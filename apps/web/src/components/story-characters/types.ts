import type { CharacterRefType, NWImage } from "@nw/types";

/**
 * One face in a story, whichever pool it came from.
 *
 * The strip does not care: on the page a character is a character, and the
 * pool only decides who may edit them and where the "more" button goes. Same
 * shape the codex's mesh works in, for the same reason.
 */
export interface StoryFace {
  id: string;
  name: string;
  image: string | null;
  avatar: NWImage | null;
  /** The muse's or character's own accent, when it opted into using one. */
  accent: string | null;
  refType: CharacterRefType;
  /** A cast muse whose novelist disabled their account: no avatar, no muse page. */
  placeholder?: boolean;
}
