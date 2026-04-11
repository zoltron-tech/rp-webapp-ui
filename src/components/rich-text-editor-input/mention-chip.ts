import { css } from "styled-components";
import type { MentionDataItem } from "@/types";

/**
 * Builds a non-editable mention chip DOM node — avatar + display name —
 * matching the standard RichTextEditor chip structure.
 */
export const createMentionChip = (item: MentionDataItem): HTMLSpanElement => {
  const span = document.createElement("span");
  span.className = "mention-tag";
  span.contentEditable = "false";
  span.dataset.type = item.type;
  span.dataset.id = item.id;

  const img = document.createElement("img");
  img.src = item.image || "";
  img.alt = item.displayName;
  img.className = "mention-avatar";

  const text = document.createElement("span");
  text.className = "mention-text";
  text.textContent = item.displayName;

  span.appendChild(img);
  span.appendChild(text);

  return span;
};

/** Shared child-element styles used by both editor and saved contexts. */
export const mentionChildrenCss = css`
  .mention-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .mention-text {
    white-space: nowrap;
  }
`;

/** .mention-tag styles for editable input contexts (RichTextEditor, ChatRichInput). */
export const editorMentionTagCss = css`
  .mention-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
    top: 6px;
    min-width: 70px;
    padding: 1px 6px 1px 2px;
    border-radius: 999px;
    background: linear-gradient(
      135deg,
      var(--accent) 0%,
      var(--accent-hover) 70%
    );
    color: var(--text);
    font-weight: var(--font-weight-semi-bold);
    user-select: none;
    font-size: var(--font-size);

    &:hover {
      background: linear-gradient(
        135deg,
        var(--accent-hover) 0%,
        var(--accent-active, var(--accent-hover)) 100%
      );
    }
  }

  ${mentionChildrenCss}
`;

/** .mention-tag styles for saved / rendered contexts (RichTextRenderer, HtmlChatBubble). */
export const savedMentionTagCss = css`
  .mention-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
    top: 6px;
    min-width: 70px;
    padding: 1px 6px 1px 2px;
    border-radius: 999px;
    background: linear-gradient(
      135deg,
      var(--accent) 0%,
      var(--accent-hover) 70%
    );
    color: var(--text);
    font-weight: var(--font-weight-bold);
    user-select: none;
    font-size: var(--font-size);
    cursor: pointer;
    margin: 2px;
    margin-bottom: 12px;

    &:hover {
      background: linear-gradient(
        135deg,
        var(--accent-hover) 0%,
        var(--accent-active, var(--accent-hover)) 100%
      );
    }
  }

  ${mentionChildrenCss}
`;
