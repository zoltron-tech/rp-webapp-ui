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
  /** The muse's novelist disabled their account: draw the placeholder. */
  isPlaceholder?: boolean;
}

export interface StoryBoardMember {
  username: string;
  storyBoardId: string;
  image: string;
  isAdmin: boolean;
  /** The member disabled their account: no username or image, draw the placeholder. */
  isPlaceholder?: boolean;
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

/**
 * How a tone's edges are stroked — the mesh's secondary encoding.
 *
 * This is what lets a story hold more tones than hue alone could carry: colour
 * and pattern together stay separable where colour on its own stops being, and
 * the mesh still reads with no colour vision at all.
 */
export type CodexToneLineStyle = "SOLID" | "DASHED" | "DOTTED";

/**
 * A tone a story's authors defined for themselves — "blood oath", "same
 * regiment", "unrequited".
 *
 * Only these come from the server. BOND / STRAIN / NEUTRAL are constants in
 * `@/components/story-codex/relationships/tones`, with per-theme colours the
 * mesh was validated against — which is exactly why they can never be renamed
 * or deleted, and why they are not rows.
 */
export interface CodexTone {
  id: string | null;
  storyBoardId?: string | null;
  label: string;
  /** A hex, used in both themes. */
  color: string;
  lineStyle: CodexToneLineStyle;
  ordinal: number;
  createdBy?: string | null;
}

/**
 * Which pool a character comes from.
 *
 * `MUSE` is a novelist's own muse, in this story's cast because it speaks here
 * — only its owner may edit it. `CHARACTER` is one of the storyboard's own
 * in-story characters, which every co-author writes. Both are characters in the
 * story; they differ only in who owns them.
 */
export type CharacterRefType = "MUSE" | "CHARACTER";

/** How two of a story's characters stand toward each other. */
export interface CodexRelationship {
  id: string | null;
  storyBoardId?: string | null;
  /** Either end may be a cast muse or one of the story's own characters. The
   *  id and its type travel together; neither means anything alone. */
  fromId: string;
  fromType: CharacterRefType;
  toId: string;
  toType: CharacterRefType;
  /** The author's own words: "sworn enemies", "raised him", "owes a debt". */
  label: string;
  /** One of the built-in three. When `toneId` is set this is what the edge
   *  falls back to if that custom tone is later retired. */
  tone: RelationshipTone;
  /** A tone this story defined for itself; null means the built-in above. */
  toneId?: string | null;
  /** Directed ("betrayed") draws an arrow; mutual ("siblings") does not. */
  isDirected: boolean;
  /** 1–3, drawn as the edge's weight. */
  strength: number;
  /** Optional rich-text detail. */
  detail?: string | null;
  createdBy?: string | null;
}

/**
 * One character in a group.
 *
 * The id and its kind travel together, exactly as an end of a relationship
 * does: the muse and story-character id spaces are separate, so an id on its
 * own does not say who somebody is.
 */
export interface CodexGroupMember {
  id: string;
  refType: CharacterRefType;
}

/**
 * A named, coloured set of the story's characters — a house, a clan, a crew,
 * an affiliation.
 *
 * A relationship is a line between exactly two characters, which is the wrong
 * shape for "these five are Gryffindor": an affiliation is a *set*, it carries
 * a name of its own, and a character belongs to as many as the story says. The
 * mesh draws each group as a coloured field around its members, and where two
 * fields overlap it paints the blend of their colours — so somebody in both
 * houses reads as being in both, without a line being drawn anywhere.
 *
 * Two members at least: a group of one is that character, and a field around a
 * single disc says nothing the disc does not already say.
 */
export interface CodexGroup {
  id: string | null;
  storyBoardId?: string | null;
  /** The authors' own words: "Gryffindor", "House Corvin", "the Ninth". */
  name: string;
  /** A hex, used in both themes — the same single choice a custom tone makes. */
  color: string;
  /** Legend order, and the order the mesh paints the fields in. */
  ordinal: number;
  /** The whole membership. The server diffs this against what it has stored,
   *  so send the whole set, not a delta. */
  members: CodexGroupMember[];
  createdBy?: string | null;
}

// ── In-story characters ────────────────────────────────────────────────────
// The storyboard's own shared pool, beside the derived cast of muses. A muse
// belongs to one novelist and travels between stories; one of these belongs to
// the story, and every co-author writes it.

export interface StoryCharacter {
  id: string | null;
  storyBoardId?: string | null;
  firstName: string;
  lastName?: string | null;
  /** Croppable portrait — the same adjustable avatar a muse has, framed by
   *  pan and zoom. `image` mirrors avatar.src for the flat contexts (chips,
   *  pickers, the dialog avatar endpoint).
   *
   *  Null means *unchanged* on the way in: a rename must not wipe the face. */
  avatar?: NWImage | null;
  image?: string | null;
  /** Takes the portrait off. Explicit, because "no portrait sent" and "no
   *  portrait wanted" are different things and only the client knows which. */
  clearAvatar?: boolean;
  /** Tints this character's embedded dialogs, exactly as a muse's accent does. */
  accent?: string | null;
  useAccent?: boolean;
  gender?: string | null;
  nicknames?: string[];
  /** Rich-text HTML, same shape as a codex entry's description. */
  about?: string | null;
  /** The authors' own fields: "House", "Weapon", "Debt owed to". */
  extraAttributes?: Record<string, string>;
  createdBy?: string | null;
  createdByName?: string | null;
  modifiedBy?: string | null;
  modifiedByName?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
}

/**
 * A character in the story, whichever pool it came from — the shape the mesh,
 * the relationship picker and the dialog sender picker all work in.
 */
export type StoryPerson = StoryCastMember & { refType: CharacterRefType };

/** Everything the codex view needs, in one payload. */
export interface Codex {
  storyBoardId: string;
  categories: CodexCategory[];
  /** Flat across every category — the view groups them by the active tab. */
  entries: CodexEntry[];
  /** How the story's characters stand toward each other, drawn as the mesh.
   *  Either end may be a cast muse or one of `characters` below. */
  relationships: CodexRelationship[];
  /** The story's own characters. The cast (muses) rides on `StoryBoard.cast`. */
  characters: StoryCharacter[];
  /** Tones the authors defined for themselves, on top of the built-in three. */
  tones: CodexTone[];
  /** The houses, clans and affiliations this story sorts its characters into,
   *  drawn on the mesh as coloured fields around their members. */
  groups?: CodexGroup[];
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
  /** Speaker id → name/accent for the dialogs in `message` (server-set). Covers
   *  both pools: the novelist's muses and the story's own characters. */
  museDialogAttrs?: Record<
    string,
    { name: string; accent: string | null; sourceType?: CharacterRefType }
  >;
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

// ── Sticky notes ───────────────────────────────────────────────────────────
// A storyboard's shared corkboard, in the spirit of Google Keep. Members-only
// in both directions — unlike the codex, a public story does not show these.

/**
 * What a sticky is. A plain note is one author telling the others something;
 * a poll is the board asking them — a question with a ballot every co-author
 * gets exactly one vote on.
 */
export type StoryNoteType = "NOTE" | "POLL";

/** Just enough of a co-author to render their chip beside their choice. */
export interface StoryNotePollVoter {
  id: string;
  name?: string | null;
  image?: string | null;
}

/**
 * One choice on a poll's ballot.
 *
 * `id` is null for a choice just added in the editor. An existing id is what
 * keeps the votes already cast on that choice attached to it while its author
 * edits the wording of the others — so send ids back untouched.
 */
export interface StoryNotePollOption {
  id: string | null;
  /** Plain text, never markup. */
  label: string;
  ordinal: number;
  /** Server-derived; ignored on the way in. */
  voteCount: number;
  /** A shared corkboard has no secret ballot — knowing who still owes an
   *  answer is half the point of asking. */
  voters: StoryNotePollVoter[];
}

export interface StoryNote {
  id: string | null;
  storyBoardId?: string | null;
  /** Optional — a note can be body-only. A poll's title is its question. */
  title?: string | null;
  /** Rich-text HTML, same shape as a codex entry's description. */
  content?: string | null;
  /** A hex from `@/components/story-notes/colors`; null means the default. */
  color?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  /** Board order within the pinned/unpinned halves. Server-assigned. */
  ordinal?: number;
  /** Defaults to a plain note when the server omits it. */
  noteType?: StoryNoteType;
  /** The ballot, in the order its author arranged it. Empty on a plain note. */
  pollOptions?: StoryNotePollOption[];
  /** A settled poll: results stay readable, the ballot closes. */
  isPollClosed?: boolean;
  /** The reading co-author's own vote. Server-derived. */
  myVoteOptionId?: string | null;
  /** How many co-authors have answered — one apiece, never more. */
  totalVotes?: number;
  createdBy?: string | null;
  createdByName?: string | null;
  createdByImage?: string | null;
  modifiedBy?: string | null;
  modifiedByName?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
}

/** Pin/archive/close toggles. Sent alone so a toggle doesn't resend the body. */
export interface StoryNoteFlags {
  isPinned?: boolean;
  isArchived?: boolean;
  /** Poll-only; ignored on a plain note. */
  isPollClosed?: boolean;
}
