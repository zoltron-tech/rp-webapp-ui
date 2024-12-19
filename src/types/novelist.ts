import { SearchResult, Tagged } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
  id: string | null;
  firstName: string;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  story: string;
  image: string | null;
  video: string | null;
  song: string | null;
  fandom: string | null;
  relationshipStatus: string | null;
  hometown: string | null;
  species: string | null;
  dateOfBirth: {
    year: number;
    month: string;
    day: number;
  } | null;
  connections: MuseConnection[];
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
  muses: Muse[];
  friends: Friend[];
  connection: string | null;
}

export interface Friend extends Tagged {
  _tag: "Friend";
  id: string;
  username: string;
  image: string;
}
