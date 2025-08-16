import { Logger } from "@/utils/services";

export interface UseVisibilityReturnType {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}
type StateEvent = <T extends string>(
  provider: string,
) => (state: T) => (instance: string) => () => void;

type Full<T> = {
  [P in keyof T]-?: T[P];
};

export const stateEvent: StateEvent =
  <T extends string>(provider: string) =>
  (state: T) =>
  (instance: string) =>
  () =>
    window.dispatchEvent(new CustomEvent(`${provider}:${state}:${instance}`));

export const createStateEvents =
  (provider: string) =>
  <T extends string>(events: Set<T>) =>
  (
    instance: string,
  ): Partial<Record<T, () => void>> | Full<Partial<Record<T, () => void>>> => {
    const stateEvents: Partial<Record<T, () => void>> = {};
    events.forEach((event) => {
      stateEvents[event] = stateEvent<T>(provider)(event)(instance);
    });

    return stateEvents;
  };

export const useVisibility = (name: string): UseVisibilityReturnType => {
  const show = () => stateEvent("visibility-provider")("open")(name)();
  const hide = () => stateEvent("visibility-provider")("close")(name)();
  const toggle = () => stateEvent("visibility-provider")("toggle")(name)();

  Logger.info("useVisibility rendered");

  return { show, hide, toggle };
};
