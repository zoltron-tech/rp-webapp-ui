import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Where a post's author lives.
 *
 * Every card with a face on it — a prompt, a comment, a reply, an activity —
 * is signed by a *source*: a muse or a novelist. Web routes the avatar and the
 * name of each to that source's page (`ROUTES.Muse.View(id)` or
 * `ROUTES.Profile.View(username)`); this is the same decision, once, so the
 * four headers cannot disagree about it.
 *
 * ## Which field is the key
 *
 * A muse's page is addressed by its id and a novelist's by their username, and
 * the two source shapes spell those differently: a `PromptSource` has
 * `sourceId` and `urlProp`, an `ActivitySource` has `id` and `urlProp`. Callers
 * hand over the pair that matters and nothing else, so neither shape leaks in.
 *
 * ## Which stack
 *
 * The muse and novelist screens are registered in the Home stack (the profile
 * stack has the muse one too). Pushing their paths from another tab lands on
 * Home's copy — the convention the likers sheet and "penned by" already
 * follow — and their own username redirects to the Profile tab from inside the
 * novelist route, so this need not know who is signed in.
 */
export type SourceRef = {
  /** The muse's id, or the novelist's id — only the former is used. */
  id: string;
  sourceType: string;
  /** The novelist's username; a muse's id again, on this client. */
  urlProp: string;
  /**
   * A disabled author's stand-in (ACCOUNT_DISABLE_PLAN.md §7.3): it keeps a
   * real id, but its page is gone, so pressing it goes nowhere.
   */
  isPlaceholder?: boolean;
};

export const useOpenSource = () => {
  const router = useRouter();

  return useCallback(
    (source: SourceRef | null | undefined) => {
      if (!source || source.isPlaceholder) return;
      if (source.sourceType === "MUSE") {
        if (!source.id) return;
        router.push({
          params: { museId: source.id },
          pathname: "/muse/[museId]",
        });
        return;
      }
      if (source.sourceType === "NOVELIST") {
        if (!source.urlProp) return;
        router.push({
          params: { username: source.urlProp },
          pathname: "/novelist/[username]",
        });
      }
    },
    [router],
  );
};

/** The label a screen reader gets on the pressable header. */
export const sourceLinkLabel = (
  name: string | null | undefined,
  sourceType: string | undefined,
  isPlaceholder?: boolean | null,
) =>
  isPlaceholder
    ? `${name ?? "Author"}. This account is disabled`
    : `${name ?? "Author"}. Opens ${sourceType === "MUSE" ? "this character" : "their profile"}`;
