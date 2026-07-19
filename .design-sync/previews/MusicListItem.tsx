import { MusicListItem } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="36" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const elena = {
  id: "n1",
  firstName: "Elena",
  lastName: "Voss",
  username: "elena_inks",
  isVerified: true,
  image: avatar("#29a383", "E"),
  avatar: null,
  connection: null,
  muses: [],
  mutualFriendCount: 0,
  totalPoints: 1240,
  level: 6,
};

const song = (over: Record<string, unknown>) => ({
  id: "s1",
  novelist: elena,
  name: "Salt & Starlight",
  description: "Wren's theme — storm season at the lighthouse",
  url: "",
  tags: [
    { id: "t1", label: "ambient", color: "#29a383" },
    { id: "t2", label: "lighthouse verse", color: "#8d5e83" },
  ],
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
  maxWidth: 560,
};

export const WithTagsAndDescription = () => (
  <div style={col}>
    <MusicListItem song={song({})} />
  </div>
);

export const Minimal = () => (
  <div style={col}>
    <MusicListItem
      song={song({
        id: "s2",
        name: "Harbor Bells",
        description: null,
        tags: [],
        novelist: {
          ...elena,
          id: "n2",
          firstName: "Marcus",
          lastName: "Wren",
          username: "marcus_wren",
          image: avatar("#8d5e83", "M"),
        },
      })}
    />
  </div>
);

export const Playlist = () => (
  <div style={col}>
    <MusicListItem song={song({})} />
    <MusicListItem
      song={song({
        id: "s3",
        name: "The Cartographer's Waltz (Extended Night Voyage Edition)",
        description: "Casimir's theme for the unnamed cove arc",
        tags: [{ id: "t3", label: "orchestral", color: "#4a4e8f" }],
      })}
    />
  </div>
);
