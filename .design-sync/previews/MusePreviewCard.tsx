import { MusePreviewCard } from "rp-webapp";

const portrait = (bg: string, fg: string, name: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="${bg}"/><circle cx="200" cy="220" r="95" fill="${fg}"/><text x="200" y="540" font-family="sans-serif" font-size="32" fill="#ffffffcc" text-anchor="middle">${name}</text></svg>`,
  )}`;

const base = {
  note: "",
  story: "",
  nicknames: [],
  extraAttributes: null,
  connections: [],
  tags: [],
  privacy: "PUBLIC",
  cardBackground: null,
  totalPoints: 0,
  level: 1,
};

const kaelen = {
  ...base,
  id: "mu-kaelen",
  firstName: "Kaelen",
  lastName: "Duskbringer",
  fandom: {
    id: "fd-bg3",
    name: "Baldur's Gate 3",
    description: "The Sword Coast",
    color: "#a3542f",
  },
  pennedBy: { id: "nv-rowan", username: "quill_and_ash" },
  accent: "#d1803c",
  useAccent: true,
  image: portrait("#33241a", "#d1803c55", "Kaelen"),
  verseNumber: 1,
};

const kaelenVerse2 = {
  ...kaelen,
  id: "mu-kaelen-v2",
  verseNumber: 2,
  originalVerseId: "mu-kaelen",
  fandom: {
    id: "fd-modern",
    name: "Modern AU",
    description: "",
    color: "#4f79c9",
  },
  accent: "#4f79c9",
  image: portrait("#1c2637", "#4f79c955", "Kaelen"),
};

const kaelenVerse3 = {
  ...kaelen,
  id: "mu-kaelen-v3",
  verseNumber: 3,
  originalVerseId: "mu-kaelen",
  fandom: {
    id: "fd-horror",
    name: "Gothic Horror AU",
    description: "",
    color: "#8d2f45",
  },
  accent: "#8d2f45",
  image: portrait("#241019", "#8d2f4555", "Kaelen"),
};

const isolde = {
  ...base,
  id: "mu-isolde",
  firstName: "Isolde",
  lastName: "Marchmain",
  fandom: {
    id: "FANDOMLESS",
    name: "Fandomless",
    description: "",
    color: "#888888",
  },
  pennedBy: { id: "nv-elena", username: "elena_inks" },
  accent: null,
  useAccent: false,
  image: portrait("#22303a", "#5aa7a055", "Isolde"),
};

const nyra = {
  ...base,
  id: "mu-nyra",
  firstName: "Nyra",
  lastName: "of the Ninth Gate",
  fandom: {
    id: "fd-genshin",
    name: "Genshin Impact",
    description: "Teyvat",
    color: "#7c5cff",
  },
  pennedBy: { id: "nv-mira", username: "mira_of_thorns" },
  accent: "#7c5cff",
  useAccent: true,
  image: portrait("#241f38", "#7c5cff55", "Nyra"),
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 16,
  padding: 24,
  flexWrap: "wrap",
};

export const Single = () => (
  <div style={row}>
    <MusePreviewCard muse={kaelen as never} />
  </div>
);

export const VerseFamily = () => (
  <div style={row}>
    <MusePreviewCard
      muse={kaelen as never}
      verses={[kaelenVerse2, kaelenVerse3] as never}
    />
  </div>
);

export const RosterRow = () => (
  <div style={row}>
    <MusePreviewCard muse={nyra as never} />
    <MusePreviewCard muse={isolde as never} />
    <MusePreviewCard muse={kaelen as never} />
  </div>
);
