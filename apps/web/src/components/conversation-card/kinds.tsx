import type { InboxKind } from "@nw/features";
import type { IconType } from "react-icons";
import {
  BsCameraReelsFill,
  BsChatLeftTextFill,
  BsCheck2All,
  BsEmojiLaughingFill,
  BsImageFill,
  BsLink45Deg,
  BsMusicNoteBeamed,
  BsPaperclip,
  BsPencilFill,
  BsSendFill,
} from "react-icons/bs";

/**
 * The glyph for each kind. Everything else about a conversation's look — its
 * kind, colour and section — is decided in `@nw/features`, where the
 * phone reads the same table.
 */
export const INBOX_ICONS: Record<InboxKind, IconType> = {
  blank: BsPencilFill,
  bundle: BsPaperclip,
  clip: BsCameraReelsFill,
  gif: BsEmojiLaughingFill,
  link: BsLink45Deg,
  picture: BsImageFill,
  seen: BsCheck2All,
  sent: BsSendFill,
  voice: BsMusicNoteBeamed,
  word: BsChatLeftTextFill,
};
