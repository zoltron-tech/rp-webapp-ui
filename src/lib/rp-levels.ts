export interface Perk {
  icon: string;
  label: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpStart: number;
  xpEnd: number | null;
  xpRange: string;
  perks: Perk[];
  comingSoon?: boolean;
}

export const NOVELIST_LEVELS = [
  { level: 1,  name: "Blank Page" },
  { level: 2,  name: "Scribbler" },
  { level: 3,  name: "Wordsmith" },
  { level: 4,  name: "Storyteller" },
  { level: 5,  name: "Inkslinger" },
  { level: 6,  name: "Narrator" },
  { level: 7,  name: "Prose Weaver" },
  { level: 8,  name: "Chapter Master" },
  { level: 9,  name: "Plot Architect" },
  { level: 10, name: "Seasoned Author" },
  { level: 11, name: "Manuscript Keeper" },
  { level: 12, name: "Quill Bearer" },
  { level: 13, name: "Lore Crafter" },
  { level: 14, name: "Voice of Many" },
  { level: 15, name: "Bound in Print" },
  { level: 16, name: "Celebrated Scribe" },
  { level: 17, name: "Grand Narrator" },
  { level: 18, name: "Myth Maker" },
  { level: 19, name: "Literary Sage" },
  { level: 20, name: "Immortal Pen" },
] as const;

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: NOVELIST_LEVELS[0].name,
    xpStart: 0,
    xpEnd: 499,
    xpRange: "0 – 499 XP",
    perks: [
      { icon: "✍️", label: "Post OOC prompts to the community" },
      { icon: "👤", label: "Create and manage your characters" },
      { icon: "🤝", label: "Send & accept friend requests" },
      { icon: "💬", label: "Comment and reply on prompts" },
    ],
  },
  {
    level: 2,
    title: NOVELIST_LEVELS[1].name,
    xpStart: 500,
    xpEnd: 999,
    xpRange: "500 – 999 XP",
    perks: [
      { icon: "🎞️", label: "Upload animated GIF avatars" },
      {
        icon: "🌟",
        label: "Pick GIFs & stickers from the NW library as your avatar",
      },
    ],
  },
  {
    level: 3,
    title: NOVELIST_LEVELS[2].name,
    xpStart: 1000,
    xpEnd: 1999,
    xpRange: "1,000 – 1,999 XP",
    perks: [
      { icon: "🎨", label: "2 new profile themes unlocked" },
      { icon: "📝", label: "Colorful note backgrounds — 39 shades to choose from" },
      { icon: "✨", label: "Emoji decoration on your pinned note" },
    ],
  },
  {
    level: 4,
    title: NOVELIST_LEVELS[3].name,
    xpStart: 2000,
    xpEnd: 3999,
    xpRange: "2,000 – 3,999 XP",
    perks: [
      { icon: "🎭", label: "2 more exclusive profile themes unlocked" },
      { icon: "🖼️", label: "Upload a static image profile banner" },
      { icon: "🎞️", label: "Upload an animated GIF profile banner" },
    ],
  },
  {
    level: 5,
    title: NOVELIST_LEVELS[4].name,
    xpStart: 4000,
    xpEnd: 7999,
    xpRange: "4,000 – 7,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 6,
    title: NOVELIST_LEVELS[5].name,
    xpStart: 8000,
    xpEnd: 15999,
    xpRange: "8,000 – 15,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 7,
    title: NOVELIST_LEVELS[6].name,
    xpStart: 16000,
    xpEnd: 31999,
    xpRange: "16,000 – 31,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 8,
    title: NOVELIST_LEVELS[7].name,
    xpStart: 32000,
    xpEnd: 63999,
    xpRange: "32,000 – 63,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 9,
    title: NOVELIST_LEVELS[8].name,
    xpStart: 64000,
    xpEnd: 127999,
    xpRange: "64,000 – 127,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 10,
    title: NOVELIST_LEVELS[9].name,
    xpStart: 128000,
    xpEnd: null,
    xpRange: "128,000+ XP",
    perks: [],
    comingSoon: true,
  },
];

export const BEYOND_LEVELS = [11, 12, 13];
