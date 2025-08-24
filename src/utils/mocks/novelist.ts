import type { Novelist } from "@/types";
import { STANDARD_TIER } from "../constants/initial-values";

const NOVELIST_MOCK: Novelist = {
  connection: "",
  createdAt: "",
  firstName: "John",
  friends: [
    {
      id: "",
      image: "",
      username: "Jonah",
    },
  ],
  friendsCount: 1,
  id: "uuit-1",
  image: "",
  lastName: "Doe",
  museCount: 1,
  muses: [
    {
      connections: [],
      extraAttributes: null,
      fandom: {
        color: "111",
        description: "",
        id: "GOT",
        name: "Game of Thrones",
      },
      firstName: "Jane",
      id: "uuid",
      image: "",
      lastName: "Doe",
      nicknames: null,
      note: "Something",
      pennedBy: {
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
    },
  ],
  note: "This is a note",
  tier: STANDARD_TIER,
  username: "johndoe",
};

export const getNovelistMock = (partial?: Partial<Novelist>): Novelist => ({
  ...NOVELIST_MOCK,
  ...partial,
});
