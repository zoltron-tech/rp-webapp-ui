import type { Tagged } from "./common";

export interface State<T extends string> extends Tagged {
  _tag: "State";
  state: T;
}
