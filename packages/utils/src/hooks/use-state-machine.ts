import { useState } from "react";
import { logger } from "../logger";

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
      logger.info("useStateMachine transition", { _state, prev });
      const next = transitions[prev];
      if (!(_state in next)) return prev;

      const nextTransition = next[_state];

      if (typeof nextTransition === "function") {
        // Updater functions run during render — invoking the callback here
        // would update other components (via setGlobalState) mid-render.
        // Defer it to a microtask so it runs after the render phase.
        queueMicrotask(nextTransition);
      }

      return _state;
    });

  logger.info("useStateMachine rendered");

  return { is, state, transition };
};
