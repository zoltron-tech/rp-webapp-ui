import { once } from "lodash";
import { Dispatch, SetStateAction, createContext } from "react";

export interface StateContextType<K extends string> {
  name: string;
  state: K;
  setState: Dispatch<SetStateAction<K>>;
}

export const createStateContext = once(
  <T extends string>(
    state: T,
    setState: Dispatch<SetStateAction<T>>,
    name: string
  ) => createContext({ state, setState, name } as StateContextType<T>)
);
// export const useStateContext = <T extends string,>() => useContext(createStateContext<T>());
