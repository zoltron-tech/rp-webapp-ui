import { SearchResult, Tagged } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
  id: string | null;
  firstName: string;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  story: string;
  image: string;
  video?: string;
  song?: string;
  fandom?: string;
  relationshipStatus?: string;
  hometown?: string;
  species?: string;
  dateOfBirth?: {
    year: number;
    month: string;
    day: number;
  };
  connections: SearchResult[];
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
  connection?: string;
}

export interface Friend extends Tagged {
  _tag: "Friend";
  id: string;
  username: string;
  image: string;
}
