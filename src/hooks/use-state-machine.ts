import { Logger } from "@/utils/services";
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
  is: (...states: T[]) => boolean;
}

export const useStateMachine = <T extends string>({
  initial,
  transitions,
}: StateMachineProps<T>): StateMachine<T> => {
  const [state, setState] = useState<T>(initial);

  const is = (..._states: T[]) => {
    return _states.some((s) => s === state);
  };

  const transition = (_state: T) =>
    setState((prev) => {
      Logger.info("useStateMachine transition", { prev, _state });
      const next = transitions[prev];
      if (!(_state in next)) return prev;

      const nextTransition = next[_state];

      if (nextTransition === true) {
        return _state;
      }

      nextTransition?.();
      return _state;
    });

  Logger.info("useStateMachine rendered");

  return { state, is, transition };
};
