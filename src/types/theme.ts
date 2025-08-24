export const ACCENT_MAP = {
  0: "jade",
  1: "cyan",
  2: "iris",
  3: "crimson",
} as const;

export type Accent = [keyof typeof ACCENT_MAP][number];
export type AccentValue = (typeof ACCENT_MAP)[keyof typeof ACCENT_MAP];
export type ThemeType = "light" | "dark";
