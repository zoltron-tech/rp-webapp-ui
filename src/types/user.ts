import type { API_MESSAGE } from "@/utils/constants";
import type { ACCENT_MAP } from "./theme";

export interface User {
  username: string;
  email: string;
  palette: keyof typeof ACCENT_MAP;
  theme: 0 | 1;
  authApp: "GOOGLE" | "DISCORD" | "NOVELIST_WORLD";
}

export type UpdateThemePayload = Pick<User, "palette" | "theme">;

export type UpdateThemeResponse = {
  message: API_MESSAGE.Success;
  user: User;
};
