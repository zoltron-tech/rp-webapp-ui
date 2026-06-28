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

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: "The First Page",
    xpStart: 0,
    xpEnd: 99,
    xpRange: "0 – 99 XP",
    perks: [
      { icon: "✍️", label: "Post OOC prompts to the community" },
      { icon: "👤", label: "Create and manage your characters" },
      { icon: "🤝", label: "Send & accept friend requests" },
      { icon: "💬", label: "Comment and reply on prompts" },
    ],
  },
  {
    level: 2,
    title: "Rising Scribe",
    xpStart: 100,
    xpEnd: 299,
    xpRange: "100 – 299 XP",
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
    title: "Weaver of Tales",
    xpStart: 300,
    xpEnd: 599,
    xpRange: "300 – 599 XP",
    perks: [
      { icon: "🎨", label: "2 new profile themes unlocked" },
      { icon: "📝", label: "Colorful note backgrounds — 39 shades to choose from" },
      { icon: "✨", label: "Emoji decoration on your pinned note" },
    ],
  },
  {
    level: 4,
    title: "Seasoned Author",
    xpStart: 600,
    xpEnd: 999,
    xpRange: "600 – 999 XP",
    perks: [
      { icon: "🎭", label: "2 more exclusive profile themes unlocked" },
      { icon: "🖼️", label: "Upload a static image profile banner" },
      { icon: "🎞️", label: "Upload an animated GIF profile banner" },
    ],
  },
  {
    level: 5,
    title: "Lorekeeper",
    xpStart: 1000,
    xpEnd: 1499,
    xpRange: "1,000 – 1,499 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 6,
    title: "Chronicle Keeper",
    xpStart: 1500,
    xpEnd: 2499,
    xpRange: "1,500 – 2,499 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 7,
    title: "Mythweaver",
    xpStart: 2500,
    xpEnd: 3999,
    xpRange: "2,500 – 3,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 8,
    title: "Arcane Narrator",
    xpStart: 4000,
    xpEnd: 5999,
    xpRange: "4,000 – 5,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 9,
    title: "Grand Storyteller",
    xpStart: 6000,
    xpEnd: 9999,
    xpRange: "6,000 – 9,999 XP",
    perks: [],
    comingSoon: true,
  },
  {
    level: 10,
    title: "Legendary Novelist",
    xpStart: 10000,
    xpEnd: null,
    xpRange: "10,000+ XP",
    perks: [],
    comingSoon: true,
  },
];

export const BEYOND_LEVELS = [11, 12, 13];
