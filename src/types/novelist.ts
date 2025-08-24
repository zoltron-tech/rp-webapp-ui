import type { Tag } from "./common";

export interface Muse {
  id: string | null;
  firstName: string;
  fandom: Fandom;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  story: string;
  image: string | null;
  video: string | null;
  song: string | null;
  nicknames: string[] | null;
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
};

export type UpdateNovelistPayload = Omit<Partial<Novelist>, "firstName"> & {
  firstName: string;
};

export interface Friend {
  id: string;
  username: string;
  image: string;
}

export interface Fandom {
  id: string;
  name: string;
  description: string;
  color: string;
}
