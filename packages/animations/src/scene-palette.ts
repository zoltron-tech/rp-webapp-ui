/**
 * The colours every paper scene in this package is drawn in.
 *
 * Named for their role rather than their source, because the two clients
 * resolve them from different places: web passes the `var(--…)` strings its
 * stylesheet already defines (so a muse's accent override on the wrapper still
 * applies), native passes values resolved from `@nw/theme` — or, on a muse's
 * profile, mixed from that muse's own accent the way web's `color-mix` does.
 *
 * The `--bg-*` and `--accent-*` comments are the variables web reads.
 */
export interface ScenePalette {
  /** `--accent` — the haze behind the drawing. */
  accent: string;
  /** `--accent-8` — the haze's midpoint, and a dimmer sparkle. */
  accentSoft: string;
  /** `--accent-9` — ribbons, seals, cheeks: the one saturated fill. */
  accentSolid: string;
  /** `--accent-10` — a brighter sparkle. */
  accentBright: string;
  /** `--accent-11` — faces, Zzz, the boldest sparkle. */
  accentText: string;
  /** `--bg-3` — the top of a sheet of paper. */
  paperTop: string;
  /** `--bg-2` — the bottom of the sheet, where it falls off. */
  paperBottom: string;
  /** `--bg-4` — page stacks, frames, shading and desk shadows. */
  edge: string;
  /** `--bg-5` — every rule and outline. */
  line: string;
}
