import type { Tag } from "./common";
import type { PrivacyLevel } from "./prompt";

export interface MentionDataItem {
  id: string;
  type: "NOVELIST" | "MUSE";
  displayName: string;
  image: string;
}

export interface MentionTab {
  getData: (prefix: string) => Promise<MentionDataItem[]>;
  id: string;
  iconKey: string;
  label: string;
}

export interface Muse {
  id: string | null;
  firstName: string;
  fandom: Fandom;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  story: string;
  accent: string | null;
  image: string | null;
  wallpaper: NWImage | null;
  avatar: NWImage | null;
  cardBackground: NWImage | null;
  video: string | null;
  song: string | null;
  nicknames: string[] | null;
  extraAttributes: Record<string, string> | null;
  connections: MuseConnection[];
  tags: Tag[];
  privacy: PrivacyLevel;
  useAccent: boolean;
  useExtraImages: boolean;
  totalPoints: number;
  level: number;
  prev: MuseNavItem | null;
  next: MuseNavItem | null;
}

/**
 * Minimal muse payload for prev/next navigation: everything the backend can
 * populate from the already-loaded muse row (no extra DB/service calls), so
 * the UI can render a nav card and optimistically show the target muse while
 * its full data loads. Excludes fandom, pennedBy, connections, tags and
 * points — those need additional lookups.
 */
export interface MuseNavItem {
  id: string;
  firstName: string;
  lastName: string | null;
  nicknames: string[] | null;
  gender: string | null;
  note: string | null;
  story: string | null;
  extraAttributes: Record<string, string> | null;
  image: string | null;
  avatar: NWImage | null;
  cardBackground: NWImage | null;
  wallpaper: NWImage | null;
  video: string | null;
  song: string | null;
  accent: string | null;
  privacy: PrivacyLevel;
  useAccent: boolean;
  useExtraImages: boolean;
}

export interface MuseAboutSection {
  id: string | null;
  parentId: string;
  text: string | null;
  ordinal: number;
  image: string | null;
}

export interface UpdateMuseAboutSection {
  text: string | null;
  ordinal: number;
  image: string | null;
}

export interface CreateUpdateMuse {
  accent: string | null;
  firstName: string;
  fandom: Fandom;
  lastName: string;
  note: string | null;
  story: string | null;
  image: string | null;
  wallpaper: NWImage | null;
  cardBackground: NWImage | null;
  video: string | null;
  song: string | null;
  nicknames: string[];
  extraAttributes: Record<string, string> | null;
  connections: MuseConnection[];
  tags: Tag[] | null;
  privacy: string;
  useAccent: boolean;
  useExtraImages: boolean;
}

export interface MuseConnection {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  sourceMuseId: string;
  targetMuseId: string;
  connection: string;
  verified: boolean;
  createdAt: number;
}

export interface NovelistTier {
  name: string;
  museLimit: number;
  storyBoardLimit: number;
  eventLimit: number;
  mediaLimit: number;
  groupLimit: number;
  musicLimit: number;
}

export type NovelistNote = {
  text: string;
  color: string | null;
  emoji: string | null;
};

export type Novelist = {
  id: string;
  username: string;
  tier: NovelistTier;
  firstName: string;
  lastName: string;
  note: NovelistNote | null;
  image: string;
  avatar: NWImage | null;
  banner: NWImage | null;
  museCount: number;
  palette: number;
  muses: Muse[];
  friendsCount: number;
  friends: Friend[];
  connection: string | null;
  createdAt: string;
  about: string | null;
  isOnboarded: boolean;
  isVerified: boolean;
  totalPoints: number;
  level: number;
};

export type UpdateNovelistPayload = Omit<Partial<Novelist>, "firstName" | "note"> & {
  firstName: string;
};

export interface Friend {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  isVerified: boolean;
  image: string;
  avatar?: NWImage | null;
  connection: string | null;
  muses: Muse[];
  mutualFriendCount: number;
  rank?: number;
  totalPoints: number;
  level: number;
}

export interface Fandom {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface NWImage {
  src: string;
  filterValues: ImageFilter;
  crop: ImageCropFilter;
}

export interface ImageFilter {
  greyscale: number;
  brightness: number;
  blur: number;
}

export interface ImageCropFilter {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
