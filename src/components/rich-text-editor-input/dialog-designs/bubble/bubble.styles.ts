import { css } from "styled-components";

/** Chat-bubble design styles, shared by the plain and colored variants (the
 *  colored one tints the bubble background inline). The leading `&` binds the
 *  design class to the render container (see card). */
export const bubbleDialogCss = css`
  &.dialog-design-bubble .dialog-embed:not([data-selected="true"]),
  &.dialog-design-bubble-colored .dialog-embed:not([data-selected="true"]) {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin: 10px;
    padding-inline: 16px;

    /* Right-oriented: avatar and bubble flip to the right (sender-side chat). */
    &[data-orientation="right"] {
      flex-direction: row-reverse;

      .dialog-bubble-content {
        align-items: flex-end;
      }

      .dialog-sender {
        margin-left: 0;
        margin-right: 10px;
      }

      .dialog-bubble-body {
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 4px;
      }
    }

    .dialog-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      display: block;
      /* Sit the avatar a touch lower than the bubble. */
      margin-bottom: -3px;
    }

    .dialog-avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-bottom: -3px;
      background: linear-gradient(
        135deg,
        var(--accent) 0%,
        var(--accent-hover) 70%
      );
      color: var(--text);
      font-size: var(--font-size-xsmall);
      font-weight: var(--font-weight-bold);
    }

    .dialog-bubble-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
      max-width: 80%;
    }

    .dialog-sender {
      margin-left: 10px;
      font-size: var(--font-size-xsmall);
      color: var(--text-secondary);
    }

    .dialog-bubble-body {
      width: fit-content;
      max-width: 100%;
      padding: 8px 12px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      background-color: var(--bg-3);
      color: var(--text);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
    }

    .dialog-text {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
`;
