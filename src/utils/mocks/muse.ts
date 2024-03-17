import { Muse, Novelist } from "@/types";

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
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    note: "This is a note",
    image: "",
    muses: [],
    friends: [],
  },
  lastName: "Doe",
  note: "Something",
  image: "https://example.com/image.jpg",
  dateOfBirth: {
    year: 1980,
    month: "January",
    day: 1,
  },
};

export const getMuseMock = (partial?: Partial<Muse>): Muse => ({
  ...MOCK_MUSE,
  ...partial,
});
