import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A speech bubble with a sky inside it and a bird crossing that sky.
 *
 * The badge's own outline is the bubble — no plate, no seal. The badge is for
 * answering other people's posts, so the shape of a reply is the shape of the
 * thing.
 */

/**
 * The bubble: a 100×84 rounded rect with a tail dropped out of its lower left,
 * as one path so the outline strokes continuously around the tail instead of
 * seaming where the tail joins.
 */
const BUBBLE = [
  "M38 12",
  "H82",
  "A28 28 0 0 1 110 40",
  "V68",
  "A28 28 0 0 1 82 96",
  "H58",
  "L30 116",
  "L44 96",
  "H38",
  "A28 28 0 0 1 10 68",
  "V40",
  "A28 28 0 0 1 38 12",
  "Z",
].join(" ");

/** A cloud, as three overlapping lobes on its own small grid. */
const CLOUD =
  "M3 10 C0.8 10 -0.6 8.2 0.2 6.3 C0.8 4.9 2.4 4.4 3.6 4.9 C4 2.5 6.2 0.8 8.7 1.1 C11 1.4 12.6 3.3 12.7 5.5 C14.5 5.5 15.9 6.9 15.9 8.6 C15.9 9.4 15.4 10 14.6 10 Z";

/**
 * The bird, on a 24×24 grid.
 *
 * Assembled from a rotated body ellipse plus four small paths rather than one
 * freehand silhouette: at 18px the whole mark is a dozen pixels tall, and a
 * shape built from primitives stays readable where an outline turns to mush.
 */
const BEAK = "M18.1 10.6 L21.4 11.8 L18.0 13.0 Z";
const TAIL = "M6.0 17.4 L1.7 19.4 L2.7 14.5 Z";
const WING =
  "M8.4 13.2 C10.5 12.1 13.0 12.7 14.3 14.6 C12.9 16.7 10.2 17.3 8.3 16.0 C7.5 15.2 7.6 13.8 8.4 13.2 Z";

/** The chatter, along the bottom of the bubble. */
const CHATTER = [50, 60, 70];

/** The distant bird: two strokes, which is all a bird is at that range. */
const FAR_BIRD = "M0 3 Q3 -1 6 3 Q9 -1 12 3";

export const SocialBirdBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const sky = muted
    ? [GREY.soft, GREY.mid, GREY.deep]
    : ["#8FEBF4", "#33B6DC", "#12628F"];
  const rim = muted ? GREY.edge : "#EAFCFF";
  const body = muted ? GREY.pale : "#FFF9EC";
  const wing = muted ? GREY.light : "#FFC864";
  const beak = muted ? GREY.light : "#FF9236";
  const eye = muted ? GREY.deep : "#0E3A4C";
  const cloud = muted ? GREY.light : "#FFFFFF";
  const cloudShade = muted ? GREY.ink : "#2E9BC4";
  const far = muted ? GREY.deep : "#0E3A4C";
  const dot = muted ? GREY.pale : "#EAFCFF";

  return (
    <>
      <Defs>
        <ClipPath id={id("clip")}>
          <Path d={BUBBLE} />
        </ClipPath>
        <LinearGradient id={id("sky")} x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor={sky[0]} />
          <Stop offset="48%" stopColor={sky[1]} />
          <Stop offset="100%" stopColor={sky[2]} />
        </LinearGradient>
        <RadialGradient id={id("sun")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={muted ? GREY.light : "#FFF6D8"}
            stopOpacity={muted ? 0.12 : 0.42}
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.light : "#FFF6D8"}
            stopOpacity="0"
          />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#2FB4D8"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#2FB4D8"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="56"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      <Path
        className="nwb-bubble"
        d={BUBBLE}
        fill={`url(#${id("sky")})`}
        stroke={rim}
        strokeOpacity={muted ? 0.4 : 0.85}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <G clipPath={`url(#${id("clip")})`}>
        {/* Low sun in the corner the sky gradient is lightest in. */}
        <Circle cx="30" cy="26" r="22" fill={`url(#${id("sun")})`} />

        {/* Clouds, drifting at different speeds so the sky has depth.

            Two layers each: a shaded copy offset down and right, then the body
            over it. A flat white cloud disappears wherever the sky is already
            pale — which, between the gradient's light corner and the sun, is
            most of the places a cloud wants to be. */}
        <G className="nwb-cloud-1" opacity={muted ? 0.3 : 0.9}>
          <G transform="translate(13 48) scale(1.45)">
            <Path d={CLOUD} fill={cloudShade} transform="translate(0.5 1.3)" />
            <Path d={CLOUD} fill={cloud} />
          </G>
        </G>
        <G className="nwb-cloud-2" opacity={muted ? 0.24 : 0.75}>
          <G transform="translate(74 20) scale(1.05)">
            <Path d={CLOUD} fill={cloudShade} transform="translate(0.5 1.3)" />
            <Path d={CLOUD} fill={cloud} />
          </G>
        </G>

        {/* A second bird, far off, crossing the whole sky and starting
                over — what makes this read as a sky with weather in it rather
                than one bird on a blue card.

                Dark, not white: at that range a bird against a bright sky is a
                silhouette, and a white one vanishes into the cloud it passes. */}
        <G className="nwb-farbird" opacity={muted ? 0.4 : 0.5}>
          <G transform="translate(2 30)">
            <Path
              d={FAR_BIRD}
              stroke={far}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </G>
      </G>

      {/* The bird: 24-grid scaled to 47px about (60, 50).
          The wing is its own group so it can beat against a body that is
          meanwhile riding the glide — a bird whose wings are welded to it reads
          as a sticker being dragged across the sky. */}
      <G className="nwb-emblem">
        <G className="nwb-glide">
          <G transform="translate(36.6 26.6) scale(1.95)">
            <Path d={TAIL} fill={body} fillOpacity={muted ? 0.5 : 0.95} />
            <Ellipse
              cx="11.2"
              cy="14.8"
              rx="5.7"
              ry="4.6"
              transform="rotate(-16 11.2 14.8)"
              fill={body}
              fillOpacity={muted ? 0.5 : 0.97}
            />
            <Circle
              cx="15.5"
              cy="11.4"
              r="3.1"
              fill={body}
              fillOpacity={muted ? 0.5 : 0.97}
            />
            <Path d={BEAK} fill={beak} fillOpacity={muted ? 0.6 : 1} />
            <G className="nwb-flap">
              <Path d={WING} fill={wing} fillOpacity={muted ? 0.6 : 0.95} />
            </G>
            <Circle cx="16.3" cy="10.7" r="0.85" fill={eye} />
          </G>
        </G>
      </G>

      {/* The chatter. It bounces left to right rather than fading, because that
          is what a typing indicator actually does, and a fade at this size
          reads as the dots flickering out. */}
      {detailed &&
        CHATTER.map((cx, index) => (
          <Circle
            key={cx}
            className={`nwb-chatter-${index + 1}`}
            cx={cx}
            cy="82"
            r="3.4"
            fill={dot}
            fillOpacity={muted ? 0.5 : 0.95}
          />
        ))}
    </>
  );
};
