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
  nicknames: string[];
  note: string | null;
  gender: string | null;
  story: string | null;
  accent: string | null;
  image: string | null;
  wallpaper: NWImage | null;
  cardBackground: NWImage | null;
  fandom: Fandom;
  privacy: PrivacyLevel;
  useAccent: boolean;
  useExtraImages: boolean;
  extraAttributes: Record<string, string> | null;
};

export const INITIAL_STATE: MuseState = {
  accent: null,
  cardBackground: null,
  extraAttributes: null,
  fandom: FANDOMLESS,
  firstName: null,
  gender: null,
  id: null,
  image: null,
  lastName: null,
  nicknames: [],
  note: null,
  privacy: "ONLY_ME",
  story: null,
  useAccent: false,
  useExtraImages: false,
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
