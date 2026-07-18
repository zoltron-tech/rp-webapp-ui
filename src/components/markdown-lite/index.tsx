import { type ReactNode } from "react";

/**
 * Minimal inline markdown: `**bold**` and `*italic*`.
 * Bold is matched first; italic applies to the remaining runs. Bold may nest
 * italic (`**foo *bar***`). Unmatched `*` markers render as literal text.
 */
export function renderMarkdownLite(text: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  // **bold** (non-greedy) or *italic* (no inner `*`, so `**` never matches here).
  const re = /\*\*(.+?)\*\*|\*([^*\n]+?)\*/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={key++}>{renderMarkdownLite(m[1])}</strong>);
    } else {
      nodes.push(<em key={key++}>{m[2]}</em>);
    }
    last = re.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface MarkdownLiteProps {
  text: string | null | undefined;
}

/** Renders `text` with minimal inline markdown (`**bold**`, `*italic*`). */
export function MarkdownLite({ text }: MarkdownLiteProps) {
  return <>{renderMarkdownLite(text ?? "")}</>;
}
