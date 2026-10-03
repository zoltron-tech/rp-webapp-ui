"use client";

import { BADGE_VIEW_BOX } from "@nw/badges";
import type { FC, ReactNode } from "react";
import * as S from "./styles";

/**
 * The web frame: a sized box with the hover sweep, wrapped round a crest.
 *
 * The drawings themselves moved to `@nw/badges` so the phone renders the same
 * twelve crests. This did not, and should not: it is a styled-component with
 * CSS keyframes, and the native frame is an `<Svg>` with a width and a height.
 * Sharing it would mean either dragging styled-components into a package both
 * clients import, or reducing the sweep to something neither engine does well.
 */

export {
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
  type BadgeArtworkProps,
} from "@nw/badges";

interface Props {
  size: number;
  animated: boolean;
  children: ReactNode;
}

export const BadgeSvg: FC<Props> = ({ size, animated, children }) => (
  <S.Frame $size={size} $animated={animated} aria-hidden="true">
    <svg viewBox={BADGE_VIEW_BOX} role="presentation" focusable="false">
      {children}
    </svg>
  </S.Frame>
);
