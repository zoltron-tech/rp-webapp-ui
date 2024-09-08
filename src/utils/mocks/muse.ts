import { Muse } from "@/types";
import { STANDARD_TIER } from "../constants";

const MOCK_MUSE: Muse = {
  _tag: "Muse",
  id: "uuid",
  firstName: "John",
  species: "human",
  fandom: "GOT",
  hometown: "lahore",
  relationshipStatus: "single",
  pennedBy: {
    _tag: "Novelist",
    id: "uuid",
    tier: STANDARD_TIER,
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    note: "This is a note",
    image: "",
    muses: [],
    friends: [],
    connection: "",
  },
  lastName: "Doe",
  note: "Something",
  story: "some story",
  image: "https://example.com/image.jpg",
  video: "",
  song: "",
  dateOfBirth: {
    year: 1980,
    month: "January",
    day: 1,
  },
  connections: [],
};

export const getMuseMock = (partial?: Partial<Muse>): Muse => ({
  ...MOCK_MUSE,
  ...partial,
});
