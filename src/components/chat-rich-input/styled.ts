import { styled } from "styled-components";
import { editorMentionTagCss } from "../rich-text-editor-input/mention-chip";

export const InputWrap = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--bg-6));
  background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 8%, transparent),
      transparent 60%
    ),
    var(--bg-2);
`;

export const Editor = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 42px;
  overflow-y: auto;
  border: none;
  background: transparent;
  color: var(--text);
  padding: 11px 12px;
  font-size: var(--font-size-small);
  line-height: 1.35;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  box-sizing: border-box;
  font-family: var(--font);

  &:focus {
    outline: none;
  }

  &[data-empty="true"]::before {
    content: attr(data-placeholder);
    color: var(--text-secondary);
    pointer-events: none;
    position: absolute;
    top: 11px;
    left: 12px;
    font-size: var(--font-size-small);
  }

  strong {
    font-weight: var(--font-weight-bold);
  }

  em {
    font-style: italic;
  }

  ${editorMentionTagCss}
`;

export const MentionDropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 200;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
`;

export const MentionItem = styled.button<{ $focused: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: none;
  background: ${({ $focused }) =>
    $focused
      ? "color-mix(in srgb, var(--accent) 20%, var(--bg-4))"
      : "transparent"};
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 20%, var(--bg-4));
  }

  .avatar {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
`;

export const MentionName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MentionType = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  flex-shrink: 0;
`;
