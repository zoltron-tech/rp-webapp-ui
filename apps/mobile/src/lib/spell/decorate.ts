import type { TextStyle } from "react-native";
import type { AppTheme } from "@/theme";
import type { SpellFlag } from "./flags";

/**
 * Splits a run of text at the flagged words inside it, so each piece can be
 * drawn with or without the misspelling style. `offset` is where the run
 * starts in the field's text, which is what the flags are offsets into.
 */
export const splitByFlags = (
  text: string,
  offset: number,
  flags: readonly SpellFlag[],
): Array<{ text: string; flagged: boolean }> => {
  if (flags.length === 0 || !text) return [{ flagged: false, text }];
  const end = offset + text.length;
  const pieces: Array<{ text: string; flagged: boolean }> = [];
  let at = offset;
  for (const flag of flags) {
    if (flag.end <= at || flag.start >= end) continue;
    const from = Math.max(flag.start, at);
    const to = Math.min(flag.end, end);
    if (from > at)
      pieces.push({
        flagged: false,
        text: text.slice(at - offset, from - offset),
      });
    pieces.push({
      flagged: true,
      text: text.slice(from - offset, to - offset),
    });
    at = to;
  }
  if (at < end) pieces.push({ flagged: false, text: text.slice(at - offset) });
  return pieces;
};

/**
 * How a misspelled word looks in a field: underlined, on a faint red wash.
 * Native text has no wavy underline, and Android ignores a decoration's
 * colour, so the wash is what carries the meaning on both platforms.
 */
export const misspelledStyle = (theme: AppTheme): TextStyle => ({
  backgroundColor: `${theme.error}26`,
  textDecorationColor: theme.error,
  textDecorationLine: "underline",
});
