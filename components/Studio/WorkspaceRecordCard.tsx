"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { workspace } from "@/styles/workspace-design";
import { studioCatalogueSheetClass } from "@/styles/studio-v2";

type Props = {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imagePlaceholder?: string;
  accentBorderClass?: string;
  onClick: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  reveal: ReactNode;
  titleAsButton?: boolean;
  onTitleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

/** Premium image-first record card — studio, certificates, ownership grids. */
export function WorkspaceRecordCard({
  title,
  subtitle,
  imageUrl,
  imagePlaceholder = "No image on file",
  accentBorderClass = "",
  onClick,
  onKeyDown,
  reveal,
  titleAsButton = false,
  onTitleClick,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={`${workspace.card.link} ${studioCatalogueSheetClass({})}`}
    >
      <div className={workspace.card.media}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className={workspace.card.mediaImg} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            {imagePlaceholder}
          </div>
        )}
      </div>

      <div className={workspace.card.surface}>
        {titleAsButton && onTitleClick ? (
          <h3 className={workspace.type.cardTitle}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTitleClick(e);
              }}
              className="text-left transition-colors hover:text-neutral-700"
            >
              {title}
            </button>
          </h3>
        ) : (
          <h3 className={workspace.type.cardTitle}>{title}</h3>
        )}
        {subtitle ? (
          <p className={`mt-1 ${workspace.type.cardArtist}`}>{subtitle}</p>
        ) : null}
      </div>

      <div className={workspace.card.reveal}>{reveal}</div>
    </div>
  );
}
