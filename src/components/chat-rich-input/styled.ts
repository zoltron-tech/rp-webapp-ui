import { styled } from "styled-components";
import { editorMentionTagCss } from "../rich-text-editor-input/mention-chip";

export const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  border-radius: 20px;
  border: 1px solid var(--bg-6);
  background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 12%, transparent),
      transparent 60%
    ),
    var(--bg-2);
`;

export const Editor = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  min-height: 45px;
  max-height: calc(3 * (1.35em + 0px) + 22px);
  height: auto;
  overflow-y: auto;
  border: none;
  background: transparent;
  color: var(--text);
  padding: 11px 12px;
  font-size: var(--font-size-input);
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
    opacity: 0.7;
    pointer-events: none;
    position: absolute;
    top: 11px;
    left: 12px;
    right: 12px;
    font-size: var(--font-size-input);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-weight: var(--font-weight-bold);
  }

  em {
    font-style: italic;
  }

  ${editorMentionTagCss}
`;

export const TrailingAction = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 4px;
  padding-bottom: 7px;
  flex-shrink: 0;
  z-index: 2;
`;
