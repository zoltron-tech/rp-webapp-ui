import type { Tag, Tagged } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
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

export interface MuseConnection extends Tagged {
  _tag: "MuseConnection";
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

export interface Novelist extends Tagged {
  _tag: "Novelist";
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
}

export interface Friend extends Tagged {
  _tag: "Friend";
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
