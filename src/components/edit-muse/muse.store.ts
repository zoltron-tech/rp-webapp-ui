import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Fandom, NWImage, PrivacyLevel } from "@/types";
import type { ProfileSong } from "@/types/music";
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
  avatar: NWImage | null;
  wallpaper: NWImage | null;
  cardBackground: NWImage | null;
  fandom: Fandom;
  privacy: PrivacyLevel;
  useAccent: boolean;
  useExtraImages: boolean;
  extraAttributes: Record<string, string> | null;
  /** Rich featured song for the muse (NW Library / Spotify); null when unset. */
  featuredSong: ProfileSong | null;
  /** When creating an alternative verse: the muse this one is a verse of. */
  originalVerseId: string | null;
};

export const INITIAL_STATE: MuseState = {
  accent: null,
  avatar: null,
  cardBackground: null,
  extraAttributes: null,
  fandom: FANDOMLESS,
  featuredSong: null,
  firstName: null,
  gender: null,
  id: null,
  image: null,
  lastName: null,
  nicknames: [],
  note: null,
  originalVerseId: null,
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
