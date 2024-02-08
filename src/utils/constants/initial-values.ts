import { Novelist } from "@/types";
import { None } from "@/types/common";

export const INITIAL_NOVELIST: Novelist = {
  _tag: "Novelist",
  username: "",
  firstName: "",
  lastName: "",
  note: "",
  image: "",
  muses: [],
};

export const NONE: None = {
  _tag: "None",
};
