import { css } from "styled-components";

/**
 * Minimal quote design, scoped to `.dialog-design-quote`. No container box,
 * background, border, accent color or avatar — just the quoted line.
 */
export const quoteDialogCss = css`
  &.dialog-design-quote .dialog-embed:not([data-selected="true"]),
  &.dialog-design-quote-plain .dialog-embed:not([data-selected="true"]) {
    display: block;
    /* Horizontal margin, with extra on the left for the minimal style. */
    margin: 8px 10px 8px 24px;
    /* Consistent horizontal padding, matching the other dialog styles. */
    padding: 2px 16px;
    background: none;
    border: none;

    .dialog-text {
      font-style: italic;
      word-break: break-word;

      /* Wrap the line inline in quotes, on the same line, one space apart. */
      &::before {
        content: "“ ";
        font-style: normal;
      }

      &::after {
        content: " ”";
        font-style: normal;
      }
    }

    /* Keep the quotes and text on one line (flatten any block children). */
    .dialog-text,
    .dialog-text > * {
      display: inline;
    }

    .dialog-attr {
      font-style: normal;
      font-size: var(--font-size-small);
      color: var(--text-secondary);
    }
  }
`;
