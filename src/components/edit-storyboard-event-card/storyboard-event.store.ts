import { DEFAULT_ASTERISM_STYLE } from "@/components/asterism-styles";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { NWImage } from "@/types";
import type { ProfileSong } from "@/types/music";

export type StoryboardEventState = {
  id: string | null;
  storyBoardId: string;
  /** Ignored server-side on save — the backend appends new events to the end
   *  and preserves the position of existing ones; only the dedicated reorder
   *  endpoint changes it. */
  ordinal: number;
  name: string;
  description: string;
  image: string | null;
  avatar: NWImage | null;
  location: string | null;
  eventTime: string | null;
  /** Divider glyph shown after the title, before the description. */
  overtureAsterism: string;
  /** Divider glyph shown before every thread in this event. */
  passageAsterism: string;
  /** Optional featured song for the chapter. */
  song: ProfileSong | null;
};

export const INITIAL_STATE: StoryboardEventState = {
  avatar: null,
  description: "",
  eventTime: null,
  id: null,
  image: null,
  location: null,
  name: "",
  ordinal: 1,
  overtureAsterism: DEFAULT_ASTERISM_STYLE,
  passageAsterism: DEFAULT_ASTERISM_STYLE,
  song: null,
  storyBoardId: "",
};

type StoryboardEventStoreKey = keyof StoryboardEventState;

export const useStoryboardEventState = <K extends StoryboardEventStoreKey>(
  key: K,
) => {
  const getFunction = createGetFunction<StoryboardEventState, K>(key);
  return useStoreState<StoryboardEventState, K>(
    "storyboard-event",
    getFunction,
  );
};

export const useStoryboardEventStoreSet = () => {
  return useStoreSet<StoryboardEventState>("storyboard-event");
};
