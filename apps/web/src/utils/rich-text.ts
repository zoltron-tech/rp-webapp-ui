/** Strip rich-text HTML down to a single-line plain string (server-safe — no
 *  DOM). Used for meta descriptions where markup and entities must be gone. */
export function toPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(div|p|h[1-6]|section|article|blockquote|li)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Whether rich-text HTML carries nothing a reader would see — empty editor
 *  output like `<p></p>` or `<p><br></p>` counts as empty; media does not. */
export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html?.trim()) return true;
  if (/<(img|video|iframe)\b/i.test(html)) return false;
  return toPlainText(html).length === 0;
}

/** Length of the text a reader would actually see, ignoring HTML markup. */
export function plainTextLength(html: string | null | undefined): number {
  if (!html) return 0;
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").length;
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").length;
}
