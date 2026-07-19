import { MusesPill } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${bg}"/><text x="60" y="76" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const fandom = { id: "f1", name: "Original Fiction", description: "Original worlds", color: "#29a383" };

const muse = (id: string, firstName: string, bg: string) => ({
  id,
  firstName,
  lastName: "",
  fandom,
  pennedBy: null,
  note: "",
  story: "",
  accent: null,
  image: portrait(bg, firstName[0]),
  wallpaper: null,
  avatar: null,
  cardBackground: null,
  video: null,
  song: null,
  featuredSong: null,
  nicknames: [],
  extraAttributes: null,
  connections: [],
  tags: [],
  privacy: "PUBLIC",
  useAccent: false,
  useExtraImages: false,
  totalPoints: 0,
  level: 1,
  prev: null,
  next: null,
});

const friendOf = (username: string, bg: string) => ({
  id: `fr-${username}`,
  firstName: username,
  lastName: null,
  username,
  isVerified: false,
  image: portrait(bg, username[0].toUpperCase()),
  avatar: null,
  connection: "FRIEND",
  muses: [],
  mutualFriendCount: 1,
  totalPoints: 100,
  level: 2,
});

const novelist = {
  id: "n1",
  username: "elena_inks",
  firstName: "Elena",
  lastName: "Voss",
  image: portrait("#29a383", "E"),
  muses: [
    muse("mu-1", "Wren", "#1d3a31"),
    muse("mu-2", "Casimir", "#3a2340"),
    muse("mu-3", "Sable", "#2b4c66"),
    muse("mu-4", "Odette", "#a3562a"),
    muse("mu-5", "Idris", "#4a4e8f"),
  ],
  friends: [
    friendOf("marcus_wren", "#8d5e83"),
    friendOf("juniper_hale", "#a3562a"),
    friendOf("rhys_writes", "#4a4e8f"),
  ],
};

const wrap: React.CSSProperties = { padding: 16, maxWidth: 560 };

export const Muses = () => (
  <div style={wrap}>
    <MusesPill title="Muses" pillType="MUSES" novelist={novelist} expandable />
  </div>
);

export const Friends = () => (
  <div style={wrap}>
    <MusesPill title="Friends" pillType="FRIENDS" novelist={novelist} expandable />
  </div>
);

export const StoryboardMembers = () => (
  <div style={wrap}>
    <MusesPill
      title="Members"
      pillType="MEMBERS"
      storyboard={{
        id: "sb-1",
        title: "Harborlight Chronicles",
        members: [
          { username: "elena_inks", image: portrait("#29a383", "E") },
          { username: "marcus_wren", image: portrait("#8d5e83", "M") },
          { username: "juniper_hale", image: portrait("#a3562a", "J") },
        ],
      }}
      expandable
    />
  </div>
);
