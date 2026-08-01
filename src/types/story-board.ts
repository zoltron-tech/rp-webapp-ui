import type { Genre, Tag } from "./common";
import type { ProfileSong } from "./music";
import type { Fandom, Friend, NWImage } from "./novelist";
import type { PromptSource } from "./prompt";

export interface StoryBoard {
  id: string | null;
  name: string;
  /** Optional rich-text HTML flavor text, up to 400 plain-text characters. */
  description?: string | null;
  image: string | null;
  /** Croppable cover (position + zoom), rendered at a 6:9 ratio. */
  avatar: NWImage | null;
  members: StoryBoardMember[];
  events: StoryBoardEvent[];
  /** When true the story is published: viewable (read-only) by everyone. */
  isPublic: boolean;
  /** Page geometry for the book layout (a `PageFormat` value from
   *  `@/lib/paginator`). Stored per story so co-authors see the same page
   *  cuts; omitted on save means "unchanged". */
  pageFormat?: string | null;
  tags: Tag[];
  /** Optional fandom this story belongs to (same catalogue as muses). */
  fandom?: Fandom | null;
  /** Curated genre tags, up to 5 per story. */
  genres?: Genre[];
  createdBy?: Friend;
  /** Heart reaction count and whether the viewer reacted. Shared with any
   * STORY_BOARD-target activity (editing the story or one of its events). */
  reactions?: number;
  reacted?: boolean;
  /** Muses with at least one embedded dialog anywhere in the story's threads,
   *  sorted by name. Server-derived; kept in sync as threads are edited. */
  cast?: StoryCastMember[];
}

/** A muse in a story's cast: minimal shape to render a character chip. */
export interface StoryCastMember {
  id: string;
  name: string;
  image: string | null;
  avatar: NWImage | null;
  /** The muse's accent when it opted into using it; null otherwise. */
  accent: string | null;
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
  /** Optional featured song for the chapter (NW Library or Spotify). */
  song: ProfileSong | null;
  /** Where the chapter sits on the story's abstract time axis (0–100). Null
   *  start/end means it hasn't been placed on the timeline yet. Server-owned:
   *  only `saveStoryboardEventTimelineAction` changes these. */
  timelineStart?: number | null;
  timelineEnd?: number | null;
  timelineLaneId?: string | null;
  /** Reads later than it happens — drawn with the flashback stripes. */
  isFlashback?: boolean;
}

/** A track on the timeline: a POV character, a plotline, a faction. */
export interface StoryTimelineLane {
  id: string | null;
  storyBoardId?: string | null;
  name: string;
  /** Accent for this lane's blocks; null falls back to the story accent. */
  color?: string | null;
  ordinal: number;
}

/** A named tick on the axis — what gives an abstract position its meaning. */
export interface StoryTimelineMarker {
  id: string | null;
  storyBoardId?: string | null;
  label: string;
  /** Abstract axis position, 0–100. */
  position: number;
  ordinal: number;
}

/** Everything the timeline view needs, in one payload. */
export interface StoryTimeline {
  storyBoardId: string;
  lanes: StoryTimelineLane[];
  markers: StoryTimelineMarker[];
  /** Every chapter in reading order — placed or not (the view shelves the
   *  unplaced ones). */
  events: StoryBoardEvent[];
}

/** Placement-only payload: a drag must not resend the whole chapter. */
export interface StoryBoardEventTimelineInput {
  /** Null start/end unplaces the chapter. */
  timelineStart: number | null;
  timelineEnd: number | null;
  laneId: string | null;
  isFlashback: boolean;
}

// ── Codex ──────────────────────────────────────────────────────────────────
// A story's world bible. Characters are *not* here: they are the derived cast
// (`StoryBoard.cast`), which the muse system owns.

export interface CodexCategory {
  id: string | null;
  storyBoardId?: string | null;
  name: string;
  /** A curated icon key (see `@/components/story-codex/icons`), not markup. */
  icon?: string | null;
  ordinal: number;
  /** True for the seeded Places/Items/Lore; they behave like any other. */
  isSystem?: boolean;
}

export interface CodexEntry {
  id: string | null;
  storyBoardId?: string | null;
  categoryId: string;
  name: string;
  /** Rich-text HTML, same shape as an event thread's message. */
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  image?: string | null;
  /** Croppable cover; `image` mirrors avatar.src for flat display contexts. */
  avatar?: NWImage | null;
  /** Chapters this entry appears in. The server diffs this against what it
   *  has stored, so send the whole set, not a delta. */
  chapterIds: string[];
  createdBy?: string | null;
  createdAt?: string | null;
}

/**
 * The colour a relationship is drawn in on the mesh.
 *
 * Three, and only three, by design: the mesh draws every edge against every
 * other, and three hues is the most that stays distinguishable under
 * colour-vision deficiency at that density. What a relationship *means* lives
 * in its `label`, never in its colour alone.
 */
export type RelationshipTone = "BOND" | "STRAIN" | "NEUTRAL";

/** How two of a story's cast characters stand toward each other. */
export interface CodexRelationship {
  id: string | null;
  storyBoardId?: string | null;
  /** Both ends are cast muse ids — characters who actually speak in the story. */
  fromMuseId: string;
  toMuseId: string;
  /** The author's own words: "sworn enemies", "raised him", "owes a debt". */
  label: string;
  tone: RelationshipTone;
  /** Directed ("betrayed") draws an arrow; mutual ("siblings") does not. */
  isDirected: boolean;
  /** 1–3, drawn as the edge's weight. */
  strength: number;
  /** Optional rich-text detail. */
  detail?: string | null;
  createdBy?: string | null;
}

/** Everything the codex view needs, in one payload. */
export interface Codex {
  storyBoardId: string;
  categories: CodexCategory[];
  /** Flat across every category — the view groups them by the active tab. */
  entries: CodexEntry[];
  /** How the story's cast stand toward each other, drawn as the mesh. */
  relationships: CodexRelationship[];
}

// ── Maps ───────────────────────────────────────────────────────────────────
// The authors' own map image with codex entries pinned onto it.

export interface StoryMapPin {
  id: string | null;
  mapId?: string | null;
  /** When set, the pin's name and detail come from that codex entry. */
  codexEntryId?: string | null;
  /** A free label — and the entry's last known name once it is deleted. */
  label?: string | null;
  /** Percentages (0–100) of the image's natural size, so a pin lands in the
   *  same place at any render size or zoom. */
  x: number;
  y: number;
}

export interface StoryMap {
  id: string | null;
  storyBoardId?: string | null;
  name: string;
  /** The uploaded map, stored uncropped — pins are percentages of it. */
  image?: string | null;
  ordinal: number;
  createdBy?: string | null;
  pins: StoryMapPin[];
}

/** Every map of a story, pins included — one payload for the map view. */
export interface StoryMaps {
  storyBoardId: string;
  maps: StoryMap[];
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

// ── Soundscape ─────────────────────────────────────────────────────────────
// Audio cues mounted to a range of a chapter's passages, fading in and out as
// the reader moves through them.

/**
 * Where a cue's audio comes from. Spotify is deliberately absent — its embed
 * player offers no programmatic seek or volume, and a clipped, fading cue
 * needs both.
 */
export type SoundCueSource = "LIBRARY_SONG" | "SFX";

export interface SoundCue {
  id: string | null;
  storyBoardEventId?: string | null;
  name: string;
  sourceType: SoundCueSource;
  /** The author's own uploaded song, when sourceType is LIBRARY_SONG. */
  songId?: string | null;
  /** Reserved for the SFX provider; unused until one is chosen. */
  sfxUrl?: string | null;
  sfxAttribution?: string | null;
  color?: string | null;
  icon?: string | null;
  /** Inclusive range over the chapter's passage positions (0-based). */
  startThreadOrdinal: number;
  endThreadOrdinal: number;
  /** The slice of the audio to play, in seconds. Null = the whole track. */
  clipStartSec?: number | null;
  clipEndSec?: number | null;
  volume: number;
  isLoop: boolean;
  fadeInSec: number;
  fadeOutSec: number;
  createdBy?: string | null;
  /** Server-resolved playable url — the reader needs no second fetch. */
  audioUrl?: string | null;
}

/** A chapter's cues, plus the passage count that gives the ruler its length. */
export interface ChapterSoundscape {
  storyBoardEventId: string;
  cues: SoundCue[];
  passageCount: number;
}

/**
 * A chapter's frozen page geometry (backend V38).
 *
 * Where the pages break depends on how tall each passage renders, which only a
 * browser can know. The first member client to lay a passage out reports its
 * height; everyone else packs the pages from these numbers instead of measuring
 * for themselves, so a page number means the same passage on every machine and
 * in both the manuscript and the book.
 */
export interface ChapterPageLayout {
  /** Layout engine the heights were measured with; mismatches are ignored. */
  engine: number;
  /** The page format the heights belong to (heights change with the format). */
  format: string;
  /** Every passage of the chapter in reading order — including unloaded ones. */
  order: string[];
  /** Item key (`overture` or a passage id) → height in the page's design px. */
  heights: Record<string, number>;
}

/** What a client reports after measuring the passages it had loaded. */
export interface ChapterPageMetricsRequest {
  format: string;
  engine: number;
  heights: Record<string, number>;
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
