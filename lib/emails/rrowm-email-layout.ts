import { escapeHtml } from "@/lib/html-escape";

export type RrowmEmailBlock =
  | { type: "kicker"; text: string }
  | { type: "p"; html: string }
  | { type: "list"; items: string[] }
  | { type: "hr" };

export type RrowmEmailLayoutOpts = {
  /** Hidden preheader (inbox preview line) */
  preheader?: string;
  blocks: RrowmEmailBlock[];
  cta?: { label: string; url: string };
  /** Muted closing note inside the main panel */
  footnoteHtml?: string;
};

const OUTER_BG = "#f5f4f2";
const PANEL_BG = "#ffffff";
const PANEL_BORDER = "#ebe9e6";
const BODY = "#1a1918";
const MUTED = "#5c5a56";
const RULE = "#eceae7";

/** Primary reading face — institutional, restrained */
const SERIF =
  "Georgia,'Iowan Old Style','Palatino Linotype',Palatino,'Times New Roman',serif";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif";

/** Narrow column for readability (~560px) */
const PANEL_MAX = 560;

/**
 * Editorial HTML shell for transactional email: narrow column, serif prose,
 * minimal chrome. Tables for client compatibility; light mobile padding via class.
 */
export function buildRrowmEmailHtml(inner: string, preheader?: string): string {
  const pv = escapeHtml(preheader ?? "");
  const hiddenPv = pv
    ? `<span style="display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent">${pv}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light only"/>
<title>RROWM Registry</title>
<style type="text/css">
@media only screen and (max-width: 600px) {
  .rrowm-shell-pad { padding: 24px 12px !important; }
  .rrowm-panel-pad { padding: 32px 22px 36px !important; }
  .rrowm-cta-cell a { display: block !important; text-align: center !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background:${OUTER_BG};">
${hiddenPv}
<table role="presentation" class="rrowm-shell-pad" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:${OUTER_BG};padding:36px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="border-collapse:collapse;max-width:${PANEL_MAX}px;background:${PANEL_BG};border:1px solid ${PANEL_BORDER};">
      <tr><td class="rrowm-panel-pad" style="padding:40px 40px 12px;">
        <p style="margin:0;font-family:${SERIF};font-size:15px;font-weight:600;letter-spacing:0.03em;color:${BODY};">
          RROWM Registry
        </p>
        <p style="margin:12px 0 0;font-family:${SANS};font-size:12px;line-height:1.55;color:${MUTED};">
          Cultural registry
        </p>
      </td></tr>
      <tr><td class="rrowm-panel-pad" style="padding:8px 40px 12px;font-family:${SERIF};font-size:15px;line-height:1.75;color:${BODY};">
        ${inner}
      </td></tr>
      <tr><td class="rrowm-panel-pad" style="padding:12px 40px 40px;font-family:${SANS};font-size:11px;line-height:1.65;color:#94918d;">
        <p style="margin:0;">RROWM · automated registry correspondence.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function rrowmEmailInnerFromOpts(opts: RrowmEmailLayoutOpts): string {
  const chunks: string[] = [];

  for (const b of opts.blocks) {
    if (b.type === "kicker") {
      chunks.push(
        `<p style="margin:0 0 26px;font-family:${SANS};font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(b.text)}</p>`
      );
    }
    if (b.type === "p") {
      chunks.push(
        `<p style="margin:0 0 22px;font-family:${SERIF};font-size:15px;line-height:1.75;color:${BODY};">${b.html}</p>`
      );
    }
    if (b.type === "hr") {
      chunks.push(
        `<div style="height:1px;background:${RULE};margin:32px 0;"></div>`
      );
    }
    if (b.type === "list") {
      chunks.push(
        `<ul style="margin:0 0 24px;padding-left:1.15em;font-family:${SERIF};font-size:14px;line-height:1.7;color:${BODY};">${b.items
          .map(
            (x) =>
              `<li style="margin:0 0 12px;">${escapeHtml(x)}</li>`
          )
          .join("")}</ul>`
      );
    }
  }

  if (opts.cta) {
    const label = escapeHtml(opts.cta.label);
    const href = escapeHtml(opts.cta.url);
    chunks.push(
      `<table role="presentation" class="rrowm-cta-cell" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:36px 0 14px;">` +
        `<tr><td align="left" style="padding:0;">` +
        `<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">` +
        `<tr><td style="border-radius:1px;background:#2a2926;">` +
        `<a href="${href}" style="display:inline-block;padding:15px 26px;font-family:${SANS};font-size:13px;font-weight:600;color:#f7f6f4;text-decoration:none;letter-spacing:0.02em;">${label}</a>` +
        `</td></tr></table>` +
        `</td></tr></table>` +
        `<p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.55;color:${MUTED};word-break:break-all;">${href}</p>`
    );
  }

  if (opts.footnoteHtml) {
    chunks.push(
      `<p style="margin:28px 0 0;font-family:${SANS};font-size:12px;line-height:1.65;color:${MUTED};">${opts.footnoteHtml}</p>`
    );
  }

  return chunks.join("");
}
