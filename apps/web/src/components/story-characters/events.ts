/**
 * Keeping the two lists of a story's characters in step.
 *
 * The storyboard page shows its characters twice at once: the strip under the
 * header, and the codex's Characters tab in the workspace below it. They hold
 * separate copies — the strip fetches the characters endpoint, the codex gets
 * them inside the codex payload — so an edit made in one would leave the other
 * showing the old name and the old face until the page was reloaded.
 *
 * Rather than lift the state into the page and rewire both, each broadcasts
 * what it changed and both listen. Scoped per storyboard, so nothing leaks
 * between stories.
 */

/** Event namespace; pair with the storyboard id as the uniqifier. */
export const STORY_CHARACTER_EVENTS = "story-characters";

/** A character was created or updated; detail is the saved `StoryCharacter`. */
export const CHARACTER_SAVED = "saved";

/** A character was removed; detail is its id. */
export const CHARACTER_DELETED = "deleted";
