import { css } from "styled-components";

/** Card design styles, shared by the plain and colored card variants (the
 *  colored one just overrides `--accent` inline). The leading `&` binds the
 *  design class to the render container itself (both classes live on the
 *  same element). */
export const cardDialogCss = css`
  &.dialog-design-card .dialog-embed:not([data-selected="true"]),
  &.dialog-design-card-colored .dialog-embed:not([data-selected="true"]) {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 8px 10px;
    padding: 10px;
    border-radius: 12px;
    border-left: 3px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);

    /* Right-oriented: avatar and accent rule flip to the right, text aligns right. */
    &[data-orientation="right"] {
      flex-direction: row-reverse;
      border-left: none;
      border-right: 3px solid var(--accent);

      .dialog-body {
        align-items: flex-end;
      }

      .dialog-text {
        text-align: right;
      }
    }

    .dialog-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      display: block;
    }

    .dialog-avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      background: linear-gradient(
        135deg,
        var(--accent) 0%,
        var(--accent-hover) 70%
      );
      color: var(--text);
      font-weight: var(--font-weight-bold);
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }

    .dialog-text {
      font-style: italic;
      white-space: pre-wrap;
      word-break: break-word;

      /* Quotes hug the first and last words (inline), like the minimal style. */
      &::before {
        content: "❝ ";
        font-style: normal;
        color: var(--accent);
        opacity: 0.7;
      }

      &::after {
        content: " ❞";
        font-style: normal;
        color: var(--accent);
        opacity: 0.7;
      }
    }

    .dialog-sender {
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-semi-bold);
      color: var(--accent);
    }
  }
`;
