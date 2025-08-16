import type { Muse } from "@/types";
import { STANDARD_TIER } from "../constants";

const MOCK_MUSE: Muse = {
  _tag: "Muse",
  id: "uuid",
  firstName: "John",
  nicknames: null,
  fandom: {
    id: "GOT",
    name: "Game of Thrones",
    description: "something",
    color: "#111",
  },
  extraAttributes: null,
  pennedBy: {
    _tag: "Novelist",
    id: "uuid",
    tier: STANDARD_TIER,
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    note: "This is a note",
    image: "",
    museCount: 0,
    muses: [],
    friendsCount: 0,
    friends: [],
    connection: "",
    createdAt: "",
  },
  lastName: "Doe",
  note: "Something",
  story: "some story",
  image: "https://example.com/image.jpg",
  video: "",
  song: "",
  privacy: "PUBLIC",
  connections: [],
  tags: [],
};

export const getMuseMock = (partial?: Partial<Muse>): Muse => ({
  ...MOCK_MUSE,
  ...partial,
});
