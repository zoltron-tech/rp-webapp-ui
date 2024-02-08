import { useState } from "react";

type Transition = true | (() => void);

export interface StateMachineProps<T extends string> {
  initial: T;
  transitions: Record<T, Partial<Record<T, Transition>>>;
}

export interface StateMachine<T extends string> {
  context?: string;
  state: T;
  transition: (state: T) => void;
  is: (state: T) => boolean;
}

export const useStateMachine = <T extends string>({
  initial,
  transitions,
}: StateMachineProps<T>): StateMachine<T> => {
  const [state, setState] = useState<T>(initial);

  const is = (_state: T) => {
    return state === _state;
  };

  const transition = (_state: T) =>
    setState((prev) => {
      const next = transitions[prev];
      if (!(_state in next)) return prev;

      const nextTransition = next[_state];

      if (nextTransition === true) {
        return _state;
      }

      nextTransition?.();
      return _state;
    });
  return { state, is, transition };
};
