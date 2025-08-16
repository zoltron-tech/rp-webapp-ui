import type { Tagged } from "./common";

export interface User extends Tagged {
  _tag: "User";
  username: string;
  email: string;
  palette: number;
  theme: number;
}
