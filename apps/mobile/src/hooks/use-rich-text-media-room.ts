import { MAX_POST_MEDIA, tooManyMediaMessage } from "@nw/utils";
import { useCallback, useRef } from "react";
import { Alert } from "react-native";
import {
  attachmentCounts,
  richTextMediaCount,
} from "@/lib/rich-text-media-count";

/**
 * The five-media limit (owner decision 2026-11-08) for a rich-text input
 * outside the prompt composer: a muse's story (About) section and the
 * novelist's About. Same rule and copy as the composer's `ensureRoom`: the
 * pictures and GIFs in `html` plus any attachment
 * (a Klipy GIF or clip in the attachment slot is not counted).
 *
 * `ensureRoom` is what every way of adding media calls first: `true` when one
 * more fits, else it alerts the line and returns `false`. `replacingAttachment`
 * is for a new clip that takes the attachment's place. The save endpoint's
 * 422 `too_many_media` stays the authority.
 */
export const useRichTextMediaRoom = (
  html: string | null | undefined,
  attachment?: string | null,
) => {
  const images = richTextMediaCount(html);
  const hasAttachment = attachmentCounts(attachment);
  const count = images + (hasAttachment ? 1 : 0);
  const full = count >= MAX_POST_MEDIA;
  const message = tooManyMediaMessage();

  // The latest counts, for checks that run from async callbacks.
  const latest = useRef({ hasAttachment, images });
  latest.current = { hasAttachment, images };

  const ensureRoom = useCallback(
    (replacingAttachment = false): boolean => {
      const { hasAttachment: attached, images: inText } = latest.current;
      const used = inText + (attached && !replacingAttachment ? 1 : 0);
      if (used < MAX_POST_MEDIA) return true;
      Alert.alert("Media limit reached", message);
      return false;
    },
    [message],
  );

  return { count, ensureRoom, full, message };
};
