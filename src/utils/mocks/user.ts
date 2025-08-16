import type { User } from "@/types";

const USER_MOCK: User = {
  _tag: "User",
  email: "example@example.com",
  username: "imAnExample",
  palette: 0,
  theme: 0,
};

export const getUserMock = (partial?: Partial<User>): User => ({
  ...USER_MOCK,
  ...partial,
});
