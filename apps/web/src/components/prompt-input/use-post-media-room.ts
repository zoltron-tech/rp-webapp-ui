import {
  countRichTextMedia,
  MAX_POST_MEDIA,
  tooManyMediaMessage,
} from "@nw/utils";
import { useCallback } from "react";
import { useUIContext } from "@/hooks";
import { usePromptInputState } from "./prompt-input.store";

/**
 * The prompt, comment or reply composer's media limit (owner decision
 * 2026-11-08: five per input): the uploaded pictures in the text plus the
 * attachment, read off the prompt-input store. Klipy GIFs never count
 * (`countRichTextMedia` leaves them out) and the GIF picker never asks.
 *
 * `ensureRoom` is what every way of adding media calls first: `true` when one
 * more fits, else it toasts the short line and returns `false`, so the picker
 * never opens. The save endpoint's 422 `too_many_media` stays the authority.
 */
export const usePostMediaRoom = () => {
  const promptText = usePromptInputState("promptText");
  const attachment = usePromptInputState("media");
  const type = usePromptInputState("type");
  const { errorToast } = useUIContext();

  const count = countRichTextMedia(promptText) + (attachment ? 1 : 0);
  const full = count >= MAX_POST_MEDIA;
  const message = tooManyMediaMessage(type);

  const ensureRoom = useCallback((): boolean => {
    if (!full) return true;
    errorToast?.(message);
    return false;
  }, [errorToast, full, message]);

  return { count, ensureRoom, full, message };
};
