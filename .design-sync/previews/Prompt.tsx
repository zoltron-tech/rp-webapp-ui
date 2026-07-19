import { Prompt } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${bg}"/><text x="60" y="76" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
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

const prompt = (over: Record<string, unknown>) => ({
  id: "p1",
  source: museSource,
  text: "The lighthouse lamp went dark at midnight for the first time in forty years.\nWren stood at the base of the spiral stairs, lantern in hand, listening to something move on the gallery above.\n\nOpen thread — who comes up the cliff road tonight?",
  media: "",
  song: "",
  featuredSong: null,
  privacy: "PUBLIC",
  createdOn: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  canInteract: true,
  reacted: false,
  commentCount: 0,
  reactions: 18,
  sharedWith: [],
  ...over,
});

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  maxWidth: 560,
};

export const MusePrompt = () => (
  <div style={col}>
    <Prompt prompt={prompt({})} />
  </div>
);

export const OOCFriendsOnly = () => (
  <div style={col}>
    <Prompt
      prompt={prompt({
        id: "p2",
        source: novelistSource,
        text: "OOC: I'm opening three slots for a slow-burn mystery arc set in the Harborlight verse. Multi-paragraph writers preferred — drop a starter below if your muse would take a night shift at the lighthouse.",
        privacy: "FRIENDS",
        reacted: true,
        reactions: 7,
        createdOn: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      })}
    />
  </div>
);

export const WithFeaturedSong = () => (
  <div style={col}>
    <Prompt
      prompt={prompt({
        id: "p3",
        source: {
          ...museSource,
          sourceId: "mu-2",
          name: "Casimir Vale",
          image: portrait("#3a2340", "C"),
          urlProp: "mu-2",
          accent: "#8d5e83",
        },
        text: "Casimir traced the coastline on the chart until his finger stopped at a cove that had no name. \"Then we name it ourselves,\" he said.",
        featuredSong: {
          source: "LIBRARY",
          title: "Salt & Starlight",
          artist: "The Quiet Harbor",
          imageUrl: null,
          // Minimal silent WAV — PromptSongPlayer only renders when the song is playable.
          url: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
          spotifyTrackId: null,
          externalUrl: null,
          songId: "s1",
        },
        reactions: 31,
        createdOn: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      })}
    />
  </div>
);
