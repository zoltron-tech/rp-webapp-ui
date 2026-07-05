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
  /** Main muse this one is an alternative verse of; null for the main verse. */
  originalVerseId?: string | null;
  /** Ordering within the verse family; the main verse renders as verse 1. */
  verseNumber?: number | null;
  /**
   * All visible verses of this muse's family (main verse included), sorted by
   * verse number. Only present when alternative verses exist.
   */
  verses?: MuseNavItem[] | null;
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
  originalVerseId?: string | null;
  verseNumber?: number | null;
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
  /** Set on create to make the new muse an alternative verse of an existing muse. */
  originalVerseId?: string | null;
  verseNumber?: number | null;
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

export type MuseConnectionStatus = "PENDING" | "DONE" | "REJECTED";

/** A muse belonging to a muse connection group. */
export interface MuseConnectionMuse {
  museId: string;
  firstName: string;
  lastName: string | null;
  image: string | null;
  novelistId: string;
  novelistName: string | null;
}

export interface MuseConnectionApproval {
  novelistId: string;
  novelistName: string | null;
  approved: boolean;
}

/**
 * A titled, rich-text described connection between several muses (own and/or
 * friends' muses). Stays PENDING until every involved novelist accepts, then
 * shows on all involved muses' profiles. Distinct from the legacy pairwise
 * MuseConnection relationship labels above.
 */
export interface MuseConnectionGroup {
  id: string;
  title: string;
  description: string | null;
  status: MuseConnectionStatus;
  createdBy: string;
  createdByName: string | null;
  muses: MuseConnectionMuse[];
  approvals: MuseConnectionApproval[];
  /** True when the viewer is one of the involved novelists. */
  canEdit: boolean;
  /** The viewer's own approval state; null when they are not involved. */
  viewerApproved: boolean | null;
  /** True when the viewer created the connection (may re-request after rejection). */
  viewerIsCreator: boolean;
  createdAt: number | null;
  modifiedAt: number | null;
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

export type UpdateNovelistPayload = Omit<
  Partial<Novelist>,
  "firstName" | "note"
> & {
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
