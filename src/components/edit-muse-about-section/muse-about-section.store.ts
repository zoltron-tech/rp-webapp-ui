import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";

export type MuseAboutSectionState = {
  id: string | null;
  parentId: string | null;
  text: string | null;
  image: string | null;
  ordinal: number;
};

export const INITIAL_STATE: MuseAboutSectionState = {
  id: null,
  image: null,
  ordinal: 0,
  parentId: null,
  text: null,
};

type MuseAboutSectionStoreKey = keyof MuseAboutSectionState;

export const useMuseAboutSectionState = <K extends MuseAboutSectionStoreKey>(
  key: K,
) => {
  const getFunction = createGetFunction<MuseAboutSectionState, K>(key);
  return useStoreState<MuseAboutSectionState, K>(
    "muse-about-section",
    getFunction,
  );
};

export const useMuseAboutSectionStoreSet = () => {
  return useStoreSet<MuseAboutSectionState>("muse-about-section");
};
