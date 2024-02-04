export type Muse = {
  firstName: string;
  lastName: string;
  image: string;
  dateOfBirth: {
    year: number;
    month: string;
    day: number;
  };
};

export type Novelist = {
  username: string;
  firstName: string;
  lastName: string;
  note: string;
  image: string;
  muses: Muse[];
};
