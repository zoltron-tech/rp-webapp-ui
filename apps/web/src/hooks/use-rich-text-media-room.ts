import { MAX_POST_MEDIA, tooManyMediaMessage } from "@nw/utils";
import { useCallback } from "react";
import { richTextMediaCount } from "@/utils/rich-text-media-count";
import { useUIContext } from "./use-ui-context";

/**
 * The five-media limit (owner decision 2026-11-08) for a rich-text input
 * outside the prompt composer: the Muse About section and the novelist's
 * About. Same rule and copy as `usePostMediaRoom`: the pictures and GIFs in
 * `html` plus any attachment
 * (a Klipy GIF or clip in the attachment slot is not counted).
 *
 * `ensureRoom` is what every way of adding media calls first: `true` when one
 * more fits, else it toasts the line and returns `false`, so the picker never
 * opens. The save endpoint's 422 `too_many_media` stays the authority.
 */
export const useRichTextMediaRoom = (
  html: string | null | undefined,
  attachment?: string | null,
) => {
  const { errorToast } = useUIContext();

  const count = richTextMediaCount(html, attachment);
  const full = count >= MAX_POST_MEDIA;
  const message = tooManyMediaMessage();

  const ensureRoom = useCallback((): boolean => {
    if (!full) return true;
    errorToast?.(message);
    return false;
  }, [errorToast, full, message]);

  return { count, ensureRoom, full, message };
};
