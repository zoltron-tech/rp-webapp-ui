import { Tagged, SearchResult } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
  id: string | null;
  firstName: string;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  image: string;
  fandom: string;
  relationshipStatus: string;
  hometown: string;
  species: string;
  dateOfBirth: {
    year: number;
    month: string;
    day: number;
  };
  connections: SearchResult[];
}

export interface Novelist extends Tagged {
  _tag: "Novelist";
  username: string;
  firstName: string;
  lastName: string;
  note: string;
  image: string;
  muses: Muse[];
  friends: Friend[];
}

export interface Friend extends Tagged {
  _tag: "Friend";
  username: string;
  image: string;
}
