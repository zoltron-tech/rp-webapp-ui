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
      firstName: "Jane",
      lastName: "Doe",
      image: "",
      dateOfBirth: {
        year: 1980,
        month: "January",
        day: 1,
      },
    },
  ],
};

export const getNovelistMock = (partial?: Partial<Novelist>): Novelist => ({
  ...NOVELIST_MOCK,
  ...partial,
});
