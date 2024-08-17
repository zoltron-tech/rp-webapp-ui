import { Novelist, Muse } from "@/types";
import { None } from "@/types/common";

export const INITIAL_NOVELIST: Novelist = {
  _tag: "Novelist",
  id: "",
  username: "",
  firstName: "",
  lastName: "",
  note: "",
  image: "",
  muses: [],
  friends: [],
  connection: "",
};

export const INITIAL_MUSE: Muse = {
  _tag: "Muse",
  id: null,
  pennedBy: INITIAL_NOVELIST,
  firstName: "",
  lastName: "",
  note: "",
  story: "",
  image: "",
  video: "",
  song: "",
  dateOfBirth: {
    year: 1970,
    month: "JANUARY",
    day: 1,
  },
  relationshipStatus: "",
  fandom: "",
  species: "",
  hometown: "",
  connections: [],
};

export const NONE: None = {
  _tag: "None",
};
