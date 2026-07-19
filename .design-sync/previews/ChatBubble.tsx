import { ChatBubble } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const elena = { id: "n1", username: "elena_inks", name: "Elena", image: avatar("#29a383", "E"), messageSourceType: "NOVELIST" };
const marcus = { id: "n2", username: "marcus_wren", name: "Marcus", image: avatar("#8d5e83", "M"), messageSourceType: "NOVELIST" };

const msg = (over: Record<string, unknown>) => ({
  id: "m1",
  senderId: "n2",
  conversationId: "c1",
  sender: marcus,
  type: "TEXT",
  image: "",
  message: "",
  isRead: true,
  reactions: [],
  attachments: [],
  createdAt: "2026-07-18T21:14:00Z",
  ...over,
});

const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, padding: 16, maxWidth: 560 };

export const Conversation = () => (
  <div style={col}>
    <ChatBubble
      currentUsername="elena_inks"
      message={msg({ id: "m1", message: "The storm broke just as Wren reached the lighthouse — she could barely hear herself think over the rain." })}
    />
    <ChatBubble
      currentUsername="elena_inks"
      message={msg({ id: "m2", senderId: "n1", sender: elena, message: "He was already there, of course. Coat soaked through, grinning like the thunder answered to him." })}
    />
  </div>
);

export const WithReactionsAndReply = () => (
  <div style={col}>
    <ChatBubble
      currentUsername="elena_inks"
      message={msg({
        id: "m3",
        message: "“You're late,” he said, without turning around.",
        reactions: [
          { messageId: "m3", sender: elena, reaction: "heart" },
          { messageId: "m3", sender: marcus, reaction: "laugh" },
        ],
      })}
    />
    <ChatBubble
      currentUsername="elena_inks"
      message={msg({
        id: "m4",
        senderId: "n1",
        sender: elena,
        message: "Storm season waits for no one.",
        repliedTo: { type: "MESSAGE", message: msg({ id: "m3", message: "“You're late,” he said, without turning around." }) },
      })}
    />
  </div>
);

export const FailedMessage = () => (
  <div style={col}>
    <ChatBubble
      currentUsername="elena_inks"
      failed
      message={msg({ id: "m5", senderId: "n1", sender: elena, message: "This one never made it out of the harbor." })}
    />
  </div>
);
