import type { Muse } from "@/types";
import { STANDARD_TIER } from "../constants";

const MOCK_MUSE: Muse = {
  _tag: "Muse",
  connections: [],
  extraAttributes: null,
  fandom: {
    color: "#111",
    description: "something",
    id: "GOT",
    name: "Game of Thrones",
  },
  firstName: "John",
  id: "uuid",
  image: "https://example.com/image.jpg",
  lastName: "Doe",
  nicknames: null,
  note: "Something",
  pennedBy: {
    _tag: "Novelist",
    connection: "",
    createdAt: "",
    firstName: "John",
    friends: [],
    friendsCount: 0,
    id: "uuid",
    image: "",
    lastName: "Doe",
    museCount: 0,
    muses: [],
    note: "This is a note",
    tier: STANDARD_TIER,
    username: "johndoe",
  },
  privacy: "PUBLIC",
  song: "",
  story: "some story",
  tags: [],
  video: "",
};

export const getMuseMock = (partial?: Partial<Muse>): Muse => ({
  ...MOCK_MUSE,
  ...partial,
});
