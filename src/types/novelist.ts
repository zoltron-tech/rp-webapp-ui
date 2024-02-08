import { Tagged } from "./common";

export interface Muse extends Tagged {
  _tag: "Muse";
  firstName: string;
  lastName: string;
  image: string;
  dateOfBirth: {
    year: number;
    month: string;
    day: number;
  };
}

export interface Novelist extends Tagged {
  _tag: "Novelist";
  username: string;
  firstName: string;
  lastName: string;
  note: string;
  image: string;
  muses: Muse[];
}
