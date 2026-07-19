import { NovelistPreviewCard } from "rp-webapp";

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="80" fill="${bg}"/><text x="80" y="102" font-family="sans-serif" font-size="66" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const museAvatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${bg}"/><text x="32" y="42" font-family="sans-serif" font-size="26" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const muses = [
  { id: "mu-1", firstName: "Wren", lastName: "Halloway", image: museAvatar("#1d3a31", "W") },
  { id: "mu-2", firstName: "Kaelen", lastName: "Duskbringer", image: museAvatar("#33241a", "K") },
];

// renderButton() shows "View Profile" whenever there's no logged-in
// novelist in the global store; DSProvider's fixed initial state keeps that
// slot empty, so both cells render the anonymous-visitor button — that's
// the true, honest render for every story authored outside a live session.
const base = {
  isVerified: true,
  connection: null,
  muses,
  mutualFriendCount: 3,
};

export const WithMuses = () => (
  <div style={{ padding: 16, maxWidth: 420 }}>
    <NovelistPreviewCard
      novelist={{
        ...base,
        id: "nv-mira",
        firstName: "Mira",
        lastName: "Castellan",
        username: "mira_of_thorns",
        image: avatar("#5b3a6e", "M"),
      } as never}
    />
  </div>
);

export const NoMusesYet = () => (
  <div style={{ padding: 16, maxWidth: 420 }}>
    <NovelistPreviewCard
      novelist={{
        ...base,
        id: "nv-rowan",
        firstName: "Rowan",
        lastName: "Ashcombe",
        username: "quill_and_ash",
        image: avatar("#a3542f", "R"),
        isVerified: false,
        muses: [],
        mutualFriendCount: 0,
      } as never}
    />
  </div>
);
