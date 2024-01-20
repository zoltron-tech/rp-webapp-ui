import { Muse } from "@/types";

const MOCK_MUSE: Muse = {
    firstName: "John",
    lastName: "Doe",
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