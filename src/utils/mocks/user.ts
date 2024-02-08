import { User } from "@/types";

const USER_MOCK: User = {
  _tag: "User",
  email: "example@example.com",
  username: "imAnExample",
};

export const getUserMock = (partial?: Partial<User>): User => ({
  ...USER_MOCK,
  ...partial,
});
