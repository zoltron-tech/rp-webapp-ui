import type { NovelistWorldNotification } from "@nw/types";
import type { IconType } from "react-icons";
import {
  BsAt,
  BsBellFill,
  BsBookFill,
  BsBookmarkFill,
  BsChatLeftTextFill,
  BsHeartFill,
  BsLink45Deg,
  BsPersonCheckFill,
  BsPersonPlusFill,
  BsReplyFill,
  BsStars,
} from "react-icons/bs";

/**
 * What a notification is, for the eye: a glyph, a colour and a few words of
 * colour commentary.
 *
 * The sentence itself ("and 2 others liked your prompt") is the server's and
 * is shown as it comes. What is added here is only dressing — the small badge
 * on the avatar and the kicker above the sentence — so a type this client has
 * never heard of still reads correctly, under the plain bell.
 */

export type NotificationKind =
  | "like"
  | "comment"
  | "reply"
  | "mention"
  | "friendRequest"
  | "friendAccepted"
  | "museRequest"
  | "museUpdate"
  | "story"
  | "chapter"
  | "other";

/** The filter chips on the notifications page. */
export type NotificationFilter =
  | "all"
  | "likes"
  | "talk"
  | "mentions"
  | "people"
  | "stories";

type KindMeta = {
  icon: IconType;
  /**
   * A fixed hue rather than a theme token: the palettes each define only
   * their own accent scale, and a like should be red in all of them. It is
   * only ever a small solid badge under a white glyph, or mixed into the
   * theme's own text and background colours, so it holds on every theme.
   */
  hue: string;
  filter: NotificationFilter;
  /** One is picked per notification, and stays picked. */
  kickers: readonly string[];
};

const KINDS: Record<NotificationKind, KindMeta> = {
  chapter: {
    filter: "stories",
    hue: "#5b6ee1",
    icon: BsBookmarkFill,
    kickers: ["Fresh chapter", "The page turns", "Hot off the quill"],
  },
  comment: {
    filter: "talk",
    hue: "#2f8fd6",
    icon: BsChatLeftTextFill,
    kickers: ["They had thoughts", "Ink on your page", "Notes in the margin"],
  },
  friendAccepted: {
    filter: "people",
    hue: "#2f9e6b",
    icon: BsPersonCheckFill,
    kickers: ["New ally unlocked", "The party grows", "Friendship: canon"],
  },
  friendRequest: {
    filter: "people",
    hue: "#e0912b",
    icon: BsPersonPlusFill,
    kickers: ["A knock at the door", "Someone new at the table"],
  },
  like: {
    filter: "likes",
    hue: "#e5484d",
    icon: BsHeartFill,
    kickers: [
      "Heart received",
      "Somebody swooned",
      "A little love",
      "Noted, with feeling",
    ],
  },
  mention: {
    filter: "mentions",
    hue: "#8e4ec6",
    icon: BsAt,
    kickers: ["You were summoned", "Your name came up", "Ears burning?"],
  },
  museRequest: {
    filter: "people",
    hue: "#d6409f",
    icon: BsLink45Deg,
    kickers: ["Muses want to meet", "A crossover is proposed"],
  },
  museUpdate: {
    filter: "people",
    hue: "#d6409f",
    icon: BsStars,
    kickers: ["Muse news", "Word from the muses"],
  },
  other: {
    filter: "all",
    hue: "#7c7f8a",
    icon: BsBellFill,
    kickers: ["For you"],
  },
  reply: {
    filter: "talk",
    hue: "#12a594",
    icon: BsReplyFill,
    kickers: ["The plot thickens", "The thread grows", "And then they said"],
  },
  story: {
    filter: "stories",
    hue: "#e2733c",
    icon: BsBookFill,
    kickers: ["Story stirring", "News from the storyboard"],
  },
};

export const kindOf = (
  notification: NovelistWorldNotification,
): NotificationKind => {
  switch (notification.type) {
    case "REACTION":
      return "like";
    case "PROMPT_COMMENT":
      return "comment";
    case "PROMPT_COMMENT_REPLY":
    case "REPLY":
      return "reply";
    case "MENTION":
      return "mention";
    case "FRIEND_REQUEST":
      return "friendRequest";
    case "FRIEND_REQUEST_ACCEPTED":
      return "friendAccepted";
    case "MUSE_CONNECTION_REQUEST":
      return "museRequest";
    case "MUSE_CONNECTION_UPDATE":
      return "museUpdate";
    case "STORYBOARD_UPDATE":
      return "story";
    case "STORYBOARD_EVENT_UPDATE":
      return "chapter";
    default:
      return "other";
  }
};

export const kindMeta = (notification: NovelistWorldNotification): KindMeta =>
  KINDS[kindOf(notification)];

/** A small stable number from an id, so a row keeps its kicker between renders. */
const hash = (value: string): number => {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  }
  return result;
};

/**
 * The few words above the sentence. A crowd gets its own line: the count is
 * the story once enough people have piled in.
 */
export const kickerFor = (notification: NovelistWorldNotification): string => {
  const kind = kindOf(notification);
  const crowd = notification.actorCount ?? 1;

  if (kind === "like") {
    if (crowd >= 10) return "Crowd favourite";
    if (crowd >= 5) return "On a roll";
    if (crowd >= 2) return "Hearts incoming";
  }
  if (kind === "reply" && crowd >= 3) return "Quite the conversation";

  const { kickers } = KINDS[kind];
  return kickers[hash(notification.id) % kickers.length];
};

/** A request is answered in the row, and waits at the top until it is. */
export const isRequest = (notification: NovelistWorldNotification): boolean =>
  notification.type === "FRIEND_REQUEST" ||
  notification.type === "MUSE_CONNECTION_REQUEST";

export const FILTERS: readonly { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "likes", label: "Likes" },
  { id: "talk", label: "Comments" },
  { id: "mentions", label: "Mentions" },
  { id: "people", label: "People" },
  { id: "stories", label: "Stories" },
];

export const matchesFilter = (
  notification: NovelistWorldNotification,
  filter: NotificationFilter,
): boolean => filter === "all" || kindMeta(notification).filter === filter;

type Section = { title: string; items: NovelistWorldNotification[] };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The list in reading order: what needs an answer, then by how long ago.
 * Sections with nothing in them are left out.
 */
export const sectionsOf = (
  notifications: NovelistWorldNotification[],
  now = Date.now(),
): Section[] => {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const sections: Section[] = [
    { items: [], title: "Waiting on you" },
    { items: [], title: "Fresh ink" },
    { items: [], title: "Earlier this week" },
    { items: [], title: "From the archives" },
  ];

  for (const notification of notifications) {
    // Seconds from some rows, milliseconds from others.
    const raw = notification.date ?? 0;
    const at = raw < 1e12 ? raw * 1000 : raw;

    if (isRequest(notification)) sections[0].items.push(notification);
    else if (at >= startOfToday) sections[1].items.push(notification);
    else if (at >= startOfToday - 6 * DAY_MS)
      sections[2].items.push(notification);
    else sections[3].items.push(notification);
  }

  return sections.filter((section) => section.items.length > 0);
};

/** The line under the page title. */
export const summaryFor = (unread: number, total: number): string => {
  if (total === 0) return "Nothing yet. The page is still blank.";
  if (unread === 0) return "All caught up. The quill rests.";
  if (unread === 1) return "One new thing. Go on, have a look.";
  if (unread < 5) return `${unread} new. The plot thickens.`;
  return `${unread} new. You are the talk of the town.`;
};
