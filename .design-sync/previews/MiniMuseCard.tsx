import { MiniMuseCard } from "rp-webapp";

const portrait = (bg: string, fg: string, name: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520"><rect width="400" height="520" fill="${bg}"/><circle cx="200" cy="190" r="88" fill="${fg}"/><rect x="90" y="320" width="220" height="24" rx="12" fill="#ffffff2e"/><text x="200" y="470" font-family="sans-serif" font-size="30" fill="#fff" text-anchor="middle">${name}</text></svg>`,
  )}`;

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${bg}"/><text x="48" y="62" font-family="sans-serif" font-size="42" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const seraphine = {
  id: "mu-seraphine",
  firstName: "Seraphine",
  lastName: "Vale",
  fandom: {
    id: "fd-ff14",
    name: "Final Fantasy XIV",
    description: "Eorzea and beyond",
    color: "#4f79c9",
  },
  pennedBy: {
    id: "nv-mira",
    username: "mira_of_thorns",
    firstName: "Mira",
    lastName: "Castellan",
    image: avatar("#5b3a6e", "M"),
    palette: 2,
    muses: [],
    friends: [],
  },
  note: "Court mage in exile",
  story: "She traded her seat at the conclave for a smuggler's map.",
  accent: "#7c5cff",
  useAccent: true,
  image: portrait("#2b2440", "#7c5cff55", "Seraphine"),
  nicknames: ["The Hollow Flame", "Sera"],
  extraAttributes: {
    Age: "27",
    Occupation: "Court mage, disgraced",
    Alignment: "Chaotic good",
    Height: "5'7\"",
    Weapon: "Soulbound grimoire",
    Fear: "Still water",
  },
  connections: [],
  tags: [],
  privacy: "PUBLIC",
  totalPoints: 1240,
  level: 9,
};

const wren = {
  id: "mu-wren",
  firstName: "Wren",
  lastName: "",
  fandom: {
    id: "FANDOMLESS",
    name: "Fandomless",
    description: "",
    color: "#888888",
  },
  pennedBy: {
    id: "nv-elena",
    username: "elena_inks",
    firstName: "Elena",
    lastName: "Voss",
    image: avatar("#1d3a31", "E"),
    palette: 0,
    muses: [],
    friends: [],
  },
  note: "Lighthouse keeper of the northern coast",
  story: "She keeps the lamp burning through storm season.",
  accent: null,
  useAccent: false,
  image: portrait("#1d3a31", "#29a38355", "Wren"),
  nicknames: [],
  extraAttributes: null,
  connections: [],
  tags: [],
  privacy: "PUBLIC",
  totalPoints: 320,
  level: 4,
};

// MiniMuseCard renders a position:fixed full-viewport overlay. The card
// harness story root has transform:translateZ(0), so the overlay sizes
// against the story root, not the browser viewport — an in-flow spacer
// gives it area to fill (same technique as the Modal preview).
const stage: React.CSSProperties = { height: 640 };

export const ExportModalFullDetails = () => (
  <>
    <div style={stage} />
    <MiniMuseCard muse={seraphine as never} onClose={() => {}} />
  </>
);

export const ExportModalMinimalMuse = () => (
  <>
    <div style={stage} />
    <MiniMuseCard muse={wren as never} onClose={() => {}} />
  </>
);
