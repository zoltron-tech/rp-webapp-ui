import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Fandom, NWImage, PrivacyLevel } from "@/types";
import { FANDOMLESS } from "@/utils/constants";

export type MuseState = {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  note: string | null;
  gender: string | null;
  story: string | null;
  accent: string | null;
  image: string | null;
  wallpaper: NWImage | null;
  cardBackground: NWImage | null;
  fandom: Fandom;
  privacy: PrivacyLevel;
};

export const INITIAL_STATE: MuseState = {
  accent: null,
  cardBackground: null,
  fandom: FANDOMLESS,
  firstName: null,
  gender: null,
  id: null,
  image: null,
  lastName: null,
  note: null,
  privacy: "ONLY_ME",
  story: null,
  wallpaper: null,
};

type ProfileStoreKey = keyof MuseState;

export const useMuseState = <K extends ProfileStoreKey>(key: K) => {
  const getFunction = createGetFunction<MuseState, K>(key);
  return useStoreState<MuseState, K>("muse", getFunction);
};

export const useMuseStoreSet = () => {
  return useStoreSet<MuseState>("muse");
};
