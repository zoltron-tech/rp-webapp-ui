import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Accent, ThemeType } from "@/types/theme";

export type ProfileState = {
  firstName: string | null;
  lastName: string | null;
  note: string | null;
  palette: Accent;
  theme: ThemeType;
  about: string | null;
  image: string | null;
};

export const INITIAL_STATE: ProfileState = {
  about: null,
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
