import { removeReaction, setReaction } from "@nw/api/endpoints/novelists";
import { useApi } from "@nw/features";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A heart, held optimistically.
 *
 * The native counterpart to web's `use-toggle-like`, and it calls the same two
 * endpoints in the same order — `PATCH /react/:id?targetType=…` to add,
 * `DELETE /react/:id` to remove. What differs is only that this owns the count
 * as well as the flag, because there is no `LikeButton` component here to hold
 * it for us.
 *
 * ## Why the state is local rather than in the query cache
 *
 * A reaction is a per-viewer fact about a row the cache holds for everyone, and
 * the endpoint answers with the authoritative pair rather than a new copy of
 * the post. Writing that back through the thread query would mean patching a
 * nested reply inside a paged infinite query on every tap — a lot of surface
 * area for two numbers that the next refetch supplies anyway.
 *
 * The cost of local state is that it has to be re-seeded when the row changes
 * underneath it, which is what the effect below is for: a refetch that brings a
 * different count must win over what was typed here, or the two disagree until
 * the screen is left.
 *
 * ## Failure
 *
 * The optimistic move is reverted to the values the server last confirmed, not
 * to "the opposite of what I just did" — those differ the moment two taps race,
 * and reverting to the inverse is how a double-tap leaves a heart that says
 * something nobody asked for.
 *
 * ## Racing taps
 *
 * Every tap is taken. The first version refused one while a request was in
 * flight, which is the safe-looking answer and the wrong one: a tap that does
 * nothing reads as a dropped tap, and the heart's animation is keyed off the
 * state changing, so a refused tap is a control that visibly ignores you.
 *
 * Instead each request carries a sequence number and only the newest one is
 * allowed to write. A reply that a later tap has already superseded is dropped
 * on arrival — the same guard the registration form uses for its username
 * check, and the reason a slow "unlike" cannot land on top of a fast "like".
 *
 * ## `onChange`, for the callers that *can* write back
 *
 * The argument above is about a *nested* row — a reply inside a paged thread —
 * where patching the cache costs more than it buys. A feed is the other case:
 * its prompts are the top level of the infinite query, so a caller that can
 * reach them cheaply should, or the heart is forgotten the moment the card
 * unmounts (which, in a recycling list, is as soon as it scrolls away).
 *
 * So this is optional and the default is unchanged. It fires on the optimistic
 * move, on the server's confirmation, and on a revert — every value this hook
 * settles on — so a cache patched from it never disagrees with what is drawn.
 * It is held in a ref rather than a dependency: the hook is called once per
 * card in a list, and a caller that rebuilt the callback would otherwise
 * rebuild `toggle` on every render of the screen above it.
 */
/** Everything the reaction endpoint will react to. Web's list, verbatim. */
export type ReactionTarget =
  | "prompt"
  | "comment"
  | "reply"
  | "media"
  | "muse"
  | "profile"
  | "story_board"
  | "story_board_event";

export const useToggleReaction = ({
  id,
  onChange,
  reacted,
  reactions,
  type,
}: {
  id: string;
  /**
   * Told every value this hook settles on, optimistic and confirmed alike.
   *
   * For a caller that keeps the row somewhere outliving the card — see the
   * note above. Omitted, the reaction stays local, which is what a thread
   * wants.
   */
  onChange?: (next: { reacted: boolean; reactions: number }) => void;
  reacted: boolean;
  reactions: number;
  /**
   * The API's own vocabulary, upper-cased on the way out.
   *
   * The same set web's `use-toggle-like` accepts, because the same endpoint
   * takes it as `?targetType=` and a value this app invents is a 400 the user
   * sees as a heart that will not fill.
   */
  type: ReactionTarget;
}) => {
  const api = useApi();
  const [state, setState] = useState({ reacted, reactions });

  /** The newest request. Anything older than this is no longer the answer. */
  const seq = useRef(0);

  /*
   * Kept current without being a dependency, so a caller that writes the
   * callback inline does not rebuild `toggle` — and through it every memoised
   * card in the list — on each render.
   */
  const notify = useRef(onChange);
  notify.current = onChange;

  /** Sets the pair and tells the caller, which are never allowed to diverge. */
  const settle = useCallback(
    (next: { reacted: boolean; reactions: number }) => {
      setState(next);
      notify.current?.(next);
    },
    [],
  );

  // Re-seed from the row whenever the row itself changes. `reacted`/`reactions`
  // are primitives, so this runs on a real change rather than on every render
  // of a new object.
  useEffect(() => {
    setState({ reacted, reactions });
  }, [reacted, reactions]);

  const toggle = useCallback(async () => {
    if (!id) return;

    const mine = ++seq.current;
    const confirmed = state;

    settle({
      reacted: !confirmed.reacted,
      reactions: confirmed.reactions + (confirmed.reacted ? -1 : 1),
    });

    try {
      const result = confirmed.reacted
        ? await removeReaction(api, id)
        : await setReaction(api, id, type.toUpperCase());

      if (mine !== seq.current) return;

      // A `message` is the API declining, not a count. Anything without the
      // pair is treated the same way: put back what was last agreed.
      if (!result || "message" in result) {
        settle(confirmed);
        return;
      }

      settle({ reacted: result.reacted, reactions: result.reactions });
    } catch {
      if (mine === seq.current) settle(confirmed);
    }
  }, [api, id, settle, state, type]);

  return { reacted: state.reacted, reactions: state.reactions, toggle };
};
