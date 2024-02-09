import { Novelist } from ".";

export type AuthState = "LOGGED_IN" | "LOGGED_OUT" | "LOADING";

export interface StoreState {
  novelists: Novelist[];
}
