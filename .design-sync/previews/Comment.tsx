import { Comment } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${bg}"/><text x="60" y="76" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const scene = (bg: string, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="${bg}"/><circle cx="520" cy="80" r="40" fill="#ffffff2b"/><rect x="40" y="250" width="360" height="22" rx="11" fill="#ffffff30"/><text x="40" y="330" font-family="sans-serif" font-size="26" fill="#ffffffd9">${label}</text></svg>`,
  )}`;

const museSource = {
  sourceId: "mu-1",
  name: "Wren Halloway",
  image: portrait("#1d3a31", "W"),
  sourceType: "MUSE",
  urlProp: "mu-1",
  avatar: null,
  useAccent: true,
  accent: "#29a383",
};

const novelistSource = {
  sourceId: "n1",
  name: "Elena Voss",
  image: portrait("#5b3a63", "E"),
  sourceType: "NOVELIST",
  urlProp: "elena_inks",
  avatar: null,
  useAccent: false,
  accent: null,
};

const comment = (over: Record<string, unknown>) => ({
  id: "cm-1",
  prompt: null,
  promptId: "p1",
  source: museSource,
  text: "Wren pulled the storm shutters closed one by one, counting the seconds between thunderclaps. Whoever was knocking at the lighthouse door had picked the worst possible night to visit.",
  media: "",
  replies: [],
  replyCount: 4,
  createdOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  reactions: 12,
  reacted: true,
  concluded: false,
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: 16,
  maxWidth: 560,
};

export const MuseThread = () => (
  <div style={col}>
    <Comment hide-separator comment={comment({})} />
  </div>
);

export const NovelistReplyWithMedia = () => (
  <div style={col}>
    <Comment
      hide-separator
      comment={comment({
        id: "cm-2",
        source: novelistSource,
        text: "OOC: sketched the harbor at dusk for our thread — feel free to use it as the chapter header!",
        media: scene("#2b4c66", "Harborlight at dusk"),
        replyCount: 1,
        reactions: 3,
        reacted: false,
        createdOn: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      })}
    />
  </div>
);

export const FreshNoReplies = () => (
  <div style={col}>
    <Comment
      hide-separator
      comment={comment({
        id: "cm-3",
        source: {
          ...museSource,
          sourceId: "mu-2",
          name: "Casimir Vale",
          image: portrait("#3a2340", "C"),
          urlProp: "mu-2",
          accent: "#8d5e83",
        },
        text: "Casimir spread the sea charts across the table. \"Every map lies a little,\" he said. \"The trick is knowing where.\"",
        replyCount: 0,
        reactions: 0,
        reacted: false,
        createdOn: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      })}
    />
  </div>
);
