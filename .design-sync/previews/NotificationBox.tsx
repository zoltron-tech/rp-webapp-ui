import { NotificationBox } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const nowSec = Math.floor(Date.now() / 1000);

const notification = (over: Record<string, unknown>) => ({
  id: "nt-1",
  source: {
    id: "n2",
    title: "Marcus Wren",
    sourceType: "NOVELIST",
    image: avatar("#8d5e83", "M"),
    avatar: null,
    urlProp: "marcus_wren",
  },
  target: { targetType: "PROMPT", urlProp: "p1" },
  type: "PROMPT_COMMENT",
  notificationText: "started a thread on your prompt",
  isRead: false,
  date: nowSec - 40 * 60,
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 16,
  maxWidth: 400,
};

export const FriendRequest = () => (
  <div style={col}>
    <NotificationBox
      notification={notification({
        id: "nt-2",
        type: "FRIEND_REQUEST",
        notificationText: "sent you a friend request",
        source: {
          id: "n4",
          title: "Juniper Hale",
          sourceType: "NOVELIST",
          image: avatar("#a3562a", "J"),
          avatar: null,
          urlProp: "juniper_hale",
        },
        target: { targetType: "NOVELIST", urlProp: "juniper_hale" },
        date: nowSec - 2 * 60 * 60,
      })}
    />
  </div>
);

export const MuseConnectionRequest = () => (
  <div style={col}>
    <NotificationBox
      notification={notification({
        id: "nt-3",
        type: "MUSE_CONNECTION_REQUEST",
        notificationText: "wants to connect Casimir Vale with your muse Wren Halloway",
        source: {
          id: "n3",
          title: "Elena Voss",
          sourceType: "NOVELIST",
          image: avatar("#29a383", "E"),
          avatar: null,
          urlProp: "elena_inks",
        },
        target: { targetType: "MUSE", urlProp: "mu-1" },
        date: nowSec - 26 * 60 * 60,
      })}
    />
  </div>
);

export const ThreadActivity = () => (
  <div style={col}>
    <NotificationBox notification={notification({})} />
    <NotificationBox
      notification={notification({
        id: "nt-4",
        type: "REACTION",
        notificationText: "loved your reply in “The lighthouse lamp went dark”",
        source: {
          id: "n3",
          title: "Elena Voss",
          sourceType: "NOVELIST",
          image: avatar("#29a383", "E"),
          avatar: null,
          urlProp: "elena_inks",
        },
        target: { targetType: "COMMENT", urlProp: "cm-1" },
        isRead: true,
        date: nowSec - 3 * 24 * 60 * 60,
      })}
    />
  </div>
);
