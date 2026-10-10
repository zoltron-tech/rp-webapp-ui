import {
  getAttachmentKind,
  getFileExtension,
  isDirectImageUrl,
} from "@nw/chat";
import type { Conversation, ConversationParticipant } from "@nw/types";
import { toLocalDate } from "@nw/utils";

/**
 * What a conversation is, for the eye: a kind and a colour. Shared by the web
 * inbox and the phone's, and built on the same idea as `notifications/kinds`
 * so the two lists read as one family.
 *
 * A notification's kind is what somebody did. A conversation's kind is where
 * the thread stands: what arrived last, or — when the last word was yours —
 * whether it has been read. That is the question an inbox is opened with, so
 * it is the one the glyph on the face answers. (A notification also gets a
 * few words above its sentence; a conversation does not — its name and its
 * last message are already two lines of words.)
 */

export type InboxKind =
  | "word"
  | "gif"
  | "picture"
  | "clip"
  | "voice"
  | "link"
  | "bundle"
  | "sent"
  | "seen"
  | "blank";

/** The filter chips above the list. */
export type InboxFilter = "all" | "unread" | "groups";

/** Fixed, as a notification's is: see `notifications/kinds`. */
const HUES: Record<InboxKind, string> = {
  blank: "#e0912b",
  bundle: "#e0912b",
  clip: "#e2733c",
  gif: "#d6409f",
  link: "#5b6ee1",
  picture: "#8e4ec6",
  seen: "#2f9e6b",
  sent: "#7c7f8a",
  voice: "#12a594",
  word: "#2f8fd6",
};

/** The URL the last message *is*: its one attachment, or a body that is only a link. */
const lastMessageUrl = (
  conversation: Conversation,
): { url: string; attached: boolean } | null => {
  const message = conversation.lastMessage;
  if (!message) return null;

  const attachment = message.attachments?.[0]?.url;
  if (attachment) return { attached: true, url: attachment };

  // The GIF/sticker case: the CDN URL *is* the message body.
  const body = message.message?.trim() ?? "";
  if (/^https?:\/\/\S+$/i.test(body)) return { attached: false, url: body };

  return null;
};

export const isLastMessageMine = (
  conversation: Conversation,
  myUsername: string | null | undefined,
): boolean =>
  Boolean(myUsername) &&
  conversation.lastMessage?.sender?.username === myUsername;

export const inboxKind = (
  conversation: Conversation,
  myUsername: string | null | undefined,
): InboxKind => {
  const message = conversation.lastMessage;
  if (!message) return "blank";

  // Your own last word is about delivery, whatever it carried.
  if (isLastMessageMine(conversation, myUsername)) {
    return message.isRead ? "seen" : "sent";
  }

  if ((message.attachments?.length ?? 0) > 1) return "bundle";

  const media = lastMessageUrl(conversation);
  if (media) {
    if (getFileExtension(media.url) === "gif") return "gif";
    if (isDirectImageUrl(media.url)) return "picture";
    const kind = getAttachmentKind(media.url);
    if (kind === "video") return "clip";
    if (kind === "audio") return "voice";
    return media.attached ? "bundle" : "link";
  }

  if (message.image) return "picture";
  return "word";
};

/** The kind's colour, a hex. */
export const inboxHue = (kind: InboxKind): string => HUES[kind];

/**
 * The picture at the end of the row, when the last message was one.
 *
 * A conversation whose last message was a picture is unrecognisable from the
 * words "Sent a GIF"; the image itself is the memory.
 */
export const inboxThumbnail = (conversation: Conversation): string | null => {
  const media = lastMessageUrl(conversation);
  return media && isDirectImageUrl(media.url) ? media.url : null;
};

/**
 * Who spoke last, in front of a quoted preview.
 *
 * Only for quoted text (`describes` false): "You: Sent a GIF" reads as a
 * sentence someone typed. Skipped in a direct conversation when the other
 * person spoke, because their name is on the line above.
 */
export const inboxSpeaker = (
  conversation: Conversation,
  myUsername: string | null | undefined,
  describes: boolean,
): string => {
  if (describes) return "";
  if (isLastMessageMine(conversation, myUsername)) return "You: ";
  const name = conversation.lastMessage?.sender?.name;
  return conversation.isGroup && name ? `${name.split(" ")[0]}: ` : "";
};

/**
 * Up to two faces for a group that has no picture of its own: the people in it
 * who are not you, overlapped the way a notification's crowd is.
 */
export const inboxGroupFaces = (
  conversation: Conversation,
  myUsername: string | null | undefined,
): ConversationParticipant[] =>
  (conversation.members ?? [])
    .filter((member) => member.userName && member.userName !== myUsername)
    .slice(0, 2);

export const INBOX_FILTERS: readonly { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
];

export const matchesInboxFilter = (
  conversation: Conversation,
  filter: InboxFilter,
  unread: boolean,
): boolean => {
  if (filter === "unread") return unread;
  if (filter === "groups") return conversation.isGroup;
  return true;
};

export type InboxSection = {
  title: string;
  items: Conversation[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a conversation last moved, in local milliseconds; 0 when unknown. */
const lastActivity = (conversation: Conversation): number => {
  const date = toLocalDate(
    conversation.lastMessage?.createdAt ||
      conversation.modifiedAt ||
      conversation.createdAt,
  );
  return date?.isValid() ? date.valueOf() : 0;
};

/**
 * The list in reading order: what is waiting on you, then by how long ago.
 * The titles are the notification list's own. Sections with nothing in them
 * are left out.
 */
export const inboxSections = (
  conversations: Conversation[],
  isUnread: (conversation: Conversation) => boolean,
  now = Date.now(),
): InboxSection[] => {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const sections: InboxSection[] = [
    { items: [], title: "Waiting on you" },
    { items: [], title: "Fresh ink" },
    { items: [], title: "Earlier this week" },
    { items: [], title: "From the archives" },
  ];

  for (const conversation of conversations) {
    const at = lastActivity(conversation);

    if (isUnread(conversation)) sections[0].items.push(conversation);
    else if (at >= startOfToday) sections[1].items.push(conversation);
    else if (at >= startOfToday - 6 * DAY_MS)
      sections[2].items.push(conversation);
    else sections[3].items.push(conversation);
  }

  return sections.filter((section) => section.items.length > 0);
};

/** The line under the title. */
export const inboxSummary = (unread: number, total: number): string => {
  if (total === 0) return "No letters yet. Break the ice.";
  if (unread === 0) return "All answered. The inkwell rests.";
  if (unread === 1) return "One thread is waiting on you.";
  if (unread < 5) return `${unread} threads waiting. The plot thickens.`;
  return `${unread} threads waiting. You are in demand.`;
};
