import { MiniProfileCard } from "rp-webapp";

const avatarSrc = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="${bg}"/><text x="100" y="128" font-family="sans-serif" font-size="88" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const elena = {
  id: "nv-elena",
  username: "elena_inks",
  tier: { id: "t2", name: "Weaver", ordinal: 2, image: null },
  firstName: "Elena",
  lastName: "Voss",
  note: { text: "Lighthouse stories & slow-burn AUs", updatedAt: "2026-06-01T00:00:00Z" },
  image: avatarSrc("#1d3a31", "E"),
  avatar: null,
  banner: null,
  museCount: 6,
  palette: 0,
  muses: [],
  friendsCount: 42,
  friends: [],
  connection: null,
  createdAt: "2024-02-11T00:00:00Z",
  about: "Slow-burn fantasy writer, coffee-powered.",
  isOnboarded: true,
  isVerified: true,
  totalPoints: 2450,
  level: 11,
};

// MiniProfileCard renders a position:fixed full-viewport overlay. The card
// harness story root has transform:translateZ(0), so the overlay sizes
// against the story root, not the browser viewport — an in-flow spacer
// gives it area to fill (same technique as the Modal/MiniMuseCard previews).
const stage: React.CSSProperties = { height: 760 };

export const Default = () => (
  <>
    <div style={stage} />
    <MiniProfileCard novelist={elena as never} onClose={() => {}} />
  </>
);
