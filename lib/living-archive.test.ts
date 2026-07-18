import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  archiveCommandForKey,
  archiveImageIntent,
  buildLivingArchiveLocation,
  computeArchiveVirtualWindow,
  createLivingArchiveState,
  indexForArchiveMove,
  livingArchiveReducer,
  normalizeArchivePresentationMode,
  parseLivingArchiveLocation,
  resolveArchiveActiveIndex,
} from "./living-archive";
import {
  adaptArchiveRecords,
  computeArchiveLinearWindow,
  createArchiveLocationCodec,
  shouldPrefetchArchiveImages,
} from "./archive-engine";

describe("Living Archive presentation mode", () => {
  it("migrates Gallery preferences to Archive without losing Ledger", () => {
    assert.equal(normalizeArchivePresentationMode("gallery"), "archive");
    assert.equal(normalizeArchivePresentationMode("archive"), "archive");
    assert.equal(normalizeArchivePresentationMode("ledger"), "ledger");
    assert.equal(normalizeArchivePresentationMode(null), "archive");
  });
});

describe("Living Archive navigation", () => {
  it("supports empty and single-work archives", () => {
    const empty = createLivingArchiveState([]);
    assert.equal(empty.activeId, null);
    assert.equal(empty.visibleRange.endIndex, -1);

    const single = createLivingArchiveState(["a"]);
    const moved = livingArchiveReducer(single, {
      type: "move",
      command: "next",
      columns: 1,
      modality: "keyboard",
    });
    assert.equal(moved.activeId, "a");
  });

  it("moves through rows without wrapping unexpectedly", () => {
    assert.equal(
      indexForArchiveMove({
        currentIndex: 5,
        itemCount: 10,
        command: "row-previous",
        columns: 3,
      }),
      2
    );
    assert.equal(
      indexForArchiveMove({
        currentIndex: 8,
        itemCount: 10,
        command: "row-next",
        columns: 3,
      }),
      9
    );
    assert.equal(
      indexForArchiveMove({
        currentIndex: 0,
        itemCount: 10,
        command: "previous",
        columns: 3,
      }),
      0
    );
  });

  it("maps keyboard input to shared archive commands", () => {
    assert.equal(archiveCommandForKey("ArrowRight", "browse"), "next");
    assert.equal(archiveCommandForKey("ArrowDown", "browse"), "row-next");
    assert.equal(archiveCommandForKey("Enter", "browse"), "open");
    assert.equal(archiveCommandForKey("Escape", "focus"), "close");
    assert.equal(archiveCommandForKey("Escape", "browse"), null);
  });
});

describe("Living Archive state", () => {
  it("preserves active identity through reorder and chooses a nearby fallback after filtering", () => {
    assert.equal(
      resolveArchiveActiveIndex(["c", "a", "b"], "b", 0),
      2
    );
    assert.equal(
      resolveArchiveActiveIndex(["a", "c"], "b", 1),
      1
    );
    assert.equal(resolveArchiveActiveIndex([], "b", 1), -1);
  });

  it("preserves active and selected work when data changes", () => {
    let state = createLivingArchiveState(["a", "b", "c"], "b");
    state = livingArchiveReducer(state, {
      type: "open-focus",
      id: "b",
      returnScrollOffset: 480,
      modality: "mouse",
    });
    state = livingArchiveReducer(state, {
      type: "items-changed",
      orderedIds: ["c", "b", "d"],
    });

    assert.equal(state.activeId, "b");
    assert.equal(state.selectedId, "b");
    assert.equal(state.mode, "focus");
    assert.equal(state.returnScrollOffset, 480);
  });

  it("falls back safely when the selected work leaves the result set", () => {
    let state = createLivingArchiveState(["a", "b"], "b");
    state = livingArchiveReducer(state, {
      type: "open-focus",
      id: "b",
      returnScrollOffset: 20,
      modality: "touch",
    });
    state = livingArchiveReducer(state, {
      type: "items-changed",
      orderedIds: ["a"],
    });

    assert.equal(state.activeId, "a");
    assert.equal(state.selectedId, null);
    assert.equal(state.mode, "browse");
  });

  it("returns focus identity and scroll anchor after closing focus mode", () => {
    let state = createLivingArchiveState(["a", "b", "c"], "b");
    state = livingArchiveReducer(state, {
      type: "open-focus",
      returnScrollOffset: 900,
      modality: "keyboard",
    });
    state = livingArchiveReducer(state, {
      type: "close-focus",
      modality: "keyboard",
    });

    assert.equal(state.activeId, "b");
    assert.equal(state.selectedId, null);
    assert.equal(state.mode, "browse");
    assert.equal(state.returnScrollOffset, 900);
  });
});

describe("Living Archive virtual window", () => {
  it("renders all of a small collection", () => {
    const window = computeArchiveVirtualWindow({
      itemCount: 10,
      columns: 4,
      rowHeight: 300,
      viewportHeight: 900,
      scrollTop: 0,
    });

    assert.deepEqual(window, {
      startIndex: 0,
      endIndex: 9,
      beforeHeight: 0,
      afterHeight: 0,
      renderedItemCount: 10,
    });
  });

  it("bounds a 100-work collection while preserving spacer geometry", () => {
    const window = computeArchiveVirtualWindow({
      itemCount: 100,
      columns: 4,
      rowHeight: 300,
      viewportHeight: 600,
      scrollTop: 1_500,
      overscanRows: 2,
      maximumRenderedItems: 32,
    });

    assert.ok(window.renderedItemCount <= 32);
    assert.ok(window.startIndex > 0);
    assert.ok(window.beforeHeight > 0);
    assert.ok(window.afterHeight > 0);
  });

  it("keeps a 10,000-work archive within the render budget", () => {
    const window = computeArchiveVirtualWindow({
      itemCount: 10_000,
      columns: 5,
      rowHeight: 280,
      viewportHeight: 840,
      scrollTop: 280 * 1_000,
      overscanRows: 3,
      maximumRenderedItems: 100,
    });

    assert.ok(window.startIndex > 0);
    assert.ok(window.endIndex < 9_999);
    assert.ok(window.renderedItemCount <= 100);
    assert.ok(window.beforeHeight > 0);
    assert.ok(window.afterHeight > 0);
  });
});

describe("Living Archive image intent", () => {
  const visibleRange = { startIndex: 10, endIndex: 20 };

  it("prioritises only focus, then neighbours, then visible cells", () => {
    assert.equal(
      archiveImageIntent({
        index: 15,
        activeIndex: 15,
        visibleRange,
        prefetchRadius: 2,
      }),
      "priority"
    );
    assert.equal(
      archiveImageIntent({
        index: 17,
        activeIndex: 15,
        visibleRange,
        prefetchRadius: 2,
      }),
      "prefetch"
    );
    assert.equal(
      archiveImageIntent({
        index: 20,
        activeIndex: 15,
        visibleRange,
        prefetchRadius: 2,
      }),
      "visible"
    );
    assert.equal(
      archiveImageIntent({
        index: 200,
        activeIndex: 15,
        visibleRange,
        prefetchRadius: 2,
      }),
      "deferred"
    );
  });
});

describe("Living Archive deep-link state", () => {
  it("preserves unrelated query state", () => {
    const current = new URLSearchParams("filter=verified&section=records");
    const next = buildLivingArchiveLocation(current, "RROWM-2026-001");

    assert.equal(next.get("filter"), "verified");
    assert.equal(next.get("section"), "artworks");
    assert.equal(next.get("view"), "archive");
    assert.equal(next.get("work"), "RROWM-2026-001");
  });

  it("parses archive and focused-work state", () => {
    const parsed = parseLivingArchiveLocation(
      new URLSearchParams(
        "section=artworks&view=archive&work=RROWM-2026-001"
      )
    );

    assert.deepEqual(parsed, {
      enabled: true,
      registryId: "RROWM-2026-001",
    });
  });
});

describe("Archive Engine role adapters", () => {
  it("normalizes role data without taking ownership of its source row", () => {
    const source = [{ artwork_id: "a", registry_id: "R-1", name: "Work" }];
    const adapted = adaptArchiveRecords(source, {
      surface: "creative",
      toSummary: (row) => ({
        id: row.artwork_id,
        registryId: row.registry_id,
        title: row.name,
        creator: "Artist",
        medium: null,
        year: null,
        image: { url: null },
      }),
    });

    assert.equal(adapted[0]?.source, source[0]);
    assert.equal(adapted[0]?.summary.registryId, "R-1");
  });
});

describe("Archive Engine route codec", () => {
  it("keeps role sections and browse/detail identities distinct", () => {
    const codec = createArchiveLocationCodec("catalogue");
    const params = codec.build(new URLSearchParams("filter=verified"), {
      activeRegistryId: "R-1",
      detailRegistryId: "R-2",
    });

    assert.equal(params.get("filter"), "verified");
    assert.equal(params.get("section"), "catalogue");
    assert.equal(params.get("view"), "archive");
    assert.equal(params.get("work"), "R-1");
    assert.equal(params.get("detail"), "R-2");
    assert.deepEqual(codec.parse(params), {
      enabled: true,
      activeRegistryId: "R-1",
      detailRegistryId: "R-2",
    });
  });

  it("removes Archive-only state when switching to Ledger", () => {
    const codec = createArchiveLocationCodec("works");
    const params = codec.build(
      new URLSearchParams("work=R-1&detail=R-1&section=works"),
      { view: "ledger" }
    );

    assert.equal(params.get("view"), "ledger");
    assert.equal(params.get("work"), null);
    assert.equal(params.get("detail"), null);
  });
});

describe("Archive Engine linear rendering", () => {
  it("keeps large horizontal collections bounded around the active work", () => {
    const window = computeArchiveLinearWindow({
      itemCount: 10_000,
      activeIndex: 5_000,
      maximumRenderedItems: 17,
    });

    assert.equal(window.renderedItemCount, 17);
    assert.ok(window.startIndex < 5_000);
    assert.ok(window.endIndex > 5_000);
    assert.equal(
      window.beforeCount + window.renderedItemCount + window.afterCount,
      10_000
    );
  });
});

describe("Archive Engine image policy", () => {
  it("does not prefetch on data-saving or slow connections", () => {
    assert.equal(
      shouldPrefetchArchiveImages({ saveData: true, effectiveType: "4g" }),
      false
    );
    assert.equal(
      shouldPrefetchArchiveImages({ saveData: false, effectiveType: "2g" }),
      false
    );
    assert.equal(
      shouldPrefetchArchiveImages({ saveData: false, effectiveType: "4g" }),
      true
    );
  });
});
