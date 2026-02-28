import type { Muse, Novelist, NovelistWorldNotification, User } from ".";
import type { AccentValue } from "./theme";

export type AuthState =
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "LOADING"
  | "UNINITIALIZED";

export interface MusicPlayerState {
  playingSongId: string | null;
  playingSongUrl: string | null;
  playingSongName: string | null;
  progress: number;
  currentTime: number;
  duration: number;
}

export interface StoreState {
  novelists: Novelist[];
  muses: Muse[];
  theme: "light" | "dark";
  authState: AuthState;
  user: User | null;
  novelist: Novelist | null;
  pageLoading: boolean;
  accent: AccentValue;
  searchBarExpanded: Boolean;
  notifications: NovelistWorldNotification[] | null;
  musicPlayer: MusicPlayerState;
}
