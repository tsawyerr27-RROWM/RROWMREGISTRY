import { createHash } from "crypto";

export type HashInput = string | Buffer | Uint8Array | ArrayBuffer;

function toBuffer(input: HashInput): Buffer {
  if (typeof input === "string") return Buffer.from(input, "utf8");
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (input instanceof ArrayBuffer) return Buffer.from(new Uint8Array(input));
  // Fallback (shouldn't happen in TS)
  return Buffer.from(String(input), "utf8");
}

/** Server-side SHA-256 hex digest. */
export function sha256Hex(input: HashInput): string {
  return createHash("sha256").update(toBuffer(input)).digest("hex");
}

/** Short display form: first + last chars. */
export function shortHex(hash: string, head = 8, tail = 8): string {
  const h = String(hash || "").trim();
  if (!h) return "—";
  if (h.length <= head + tail + 1) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

