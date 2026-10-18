import type { AccentValue } from "@nw/types/theme";

/**
 * Every colour scale both clients paint from, and which pair each accent uses.
 *
 * Web gets these from CSS: `globals.css` imports the Radix dark scales, defines
 * four of its own, and each accent class remaps twelve accent steps *and*
 * twelve neutral steps onto `--accent-*` and `--bg-*`. React Native has no
 * cascade and no custom properties, so the same numbers have to exist as
 * values — and they must be *the same numbers*, which is why this file is
 * generated from that stylesheet rather than typed by hand.
 *
 * Two things are easy to miss and both are load-bearing:
 *
 *  - **An accent changes the greys too.** Jade is paired with olive, crimson
 *    with mauve, iris and lunar with slate, gold and ember with sand, cyan with
 *    gray, onyx and tobacco with scales of their own. A client that swapped only
 *    the accent would paint a crimson app on olive panels, which is not what web
 *    shows.
 *  - **`--accent` is not always step 6.** The six pastel accents put their
 *    quiet surface at step 6; the seven saturated ones (lime, lotus, dracula,
 *    lunar, ember, onyx, tobacco) put it at step 9, because step 6 of those is too dark
 *    to read a label against. `ACCENT_DEFINITIONS` carries the steps per
 *    accent rather than assuming one rule.
 *
 * Only dark scales are here because only dark scales are imported on web. The
 * accent does not change with the colour scheme on either client.
 */

/** One scale, steps 1-12. Step 1 is the faintest, 12 the boldest. */
export type ColorScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export const AMBER: ColorScale = [
  "#15130a",
  "#201e0e",
  "#342f14",
  "#474015",
  "#595018",
  "#6d621d",
  "#857823",
  "#a39329",
  "#d4bd2c",
  "#dac53e",
  "#d7ca75",
  "#f4f1e1",
];

export const CRIMSON: ColorScale = [
  "#191114",
  "#201318",
  "#381525",
  "#4d122f",
  "#5c1839",
  "#6d2545",
  "#873356",
  "#b0436e",
  "#e93d82",
  "#ee518a",
  "#ff92ad",
  "#fdd3e8",
];

export const CYAN: ColorScale = [
  "#0b161a",
  "#101b20",
  "#082c36",
  "#003848",
  "#004558",
  "#045468",
  "#12677e",
  "#11809c",
  "#00a2c7",
  "#23afd0",
  "#4ccce6",
  "#b6ecf7",
];

export const DRACULA_RED: ColorScale = [
  "#150708",
  "#1f0808",
  "#2d0808",
  "#3b0707",
  "#4d0606",
  "#610606",
  "#860808",
  "#900908",
  "#ac0a0a",
  "#c61415",
  "#ef7b78",
  "#fcd8d5",
];

export const EMBER: ColorScale = [
  "#150e05",
  "#1f1407",
  "#2e1b07",
  "#3c2206",
  "#4b2a06",
  "#5d3406",
  "#784207",
  "#965208",
  "#b3620a",
  "#d97b06",
  "#fc9403",
  "#ffe0bb",
];

export const GRAY: ColorScale = [
  "#111111",
  "#191919",
  "#222222",
  "#2a2a2a",
  "#313131",
  "#3a3a3a",
  "#484848",
  "#606060",
  "#6e6e6e",
  "#7b7b7b",
  "#b4b4b4",
  "#eeeeee",
];

export const IRIS: ColorScale = [
  "#13131e",
  "#171625",
  "#202248",
  "#262a65",
  "#303374",
  "#3d3e82",
  "#4a4a95",
  "#5958b1",
  "#5b5bd6",
  "#6e6ade",
  "#b1a9ff",
  "#e0dffe",
];

export const JADE: ColorScale = [
  "#0d1512",
  "#121c18",
  "#0f2e22",
  "#0b3b2c",
  "#114837",
  "#1b5745",
  "#246854",
  "#2a7e68",
  "#29a383",
  "#27b08b",
  "#1fd8a4",
  "#adf0d4",
];

export const LIME: ColorScale = [
  "#0b100a",
  "#12190e",
  "#182213",
  "#1e2c19",
  "#25371f",
  "#2d4526",
  "#38572f",
  "#436b39",
  "#4a7a38",
  "#5c9247",
  "#8ab876",
  "#d0e6c2",
];

export const LOTUS: ColorScale = [
  "#130d12",
  "#1c1420",
  "#291d2b",
  "#342535",
  "#3e2d3f",
  "#503b4e",
  "#684a64",
  "#8d5e83",
  "#bf7db1",
  "#c98ebb",
  "#d9a8d0",
  "#f0dded",
];

export const LUNAR: ColorScale = [
  "#050810",
  "#0a0f1c",
  "#0f1729",
  "#142038",
  "#1a2c4c",
  "#1e3a8a",
  "#1e40af",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#93c5fd",
  "#dbeafe",
];

export const MAUVE: ColorScale = [
  "#121113",
  "#1a191b",
  "#232225",
  "#2b292d",
  "#323035",
  "#3c393f",
  "#49474e",
  "#625f69",
  "#6f6d78",
  "#7c7a85",
  "#b5b2bc",
  "#eeeef0",
];

export const OLIVE: ColorScale = [
  "#111210",
  "#181917",
  "#212220",
  "#282a27",
  "#2f312e",
  "#383a36",
  "#454843",
  "#5c625b",
  "#687066",
  "#767d74",
  "#afb5ad",
  "#eceeec",
];

export const ONYX: ColorScale = [
  "#0c0b10",
  "#131218",
  "#1b1a24",
  "#22212e",
  "#2a2839",
  "#343147",
  "#45415c",
  "#565273",
  "#6f6b96",
  "#827ead",
  "#b3afd0",
  "#e8e6f4",
];

export const ONYX_NEUTRAL: ColorScale = [
  "#0d0c11",
  "#16151b",
  "#1f1e26",
  "#24232d",
  "#2b2a35",
  "#343341",
  "#414052",
  "#56546a",
  "#63617a",
  "#706e88",
  "#9d9bad",
  "#e9e7f0",
];

export const RED: ColorScale = [
  "#191111",
  "#201314",
  "#3b1219",
  "#500f1c",
  "#611623",
  "#72232d",
  "#8c333a",
  "#b54548",
  "#e5484d",
  "#ec5d5e",
  "#ff9592",
  "#ffd1d9",
];

export const SAND: ColorScale = [
  "#111110",
  "#191918",
  "#222221",
  "#2a2a28",
  "#31312e",
  "#3b3a37",
  "#494844",
  "#62605b",
  "#6f6d66",
  "#7c7b74",
  "#b5b3ad",
  "#eeeeec",
];

export const SLATE: ColorScale = [
  "#111113",
  "#18191b",
  "#212225",
  "#272a2d",
  "#2e3135",
  "#363a3f",
  "#43484e",
  "#5a6169",
  "#696e77",
  "#777b84",
  "#b0b4ba",
  "#edeef0",
];

export const TOBACCO: ColorScale = [
  "#0d0a07",
  "#15100b",
  "#21180f",
  "#2d1f12",
  "#392616",
  "#48301b",
  "#5c3e24",
  "#704d2e",
  "#8b613c",
  "#a97242",
  "#d5ab86",
  "#f4e2d2",
];

export const TOBACCO_NEUTRAL: ColorScale = [
  "#0a0907",
  "#120f0d",
  "#191512",
  "#1f1a17",
  "#26211d",
  "#302a25",
  "#403832",
  "#584e46",
  "#685d55",
  "#786c63",
  "#a79d95",
  "#efeae6",
];

/**
 * What one accent is made of.
 *
 * `solid`/`hover`/`active` are step *numbers*, 1-12, matching web's
 * `--accent`, `--accent-hover` and `--accent-active` for that class.
 */
export interface AccentDefinition {
  accent: ColorScale;
  /** The `--bg-*` scale this accent is paired with. */
  neutral: ColorScale;
  solid: number;
  hover: number;
  active: number;
}

export const ACCENT_DEFINITIONS: Record<AccentValue, AccentDefinition> = {
  crimson: {
    accent: CRIMSON,
    active: 5,
    hover: 7,
    neutral: MAUVE,
    solid: 6,
  },
  cyan: {
    accent: CYAN,
    active: 5,
    hover: 7,
    neutral: GRAY,
    solid: 6,
  },
  dracula: {
    accent: DRACULA_RED,
    active: 8,
    hover: 10,
    neutral: MAUVE,
    solid: 9,
  },
  ember: {
    accent: EMBER,
    active: 8,
    hover: 10,
    neutral: SAND,
    solid: 9,
  },
  gold: {
    accent: AMBER,
    active: 5,
    hover: 7,
    neutral: SAND,
    solid: 6,
  },
  iris: {
    accent: IRIS,
    active: 5,
    hover: 7,
    neutral: SLATE,
    solid: 6,
  },
  jade: {
    accent: JADE,
    active: 5,
    hover: 7,
    neutral: OLIVE,
    solid: 6,
  },
  lime: {
    accent: LIME,
    active: 8,
    hover: 10,
    neutral: OLIVE,
    solid: 9,
  },
  lotus: {
    accent: LOTUS,
    active: 8,
    hover: 10,
    neutral: MAUVE,
    solid: 9,
  },
  lunar: {
    accent: LUNAR,
    active: 8,
    hover: 10,
    neutral: SLATE,
    solid: 9,
  },
  onyx: {
    accent: ONYX,
    active: 8,
    hover: 10,
    neutral: ONYX_NEUTRAL,
    solid: 9,
  },
  red: {
    accent: RED,
    active: 5,
    hover: 7,
    neutral: MAUVE,
    solid: 6,
  },
  tobacco: {
    accent: TOBACCO,
    active: 8,
    hover: 10,
    neutral: TOBACCO_NEUTRAL,
    solid: 9,
  },
};
