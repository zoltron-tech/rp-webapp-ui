import { Dispatch, SetStateAction } from "react";

export interface StateContextType<T extends string> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
}

// export const StateContext = createContext<StateContextType<T>>
