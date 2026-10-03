import type { UserGuide } from "../../types";
import {
  CategoryManagerStage,
  CharacterEditorStage,
  CodexStage,
  EntryEditorStage,
  WorkspaceStage,
} from "./stages";

/**
 * "About storyboards" — the tour a first-time author gets from the storyboard
 * page.
 *
 * It leans on the codex, because that is the part of the workspace nobody
 * guesses at: the cast that fills itself, the two pools of characters, the mesh,
 * and the fact that the categories are the author's to invent.
 *
 * The stages carry the demonstration, so the copy only has to name what is
 * moving: one line of body, then bullets a reader can skim while the flow
 * plays. Anything longer competes with the picture beside it.
 */
export const STORYBOARD_GUIDE: UserGuide = {
  id: "storyboard-overview",
  steps: [
    {
      body: "Chapters, cast, world, map, notes — one page. The views are tabs, so switching never reloads or loses your place.",
      id: "what-it-is",
      stage: <WorkspaceStage flow={["chapters", "codex", "map"]} />,
      stageNote: "A sample story, playing itself.",
      title: "One storyboard, several views",
    },
    {
      body: "A rail on desktop, a tab bar on a phone. The view you are in stays in the address bar, so it can be linked.",
      id: "getting-around",
      points: [
        <>
          <b>Chapters</b> — the story, in reading order.
        </>,
        <>
          <b>Timeline</b> — when chapters happen, not the order they are read.
        </>,
        <>
          <b>Codex</b> — cast, places, items, lore.
        </>,
        <>
          <b>Map</b> — codex places, pinned.
        </>,
        <>
          <b>Notes</b>, <b>Sound</b> — members only.
        </>,
      ],
      stage: <WorkspaceStage />,
      stageNote: "Every view, in turn.",
      title: "Getting around",
    },
    {
      body: "Everything true about your world that is not a chapter. Two tabs for people, then one per category.",
      id: "codex-intro",
      points: [
        "Each tab counts what is in it.",
        "Tabs scroll sideways on a phone; the fade means more.",
        "A public story shows its codex read-only.",
      ],
      stage: (
        <CodexStage
          flow={[
            { at: "tab:cast", tab: "cast" },
            { at: "tab:mesh", tab: "mesh" },
            { at: "tab:cat-places", tab: "cat-places" },
            { at: "tab:cat-lore", tab: "cat-lore" },
            { at: "tab:add", tab: "cat-lore" },
          ]}
        />
      ),
      stageNote: "Tab by tab, including the + that adds one.",
      title: "The Codex",
    },
    {
      body: (
        <>
          <b>The cast</b> is muses — owned by a novelist, added here the moment
          they speak in a passage. <b>The story&rsquo;s characters</b> belong to
          the storyboard: the innkeeper, the dead king.
        </>
      ),
      id: "characters",
      points: [
        "A muse is edited from its own page, by its owner.",
        "A story character is edited by any co-author.",
        "Both can speak in a passage; both appear on the mesh.",
      ],
      stage: (
        <CodexStage
          flow={[
            { at: "pool:cast", tab: "cast" },
            { at: "pool:characters", tab: "cast" },
            { at: "chip:new-character", tab: "cast" },
          ]}
        />
      ),
      stageNote: "Solid chips are muses; dashed belong to the story.",
      title: "Two pools of characters",
    },
    {
      body: "New character opens this sheet — a tray on a phone, a dialog on a desktop. Tapping one opens the same sheet on them.",
      id: "character-editor",
      points: [
        "The portrait's framing follows them everywhere.",
        "Nicknames are what the mention picker matches.",
        "Add fields of your own: House, Weapon, Debt owed to.",
        "Delete takes their relationship threads with them.",
        "50 story characters per story; muses are not capped.",
      ],
      stage: <CharacterEditorStage />,
      title: "Making characters",
    },
    {
      body: "Your cast on a ring, a thread for every relationship. Colour is a coarse tone; the meaning is the label you write.",
      id: "relationships",
      points: [
        "New relationship: two characters, a label, a tone, a weight of 1–3.",
        "Weight is the thread's thickness; directed ones draw an arrow.",
        "Add tones of your own — each has its own stroke, so colour is never the only signal.",
        "Tap a face to follow only their threads; tap a tone to hide it.",
        "Click a thread to edit it. A table view holds the same data.",
      ],
      stage: (
        <CodexStage
          flow={[
            { tab: "mesh" },
            { at: "mesh:legend", tab: "mesh" },
            { at: "mesh:new", tab: "mesh" },
          ]}
        />
      ),
      stageNote: "Following one character at a time.",
      title: "Relationships",
    },
    {
      body: "Everything else in the codex is an entry, filed under a category — a place, an item, a piece of lore.",
      id: "entries",
      points: [
        "New entry files it under the tab you are on.",
        "The pencil edits; the card itself opens to read.",
        "“Used in” chips jump to the chapters it appears in.",
      ],
      stage: (
        <CodexStage
          flow={[
            { at: "tool:new-entry", tab: "cat-places" },
            { at: "card:edit", tab: "cat-places" },
            { at: "card:open", tab: "cat-places" },
            { at: "card:chapters", tab: "cat-places" },
          ]}
        />
      ),
      stageNote: "Places, here; Items, Lore and Factions sit alongside.",
      title: "Entries",
    },
    {
      body: "One sheet for new and existing entries. Only the name is required.",
      id: "entry-editor",
      points: [
        "Move an entry between categories whenever you like.",
        "An icon and a colour keep it findable in a full grid.",
        "Tick the chapters it appears in.",
        "The description is full rich text: images, GIFs, links.",
        "Delete sits at the foot of the sheet, and asks first.",
      ],
      stage: <EntryEditorStage />,
      title: "Adding and deleting entries",
    },
    {
      body: "Places, Items and Lore are only a start. The + tab makes your own — Factions, Languages, Ships.",
      id: "categories",
      points: [
        "Drag the handles to order the tabs.",
        "Rename or re-icon anytime; the entries are untouched.",
        "A category deletes only once empty, so entries are never lost with it.",
      ],
      stage: <CategoryManagerStage />,
      title: "Your own kinds of entry",
    },
    {
      body: "The rest is a tap away on the same rail, and the codex feeds all of it.",
      id: "the-rest",
      points: [
        <>
          <b>Map</b> — pin your codex places.
        </>,
        <>
          <b>Timeline</b> — when things happened, flashbacks included.
        </>,
        <>
          <b>Notes</b> — for co-authors, never readers.
        </>,
        <>
          <b>Sound</b> — audio cues on a chapter&rsquo;s passages.
        </>,
      ],
      stage: <WorkspaceStage flow={["map", "timeline", "notes", "sound"]} />,
      stageNote: "Reopen it anytime from the Guide button.",
      title: "And the rest",
    },
  ],
  title: "About storyboards",
};
