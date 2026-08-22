import type { Message } from "@nw/types";
import { IoClose } from "react-icons/io5";
import { AvatarNew } from "@/components/common/avatar-new";
import * as S from "./styles";

const REPLY_IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp"]);
const REPLY_URL_RE = /(https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/i;
const MENTION_TAG_RE = /class="mention-tag"/i;

const getReplyImageSrc = (message: Message): string | null => {
  const imgAttachment = message.attachments?.find((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return REPLY_IMAGE_EXTS.has(ext);
  });
  if (imgAttachment) return imgAttachment.url;

  const text = message.message || "";
  const urlMatch = text.match(REPLY_URL_RE);
  if (urlMatch) {
    const ext =
      urlMatch[0]
        .split("?")[0]
        ?.split("#")[0]
        ?.split(".")
        .pop()
        ?.toLowerCase() ?? "";
    if (REPLY_IMAGE_EXTS.has(ext)) return urlMatch[0];
  }

  return null;
};

/** Returns true only when the message has no meaningful text beyond the image itself. */
const isImageOnlyMessage = (message: Message): boolean => {
  if (MENTION_TAG_RE.test(message.message || "")) return false;

  const hasText = !!message.message?.trim();
  const hasImageAttachment = message.attachments?.some((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return REPLY_IMAGE_EXTS.has(ext);
  });

  if (hasImageAttachment && !hasText) return true;

  if (hasText) {
    const text = message.message.trim();
    const urlMatch = text.match(REPLY_URL_RE);
    if (urlMatch && urlMatch[0] === text) {
      const ext =
        urlMatch[0]
          .split("?")[0]
          ?.split("#")[0]
          ?.split(".")
          .pop()
          ?.toLowerCase() ?? "";
      if (REPLY_IMAGE_EXTS.has(ext)) return true;
    }
  }

  return false;
};

type Props = {
  message: Message;
  onDismiss: () => void;
};

export function ReplyPreview({ message, onDismiss }: Props) {
  const imgSrc = getReplyImageSrc(message);

  return (
    <S.ReplyPreviewBar>
      <S.ReplyPreviewAvatar>
        <AvatarNew
          src={message.sender.image || null}
          alt={message.sender.name || message.sender.username}
          username={message.sender.username}
        />
      </S.ReplyPreviewAvatar>
      <S.ReplyPreviewBody>
        <S.ReplyPreviewSender>
          {message.sender.name || message.sender.username}
        </S.ReplyPreviewSender>
        {isImageOnlyMessage(message) ? (
          <S.ReplyPreviewThumbLabel>📷 Image</S.ReplyPreviewThumbLabel>
        ) : (
          <S.ReplyPreviewText>
            {message.message
              ? message.message
                  .replace(/<[^>]+>/g, "")
                  .trim()
                  .slice(0, 100)
              : "(attachment)"}
          </S.ReplyPreviewText>
        )}
      </S.ReplyPreviewBody>
      {imgSrc ? <S.ReplyPreviewThumb src={imgSrc} alt="Image preview" /> : null}
      <S.ReplyPreviewDismiss
        type="button"
        aria-label="Cancel reply"
        onClick={onDismiss}
      >
        <IoClose size={14} />
      </S.ReplyPreviewDismiss>
    </S.ReplyPreviewBar>
  );
}
