import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { NWImage, NovelistNote } from "@/types";
import type { Accent, ThemeType } from "@/types/theme";

export type ProfileState = {
  firstName: string | null;
  lastName: string | null;
  note: NovelistNote | null;
  palette: Accent;
  theme: ThemeType;
  about: string | null;
  image: string | null;
  /** Avatar with crop/position data. When set, used for avatar display
   *  instead of the plain `image` URL. */
  avatar: NWImage | null;
  /** Cover banner with crop/position data. Displayed behind the avatar on the profile page. */
  banner: NWImage | null;
};

export const INITIAL_STATE: ProfileState = {
  about: null,
  avatar: null,
  banner: null,
  firstName: null,
  image: null,
  lastName: null,
  note: null,
  palette: 0,
  theme: "dark",
};

type ProfileStoreKey = keyof ProfileState;

export const useProfileState = <K extends ProfileStoreKey>(key: K) => {
  const getFunction = createGetFunction<ProfileState, K>(key);
  return useStoreState<ProfileState, K>("profile", getFunction);
};

export const useProfileStoreSet = () => {
  return useStoreSet<ProfileState>("profile");
};
