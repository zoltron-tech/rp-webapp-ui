import { VideoCard } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${bg}"/><text x="60" y="76" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const fandom = { id: "f1", name: "Original Fiction", description: "Original worlds", color: "#29a383" };
const pennedBy = { id: "n1", username: "elena_inks", firstName: "Elena", lastName: "Voss", image: "", muses: [], friends: [] };

const muse = (over: Record<string, unknown>) => ({
  id: "mu-1",
  firstName: "Wren",
  lastName: "Halloway",
  fandom,
  pennedBy,
  note: "Lighthouse keeper of the northern coast",
  story: "She keeps the lamp burning through storm season.",
  accent: "#29a383",
  image: portrait("#1d3a31", "W"),
  wallpaper: null,
  avatar: null,
  cardBackground: null,
  video: "",
  song: null,
  featuredSong: null,
  nicknames: ["The Keeper"],
  extraAttributes: null,
  connections: [],
  tags: [],
  privacy: "PUBLIC",
  useAccent: true,
  useExtraImages: false,
  totalPoints: 320,
  level: 4,
  prev: null,
  next: null,
  ...over,
});

const row: React.CSSProperties = { display: "flex", gap: 16, padding: 16, flexWrap: "wrap" };

export const Single = () => (
  <div style={row}>
    <VideoCard muse={muse({})} />
  </div>
);

export const Gallery = () => (
  <div style={row}>
    <VideoCard muse={muse({})} />
    <VideoCard
      muse={muse({
        id: "mu-2",
        firstName: "Casimir",
        lastName: "Vale",
        image: portrait("#3a2340", "C"),
        accent: "#8d5e83",
        note: "Cartographer of unnamed coves",
      })}
    />
  </div>
);
