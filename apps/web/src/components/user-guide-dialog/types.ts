import type { ReactNode } from "react";

/**
 * One page of a user guide.
 *
 * A step is copy plus, optionally, a *stage*: a mock of the real screen built
 * from the real components with sample data, so the reader recognises what they
 * are being told about the moment they meet it.
 */
export interface UserGuideStep {
  /** Stable id — the React key, and what a resume/analytics hook would store. */
  id: string;
  /** The step's heading, e.g. "The Codex". */
  title: string;
  /** The explanation. Plain text, or nodes when it needs emphasis. */
  body: ReactNode;
  /** Short bullets under the body — one line each, no paragraphs. */
  points?: ReactNode[];
  /**
   * The visual, rendered above the copy inside its own frame. Built from the
   * app's own components so it stays honest as the UI moves; sample data only,
   * nothing here touches the reader's story.
   */
  stage?: ReactNode;
  /** A caption under the stage — "tap it, nothing is saved" style hints. */
  stageNote?: ReactNode;
}

/**
 * A guide: a title and its steps, in order.
 *
 * Guides are plain data, so a feature adds one by exporting a `UserGuide` and
 * handing it to [UserGuideDialog] — no new dialog, no new chrome.
 */
export interface UserGuide {
  /** Stable id — also the key `useUserGuide` remembers "seen" under. */
  id: string;
  /** The dialog's title, constant across steps: "About storyboards". */
  title: string;
  steps: UserGuideStep[];
}
