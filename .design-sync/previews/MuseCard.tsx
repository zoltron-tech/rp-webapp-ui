import { MuseCard } from "rp-webapp";

const portrait = (bg: string, name: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520"><rect width="400" height="520" fill="${bg}"/><circle cx="200" cy="200" r="90" fill="#ffffff33"/><rect x="80" y="330" width="240" height="26" rx="13" fill="#ffffff2e"/><text x="200" y="470" font-family="sans-serif" font-size="30" fill="#fff" text-anchor="middle">${name}</text></svg>`,
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
  accent: "jade",
  image: portrait("#1d3a31", "Wren"),
  wallpaper: null,
  avatar: null,
  cardBackground: null,
  video: null,
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

const grid: React.CSSProperties = { display: "flex", gap: 16, padding: 16, flexWrap: "wrap" };

export const Single = () => (
  <div style={grid}>
    <MuseCard muse={muse({})} />
  </div>
);

export const Pair = () => (
  <div style={grid}>
    <MuseCard muse={muse({})} />
    <MuseCard
      muse={muse({
        id: "mu-2",
        firstName: "Casimir",
        lastName: "Vale",
        image: portrait("#3a2340", "Casimir"),
        accent: "iris",
        nicknames: ["The Cartographer"],
        level: 7,
        totalPoints: 980,
      })}
    />
  </div>
);
