/**
 * Client helper: record institution-filed participation after gallery registers a work.
 */
export async function recordInstitutionArtworkFiling(artworkId: string): Promise<{
  ok: boolean;
  relationshipId?: string | null;
  error?: string;
}> {
  const id = artworkId.trim();
  if (!id) {
    return { ok: false, error: "Missing artwork id." };
  }

  try {
    const res = await fetch("/api/representation/record-institution-filing", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artwork_id: id }),
    });
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      relationshipId?: string | null;
      error?: string;
    } | null;

    if (!res.ok) {
      return {
        ok: false,
        error: body?.error || "Institution filing could not be recorded on file.",
      };
    }

    return {
      ok: true,
      relationshipId: body?.relationshipId ?? null,
    };
  } catch {
    return {
      ok: false,
      error: "Network error while recording institution filing.",
    };
  }
}
