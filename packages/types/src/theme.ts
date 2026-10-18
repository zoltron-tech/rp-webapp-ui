export const ACCENT_MAP = {
  0: "jade",
  1: "cyan",
  2: "iris",
  3: "crimson",
  4: "gold",
  5: "red",
  6: "lime",
  7: "lotus",
  8: "dracula",
  9: "lunar",
  10: "ember",
  11: "onyx",
  12: "tobacco",
} as const;

export type Accent = keyof typeof ACCENT_MAP;

/**
 * The four palettes shown up front: the only ones in onboarding, and the
 * first row in Edit profile, where the rest sit behind "More".
 */
export const BASIC_ACCENTS: readonly Accent[] = [0, 1, 2, 3];

/** Every palette not in `BASIC_ACCENTS`, in palette order. */
export const MORE_ACCENTS: readonly Accent[] = (
  Object.keys(ACCENT_MAP).map(Number) as Accent[]
).filter((key) => !BASIC_ACCENTS.includes(key));
export type AccentValue = (typeof ACCENT_MAP)[keyof typeof ACCENT_MAP];
export type ThemeType = "light" | "dark";
