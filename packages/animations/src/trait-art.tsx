import type { FC, ReactNode } from "react";
import { Circle, Ellipse, Path, Rect, Svg } from "./primitives";

/**
 * Little drawings for the traits — one per catalogue key, in full colour:
 * every shape has its own fill with a deeper outline of the same colour (a
 * sunny yellow sun, an orange flame, a pink heart), so each glyph reads on
 * the dark character card and the light edit page alike. Drawn on a 20×20
 * grid to be read at 14–18px.
 *
 * A key with no drawing falls back to its group's, then to a sparkle.
 */

type Tone = { fill: string; stroke: string };

const Y: Tone = { fill: "#FFD54A", stroke: "#D99100" }; // yellow
const O: Tone = { fill: "#FF9F43", stroke: "#D9601A" }; // orange
const R: Tone = { fill: "#FF6B6B", stroke: "#CF3546" }; // red
const K: Tone = { fill: "#FF8FC7", stroke: "#D8508F" }; // pink
const P: Tone = { fill: "#B794F6", stroke: "#7650D2" }; // purple
const B: Tone = { fill: "#6EC8FF", stroke: "#2B87D1" }; // blue
const T: Tone = { fill: "#4FD1C5", stroke: "#1B978C" }; // teal
const G: Tone = { fill: "#7BD88F", stroke: "#36A055" }; // green
const N: Tone = { fill: "#D9A272", stroke: "#93603A" }; // brown
const S: Tone = { fill: "#D5DDE8", stroke: "#8492A6" }; // silver
const W: Tone = { fill: "#FFFFFF", stroke: "#94A3B8" }; // white
const D: Tone = { fill: "#5B6478", stroke: "#2A3142" }; // dark

/** Line-only stroke in a tone's outline colour. */
const line = (t: Tone) => ({ fill: "none", stroke: t.stroke });
/** A white highlight line (a shine, a glint). */
const HI = { fill: "none", stroke: "#FFFFFF" };
/** A solid dot (eyes, seeds, pips): the outline colour, no stroke. */
const dot = (t: Tone) => ({ fill: t.stroke, stroke: "none" });

/** The four-point star every app scene sparkles with. */
const Sparkle = ({
  x,
  y,
  size = 1,
  tone = Y,
}: {
  x: number;
  y: number;
  size?: number;
  tone?: Tone;
}) => (
  <Path
    transform={`translate(${x} ${y}) scale(${size})`}
    d="M0 -2.6 C0.3 -0.8 0.8 -0.3 2.6 0 C0.8 0.3 0.3 0.8 0 2.6 C-0.3 0.8 -0.8 0.3 -2.6 0 C-0.8 -0.3 -0.3 -0.8 0 -2.6 Z"
    fill={tone.fill}
    stroke={tone.stroke}
    strokeWidth={0.6}
  />
);

/** A round face for the expression glyphs. */
const Face = ({ tone = Y }: { tone?: Tone }) => (
  <Circle cx="10" cy="10.4" r="6.6" {...tone} />
);

const GLYPHS: Record<string, ReactNode> = {
  // ── Mind, round two ─────────────────────────────────────────────────────
  ABSENT_MINDED: (
    <>
      <Rect
        x="5.6"
        y="5.6"
        width="11"
        height="11"
        rx="1"
        transform="rotate(8 11 11)"
        {...K}
      />
      <Rect
        x="3"
        y="3"
        width="10.4"
        height="10.4"
        rx="1"
        transform="rotate(-6 8.2 8.2)"
        {...Y}
      />
      <Path
        d="M5.6 6.4h5M5.8 8.6h4"
        {...line(O)}
        transform="rotate(-6 8.2 8.2)"
      />
      <Path d="M11.8 13.4h.01" {...line(D)} strokeWidth={2} />
    </>
  ),
  // ── Lifestyle ───────────────────────────────────────────────────────────
  ADVENTUROUS: (
    <>
      <Circle cx="10" cy="10" r="7.2" {...N} />
      <Circle cx="10" cy="10" r="5.4" {...W} />
      <Path d="m12.8 7.2-1.6 4-1.2-1.2Z" {...R} strokeWidth={0.6} />
      <Path d="m7.2 12.8 1.6-4 1.2 1.2Z" {...S} strokeWidth={0.6} />
    </>
  ),
  ANALYTICAL: (
    <>
      <Path d="M3 3v14h14" {...line(S)} strokeWidth={1.6} />
      <Rect x="5.2" y="10" width="2.6" height="6" rx=".5" {...B} />
      <Rect x="9.2" y="6.4" width="2.6" height="9.6" rx=".5" {...T} />
      <Rect x="13.2" y="8.6" width="2.6" height="7.4" rx=".5" {...P} />
    </>
  ),

  // ── Lifestyle, round two ────────────────────────────────────────────────
  ANIMAL_LOVER: (
    <>
      <Path d="M4.6 8.4 4 3.4l4 3M15.4 8.4l.6-5-4 3" {...O} />
      <Ellipse cx="10" cy="11" rx="6.2" ry="5.6" {...O} />
      <Circle cx="7.6" cy="10.2" r=".8" {...dot(D)} />
      <Circle cx="12.4" cy="10.2" r=".8" {...dot(D)} />
      <Path d="M9.2 12.4h1.6L10 13.4Z" fill="#FF8FC7" stroke="none" />
      <Path d="M10 13.4v.6M3 11.6l2.4.4M17 11.6l-2.4.4" {...line(D)} />
    </>
  ),
  // ── Emotional ───────────────────────────────────────────────────────────
  ANXIOUS: (
    <>
      <Circle cx="10" cy="10" r="7" {...P} />
      <Path
        d="M10 10.2c0-.9.8-1.5 1.6-1.2.9.4 1 1.7.3 2.4-1 1-2.8.8-3.6-.3-1-1.4-.4-3.5 1.1-4.2 2-.9 4.4.2 5 2.3"
        {...HI}
      />
    </>
  ),

  // ── Dark ────────────────────────────────────────────────────────────────
  ARROGANT: (
    <>
      <Path d="M3.4 14.6 2.6 6.4l4.2 3L10 4l3.2 5.4 4.2-3-.8 8.2Z" {...Y} />
      <Rect x="3.4" y="14.6" width="13.2" height="2.2" rx=".6" {...O} />
      <Circle cx="10" cy="11.2" r="1" {...R} strokeWidth={0.5} />
      <Circle cx="6.2" cy="12" r=".7" {...B} strokeWidth={0.5} />
      <Circle cx="13.8" cy="12" r=".7" {...G} strokeWidth={0.5} />
    </>
  ),
  ATHLETIC: (
    <>
      <Path d="M5 10h10" {...line(S)} strokeWidth={2} />
      <Rect x="2.4" y="6.6" width="3" height="6.8" rx="1.1" {...R} />
      <Rect x="14.6" y="6.6" width="3" height="6.8" rx="1.1" {...R} />
    </>
  ),
  BAKER: (
    <>
      <Path
        d="M7.2 3.6c-.6-.8.6-1.2 0-2.2M12.4 3.6c-.6-.8.6-1.2 0-2.2"
        {...line(S)}
      />
      <Path
        d="M3.4 10.2C2.6 6.8 5.6 4.8 10 4.8s7.4 2 6.6 5.4v5.4a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2Z"
        {...N}
      />
      <Path
        d="M6.4 7.8 7.8 9.6M9.4 7l1.4 1.8M12.4 7.8l1.4 1.8"
        {...line(N)}
        strokeWidth={1.2}
      />
      <Path d="M5 11.4v3" {...HI} />
      <Sparkle x={15.4} y={13.4} size={0.55} />
    </>
  ),
  BLOODTHIRSTY: (
    <>
      <Path
        d="M3 7.4c2.4 1.6 4.6 2.2 7 2.2s4.6-.6 7-2.2c-.6 4.4-3.6 7.2-7 7.2S3.6 11.8 3 7.4Z"
        {...D}
      />
      <Path
        d="M5.8 8.6 6.8 12l1.2-3ZM14.2 8.6 13.2 12 12 9Z"
        {...W}
        strokeWidth={0.6}
      />
      <Path
        d="M13.6 13.6c.8 1.2 1.2 1.8 1.2 2.6a1.2 1.2 0 0 1-2.4 0c0-.8.4-1.4 1.2-2.6Z"
        {...R}
        strokeWidth={0.7}
      />
    </>
  ),

  // ── Social, round two ───────────────────────────────────────────────────
  BLUNT: (
    <>
      <Path d="m9.6 9.4 7.2 7.2" {...line(N)} strokeWidth={2.4} />
      <Rect
        x="2.4"
        y="4"
        width="9.4"
        height="4.8"
        rx="1"
        transform="rotate(45 7.1 6.4)"
        {...S}
      />
    </>
  ),

  // ── Social ──────────────────────────────────────────────────────────────
  BOLD: <Path d="M11.6 2.4 4.4 11.4h4.8l-.8 6.2 7.2-9.2h-4.9Z" {...Y} />,

  // ── Mind ────────────────────────────────────────────────────────────────
  BOOKWORM: (
    <>
      <Path d="M10 6.2C8.2 4.8 5.6 4.4 3 4.8v10.4c2.6-.4 5.2 0 7 1.4Z" {...B} />
      <Path
        d="M10 6.2c1.8-1.4 4.4-1.8 7-1.4v10.4c-2.6-.4-5.2 0-7 1.4Z"
        {...W}
      />
      <Path d="M12.2 8.2h2.6M12.2 10.6h2.6" {...line(S)} />
      <Path d="M5.2 8.2h2.4" {...HI} />
      <Circle cx="13.6" cy="13.4" r="1.2" {...G} />
    </>
  ),
  CALM: (
    <>
      <Path d="M2.6 13.2c2.4 3 12.4 3 14.8 0Z" {...B} />
      <Path
        d="M3 8.4c1.6-1.4 3.2-1.4 4.7 0s3.1 1.4 4.6 0 3.1-1.4 4.7 0"
        {...line(T)}
      />
      <Path
        d="M3 11.4c1.6-1.4 3.2-1.4 4.7 0s3.1 1.4 4.6 0 3.1-1.4 4.7 0"
        {...line(B)}
      />
    </>
  ),
  CAREFREE: (
    <>
      <Path d="M7.6 17.6c0-3.4.4-6.6 1.8-9.6" {...line(G)} />
      <Path
        d="M9.4 8H5.6M9.4 8 6.7 5.3M9.4 8V4.2M9.4 8l2.7-2.7M9.4 8l-2.7 2.7M13.6 5.4l-1 .8M16.6 9l-1.2.3M15.4 13.2l-1-.6"
        {...line(S)}
      />
      <Circle cx="5.6" cy="8" r="1" {...W} strokeWidth={0.6} />
      <Circle cx="6.7" cy="5.3" r="1" {...W} strokeWidth={0.6} />
      <Circle cx="9.4" cy="4.2" r="1" {...W} strokeWidth={0.6} />
      <Circle cx="12.1" cy="5.3" r="1" {...W} strokeWidth={0.6} />
      <Circle cx="6.7" cy="10.7" r="1" {...W} strokeWidth={0.6} />
      <Circle cx="9.4" cy="8" r="1.2" {...Y} strokeWidth={0.6} />
      <Circle cx="14.2" cy="4.8" r=".8" {...W} strokeWidth={0.6} />
      <Circle cx="17.3" cy="8.8" r=".8" {...W} strokeWidth={0.6} />
      <Circle cx="16.1" cy="13.6" r=".8" {...W} strokeWidth={0.6} />
    </>
  ),

  // ── Dark, round two ─────────────────────────────────────────────────────
  CHAOTIC: (
    <>
      <Path
        d="m10 1.8 1.8 4.4 4.4-1.8-1.8 4.4 4.4 1.8-4.4 1.8 1.8 4.4-4.4-1.8L10 19.4 8.2 15l-4.4 1.8L5.6 12.4 1.2 10.6l4.4-1.8L3.8 4.4l4.4 1.8Z"
        {...O}
      />
      <Circle cx="10" cy="10.6" r="3" {...Y} />
    </>
  ),
  CHARMING: (
    <>
      <Path
        d="M9 2.8c.9 3.5 2 4.6 5.5 5.5-3.5.9-4.6 2-5.5 5.5-.9-3.5-2-4.6-5.5-5.5C7 7.4 8.1 6.3 9 2.8Z"
        {...Y}
      />
      <Sparkle x={15.4} y={14.6} size={0.8} tone={K} />
      <Sparkle x={15.6} y={4} size={0.45} tone={P} />
    </>
  ),
  CHEERFUL: (
    <>
      <Path
        d="M10 2.4v2M10 15.6v2M2.4 10h2M15.6 10h2M4.6 4.6 6 6M14 14l1.4 1.4M4.6 15.4 6 14M14 6l1.4-1.4"
        {...line(O)}
      />
      <Circle cx="10" cy="10" r="4.4" {...Y} />
      <Path d="M8.2 10.6c.9 1 2.7 1 3.6 0" {...line(O)} />
      <Circle cx="8.4" cy="8.9" r=".55" {...dot(O)} />
      <Circle cx="11.6" cy="8.9" r=".55" {...dot(O)} />
    </>
  ),
  CLASS_CLOWN: (
    <>
      <Face />
      <Path
        d="M4.6 6.6 2.4 3.2l4.6 1.6ZM15.4 6.6l2.2-3.4-4.6 1.6Z"
        {...P}
        strokeWidth={0.7}
      />
      <Circle cx="10" cy="11" r="1.6" {...R} strokeWidth={0.6} />
      <Path d="M6.6 13.2c1.8 2.4 5 2.4 6.8 0" {...line(O)} />
      <Path d="M7 8.6h1.6M11.4 8.6H13" {...line(O)} />
    </>
  ),
  CLUMSY: (
    <>
      <Path
        d="M2.6 14.8c2.6-1.6 9.4-1.8 14.8 0-1.6 1.8-12.4 2-14.8 0Z"
        fill="#BFE9FF"
        stroke="#2B87D1"
      />
      <Path d="m5 6 6.6-2.4 2.2 6-6.6 2.4Z" {...W} />
      <Path d="M13.6 9.4c1.4.2 2.2 1.4 1.6 2.6" {...line(S)} />
      <Path d="M7.6 11.8c-.6.8-.8 1.6-.6 2.4" {...line(B)} />
    </>
  ),
  COFFEE_ADDICT: (
    <>
      <Path d="M3.6 8.4h10v5.4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" {...W} />
      <Path
        d="M13.6 9.6h1.4a2 2 0 0 1 0 4h-1.4"
        {...line(S)}
        strokeWidth={1.6}
      />
      <Path d="M4.6 9.6h8" {...line(N)} strokeWidth={1.8} />
      <Path
        d="M6.6 6.4c-.8-1 .8-1.6 0-3M10.4 6.4c-.8-1 .8-1.6 0-3"
        {...line(S)}
      />
    </>
  ),
  COLD_HEARTED: (
    <>
      <Path
        d="M10 16.4s-6.2-3.7-6.2-8.2A3.4 3.4 0 0 1 10 6.3a3.4 3.4 0 0 1 6.2 1.9c0 4.5-6.2 8.2-6.2 8.2Z"
        fill="#BFE9FF"
        stroke="#2B87D1"
      />
      <Path d="M10 8.2v5.6M7.6 9.6l4.8 2.8M12.4 9.6l-4.8 2.8" {...HI} />
      <Sparkle x={16} y={3.6} size={0.6} tone={B} />
    </>
  ),
  COUCH_POTATO: (
    <>
      <Path d="M4.4 11V8.2a2 2 0 0 1 2-2h7.2a2 2 0 0 1 2 2V11Z" {...P} />
      <Path
        d="M3 11a1.4 1.4 0 0 1 2.8 0v1h8.4v-1a1.4 1.4 0 0 1 2.8 0v3.6H3Z"
        {...P}
      />
      <Ellipse cx="10" cy="10.4" rx="2.2" ry="1.4" {...N} />
      <Path d="M4.6 14.6v1.8M15.4 14.6v1.8" {...line(N)} />
    </>
  ),
  COWARD: (
    <>
      <Path d="M5 17.4V2.8" {...line(N)} strokeWidth={1.8} />
      <Path
        d="M5.2 3.2c3.6-1.4 5.8 1.6 10.4 0v7c-4.6 1.6-6.8-1.4-10.4 0Z"
        {...W}
      />
      <Path d="M8 6.6c1 .6 2.4.8 3.6.4" {...line(S)} />
    </>
  ),
  CREATIVE: (
    <>
      <Path
        d="M10 3a7 7 0 1 0 0 14c1.2 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.2-2.2H14a3.3 3.3 0 0 0 3.3-3.4C17.2 5.9 13.9 3 10 3Z"
        {...N}
      />
      <Circle cx="6.6" cy="9.2" r="1.2" {...R} strokeWidth={0.6} />
      <Circle cx="9" cy="6.2" r="1.2" {...Y} strokeWidth={0.6} />
      <Circle cx="12.6" cy="6.6" r="1.2" {...B} strokeWidth={0.6} />
      <Circle cx="6.9" cy="12.8" r="1.2" {...G} strokeWidth={0.6} />
    </>
  ),
  CUNNING: (
    <>
      <Path d="M3 4.4 6.6 7h6.8L17 4.4l-.6 5.4L10 17 3.6 9.8Z" {...O} />
      <Path
        d="m4.6 6.4 1.2 1.4-1 .8ZM15.4 6.4l-1.2 1.4 1 .8Z"
        {...W}
        strokeWidth={0.5}
      />
      <Path
        d="M4.4 10.4 10 17l5.6-6.6c-1.6.4-3.4 1.4-5.6 1.4s-4-1-5.6-1.4Z"
        {...W}
      />
      <Path d="m6.8 9.6 1.8.6M13.2 9.6l-1.8.6" {...line(D)} strokeWidth={1.4} />
      <Circle cx="10" cy="15.8" r=".8" {...dot(D)} />
    </>
  ),
  CURIOUS: (
    <>
      <Path d="m12.2 12.2 4.6 4.6" {...line(N)} strokeWidth={2.2} />
      <Circle cx="8.6" cy="8.6" r="5" {...line(S)} strokeWidth={1.8} />
      <Circle cx="8.6" cy="8.6" r="4.1" fill="#BFE9FF" stroke="none" />
      <Path d="M6.6 7.2a2.4 2.4 0 0 1 2-1.4" {...HI} />
    </>
  ),
  CYNIC: (
    <>
      <Face tone={O} />
      <Path d="M6.4 7.6 8.6 8.4M11.6 8l2.2-.6M7.6 13.4h4.6" {...line(N)} />
      <Circle cx="7.9" cy="10.2" r=".7" {...dot(N)} />
      <Circle cx="12.3" cy="10.2" r=".7" {...dot(N)} />
    </>
  ),
  DAYDREAMER: (
    <>
      <Path
        d="M5.4 14.6a3 3 0 0 1 .4-6A4 4 0 0 1 13.4 9.2a2.7 2.7 0 0 1 .8 5.4Z"
        {...W}
      />
      <Sparkle x={14.8} y={4.2} size={0.8} />
      <Sparkle x={4.6} y={4.2} size={0.55} tone={K} />
    </>
  ),
  DIPLOMATIC: (
    <>
      <Path d="M3.4 16.6C7 13 10.6 8.4 16.4 3.4" {...line(N)} />
      <Ellipse
        cx="6.6"
        cy="11.2"
        rx="2.4"
        ry="1.2"
        transform="rotate(-50 6.6 11.2)"
        {...G}
      />
      <Ellipse
        cx="9.8"
        cy="12.8"
        rx="2.4"
        ry="1.2"
        transform="rotate(20 9.8 12.8)"
        {...G}
      />
      <Ellipse
        cx="10"
        cy="7.8"
        rx="2.4"
        ry="1.2"
        transform="rotate(-60 10 7.8)"
        {...G}
      />
      <Ellipse
        cx="13.4"
        cy="9"
        rx="2.4"
        ry="1.2"
        transform="rotate(10 13.4 9)"
        {...G}
      />
      <Circle cx="15.6" cy="5.8" r="1" {...P} strokeWidth={0.6} />
    </>
  ),
  DRAMATIC: (
    <>
      <Path d="M3.2 5.4h3.8c-.4 4 .4 8 2 11.6H3.2Z" {...R} />
      <Path d="M16.8 5.4H13c.4 4-.4 8-2 11.6h5.8Z" {...R} />
      <Path d="M5 7.4v7.6M15 7.4v7.6" {...HI} />
      <Rect x="2.4" y="2.8" width="15.2" height="2.6" rx=".8" {...P} />
      <Sparkle x={10} y={11.4} size={0.9} />
    </>
  ),
  EARLY_BIRD: (
    <>
      <Path d="M2.6 13.8h14.8v3H2.6Z" {...G} />
      <Path d="M4.8 13.8a5.2 5.2 0 0 1 10.4 0Z" {...O} />
      <Path d="M10 4.6v1.8M4.2 7.2l1.2 1.2M15.8 7.2l-1.2 1.2" {...line(Y)} />
    </>
  ),
  EMPATHETIC: (
    <>
      <Path
        d="M7.4 15s-4.6-2.8-4.6-6.2a2.6 2.6 0 0 1 4.6-1.5A2.6 2.6 0 0 1 12 8.8C12 12.2 7.4 15 7.4 15Z"
        {...K}
      />
      <Path
        d="M12.6 17.2s-4.6-2.8-4.6-6.2a2.6 2.6 0 0 1 4.6-1.5 2.6 2.6 0 0 1 4.6 1.5c0 3.4-4.6 6.2-4.6 6.2Z"
        {...R}
      />
      <Sparkle x={15.6} y={4.4} size={0.6} tone={K} />
    </>
  ),
  EQUESTRIAN: (
    <>
      <Path
        d="M5.6 3.4 4.4 10a5.6 5.6 0 0 0 11.2 0l-1.2-6.6"
        fill="none"
        stroke={S.stroke}
        strokeWidth={3.6}
      />
      <Path
        d="M5.6 3.4 4.4 10a5.6 5.6 0 0 0 11.2 0l-1.2-6.6"
        fill="none"
        stroke={S.fill}
        strokeWidth={2}
      />
      <Circle cx="5" cy="6.8" r=".45" {...dot(D)} />
      <Circle cx="4.6" cy="10.6" r=".45" {...dot(D)} />
      <Circle cx="15" cy="6.8" r=".45" {...dot(D)} />
      <Circle cx="15.4" cy="10.6" r=".45" {...dot(D)} />
      <Sparkle x={10} y={7} size={0.75} />
    </>
  ),
  FASHIONISTA: (
    <>
      <Path d="M7.4 2.8h5.2l-.6 3.4 4 10.8H4l4-10.8Z" {...K} />
      <Path d="M7.6 6.2h4.8" {...line(P)} strokeWidth={1.6} />
      <Circle cx="10" cy="11.6" r=".8" fill="#FFFFFF" stroke="none" />
      <Sparkle x={16} y={4} size={0.6} />
    </>
  ),

  // ── Emotional, round two ────────────────────────────────────────────────
  FEARLESS: (
    <>
      <Path d="M2.4 16.6 9 5.4l6.8 11.2Z" {...S} />
      <Path d="m7 9 2-3.6 2.1 3.5-1-.6-1.1.9-1-.9Z" {...W} strokeWidth={0.6} />
      <Path d="M9 5.4V2.2" {...line(N)} />
      <Path d="M9.2 2.4h4.4l-1.2 1.4 1.2 1.4H9.2Z" {...R} strokeWidth={0.8} />
    </>
  ),
  FLIRT: (
    <>
      <Face />
      <Path
        d="M6.8 9.4c.4-.5 1.2-.5 1.6 0M11.4 9.2h1.9M7.4 12.2c1.4 1.5 3.8 1.5 5.2 0"
        {...line(O)}
      />
      <Path
        d="M15.8 4.6s-1.9-.9-1.9-2a1 1 0 0 1 1.9-.4 1 1 0 0 1 1.9.4c0 1.1-1.9 2-1.9 2Z"
        {...R}
        strokeWidth={0.6}
      />
    </>
  ),
  FOODIE: (
    <>
      <Path d="M5 10.6h10l-1.2 6H6.2Z" {...K} />
      <Path
        d="M4.6 10.6c-.4-2.6 1.6-4.2 3.4-3.6C8.6 4.8 11.6 4.6 12.6 7c2-.4 3.4 1.4 2.8 3.6Z"
        {...W}
      />
      <Path d="M8.2 12.4v2.6M11.8 12.4v2.6" {...line(K)} />
      <Circle cx="10" cy="3.8" r="1.2" {...R} strokeWidth={0.6} />
    </>
  ),
  GAMER: (
    <>
      <Path
        d="M5.4 6.4h9.2a3 3 0 0 1 3 2.8l.4 4.4a2 2 0 0 1-3.6 1.4l-1.6-2.2H7.2l-1.6 2.2A2 2 0 0 1 2 13.6l.4-4.4a3 3 0 0 1 3-2.8Z"
        {...P}
      />
      <Path d="M6.2 8.6v2.8M4.8 10h2.8" {...HI} strokeWidth={1.5} />
      <Circle cx="13.2" cy="9" r=".8" {...R} strokeWidth={0.5} />
      <Circle cx="14.8" cy="10.6" r=".8" {...Y} strokeWidth={0.5} />
    </>
  ),
  GENIUS: (
    <>
      <Path
        d="M7.4 13.2c0-1.6-2.4-2.8-2.4-5.6a5 5 0 0 1 10 0c0 2.8-2.4 4-2.4 5.6Z"
        {...Y}
      />
      <Rect x="7.4" y="13.2" width="5.2" height="2.4" rx=".6" {...S} />
      <Path d="M8.6 17.4h2.8" {...line(S)} />
      <Path d="M10 13.2v-2.8l-1.2-1.2M10 10.4l1.2-1.2" {...line(O)} />
    </>
  ),
  GENTLE: (
    <>
      <Path
        d="M15.8 3.2C10.6 3.4 6.2 7.6 5.6 13.4l1 1c5.6-.8 9.6-5.2 9.2-11.2Z"
        {...T}
      />
      <Path d="M15.4 3.6 4 16.6" {...line(N)} />
      <Path d="M12.6 6.4 11 6M11 8.6 8.8 8.4M9.4 10.8l-2-.1" {...HI} />
    </>
  ),
  GLOOMY: (
    <>
      <Path
        d="M5.6 11.4a3 3 0 0 1 .4-6 4 4 0 0 1 7.6.8 2.6 2.6 0 0 1 .8 5.2Z"
        {...S}
      />
      <Path d="M7 14 6.2 16.2M10.2 14l-.8 2.2M13.4 14l-.8 2.2" {...line(B)} />
    </>
  ),
  GOSSIP: (
    <>
      <Path
        d="M2.6 4h9a1.2 1.2 0 0 1 1.2 1.2v4.4A1.2 1.2 0 0 1 11.6 10.8H6.4l-2.6 2v-2h-1.2A1.2 1.2 0 0 1 1.4 9.6V5.2A1.2 1.2 0 0 1 2.6 4Z"
        {...K}
      />
      <Path
        d="M17.4 8.4h-6.2a1.2 1.2 0 0 0-1.2 1.2v4a1.2 1.2 0 0 0 1.2 1.2h4.2l2.4 1.8v-1.8a1.2 1.2 0 0 0 1-1.2v-4a1.2 1.2 0 0 0-1.4-1.2Z"
        {...P}
      />
      <Circle cx="4.6" cy="7.4" r=".6" fill="#FFFFFF" stroke="none" />
      <Circle cx="7" cy="7.4" r=".6" fill="#FFFFFF" stroke="none" />
      <Circle cx="9.4" cy="7.4" r=".6" fill="#FFFFFF" stroke="none" />
    </>
  ),
  GREEDY: (
    <>
      <Path
        d="M7.4 6.2C6 4.6 6.6 2.8 8 3.4c.8.4 1.4.4 2 0s1.2-.4 2 0c1.4-.6 2 1.2.6 2.8"
        {...N}
      />
      <Path
        d="M7.2 6.2h5.6c3 1.8 4.6 4.6 4.6 7.4 0 2.4-1.6 3.6-4 3.6H6.6c-2.4 0-4-1.2-4-3.6 0-2.8 1.6-5.6 4.6-7.4Z"
        {...Y}
      />
      <Path
        d="M11.4 9.6c-.4-.6-1-.8-1.6-.8-1 0-1.6.6-1.6 1.2 0 1.6 3.4.8 3.4 2.6 0 .7-.7 1.2-1.8 1.2-.7 0-1.3-.3-1.7-.8M10 8v.8M10 13.8v.8"
        {...line(O)}
      />
    </>
  ),
  GREEN_THUMB: (
    <>
      <Path d="M5.4 12h9.2l-1.2 5.2H6.6Z" {...O} />
      <Path d="M10 12V6.6" {...line(G)} />
      <Path d="M10 8.6C8 9 5.6 8.2 5 5.6c2.4-.4 4.6.6 5 3Z" {...G} />
      <Path d="M10 7c.4-2.6 2.6-3.8 5-3.4-.4 2.4-2.6 3.8-5 3.4Z" {...G} />
      <Path d="M4.8 12h10.4" {...line(O)} strokeWidth={1.8} />
    </>
  ),
  GRUMPY: (
    <>
      <Face tone={S} />
      <Path
        d="M6.4 8.2 8.8 9M13.6 8.2 11.2 9M7.6 14c1.4-1.4 3.4-1.4 4.8 0"
        {...line(D)}
      />
      <Circle cx="7.9" cy="10.6" r=".7" {...dot(D)} />
      <Circle cx="12.1" cy="10.6" r=".7" {...dot(D)} />
      <Path
        d="M14.6 3.4c1 .6 1.2 1.6.6 2.4M16.6 2.6c1.4 1 1.6 2.6.8 3.8"
        {...line(B)}
      />
    </>
  ),
  HOMEBODY: (
    <>
      <Path d="M3.6 9.6h12.8v6.4a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1Z" {...Y} />
      <Path d="M2.6 10 10 3.8l7.4 6.2Z" {...R} />
      <Path d="M8.2 17v-4h3.6v4Z" {...N} />
      <Rect
        x="12.6"
        y="11.6"
        width="2"
        height="2"
        rx=".4"
        {...B}
        strokeWidth={0.6}
      />
    </>
  ),
  HOT_HEADED: (
    <>
      <Path
        d="M10 2.6c.5 2.4 4.6 4.4 4.6 8.5A4.6 4.6 0 0 1 10 15.8a4.6 4.6 0 0 1-4.6-4.7c0-2 1.1-3.3 2-4.2.2 1.3.9 2.1 1.7 2.2C9.4 7.3 9.2 4.7 10 2.6Z"
        {...R}
      />
      <Path
        d="M10 15.8c-1.5 0-2.4-1-2.4-2.3 0-1.4 1.3-2.1 2.4-3.5 1.1 1.4 2.4 2.1 2.4 3.5 0 1.3-.9 2.3-2.4 2.3Z"
        {...Y}
      />
    </>
  ),
  IDEALIST: (
    <>
      <Path d="M2.4 15.4 8 11.4M3.4 17.6l6.4-4.4" {...line(K)} />
      <Path d="M2.6 13 7.2 9.8" {...line(B)} />
      <Path
        d="m13.2 2.6 1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.9 1.5.6-3.2L8.6 6l3.2-.5Z"
        {...Y}
      />
    </>
  ),
  IMPULSIVE: (
    <>
      <Path d="M6.4 13.6 4.2 15.8l.6-3 1.6.8Z" {...O} strokeWidth={0.6} />
      <Path
        d="M7.6 12.4c-1.4.4-2.6 1.6-3 3.4 1.8-.4 3-1.6 3.4-3Z"
        {...Y}
        strokeWidth={0.6}
      />
      <Path
        d="M16.8 3.2c-4.2.2-7.8 3.4-9.4 8l2.2 2.2c4.6-1.6 7.8-5.2 7.2-10.2Z"
        {...W}
      />
      <Circle cx="12.6" cy="7.4" r="1.4" {...B} strokeWidth={0.8} />
      <Path
        d="m7.4 11.2-2-.2 1.6-2.4 2.2.2ZM8.8 12.6l.2 2 2.4-1.6-.2-2.2Z"
        {...R}
        strokeWidth={0.6}
      />
    </>
  ),
  INSECURE: (
    <>
      <Path d="M5 13.8v1.8M14.2 13.8v1.8" {...line(G)} strokeWidth={1.8} />
      <Path d="M3.4 13.6a6.6 6.6 0 0 1 13.2 0Z" {...G} />
      <Path
        d="M6.6 13.4 8.2 9.8h3.6l1.6 3.6M8.2 9.8 10 7.2l1.8 2.6"
        {...line(G)}
      />
      <Path d="M2.6 13.6h14.8" {...line(N)} strokeWidth={1.6} />
      <Path
        d="M15.8 3.4c.8 1 1.2 1.6 1.2 2.2a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.2 1.2-2.2Z"
        {...B}
        strokeWidth={0.7}
      />
    </>
  ),
  INVENTOR: (
    <>
      <Circle
        cx="10"
        cy="10"
        r="5.6"
        {...line(S)}
        strokeWidth={3.2}
        strokeDasharray="2.2 2.2"
      />
      <Circle cx="10" cy="10" r="4.4" {...S} />
      <Circle cx="10" cy="10" r="1.8" {...Y} strokeWidth={0.8} />
    </>
  ),
  JEALOUS: (
    <>
      <Path
        d="M4.4 15.8c-1.6 0-2.2-1.3-1.5-2.5.9-1.9 4-.7 5.2-3.1 1-2.1-.4-3.7.6-5.1.9-1.2 3.1-1.2 3.9.4"
        {...line(G)}
        strokeWidth={2.6}
      />
      <Path
        d="M4.4 15.8c3.3 0 3.5-3.7 6.4-3.7 2.7 0 2.5 2.7 4.5 2.7 1.6 0 2.3-1.4 2.3-2.7"
        {...line(G)}
        strokeWidth={2.6}
      />
      <Circle cx="11.4" cy="5.4" r=".7" {...dot(D)} />
      <Path d="m12.8 6.4 1.4.6-.4.6M14.2 7l.6-.6" {...line(R)} />
    </>
  ),
  KNOW_IT_ALL: (
    <>
      <Path
        d="M5.4 9v3.4c0 1.4 2 2.6 4.6 2.6s4.6-1.2 4.6-2.6V9L10 11.2Z"
        {...D}
      />
      <Path d="M10 3.6 18 7.4l-8 3.8-8-3.8Z" {...D} />
      <Path d="M7 6.6l3-1.4" {...HI} />
      <Path d="M10 7.4 15.8 9.2v4.4" {...line(Y)} />
      <Circle cx="15.8" cy="14.4" r=".9" {...Y} strokeWidth={0.6} />
      <Sparkle x={3.8} y={14} size={0.55} />
    </>
  ),
  LAZY: (
    <>
      <Rect x="2.4" y="10" width="15.2" height="6.4" rx="3.2" {...B} />
      <Path d="M5 13.2h10" {...HI} strokeDasharray="1.2 1.6" />
      <Path d="M10.4 3.4h3l-3 3h3M14.6 1.8h2l-2 2h2" {...line(P)} />
    </>
  ),
  LEADER: (
    <>
      <Path d="M3.6 8.2h3l6.6-4.2v12l-6.6-4.2h-3Z" {...R} />
      <Path d="M5.4 11.8 6.6 16h1.8l-.6-4.2" {...S} strokeWidth={0.8} />
      <Path
        d="M15.6 7.6c1 .8 1 4 0 4.8M17.2 6c1.8 1.6 1.8 6.4 0 8"
        {...line(Y)}
      />
    </>
  ),
  LIAR: (
    <>
      <Path
        d="M3.4 4.4h9.8a1.4 1.4 0 0 1 1.4 1.4v5.8a1.4 1.4 0 0 1-1.4 1.4H8.6l-3.2 2.4v-2.4h-2a1.4 1.4 0 0 1-1.4-1.4V5.8a1.4 1.4 0 0 1 1.4-1.4Z"
        {...D}
      />
      <Path d="M4.6 8.6c.8-1 1.6-1 2.4 0s1.6 1 2.4 0 1.6-1 2.4 0" {...HI} />
      <Path
        d="M16.4 17.4c-1.4 0-2.2-.9-2.2-2 0-1.2 1.2-1.8 2.2-3.2 1 1.4 2.2 2 2.2 3.2 0 1.1-.8 2-2.2 2Z"
        {...R}
        strokeWidth={0.7}
      />
    </>
  ),
  LONER: (
    <>
      <Circle cx="10" cy="10" r="7.2" {...line(S)} strokeDasharray="1.6 2" />
      <Path d="M6.6 14.4c.4-1.9 1.8-3 3.4-3s3 1.1 3.4 3Z" {...B} />
      <Circle cx="10" cy="7.8" r="2.2" {...O} />
    </>
  ),
  LOYAL: (
    <>
      <Ellipse cx="10" cy="12.6" rx="3.4" ry="3" {...N} />
      <Ellipse cx="5" cy="8.2" rx="1.5" ry="1.9" {...N} />
      <Ellipse cx="8.2" cy="5.4" rx="1.5" ry="1.9" {...N} />
      <Ellipse cx="11.8" cy="5.4" rx="1.5" ry="1.9" {...N} />
      <Ellipse cx="15" cy="8.2" rx="1.5" ry="1.9" {...N} />
    </>
  ),
  MANIPULATIVE: (
    <>
      <Path
        d="M10 3.2v3.4M6 2.8v3.4M14 2.8v3.4"
        {...line(S)}
        strokeDasharray="1 1.2"
      />
      <Path
        d="M2.6 8.4C4 6.6 7 6.8 10 8c3-1.2 6-1.4 7.4.4.6 3-1.4 5.4-3.8 5.2-1.8-.2-2.6-1.6-3.6-1.6s-1.8 1.4-3.6 1.6C4 13.8 2 11.4 2.6 8.4Z"
        {...P}
      />
      <Ellipse cx="6.6" cy="10" rx="1.5" ry="1" {...dot(D)} />
      <Ellipse cx="13.4" cy="10" rx="1.5" ry="1" {...dot(D)} />
    </>
  ),
  MATCHMAKER: (
    <>
      <Path d="M3 15.1 16 5.4" {...line(N)} />
      <Path
        d="M10 16s-5.6-3.4-5.6-7.4A3 3 0 0 1 10 6.8a3 3 0 0 1 5.6 1.8c0 4-5.6 7.4-5.6 7.4Z"
        {...K}
      />
      <Path d="M17.6 4.2 16.66 6.28 15.34 4.52Z" {...S} strokeWidth={0.6} />
      <Path
        d="M3.6 14.6 3 12.8M3.6 14.6l1.8.6M2.4 15.6l-.6-1.8M2.4 15.6l1.8.6"
        {...line(R)}
      />
      <Path d="M7.2 9a1.5 1.5 0 0 1 1.2-1.2" {...HI} />
    </>
  ),
  MENTOR: (
    <>
      <Path d="M8.4 3.6a1.6 1.6 0 0 1 3.2 0" {...line(S)} />
      <Path d="M6.4 5.2h7.2l-1 1.4H7.4Z" {...D} />
      <Rect x="6.6" y="6.6" width="6.8" height="8" rx="1.2" {...Y} />
      <Path
        d="M10 8.8c.8 1 1.2 1.6 1.2 2.4a1.2 1.2 0 0 1-2.4 0c0-.8.4-1.4 1.2-2.4Z"
        {...O}
        strokeWidth={0.6}
      />
      <Path d="M8 8v4.8" {...HI} />
      <Rect x="6.2" y="14.6" width="7.6" height="1.8" rx=".5" {...D} />
      <Sparkle x={16.2} y={6.4} size={0.6} />
      <Sparkle x={3.8} y={9.6} size={0.45} tone={O} />
    </>
  ),
  MOODY: (
    <>
      <Circle cx="12.6" cy="7" r="3.6" {...Y} />
      <Path d="M12.6 1.8v1.2M17.8 7h-1.2M16.2 3.4l-.9.9" {...line(O)} />
      <Path
        d="M4.6 15.6a3 3 0 0 1 .4-6 4 4 0 0 1 7.6.8 2.6 2.6 0 0 1 .8 5.2Z"
        {...S}
      />
    </>
  ),
  MUSIC_LOVER: (
    <>
      <Path d="M7.4 14.4V4.8l9-1.8v9.6" {...line(P)} strokeWidth={1.6} />
      <Path d="M7.4 7.4l9-1.8" {...line(P)} strokeWidth={1.6} />
      <Ellipse cx="5.4" cy="14.6" rx="2.2" ry="1.7" {...P} />
      <Ellipse cx="14.4" cy="12.8" rx="2.2" ry="1.7" {...K} />
    </>
  ),
  MYSTERIOUS: (
    <>
      <Path d="M5.4 17.2h9.2l-1.2-2.6H6.6Z" {...N} />
      <Circle cx="10" cy="9" r="6" {...P} />
      <Path d="M7 6.6a3.4 3.4 0 0 1 2.4-1.6" {...HI} />
      <Sparkle x={11.4} y={10} size={0.7} tone={W} />
      <Sparkle x={8} y={11.6} size={0.4} tone={W} />
    </>
  ),
  NEAT_FREAK: (
    <>
      <Circle cx="7.6" cy="11.6" r="4.2" {...B} />
      <Circle cx="13.8" cy="7" r="2.7" {...T} />
      <Circle cx="13.9" cy="14.3" r="1.7" {...K} />
      <Path d="M5.6 10a2 2 0 0 1 1.7-1.5" {...HI} />
      <Sparkle x={5.2} y={4.4} size={0.65} />
    </>
  ),
  NIGHT_OWL: (
    <>
      <Path
        d="M13.6 13.8A6.3 6.3 0 0 1 8.4 3.2a6.5 6.5 0 1 0 8.2 8.4 6.2 6.2 0 0 1-3 2.2Z"
        {...Y}
      />
      <Sparkle x={14.2} y={5} size={0.75} tone={B} />
      <Sparkle x={16.6} y={8.8} size={0.45} tone={P} />
    </>
  ),
  NOSTALGIC: (
    <>
      <Rect
        x="3.4"
        y="3"
        width="13.2"
        height="14.4"
        rx="1.2"
        {...W}
        transform="rotate(-6 10 10)"
      />
      <Path
        d="M5.4 4.6h9.2v8.2H5.4Z"
        fill="#BFE9FF"
        stroke="none"
        transform="rotate(-6 10 10)"
      />
      <Path
        d="M5.4 12.8 8.4 9.6l2.2 2 1.6-1.4 2.4 2.6Z"
        {...G}
        strokeWidth={0.6}
        transform="rotate(-6 10 10)"
      />
      <Circle
        cx="12.4"
        cy="6.8"
        r="1.1"
        {...Y}
        strokeWidth={0.6}
        transform="rotate(-6 10 10)"
      />
    </>
  ),
  OBSESSIVE: (
    <>
      <Rect x="2.4" y="3" width="15.2" height="13" rx="1.4" {...N} />
      <Path d="M5.6 6.6 13.8 8.6 7 13l7.2-.4" {...line(R)} />
      <Circle cx="5.6" cy="6.6" r="1" {...R} strokeWidth={0.5} />
      <Circle cx="13.8" cy="8.6" r="1" {...R} strokeWidth={0.5} />
      <Circle cx="7" cy="13" r="1" {...R} strokeWidth={0.5} />
      <Circle cx="14.2" cy="12.6" r="1" {...R} strokeWidth={0.5} />
    </>
  ),
  OPTIMIST: (
    <>
      <Path d="M2.6 14.6a7.4 7.4 0 0 1 14.8 0" {...line(R)} strokeWidth={2} />
      <Path d="M5.2 14.6a4.8 4.8 0 0 1 9.6 0" {...line(Y)} strokeWidth={2} />
      <Path d="M7.8 14.6a2.2 2.2 0 0 1 4.4 0" {...line(B)} strokeWidth={2} />
      <Sparkle x={16} y={4.2} size={0.75} />
    </>
  ),
  OVERTHINKER: (
    <>
      <Path
        d="M5.4 13.6a3.2 3.2 0 0 1 .4-6.4 4.2 4.2 0 0 1 8 .8 2.8 2.8 0 0 1 .8 5.6Z"
        {...W}
      />
      <Path
        d="M7.2 10.4c.6-1.6 2.6-1.6 2.6 0s-2.8 1.4-2 2.4c.8 1 3.6.2 3.4-1.6-.2-1.6 2.2-2.2 2.6-.4"
        {...line(P)}
      />
      <Circle cx="5" cy="16" r=".9" {...W} strokeWidth={0.6} />
      <Circle cx="3.2" cy="17.6" r=".6" {...W} strokeWidth={0.6} />
    </>
  ),
  PARANOID: (
    <>
      <Path
        d="M2.4 10S5.2 5 10 5s7.6 5 7.6 5-2.8 5-7.6 5-7.6-5-7.6-5Z"
        {...W}
      />
      <Circle cx="10" cy="10" r="2.8" {...T} />
      <Circle cx="10" cy="10" r="1.1" {...dot(D)} />
      <Path d="M10 2v1.4M4.2 3.4l.8 1.1M15.8 3.4l-.8 1.1" {...line(R)} />
    </>
  ),
  PARTY_ANIMAL: (
    <>
      <Path d="M3 17 6.4 7.6l6 6Z" {...P} />
      <Path d="m4.7 12.3 3 3" {...line(Y)} strokeWidth={1.4} />
      <Path d="m9.6 4 .8 1.6M15.6 11.4l1.6.4M13.8 3.6l-.8 1.4" {...line(K)} />
      <Circle cx="15.6" cy="7.8" r=".9" {...Y} strokeWidth={0.5} />
      <Circle cx="12" cy="2.6" r=".7" {...B} strokeWidth={0.5} />
      <Circle cx="17" cy="14.6" r=".7" {...G} strokeWidth={0.5} />
      <Sparkle x={11.8} y={8.2} size={0.7} tone={O} />
    </>
  ),
  PASSIONATE: (
    <>
      <Path
        d="M10 17s-6-3.6-6-8a3.3 3.3 0 0 1 6-1.9A3.3 3.3 0 0 1 16 9c0 4.4-6 8-6 8Z"
        {...R}
      />
      <Path
        d="M10 6.4c-.8-1-.6-2.4.4-3.6.2 1 1 1.4 1.2 2.4.2.8-.4 1.6-1.6 1.2Z"
        {...O}
        strokeWidth={0.7}
      />
      <Path d="M6.6 9.4a1.5 1.5 0 0 1 1.2-1.3" {...HI} />
    </>
  ),
  PATIENT: (
    <>
      <Path d="M5 2.8h10M5 17.2h10" {...line(N)} strokeWidth={1.8} />
      <Path
        d="M6.2 2.8h7.6c0 3.4-2.6 4.8-2.6 7.2s2.6 3.8 2.6 7.2H6.2c0-3.4 2.6-4.8 2.6-7.2S6.2 6.2 6.2 2.8Z"
        {...W}
      />
      <Path
        d="M7.4 16.4c.4-1.8 1.4-2.6 2.6-2.6s2.2.8 2.6 2.6Z"
        {...Y}
        strokeWidth={0.6}
      />
      <Path
        d="M8 5.4h4c-.4 1-1.2 1.6-2 2.4-.8-.8-1.6-1.4-2-2.4Z"
        {...Y}
        strokeWidth={0.6}
      />
    </>
  ),
  PEOPLE_PLEASER: (
    <>
      <Rect x="4" y="8.4" width="12" height="8.2" rx="1.4" {...K} />
      <Rect x="3.2" y="6.8" width="13.6" height="3" rx="1" {...K} />
      <Path d="M10 6.8v9.8" {...line(Y)} strokeWidth={2} />
      <Path
        d="M10 6.8C9 4 6 3.4 6 5.4c0 1.2 2.4 1.4 4 1.4Zm0 0c1-2.8 4-3.4 4-1.4 0 1.2-2.4 1.4-4 1.4Z"
        {...Y}
      />
    </>
  ),
  PERFECTIONIST: (
    <>
      <Circle cx="9.4" cy="10.6" r="6.6" {...R} />
      <Circle cx="9.4" cy="10.6" r="4.4" {...W} />
      <Circle cx="9.4" cy="10.6" r="2.2" {...R} />
      <Path d="m9.4 10.6 7-7" {...line(N)} />
      <Path d="m14.6 3.2 1.8-1 .2 1.6 1.6.2-1 1.8" {...B} strokeWidth={0.7} />
    </>
  ),
  PETTY: (
    <>
      <Rect x="4" y="2.8" width="12" height="14.4" rx="1.4" {...K} />
      <Path d="M6.6 6.4h6.8M6.6 9.2h6.8M6.6 12h4" {...HI} />
      <Path d="m12 11 3 3M15 11l-3 3" {...line(R)} strokeWidth={1.6} />
    </>
  ),
  PHILOSOPHER: (
    <>
      <Rect x="6.2" y="6.4" width="7.6" height="8.4" {...W} />
      <Path d="M8.2 7.4v6.4M10 7.4v6.4M11.8 7.4v6.4" {...line(S)} />
      <Path d="M5 5h10l-1 1.4H6Z" {...Y} />
      <Rect x="3.6" y="2.6" width="12.8" height="2.4" rx=".6" {...Y} />
      <Rect x="4.4" y="14.8" width="11.2" height="2.6" rx=".6" {...Y} />
    </>
  ),
  PLAYFUL: (
    <>
      <Path d="M9.6 12.2c-.4 1.8-2.2 1.6-2.8 3s-1.6 2-3 1.8" {...line(P)} />
      <Path d="M15.8 2.4 17.1 7.8 9.6 12.2l.8-8.6Z" {...K} />
      <Path d="M15.8 2.4 9.6 12.2M10.4 3.6l6.7 4.2" {...HI} />
      <Circle cx="7" cy="14.8" r=".9" {...Y} strokeWidth={0.5} />
      <Circle cx="4.6" cy="16.8" r=".9" {...B} strokeWidth={0.5} />
    </>
  ),
  POLYGLOT: (
    <>
      <Circle cx="8.6" cy="11" r="6" {...B} />
      <Path
        d="M5.4 8.4c1-.8 2.6-.6 3 .4s-.6 1.8-1.6 2-1.2 1.6-2.2 1C4 11 4.4 9.2 5.4 8.4Z"
        {...G}
        strokeWidth={0.6}
      />
      <Path
        d="M9.8 12.6c1-.2 2.2.4 2.2 1.4s-1 1.8-2 1.4c-.8-.4-1-2.6-.2-2.8Z"
        {...G}
        strokeWidth={0.6}
      />
      <Path
        d="M12.4 2.4h4.8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2.4l-1.8 1.4V7.4h-.6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
        {...Y}
      />
      <Path d="M13.8 4.9h2" {...line(Y)} />
    </>
  ),
  POSSESSIVE: (
    <>
      <Path
        d="M10 17s-6-3.6-6-8a3.3 3.3 0 0 1 6-1.9A3.3 3.3 0 0 1 16 9c0 4.4-6 8-6 8Z"
        {...K}
      />
      <Ellipse
        cx="5.6"
        cy="13"
        rx="2.8"
        ry="1.5"
        transform="rotate(-36 5.6 13)"
        fill="none"
        stroke={S.stroke}
        strokeWidth={1.8}
      />
      <Path
        d="M8.2 11.1 10.6 9.3"
        fill="none"
        stroke={S.stroke}
        strokeWidth={1.8}
      />
      <Ellipse
        cx="13.2"
        cy="7.4"
        rx="2.8"
        ry="1.5"
        transform="rotate(-36 13.2 7.4)"
        fill="none"
        stroke={S.stroke}
        strokeWidth={1.8}
      />
      <Ellipse
        cx="5.6"
        cy="13"
        rx="2.8"
        ry="1.5"
        transform="rotate(-36 5.6 13)"
        fill="none"
        stroke={S.fill}
        strokeWidth={0.7}
      />
      <Ellipse
        cx="13.2"
        cy="7.4"
        rx="2.8"
        ry="1.5"
        transform="rotate(-36 13.2 7.4)"
        fill="none"
        stroke={S.fill}
        strokeWidth={0.7}
      />
    </>
  ),
  PRAGMATIC: (
    <>
      <Rect x="4.4" y="3.8" width="11.2" height="13.4" rx="1.6" {...N} />
      <Rect x="6" y="5.6" width="8" height="10" rx=".8" {...W} />
      <Rect x="7.8" y="3" width="4.4" height="2.2" rx=".8" {...S} />
      <Path d="m7.2 9 1 1 1.8-1.8M7.2 12.6l1 1 1.8-1.8" {...line(G)} />
      <Path d="M11.6 9.2h1.4M11.6 12.8h1.4" {...line(S)} />
    </>
  ),
  PROTECTIVE: (
    <>
      <Path
        d="M10 2.6 16 5v4.4c0 3.8-2.6 6.6-6 8-3.4-1.4-6-4.2-6-8V5Z"
        {...B}
      />
      <Path
        d="M10 13.4s-3-1.8-3-4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2.2-3 4-3 4Z"
        fill="#FFFFFF"
        stroke="none"
      />
    </>
  ),
  REBEL: (
    <>
      <Path d="M5.4 17.2V3.4" {...line(N)} strokeWidth={1.8} />
      <Path d="M5.6 3.8h9.6l-2.4 3.1 2.4 3.1H5.6Z" {...R} />
      <Path d="m8.6 5.4 1.8 1.8M10.4 5.4 8.6 7.2" {...HI} />
    </>
  ),
  RECKLESS: (
    <>
      <Path d="M13.8 6.6c.4-1.6 1.4-2.6 2.6-2.8" {...line(N)} />
      <Rect
        x="11.3"
        y="6.5"
        width="3"
        height="2.6"
        rx=".6"
        transform="rotate(45 12.8 7.8)"
        {...S}
      />
      <Circle cx="9" cy="11.6" r="5.4" {...D} />
      <Path d="M6.2 9.6a3 3 0 0 1 1.8-1.6" {...HI} />
      <Sparkle x={16.8} y={3.4} size={0.8} tone={O} />
    </>
  ),
  RESILIENT: (
    <>
      <Path
        d="M2.6 17.2 4 11.6l3.4-1.6 2 1.2 1.6-.2 1.6.2 3.4 1.2 1.4 4.8Z"
        {...S}
      />
      <Path d="m10.2 11.2-.8 2.2 1.2 1.4-.6 2.4" {...line(D)} />
      <Path d="M10.2 11.2V6.4" {...line(G)} />
      <Path d="M10.2 8.2C8.6 8.4 7 7.4 6.8 5.4c2-.2 3.4 1 3.4 2.8Z" {...G} />
      <Path d="M10.2 7c.2-2 1.8-3.4 3.8-3.2-.2 2-1.8 3.2-3.8 3.2Z" {...G} />
    </>
  ),
  ROMANTIC: (
    <>
      <Path
        d="M10 16.2s-6.2-3.7-6.2-8.2A3.4 3.4 0 0 1 10 6.1 3.4 3.4 0 0 1 16.2 8c0 4.5-6.2 8.2-6.2 8.2Z"
        {...R}
      />
      <Path d="M6.4 7.8a1.6 1.6 0 0 1 1.4-1.2" {...HI} />
      <Sparkle x={16.2} y={3.4} size={0.65} tone={K} />
    </>
  ),
  RUTHLESS: (
    <>
      <Path
        d="M10 3a5.6 5.6 0 0 0-5.6 5.6c0 2 1 3.2 2 3.8v2.2a1 1 0 0 0 1 1h5.2a1 1 0 0 0 1-1v-2.2c1-.6 2-1.8 2-3.8A5.6 5.6 0 0 0 10 3Z"
        {...W}
      />
      <Circle cx="7.8" cy="9" r="1.4" {...dot(D)} />
      <Circle cx="12.2" cy="9" r="1.4" {...dot(D)} />
      <Path d="M9 13.2v2.4M11 13.2v2.4" {...line(S)} />
    </>
  ),
  SARCASTIC: (
    <>
      <Face />
      <Circle cx="7.9" cy="7.6" r="1.6" {...W} strokeWidth={0.6} />
      <Circle cx="12.1" cy="7.6" r="1.6" {...W} strokeWidth={0.6} />
      <Circle cx="7.9" cy="6.8" r=".7" {...dot(D)} />
      <Circle cx="12.1" cy="6.8" r=".7" {...dot(D)} />
      <Path d="M7.4 13.2c1.6.4 3.6.2 5.2-.6" {...line(O)} />
    </>
  ),
  SECRETIVE: (
    <>
      <Path
        d="M6.8 8.6V6.4a3.2 3.2 0 0 1 6.4 0v2.2"
        {...line(S)}
        strokeWidth={1.8}
      />
      <Rect x="4.4" y="8.6" width="11.2" height="8.6" rx="1.8" {...Y} />
      <Circle cx="10" cy="12.2" r="1.2" {...dot(N)} />
      <Path d="M10 13v1.9" {...line(N)} strokeWidth={1.4} />
    </>
  ),
  SENSITIVE: (
    <>
      <Path
        d="M10 3c2.5 3.4 4.8 5.8 4.8 8.5a4.8 4.8 0 0 1-9.6 0C5.2 8.8 7.5 6.4 10 3Z"
        {...B}
      />
      <Path d="M7.8 12.2c.2 1.1 1.1 1.8 2.2 1.9" {...HI} />
    </>
  ),
  SHUTTERBUG: (
    <>
      <Path d="M7 5.4 8 3.8h4l1 1.6Z" {...S} />
      <Rect x="2.6" y="5.4" width="14.8" height="10.6" rx="1.8" {...D} />
      <Circle cx="10" cy="10.6" r="3.8" {...S} />
      <Circle cx="10" cy="10.6" r="2.4" {...B} />
      <Path d="M8.8 9.6a1.4 1.4 0 0 1 1.2-.8" {...HI} />
      <Circle cx="14.8" cy="7.6" r=".7" {...R} strokeWidth={0.5} />
    </>
  ),
  SHY: (
    <>
      <Face />
      <Ellipse
        cx="6.5"
        cy="11.8"
        rx="1.4"
        ry=".8"
        fill="#FF8FC7"
        stroke="none"
      />
      <Ellipse
        cx="13.5"
        cy="11.8"
        rx="1.4"
        ry=".8"
        fill="#FF8FC7"
        stroke="none"
      />
      <Path
        d="M7.1 9.3c.4.4 1 .4 1.4 0M11.5 9.3c.4.4 1 .4 1.4 0M9 13c.6.4 1.4.4 2 0"
        {...line(O)}
      />
    </>
  ),
  SKEPTIC: (
    <>
      <Path
        d="M4 4.4h12a1.4 1.4 0 0 1 1.4 1.4v6.8a1.4 1.4 0 0 1-1.4 1.4H9l-3.4 2.6v-2.6H4a1.4 1.4 0 0 1-1.4-1.4V5.8A1.4 1.4 0 0 1 4 4.4Z"
        {...T}
      />
      <Path d="M8.4 7.6a1.7 1.7 0 1 1 2.4 1.6c-.5.2-.8.6-.8 1.1" {...HI} />
      <Circle cx="10" cy="12" r=".7" fill="#FFFFFF" stroke="none" />
    </>
  ),
  SLOB: (
    <>
      <Path d="M3.4 5.6c4.1-2.5 9.1-2.5 13.2 0L10 17.2Z" {...Y} />
      <Path
        d="M3.4 5.6c4.1-2.5 9.1-2.5 13.2 0l-.9 1.6c-3.6-2-7.8-2-11.4 0Z"
        {...O}
      />
      <Circle cx="8.4" cy="8.8" r="1.1" {...R} strokeWidth={0.5} />
      <Circle cx="11.6" cy="10.6" r="1.1" {...R} strokeWidth={0.5} />
      <Circle cx="9.8" cy="13.2" r="1" {...G} strokeWidth={0.5} />
    </>
  ),
  SOCIAL_BUTTERFLY: (
    <>
      <Path d="M10 6.6C8.4 3.8 3.4 3 3.6 6.4c.2 2.4 2.6 3.4 6.4 3.6Z" {...K} />
      <Path d="M10 6.6c1.6-2.8 6.6-3.6 6.4-.2-.2 2.4-2.6 3.4-6.4 3.6Z" {...P} />
      <Path d="M10 10c-3 .3-5.2 1.8-4.6 3.8.6 1.8 3.2 1 4.6-1.4Z" {...O} />
      <Path d="M10 10c3 .3 5.2 1.8 4.6 3.8-.6 1.8-3.2 1-4.6-1.4Z" {...Y} />
      <Path d="M10 5.4v10M9 4.2l-.8-1.4M11 4.2l.8-1.4" {...line(D)} />
    </>
  ),
  STARGAZER: (
    <>
      <Path d="M8.6 12 5.6 17.4M8.6 12l3.2 5.4M8.6 12v5.4" {...line(N)} />
      <Rect
        x="1.8"
        y="9.2"
        width="1.4"
        height="1.6"
        rx=".3"
        transform="rotate(-26 10 10)"
        {...S}
      />
      <Rect
        x="3"
        y="8.6"
        width="10"
        height="2.8"
        rx=".6"
        transform="rotate(-26 10 10)"
        {...P}
      />
      <Rect
        x="13"
        y="7.8"
        width="3"
        height="4.4"
        rx=".6"
        transform="rotate(-26 10 10)"
        {...B}
      />
      <Path d="M4.6 9.6h7" transform="rotate(-26 10 10)" {...HI} />
      <Sparkle x={16.6} y={2.8} size={0.6} />
      <Sparkle x={11.4} y={3.2} size={0.45} tone={B} />
    </>
  ),
  STOIC: (
    <>
      <Path d="M2.6 15.8 7.6 6.6l2.8 3.8 1.9-2.6 5.1 8Z" {...S} />
      <Path d="m6.4 8.8 1.2 1.3 1.1-1" {...HI} />
      <Path d="M2.6 15.8h14.8" {...line(G)} />
    </>
  ),
  STORYTELLER: (
    <>
      <Path
        d="M10 3.4c.4 2 3.8 3.6 3.8 7a3.8 3.8 0 0 1-7.6 0c0-1.6.9-2.7 1.6-3.4.2 1 .8 1.7 1.4 1.8C8.8 7.4 9.4 5.2 10 3.4Z"
        {...O}
      />
      <Path
        d="M10 14.2c-1.2 0-2-.8-2-1.9 0-1.1 1.1-1.7 2-2.9.9 1.2 2 1.8 2 2.9 0 1.1-.8 1.9-2 1.9Z"
        {...Y}
      />
      <Path
        d="M3.6 16.6 16 13.8M4 13.8l12.4 2.8"
        {...line(N)}
        strokeWidth={1.8}
      />
      <Sparkle x={15.6} y={4.4} size={0.55} />
      <Sparkle x={4.4} y={5.8} size={0.4} tone={O} />
    </>
  ),
  STRATEGIST: (
    <>
      <Path d="M5.4 16.8h9.2l-.8-3.2H6.2Z" {...D} />
      <Path d="M8.2 8.2h3.6l1 5.4H7.2Z" {...D} />
      <Circle cx="10" cy="5.6" r="2.3" {...D} />
      <Path d="M8.8 4.8a1.2 1.2 0 0 1 1-.6" {...HI} />
    </>
  ),
  STREET_SMART: (
    <>
      <Path d="M10 6.4v11" {...line(S)} strokeWidth={1.8} />
      <Path d="M3.4 3.4h11.4l2 2.2-2 2.2H3.4Z" {...G} />
      <Path d="M5.4 5.6h6.6M10 4.4l1.6 1.2-1.6 1.2" {...HI} />
      <Path d="M7 15.4h6" {...line(N)} strokeWidth={1.8} />
    </>
  ),
  SWEET_TOOTH: (
    <>
      <Path d="M10 11v6.6" {...line(S)} strokeWidth={1.6} />
      <Circle cx="10" cy="7.4" r="5" {...K} />
      <Path
        d="M10 7.4c0-.8 1-1.2 1.6-.6.8.8.2 2.2-.8 2.4-1.6.4-2.8-1-2.6-2.4.2-1.8 2.2-2.8 3.8-2.2 2 .8 2.4 3.4 1.2 5"
        {...HI}
        strokeWidth={1.4}
      />
      <Path d="m10 13.4-2-1v2Zm0 0 2-1v2Z" {...Y} strokeWidth={0.6} />
    </>
  ),
  TEASE: (
    <>
      <Face />
      <Path d="m6.8 8.2 1.6 1-1.6 1M13.2 8.2l-1.6 1 1.6 1" {...line(O)} />
      <Path
        d="M8.8 12.4v1.4a1.2 1.2 0 0 0 2.4 0v-1.4Z"
        {...K}
        strokeWidth={0.8}
      />
      <Path d="M7 12.4h6" {...line(O)} />
    </>
  ),
  TECH_WHIZ: (
    <>
      <Rect x="4" y="4" width="12" height="8.6" rx="1" {...D} />
      <Rect
        x="5.4"
        y="5.4"
        width="9.2"
        height="5.8"
        rx=".4"
        {...B}
        strokeWidth={0.6}
      />
      <Path
        d="m7.8 7.2-1.2 1.1 1.2 1.1M12.2 7.2l1.2 1.1-1.2 1.1M10.6 6.8l-1.2 3"
        {...HI}
      />
      <Path d="M2 13.4h16l-1.2 2.4H3.2Z" {...S} />
    </>
  ),
  TWO_FACED: (
    <>
      <Path d="M10 3.8a6.6 6.6 0 0 0 0 13.2Z" {...Y} />
      <Path d="M10 3.8a6.6 6.6 0 0 1 0 13.2Z" {...P} />
      <Path
        d="M6.4 9.4c.4-.6 1.4-.6 1.8 0M6.6 12.6c.8 1.2 2.2 1.6 3.4 1.4"
        {...line(O)}
      />
      <Path d="m11.6 8.8 2-.6M10 13.6c1.2-.6 2.4-.6 3.2.2" {...line(D)} />
      <Circle cx="12.8" cy="10.2" r=".7" {...dot(D)} />
    </>
  ),
  VAIN: (
    <>
      <Path d="M10.4 13.4 7.6 17.8" {...line(N)} strokeWidth={2.2} />
      <Ellipse cx="11.6" cy="8" rx="5.2" ry="5.6" {...K} />
      <Ellipse
        cx="11.6"
        cy="8"
        rx="3.8"
        ry="4.2"
        fill="#BFE9FF"
        stroke="#2B87D1"
        strokeWidth={0.6}
      />
      <Path d="M9.6 6.6a2.6 2.6 0 0 1 1.6-2" {...HI} />
      <Sparkle x={4.6} y={5} size={0.7} />
      <Sparkle x={13.4} y={9.6} size={0.5} tone={W} />
    </>
  ),
  VENGEFUL: (
    <>
      <Path d="M10.2 2.4 12.2 4.4 6.4 13.6l-1.8-1.6Z" {...S} />
      <Path d="m3.4 11.4 5 5" {...line(O)} strokeWidth={2} />
      <Path d="M5.4 15.2 3.4 17.2" {...line(N)} strokeWidth={2} />
      <Circle cx="3" cy="17.4" r="1" {...R} strokeWidth={0.5} />
    </>
  ),
  WALLFLOWER: (
    <>
      <Rect x="2.6" y="3" width="9" height="14.2" rx=".8" {...O} />
      <Path
        d="M2.6 6.6h9M2.6 10.2h9M2.6 13.8h9M6.4 3v3.6M9 6.6v3.6M5 10.2v3.6M8 13.8v3.4"
        {...line(O)}
      />
      <Path d="M14.6 17.2V9.6" {...line(G)} />
      <Path
        d="M14.6 13.6c1.4-.2 2.4-1 2.6-2.4-1.4 0-2.4.8-2.6 2.4Z"
        {...G}
        strokeWidth={0.6}
      />
      <Circle cx="14.6" cy="6.4" r="1.3" {...K} strokeWidth={0.6} />
      <Circle cx="16.2" cy="8" r="1.3" {...K} strokeWidth={0.6} />
      <Circle cx="14.6" cy="9.6" r="1.3" {...K} strokeWidth={0.6} />
      <Circle cx="13" cy="8" r="1.3" {...K} strokeWidth={0.6} />
      <Circle cx="14.6" cy="8" r="1" {...Y} strokeWidth={0.6} />
    </>
  ),
  WANDERLUST: (
    <>
      <Path
        d="M7.6 5.6V4a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v1.6"
        {...line(N)}
        strokeWidth={1.6}
      />
      <Path d="M5.4 16v1.2M14.6 16v1.2" {...line(D)} strokeWidth={1.6} />
      <Rect x="3" y="5.6" width="14" height="10.4" rx="1.6" {...T} />
      <Path d="M6.4 5.6V16M13.6 5.6V16" {...line(T)} />
      <Circle cx="10" cy="9.2" r="1.6" {...Y} strokeWidth={0.6} />
      <Rect
        x="8.6"
        y="11.8"
        width="3.4"
        height="2.2"
        rx=".4"
        transform="rotate(-10 10.3 12.9)"
        {...K}
        strokeWidth={0.6}
      />
    </>
  ),
  WISE: (
    <>
      <Path d="M5.4 17.4h9.2" {...line(G)} strokeWidth={1.6} />
      <Path
        d="M4.6 5.4 6 3.4l1.6 1.4h4.8L14 3.4l1.4 2v6.4a5.4 5.4 0 0 1-10.8 0Z"
        {...N}
      />
      <Circle cx="7.8" cy="8.4" r="2" {...W} />
      <Circle cx="12.2" cy="8.4" r="2" {...W} />
      <Circle cx="7.8" cy="8.4" r=".9" {...dot(D)} />
      <Circle cx="12.2" cy="8.4" r=".9" {...dot(D)} />
      <Path d="M9.2 10.4h1.6L10 11.8Z" {...O} strokeWidth={0.6} />
      <Path d="M7.4 13.6c.8.6 1.6.6 2.6 0 1 .6 1.8.6 2.6 0" {...line(N)} />
    </>
  ),
  WITTY: (
    <>
      <Path
        d="M4 3.8h12a1.4 1.4 0 0 1 1.4 1.4v7a1.4 1.4 0 0 1-1.4 1.4H9.4l-3.6 2.6v-2.6H4a1.4 1.4 0 0 1-1.4-1.4v-7A1.4 1.4 0 0 1 4 3.8Z"
        {...O}
      />
      <Path
        d="m11 5.6-3.4 4.2h2.6l-1 3.2 3.6-4.6H10Z"
        fill="#FFFFFF"
        stroke="none"
      />
    </>
  ),
  WORKAHOLIC: (
    <>
      <Rect x="2.6" y="6.4" width="14.8" height="10" rx="1.6" {...N} />
      <Path
        d="M7.4 6.4V4.6a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1v1.8"
        {...line(N)}
        strokeWidth={1.6}
      />
      <Path d="M2.6 10.4h14.8" {...line(N)} />
      <Rect
        x="8.6"
        y="9.2"
        width="2.8"
        height="2.4"
        rx=".5"
        {...Y}
        strokeWidth={0.6}
      />
    </>
  ),
};

/** What a trait without its own drawing borrows: its group's emblem. */
const GROUP_FALLBACK: Record<string, string> = {
  DARK: "SECRETIVE",
  EMOTIONAL: "ROMANTIC",
  LIFESTYLE: "HOMEBODY",
  MIND: "BOOKWORM",
  SOCIAL: "CHARMING",
};

type Props = {
  traitKey: string;
  group?: string;
  size?: number;
};

export const TraitGlyph: FC<Props> = ({ traitKey, group, size = 16 }) => {
  const drawing = GLYPHS[traitKey] ??
    (group && GLYPHS[GROUP_FALLBACK[group] ?? ""]) ?? (
      <Sparkle x={10} y={10} size={2.4} />
    );
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {drawing}
    </Svg>
  );
};
