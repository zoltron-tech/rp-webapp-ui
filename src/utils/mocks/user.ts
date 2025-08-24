import type { User } from "@/types";

const USER_MOCK: User = {
  authApp: "GOOGLE",
  email: "example@example.com",
  palette: 0,
  theme: 0,
  username: "imAnExample",
};

export const getUserMock = (partial?: Partial<User>): User => ({
  ...USER_MOCK,
  ...partial,
});
