/** Same-origin download without fetch (avoids extension fetch hijacking). */
export function triggerSameOriginDownload(href: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
