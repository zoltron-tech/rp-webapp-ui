import type { Fandom, NWImage, PrivacyLevel } from "@nw/types";
import type { MuseNavItem } from "@nw/types/novelist";
import type { ProfileSong } from "@nw/types/music";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
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
  /** Advanced appearance overrides; null/false = default profile styling. */
  nameColor: string | null;
  pennedByColor: string | null;
  sideMenuBgColor: string | null;
  sideMenuTextColor: string | null;
  hideExpandedBackground: boolean;
  hideSideMenuBackground: boolean;
  extraAttributes: Record<string, string> | null;
  /** Rich featured song for the muse (NW Library / Spotify); null when unset. */
  featuredSong: ProfileSong | null;
  /** When creating an alternative verse: the muse this one is a verse of. */
  originalVerseId: string | null;
  /** The verse family (main verse included), when alternatives exist. Read-only. */
  verses: MuseNavItem[] | null;
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
  hideExpandedBackground: false,
  hideSideMenuBackground: false,
  id: null,
  image: null,
  lastName: null,
  nameColor: null,
  nicknames: [],
  note: null,
  originalVerseId: null,
  pennedByColor: null,
  privacy: "ONLY_ME",
  sideMenuBgColor: null,
  sideMenuTextColor: null,
  story: null,
  useAccent: false,
  useExtraImages: false,
  verses: null,
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
