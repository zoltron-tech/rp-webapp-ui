import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { Muse } from "@/types";

export type CardDesignProps = {
  muse: Muse;
  accent: string | null;
  novelistAccent: string;
  theme: string;
  coverSrc: string;
  coverPosition: number;
  isPortrait: boolean;
  entries: [string, string][];
  profileUrl: string;
};

export type CardDesignComponent = ForwardRefExoticComponent<
  CardDesignProps & RefAttributes<HTMLDivElement>
>;

export type DesignId = "portrait" | "square";

export type Design = {
  id: DesignId;
  label: string;
  /** Node pixel size (matches the design's CSS box, incl. frame padding) —
   * used so html-to-image captures the DOM at its real, undistorted size. */
  width: number;
  height: number;
  /**
   * Final exported PNG resolution, if it should differ from the node's own
   * size. When set, `pixelRatio` should usually be 1 — these are already the
   * literal output pixel dimensions, not a multiplier. Omit both to fall
   * back to `width`/`height` scaled by `pixelRatio` (the old behavior).
   */
  exportWidth?: number;
  exportHeight?: number;
  pixelRatio?: number;
  /** Whether this design places `coverPosition` on a full-bleed cover image */
  usesCoverPosition?: boolean;
  /** Max extra attributes to show; falls back to the shared default. */
  maxAttributes?: number;
  Component: CardDesignComponent;
};
