import type { IconType } from "react-icons";
import {
  LuBookText,
  LuHistory,
  LuLibrary,
  LuMap,
  LuStickyNote,
  LuWaves,
} from "react-icons/lu";

/**
 * The storyboard workspace's views.
 *
 * The reading experience (the chapter page, the book/pages layouts) is a
 * separate, reader-facing path. This is the authoring surface — though a
 * public story shows all of it read-only, so a reader can browse a world
 * bible without joining the story.
 */
export type WorkspaceView =
  | "chapters"
  | "timeline"
  | "codex"
  | "map"
  | "notes"
  | "sound";

export const WORKSPACE_VIEWS: WorkspaceView[] = [
  "chapters",
  "timeline",
  "codex",
  "map",
  "notes",
  "sound",
];

/** Views a public story does not show at all — the authors' own workspace. */
export const MEMBERS_ONLY_VIEWS: WorkspaceView[] = ["notes", "sound"];

export const isWorkspaceView = (
  value: string | null | undefined,
): value is WorkspaceView => WORKSPACE_VIEWS.includes(value as WorkspaceView);

export interface WorkspaceViewMeta {
  view: WorkspaceView;
  label: string;
  icon: IconType;
  /** Tooltip on the rail, and the mobile tab's accessible name. */
  description: string;
}

export const VIEW_META: Record<WorkspaceView, WorkspaceViewMeta> = {
  chapters: {
    description: "The story itself, in reading order",
    icon: LuBookText,
    label: "Chapters",
    view: "chapters",
  },
  codex: {
    description: "The world bible — places, items, lore and your cast",
    icon: LuLibrary,
    label: "Codex",
    view: "codex",
  },
  map: {
    description: "Your world map, with codex places pinned onto it",
    icon: LuMap,
    label: "Map",
    view: "map",
  },
  notes: {
    description: "Sticky notes shared with your co-authors — private to you",
    icon: LuStickyNote,
    label: "Notes",
    view: "notes",
  },
  sound: {
    description: "Audio cues mounted to a chapter's passages",
    icon: LuWaves,
    label: "Sound",
    view: "sound",
  },
  timeline: {
    description:
      "When the chapters happen, as opposed to the order they're read in",
    icon: LuHistory,
    label: "Timeline",
    view: "timeline",
  },
};
