export const ACCENT_MAP = {
  0: "jade",
  1: "cyan",
  2: "iris",
  3: "crimson",
  4: "amber",
  5: "red",
  6: "lime",
  7: "lotus",
} as const;

export type Accent = keyof typeof ACCENT_MAP;
export type AccentValue = (typeof ACCENT_MAP)[keyof typeof ACCENT_MAP];
export type ThemeType = "light" | "dark";

/** Minimum novelist level required to unlock and save a given palette. Keys absent → unlocked for everyone. */
export const ACCENT_LEVEL_REQUIREMENT: Partial<Record<Accent, number>> = {
  4: 3,
  5: 3,
  6: 4,
  7: 4,
};
