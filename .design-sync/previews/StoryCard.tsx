import { StoryCard } from "rp-webapp";

// Plain gradient swatch — no baked-in text. The real card title comes from
// storyBoard.name via S.CardTitle; embedding text in the cover image itself
// gets cropped by the component's own image positioning and reads as a bug.
const cover = (bg: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="400" height="260" fill="url(#g)"/></svg>`,
  )}`;

const avatar = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-family="sans-serif" font-size="34" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const members = [
  { username: "elena_inks", storyBoardId: "sb-1", image: avatar("#1d3a31", "E"), isAdmin: true },
  { username: "marcus_wren", storyBoardId: "sb-1", image: avatar("#8d5e83", "M"), isAdmin: false },
  { username: "mira_of_thorns", storyBoardId: "sb-1", image: avatar("#5b3a6e", "M"), isAdmin: false },
];

const storyBoard = {
  id: "sb-1",
  name: "The Lighthouse Chronicles",
  image: cover("#1d3a31"),
  avatar: null,
  members,
  events: [
    { id: "e1", storyBoardId: "sb-1", ordinal: 1, name: "The Storm", description: "" },
    { id: "e2", storyBoardId: "sb-1", ordinal: 2, name: "The Arrival", description: "" },
  ],
  isPublic: true,
  tags: [],
  fandom: { id: "f1", name: "Original Fiction", description: "", color: "#29a383" },
  genres: [],
};

export const Published = () => (
  <div style={{ padding: 16, maxWidth: 420 }}>
    <StoryCard storyBoard={storyBoard as never} />
  </div>
);

export const PrivateDraft = () => (
  <div style={{ padding: 16, maxWidth: 420 }}>
    <StoryCard storyBoard={{ ...storyBoard, id: "sb-2", name: "Untitled Draft", isPublic: false } as never} />
  </div>
);
