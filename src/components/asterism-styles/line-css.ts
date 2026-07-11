import { css } from "styled-components";
import type { AsterismLineVariant } from "./types";

/**
 * The rule flanking a divider glyph, keyed by line variant. Shared between
 * the reader's actual divider and the style picker's live preview so the
 * preview never drifts from what the reader renders.
 */
export const ASTERISM_LINE_CSS: Record<
  AsterismLineVariant,
  ReturnType<typeof css>
> = {
  beaded: css`
    height: 3px;
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--text-secondary) 70%, transparent) 1.4px,
      transparent 1.6px
    );
    background-size: 9px 3px;
    background-repeat: repeat-x;
  `,
  dashed: css`
    height: 0;
    border-top: 1px dashed
      color-mix(in srgb, var(--text-secondary) 65%, transparent);
  `,
  dotted: css`
    height: 0;
    border-top: 1px dotted
      color-mix(in srgb, var(--text-secondary) 75%, transparent);
  `,
  double: css`
    height: 1px;
    background: color-mix(in srgb, var(--text-secondary) 55%, transparent);
    box-shadow: 0 3px 0
      color-mix(in srgb, var(--text-secondary) 35%, transparent);
  `,
  gradient: css`
    background: linear-gradient(
      to var(--dir, right),
      transparent,
      color-mix(in srgb, var(--text-secondary) 55%, transparent)
    );
  `,
  solid: css`
    background: color-mix(in srgb, var(--text-secondary) 55%, transparent);
  `,
};
