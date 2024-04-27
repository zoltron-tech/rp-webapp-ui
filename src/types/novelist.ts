import { Tagged, SearchResult } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
  id: string | null;
  firstName: string;
  pennedBy: Novelist;
  lastName: string;
  note: string;
  story: string;
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
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  note: string;
  image: string;
  muses: Muse[];
  friends: Friend[];
  connection: string | undefined;
}

export interface Friend extends Tagged {
  _tag: "Friend";
  username: string;
  image: string;
}

export interface Message extends Tagged {
  _tag: "Friend";
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
}
