"use client";

import { BADGE_ARTWORK, hasBadgeArtwork } from "@nw/badges";
import type { BadgeCode } from "@nw/types/badge";
import type { FC } from "react";
import nwLogo from "@/assets/images/Logo text.png";
import { BadgeSvg } from "./frame";

/**
 * A crest, framed for the web.
 *
 * The drawing comes from `@nw/badges`, which both clients render; the frame and
 * the monogram are supplied here because neither can live in a package — one is
 * a styled-component, the other a bundler-resolved image URL.
 *
 * A badge with no artwork renders as nothing rather than as a broken box, which
 * is the right failure when a newer backend knows about a badge this bundle
 * does not.
 */

export { hasBadgeArtwork };
export type { BadgeArtworkProps } from "@nw/badges";

interface Props {
  code: BadgeCode;
  size: number;
  animated: boolean;
  muted?: boolean;
}

export const BadgeArtwork: FC<Props> = ({
  code,
  size,
  animated,
  muted = false,
}) => {
  const Artwork = BADGE_ARTWORK[code];
  if (!Artwork) return null;

  return (
    <BadgeSvg size={size} animated={animated}>
      <Artwork logoHref={nwLogo} muted={muted} size={size} />
    </BadgeSvg>
  );
};
