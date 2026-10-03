// The state machine is portable and now lives in @nw/utils; re-exported here so
// the app's existing `@/hooks` imports are unchanged.
export type { StateMachine, StateMachineProps } from "@nw/utils/hooks/use-state-machine";
export { useStateMachine } from "@nw/utils/hooks/use-state-machine";
