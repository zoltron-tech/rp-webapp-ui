import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { NWImage } from "@/types";
import type { Accent, ThemeType } from "@/types/theme";

export type OnboardingState = {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  palette: Accent;
  theme: ThemeType;
  about: string | null;
  image: string | null;
  avatar: NWImage | null;
};

export const INITIAL_STATE: OnboardingState = {
  about: null,
  avatar: null,
  firstName: null,
  image: null,
  lastName: null,
  palette: 0,
  theme: "dark",
  username: null,
};

type OnboardingStoreKey = keyof OnboardingState;

export const useOnboardingState = <K extends OnboardingStoreKey>(key: K) => {
  const getFunction = createGetFunction<OnboardingState, K>(key);
  return useStoreState<OnboardingState, K>("onboarding", getFunction);
};

export const useOnboardingStoreSet = () => {
  return useStoreSet<OnboardingState>("onboarding");
};
