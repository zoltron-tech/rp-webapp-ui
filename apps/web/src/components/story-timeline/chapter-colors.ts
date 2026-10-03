/**
 * Chapter accents on the timeline board.
 *
 * A chapter must not wear its timeline's colour: the timeline's line already
 * carries that, and a bar in the same hue reads as part of the line rather
 * than as a thing branching off it. So every chapter gets its own accent —
 * but it is not actually random. A colour that changed between renders (or
 * between two people looking at the same board) would be noise, and there is
 * nowhere to persist a per-chapter colour without touching the API. Instead
 * the accent is *derived*: chapters take these in reading order and wrap
 * round, which is stable for everyone, survives a reload, and never shifts
 * while a bar is being dragged.
 *
 * Every entry is dark enough to carry the white bar label.
 */
export const CHAPTER_COLORS = [
  "#3f6fd8",
  "#c2483d",
  "#2f8f6b",
  "#8a5cd6",
  "#c07a1e",
  "#1e7f96",
  "#b4478c",
  "#5f7a2c",
  "#8d5a3c",
  "#4b5bbf",
  "#a03b5e",
  "#337d4a",
];

/**
 * The accent for the chapter at `order` (1-based reading position, as shown
 * everywhere else in this view). Anything unnumbered falls to the first
 * accent rather than to the timeline's colour.
 */
export const chapterColor = (order: number): string => {
  const index = Math.max(0, order - 1) % CHAPTER_COLORS.length;
  return CHAPTER_COLORS[index];
};
