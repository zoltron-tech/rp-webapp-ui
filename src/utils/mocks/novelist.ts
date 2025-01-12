import { Novelist } from "@/types";
import { STANDARD_TIER } from "../constants/initial-values";

const NOVELIST_MOCK: Novelist = {
  _tag: "Novelist",
  id: "uuit-1",
  tier: STANDARD_TIER,
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  note: "This is a note",
  image: "",
  museCount: 1,
  muses: [
    {
      _tag: "Muse",
      id: "uuid",
      firstName: "Jane",
      species: "human",
      fandom: "GOT",
      hometown: "lahore",
      relationshipStatus: "single",
      pennedBy: {
        _tag: "Novelist",
        id: "uuid",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        tier: STANDARD_TIER,
        note: "This is a note",
        image: "",
        museCount: 0,
        muses: [],
        friends: [],
        friendsCount: 0,
        connection: "",
        createdAt: "",
      },
      lastName: "Doe",
      image: "",
      video: "",
      song: "",
      note: "Something",
      story: "some story",
      dateOfBirth: {
        year: 1980,
        month: "January",
        day: 1,
      },
      connections: [],
    },
  ],
  friendsCount: 1,
  friends: [
    {
      _tag: "Friend",
      id: "",
      username: "Jonah",
      image: "",
    },
  ],
  connection: "",
  createdAt: "",
};

export const getNovelistMock = (partial?: Partial<Novelist>): Novelist => ({
  ...NOVELIST_MOCK,
  ...partial,
});
