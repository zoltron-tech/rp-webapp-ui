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
