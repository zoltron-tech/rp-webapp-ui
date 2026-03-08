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
  tags: Tag[];
  privacy: string;
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
}

export type Novelist = {
  id: string;
  username: string;
  tier: NovelistTier;
  firstName: string;
  lastName: string;
  note: string;
  image: string;
  museCount: number;
  muses: Muse[];
  friendsCount: number;
  friends: Friend[];
  connection: string | null;
  createdAt: string;
  about: string | null;
  isOnboarded: boolean;
  isVerified: boolean;
};

export type UpdateNovelistPayload = Omit<Partial<Novelist>, "firstName"> & {
  firstName: string;
};

export interface Friend {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  isVerified: boolean;
  image: string;
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
