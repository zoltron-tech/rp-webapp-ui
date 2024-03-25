import { Novelist } from "@/types";

const NOVELIST_MOCK: Novelist = {
  _tag: "Novelist",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  note: "This is a note",
  image: "",
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
      image: "",
      note: "Something",
      dateOfBirth: {
        year: 1980,
        month: "January",
        day: 1,
      },
      connections: [],
    },
  ],
  friends: [
    {
      _tag: "Friend",
      username: "Jonah",
      image: "",
    },
  ],
  connection: "",
};

export const getNovelistMock = (partial?: Partial<Novelist>): Novelist => ({
  ...NOVELIST_MOCK,
  ...partial,
});
