import { Muse, Novelist } from ".";

export type AuthState =
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "LOADING"
  | "UNINITIALIZED";

export interface StoreState {
  novelists: Novelist[];
  muses: Muse[];
  theme: "light" | "dark";
}
