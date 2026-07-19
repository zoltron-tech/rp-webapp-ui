import { ConversationCard } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const member = (over: Record<string, unknown>) => ({
  conversationId: "c1",
  novelistId: "n2",
  firstName: "Marcus",
  lastName: "Wren",
  userName: "marcus_wren",
  image: avatar("#8d5e83", "M"),
  avatar: null,
  role: "MEMBER",
  isVerified: false,
  joinedAt: "2026-05-02T10:00:00Z",
  ...over,
});

const sender = (over: Record<string, unknown>) => ({
  id: "n2",
  username: "marcus_wren",
  name: "Marcus",
  image: avatar("#8d5e83", "M"),
  messageSourceType: "NOVELIST",
  ...over,
});

const message = (over: Record<string, unknown>) => ({
  id: "m1",
  senderId: "n2",
  conversationId: "c1",
  sender: sender({}),
  type: "TEXT",
  image: "",
  message: "",
  isRead: true,
  reactions: [],
  attachments: [],
  createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  ...over,
});

const conversation = (over: Record<string, unknown>) => ({
  id: "c1",
  name: "",
  image: "",
  isGroup: false,
  members: [member({})],
  lastMessage: message({}),
  createdAt: "2026-06-30T18:00:00Z",
  modifiedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 16,
  maxWidth: 400,
};

export const UnreadDirect = () => (
  <div style={col}>
    <ConversationCard
      conversation={conversation({
        lastMessage: message({
          message: "The storm finally broke over the lighthouse — Wren, your move.",
          isRead: false,
        }),
      })}
    />
  </div>
);

export const ReadWithVerified = () => (
  <div style={col}>
    <ConversationCard
      conversation={conversation({
        id: "c2",
        members: [
          member({
            conversationId: "c2",
            novelistId: "n3",
            firstName: "Elena",
            lastName: "Voss",
            userName: "elena_inks",
            image: avatar("#29a383", "E"),
            isVerified: true,
          }),
        ],
        lastMessage: message({
          id: "m2",
          conversationId: "c2",
          senderId: "n3",
          sender: sender({ id: "n3", username: "elena_inks", name: "Elena", image: avatar("#29a383", "E") }),
          message: "Loved your last thread, want to plot something new?",
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })}
    />
  </div>
);

export const GroupChat = () => (
  <div style={col}>
    <ConversationCard
      conversation={conversation({
        id: "c3",
        name: "Harborlight Writers Room",
        image: avatar("#2b4c66", "H"),
        isGroup: true,
        members: [
          member({ conversationId: "c3" }),
          member({
            conversationId: "c3",
            novelistId: "n3",
            firstName: "Elena",
            lastName: "Voss",
            userName: "elena_inks",
            image: avatar("#29a383", "E"),
          }),
        ],
        lastMessage: message({
          id: "m3",
          conversationId: "c3",
          message: "Posting the chapter three outline tonight!",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }),
      })}
    />
  </div>
);

export const MediaAndEmpty = () => (
  <div style={col}>
    <ConversationCard
      conversation={conversation({
        id: "c4",
        members: [
          member({
            conversationId: "c4",
            novelistId: "n4",
            firstName: "Juniper",
            lastName: "Hale",
            userName: "juniper_hale",
            image: avatar("#a3562a", "J"),
          }),
        ],
        lastMessage: message({
          id: "m4",
          conversationId: "c4",
          senderId: "n4",
          sender: sender({ id: "n4", username: "juniper_hale", name: "Juniper", image: avatar("#a3562a", "J") }),
          message: "",
          image: avatar("#a3562a", "J"),
          isRead: false,
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        }),
      })}
    />
    <ConversationCard
      conversation={conversation({
        id: "c5",
        members: [
          member({
            conversationId: "c5",
            novelistId: "n5",
            firstName: "Rhys",
            lastName: "Calloway",
            userName: "rhys_writes",
            image: avatar("#4a4e8f", "R"),
          }),
        ],
        lastMessage: null,
        modifiedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      })}
    />
  </div>
);
