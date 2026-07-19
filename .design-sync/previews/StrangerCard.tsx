import { StrangerCard } from "rp-webapp";

const avatarSrc = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${bg}"/><text x="100" y="128" font-family="sans-serif" font-size="88" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const marcus = {
  id: "nv-marcus",
  username: "marcus_wren",
  firstName: "Marcus",
  lastName: "Wren",
  image: avatarSrc("#8d5e83", "M"),
  museCount: 3,
  friendsCount: 12,
  totalPoints: 640,
  level: 5,
  isVerified: false,
};

const row: React.CSSProperties = { display: "flex", gap: 16, padding: 16, flexWrap: "wrap" };

export const IncomingRequest = () => (
  <div style={row}>
    <StrangerCard novelist={marcus as never} isRequest />
  </div>
);

export const Suggestion = () => (
  <div style={row}>
    <StrangerCard novelist={marcus as never} />
  </div>
);
