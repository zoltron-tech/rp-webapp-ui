import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Message } from "@nw/types";
import { ConversationSendList } from "@/components/chat/conversation-send-list";
import { BottomSheet } from "@/components/sheet";

/**
 * Forwarding a message — web's `ForwardMessageDialog`, as a tray.
 *
 * What goes is web's rule: a message's words, or the link of its first
 * attachment if it has none. A message's words forward with no formatting, and
 * the sheet says when something is left behind. It is sent as you, whoever
 * the message was from, and is encrypted for each conversation it goes to,
 * because each has its own key.
 *
 * The list and its sends are `ConversationSendList`, shared with "Send in a
 * chat" in the share trays. Keyed by the message, so each one starts over.
 */

/** What forwarding `message` sends. Empty means there is nothing to send. */
const forwardTextOf = (message: Message): string =>
  richTextToPlainText(parseRichText(message.message)).trim() ||
  message.attachments?.[0]?.url ||
  "";

/** What will not make it across, said before anything is sent. */
const leftBehind = (message: Message): string | undefined => {
  const count = message.attachments?.length ?? 0;
  if (count === 0) return undefined;
  if (richTextToPlainText(parseRichText(message.message)).trim()) {
    return "The words are sent. The attachments stay here.";
  }
  return count > 1 ? `Sends the first of ${count} attachments.` : undefined;
};

export const ForwardSheet = ({
  message,
  onClose,
  sourceConversationId,
}: {
  /** Null closes the sheet. */
  message: Message | null;
  onClose: () => void;
  /** Where the message already is: not somewhere to send it. */
  sourceConversationId: string | undefined;
}) => (
  <BottomSheet
    fill
    maxHeightRatio={0.88}
    onClose={onClose}
    subtitle={message ? leftBehind(message) : undefined}
    title="Forward message"
    visible={message !== null}
  >
    <ConversationSendList
      detail="preview"
      excludeId={sourceConversationId}
      failTitle="Not forwarded"
      key={message?.id ?? "none"}
      text={message ? forwardTextOf(message) : ""}
    />
  </BottomSheet>
);
