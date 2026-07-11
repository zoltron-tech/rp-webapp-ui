import type { Genre, Tag } from "./common";
import type { Fandom, Friend, NWImage } from "./novelist";
import type { PromptSource } from "./prompt";

export interface StoryBoard {
  id: string | null;
  name: string;
  image: string | null;
  /** Croppable cover (position + zoom), rendered at a 6:9 ratio. */
  avatar: NWImage | null;
  members: StoryBoardMember[];
  events: StoryBoardEvent[];
  /** When true the story is published: viewable (read-only) by everyone. */
  isPublic: boolean;
  tags: Tag[];
  /** Optional fandom this story belongs to (same catalogue as muses). */
  fandom?: Fandom | null;
  /** Curated genre tags, up to 5 per story. */
  genres?: Genre[];
  createdBy?: Friend;
}

export interface StoryBoardMember {
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
}

export interface StoryBoardEvent {
  id: string | null;
  storyBoardId: string;
  ordinal: number;
  name: string;
  description: string;
  image: string | null;
  /** Croppable cover (position + zoom), rendered at a 6:9 ratio. */
  avatar: NWImage | null;
  location: string | null;
  eventTime: string | null;
  createdAt: string | null;
  /** Divider glyph shown once after the title, before the description
   *  (an `AsterismStyle` value). */
  overtureAsterism: string;
  /** Divider glyph shown before every thread in this event (an
   *  `AsterismStyle` value). */
  passageAsterism: string;
}

export interface StoryBoardEventThread {
  id: string | null;
  storyBoardEventId: string;
  /** The novelist who wrote the thread (set by the server). */
  author: PromptSource;
  /** Rich text HTML; may contain embedded muse dialogs. */
  message: string | null;
  /** The read-only style for this thread's embedded dialogs, fixed by its
   *  author at write time (a `DialogDesign` value). */
  dialogDesign: string;
  createdAt: string | null;
  /** Muse id → sender name/accent for the dialogs in `message` (server-set). */
  museDialogAttrs?: Record<string, { name: string; accent: string | null }>;
}

/** One page of an event's threads, ordered by createdAt. */
export interface StoryBoardEventThreadPage {
  threads: StoryBoardEventThread[];
  /** 1-based page number this response covers. */
  pageNumber: number;
  pageSize: number;
  /** Total threads in the event, so the UI can page in either direction. */
  totalCount: number;
}

/** A reader's saved position: the index of the thread they stopped at. */
export interface StoryBoardEventBookmark {
  storyBoardEventId: string;
  threadIndex: number;
  modifiedAt?: string | null;
}

/** A bookmarked event plus the story context needed to navigate back and
 *  resume reading at the saved passage. */
export interface BookmarkedStoryBoardEvent {
  event: StoryBoardEvent;
  storyBoardId: string;
  storyBoardName: string;
  bookmark: StoryBoardEventBookmark;
}

export type StoryBoardEventThreadInput = {
  id?: string | null;
  storyBoardEventId: string;
  message: string | null;
  /** The dialog style to fix on this thread (defaults server-side when unset). */
  dialogDesign?: string;
};
