import type { Muse, Novelist, User } from ".";
import type { AccentValue } from "./theme";

export type AuthState =
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "LOADING"
  | "UNINITIALIZED";

export interface StoreState {
  novelists: Novelist[];
  muses: Muse[];
  theme: "light" | "dark";
  authState: AuthState;
  user: User | null;
  novelist: Novelist | null;
  globalLoading: boolean;
  accent: AccentValue;
}
