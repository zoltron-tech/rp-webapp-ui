import { FriendListItem } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const friend = (over: Record<string, unknown>) => ({
  id: "n1",
  firstName: "Elena",
  lastName: "Voss",
  username: "elena_inks",
  isVerified: true,
  image: avatar("#29a383", "E"),
  avatar: null,
  connection: "FRIEND",
  muses: [],
  mutualFriendCount: 4,
  totalPoints: 1240,
  level: 6,
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 16,
  maxWidth: 400,
};

export const Single = () => (
  <div style={col}>
    <FriendListItem friend={friend({})} />
  </div>
);

export const FriendsList = () => (
  <div style={col}>
    <FriendListItem friend={friend({})} />
    <FriendListItem
      friend={friend({
        id: "n2",
        firstName: "Marcus",
        lastName: "Wren",
        username: "marcus_wren",
        isVerified: false,
        image: avatar("#8d5e83", "M"),
        mutualFriendCount: 2,
        level: 3,
      })}
    />
  </div>
);
