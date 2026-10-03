"use client";

import type { FC } from "react";

type EmojiProps = { size?: number };

// ── Heart ──────────────────────────────────────────────────────────────────
export const HeartEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reHtBody" x1="2" y1="5" x2="22" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#B81020" />
        <stop offset="35%"  stopColor="#F03050" />
        <stop offset="68%"  stopColor="#FF5070" />
        <stop offset="100%" stopColor="#8A0818" />
      </linearGradient>
      <radialGradient id="reHtGl" cx="33%" cy="22%" r="60%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.65" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Soft glow halo */}
    <ellipse cx="12" cy="13" rx="10.5" ry="9" fill="#FF1030" opacity="0.12" />
    {/* Body */}
    <path
      d="M12 21C10 19 2 14.5 2 9C2 6 4.5 4 7.5 4C9.5 4 11 5 12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 14 19 12 21Z"
      fill="url(#reHtBody)"
    />
    {/* Inner warmth highlight */}
    <path
      d="M12 18C10.5 16.5 5 13 5 9.5C5 7.5 6.5 6 8.5 6C10 6 11 6.8 12 8C13 6.8 14 6 15.5 6C17.5 6 19 7.5 19 9.5C19 13 13.5 16.5 12 18Z"
      fill="#FF8898" opacity="0.22"
    />
    {/* Gloss */}
    <path
      d="M12 21C10 19 2 14.5 2 9C2 6 4.5 4 7.5 4C9.5 4 11 5 12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 14 19 12 21Z"
      fill="url(#reHtGl)"
    />
    {/* Specular arc */}
    <path d="M5.5 6.5Q9 4.5 11.5 6.2" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.68" />
    {/* Outline */}
    <path
      d="M12 21C10 19 2 14.5 2 9C2 6 4.5 4 7.5 4C9.5 4 11 5 12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 14 19 12 21Z"
      stroke="#9A0818" strokeWidth="0.5" fill="none" opacity="0.38"
    />
  </svg>
);

// ── BrokenHeart ────────────────────────────────────────────────────────────
export const BrokenHeartEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reBHLt" x1="2" y1="5" x2="13" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#8A1020" />
        <stop offset="50%"  stopColor="#C02038" />
        <stop offset="100%" stopColor="#700818" />
      </linearGradient>
      <linearGradient id="reBHRt" x1="12" y1="5" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#B81828" />
        <stop offset="50%"  stopColor="#E02848" />
        <stop offset="100%" stopColor="#880A18" />
      </linearGradient>
      <radialGradient id="reBHGl" cx="32%" cy="24%" r="62%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Left half — shifted down-left */}
    <g transform="translate(-0.8 1)">
      <path
        d="M12 6.5C11 5 9.5 4 7.5 4C4.5 4 2 6 2 9C2 14.5 10.5 18.5 12 20.5L13.5 14.5L10.5 11Z"
        fill="url(#reBHLt)"
      />
      <path
        d="M12 6.5C11 5 9.5 4 7.5 4C4.5 4 2 6 2 9C2 14.5 10.5 18.5 12 20.5L13.5 14.5L10.5 11Z"
        fill="url(#reBHGl)"
      />
      <path d="M5.5 6Q8 4.5 10.5 5.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
      <path
        d="M12 6.5C11 5 9.5 4 7.5 4C4.5 4 2 6 2 9C2 14.5 10.5 18.5 12 20.5L13.5 14.5L10.5 11Z"
        stroke="#6A0810" strokeWidth="0.45" fill="none" opacity="0.40"
      />
    </g>
    {/* Right half — shifted up-right */}
    <g transform="translate(0.8 -1)">
      <path
        d="M12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 13.5 18.5 12 20.5L10.5 11L13.5 14.5Z"
        fill="url(#reBHRt)"
      />
      <path
        d="M12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 13.5 18.5 12 20.5L10.5 11L13.5 14.5Z"
        fill="url(#reBHGl)"
      />
      <path d="M13.5 5.5Q16.5 4 19 6" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55" />
      <path
        d="M12 6.5C13 5 14.5 4 16.5 4C19.5 4 22 6 22 9C22 14.5 13.5 18.5 12 20.5L10.5 11L13.5 14.5Z"
        stroke="#900818" strokeWidth="0.45" fill="none" opacity="0.40"
      />
    </g>
  </svg>
);

// ── Laugh (😂 tears of joy) ────────────────────────────────────────────────
export const LaughEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reLgFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reLgGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.60" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="reLgTear" x1="7.5" y1="9.5" x2="6.5" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#90D0FF" />
        <stop offset="100%" stopColor="#2880D8" />
      </linearGradient>
      <linearGradient id="reLgTearR" x1="16.5" y1="9.5" x2="17.5" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#90D0FF" />
        <stop offset="100%" stopColor="#2880D8" />
      </linearGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reLgFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reLgGl)" />
    {/* Cheeks */}
    <ellipse cx="6.2"  cy="14.5" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.28" />
    <ellipse cx="17.8" cy="14.5" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.28" />
    {/* Eyes — happy squinting crescents */}
    <path d="M6.8 10.8Q8.5 8.8 10.2 10.8" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    <path d="M13.8 10.8Q15.5 8.8 17.2 10.8" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    {/* Tears of joy */}
    <path d="M7.5 10.2Q6 12.5 6.5 14.8Q7.2 16.8 8.2 15.5Q8.8 14 7.5 12.2Z" fill="url(#reLgTear)" />
    <path d="M16.5 10.2Q18 12.5 17.5 14.8Q16.8 16.8 15.8 15.5Q15.2 14 16.5 12.2Z" fill="url(#reLgTearR)" />
    {/* Tear gloss */}
    <ellipse cx="7.0"  cy="12.4" rx="0.45" ry="0.85" fill="#C8E8FF" opacity="0.55" transform="rotate(-8 7 12.4)" />
    <ellipse cx="17.0" cy="12.4" rx="0.45" ry="0.85" fill="#C8E8FF" opacity="0.55" transform="rotate(8 17 12.4)" />
    {/* Wide open smile */}
    <path d="M7 15.5Q12 21 17 15.5" fill="#7A4000" />
    <path d="M7 15.5Q12 21 17 15.5" stroke="#5A3000" strokeWidth="0.45" fill="none" opacity="0.45" />
    {/* Teeth */}
    <path d="M7.5 15.8Q12 17.5 16.5 15.8Q16 14.8 12 14.8Q8 14.8 7.5 15.8Z" fill="#FFFDF2" />
    {/* Tongue */}
    <ellipse cx="12" cy="18.8" rx="2.8" ry="1.9" fill="#FF6888" />
    <ellipse cx="12" cy="18.2" rx="2.2" ry="0.8" fill="#FF90A8" opacity="0.52" />
    {/* Specular arc */}
    <path d="M5.5 5.8Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── Sad (😢) ───────────────────────────────────────────────────────────────
export const SadEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reSdFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFE98" />
        <stop offset="30%"  stopColor="#FFD018" />
        <stop offset="68%"  stopColor="#F09800" />
        <stop offset="100%" stopColor="#C07000" />
      </linearGradient>
      <radialGradient id="reSdGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="reSdTear" x1="15" y1="12.5" x2="14.5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#90C8FF" />
        <stop offset="100%" stopColor="#2880D8" />
      </linearGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reSdFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reSdGl)" />
    {/* Sad eyebrows — angled down toward center */}
    <path d="M6.5 8.5Q8.5 7 10 8.2" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M14 8.2Q15.5 7 17.5 8.5" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    {/* Sad eyes — downward dome shape */}
    <path d="M6.8 11.8Q8.5 13.5 10.2 11.8" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M13.8 11.8Q15.5 13.5 17.2 11.8" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    {/* Frown */}
    <path d="M8.5 17.2Q12 14 15.5 17.2" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    {/* Single tear — right cheek */}
    <path d="M15.2 12.5Q14 15 14.5 17.5Q15.5 18.5 16.2 17Q16.5 15.2 15.2 13Z" fill="url(#reSdTear)" />
    <ellipse cx="14.9" cy="14.2" rx="0.42" ry="0.85" fill="#C8E0FF" opacity="0.52" transform="rotate(-5 14.9 14.2)" />
    {/* Specular arc */}
    <path d="M5.5 5.8Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#C07000" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── Angry (😡) ─────────────────────────────────────────────────────────────
export const AngryEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reAgFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF5020" />
        <stop offset="35%"  stopColor="#E81010" />
        <stop offset="68%"  stopColor="#CC0808" />
        <stop offset="100%" stopColor="#880408" />
      </linearGradient>
      <radialGradient id="reAgGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reAgFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reAgGl)" />
    {/* Heavy furrowed brows — angled steeply inward */}
    <path d="M5.5 9.8Q8 7.2 10.8 9.2" stroke="#550208" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M13.2 9.2Q16 7.2 18.5 9.8" stroke="#550208" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Brow crease shadow */}
    <path d="M5.8 9.5Q8 7.5 10.5 9" stroke="#330108" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35" />
    <path d="M13.5 9Q16 7.5 18.2 9.5" stroke="#330108" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.35" />
    {/* Angry narrow eyes */}
    <ellipse cx="8.5"  cy="12.2" rx="2.5" ry="1.4" fill="#480208" />
    <ellipse cx="15.5" cy="12.2" rx="2.5" ry="1.4" fill="#480208" />
    {/* Eye iris (dark) */}
    <ellipse cx="8.5"  cy="11.8" rx="1.5" ry="0.9" fill="#280108" />
    <ellipse cx="15.5" cy="11.8" rx="1.5" ry="0.9" fill="#280108" />
    {/* Tight clenched frown */}
    <path d="M8 17.5Q12 15.2 16 17.5" stroke="#480208" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    {/* Clenched teeth hint */}
    <path d="M8.8 17.2Q12 15.8 15.2 17.2" stroke="#FFF8E0" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.48" />
    {/* Specular arc */}
    <path d="M5.5 5.5Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.50" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#880408" strokeWidth="0.45" fill="none" opacity="0.40" />
  </svg>
);

// ── Wow (😮) ───────────────────────────────────────────────────────────────
export const WowEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reWwFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reWwGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="reWwMouth" cx="45%" cy="28%" r="70%">
        <stop offset="0%"   stopColor="#3A1800" />
        <stop offset="100%" stopColor="#180800" />
      </radialGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reWwFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reWwGl)" />
    {/* Raised eyebrows */}
    <path d="M6 9Q8.5 7 11 8.5" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M13 8.5Q15.5 7 18 9" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    {/* Wide open eyes — full circles with irises */}
    <circle cx="8.5"  cy="12" r="2.5" fill="#3A2000" />
    <circle cx="15.5" cy="12" r="2.5" fill="#3A2000" />
    <circle cx="8.5"  cy="11.2" r="1.5" fill="white" />
    <circle cx="15.5" cy="11.2" r="1.5" fill="white" />
    <circle cx="8.5"  cy="11.8" r="1.0" fill="#1A0A00" />
    <circle cx="15.5" cy="11.8" r="1.0" fill="#1A0A00" />
    {/* Eye glints */}
    <circle cx="8.0"  cy="11.2" r="0.42" fill="white" opacity="0.85" />
    <circle cx="15.0" cy="11.2" r="0.42" fill="white" opacity="0.85" />
    {/* Open "O" mouth */}
    <ellipse cx="12" cy="17.5" rx="3.5" ry="3.0" fill="url(#reWwMouth)" />
    <ellipse cx="12" cy="16.2" rx="2.8" ry="1.0" fill="#180800" opacity="0.55" />
    {/* Mouth rim */}
    <ellipse cx="12" cy="17.5" rx="3.5" ry="3.0" stroke="#6A3E00" strokeWidth="0.5" fill="none" opacity="0.38" />
    {/* Specular arc */}
    <path d="M5.5 5.8Q10 3.5 15.5 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── MindBlown (🤯) ─────────────────────────────────────────────────────────
export const MindBlownEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reMBFace" x1="3" y1="5" x2="21" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reMBGl" cx="35%" cy="30%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="reMBExp" cx="42%" cy="38%" r="72%">
        <stop offset="0%"   stopColor="#FFFFB0" />
        <stop offset="40%"  stopColor="#FFD020" />
        <stop offset="75%"  stopColor="#FF8000" />
        <stop offset="100%" stopColor="#CC4000" />
      </radialGradient>
    </defs>
    {/* Explosion puffs (rendered behind face) */}
    <circle cx="12"   cy="3.5" r="3.2" fill="url(#reMBExp)" />
    <circle cx="7.5"  cy="4.8" r="2.3" fill="url(#reMBExp)" opacity="0.88" />
    <circle cx="16.5" cy="4.8" r="2.3" fill="url(#reMBExp)" opacity="0.88" />
    <circle cx="4.8"  cy="7.8" r="1.8" fill="url(#reMBExp)" opacity="0.72" />
    <circle cx="19.2" cy="7.8" r="1.8" fill="url(#reMBExp)" opacity="0.72" />
    {/* Explosion specular glints */}
    <circle cx="11.2" cy="2.8" r="0.9" fill="#FFFDE0" opacity="0.78" />
    <circle cx="7.0"  cy="4.2" r="0.6" fill="#FFFDE0" opacity="0.68" />
    <circle cx="17.0" cy="4.2" r="0.6" fill="#FFFDE0" opacity="0.68" />
    {/* Face (shifted down to make room for explosion) */}
    <circle cx="12" cy="14.5" r="9.2" fill="url(#reMBFace)" />
    <circle cx="12" cy="14.5" r="9.2" fill="url(#reMBGl)" />
    {/* Shocked raised eyebrows */}
    <path d="M5.5 10.5Q8 8.5 10.5 10" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M13.5 10Q16 8.5 18.5 10.5" stroke="#6A3E00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    {/* Wide shocked eyes */}
    <circle cx="8.5"  cy="14.5" r="2.3" fill="#3A2000" />
    <circle cx="15.5" cy="14.5" r="2.3" fill="#3A2000" />
    <circle cx="8.5"  cy="13.8" r="1.3" fill="white" />
    <circle cx="15.5" cy="13.8" r="1.3" fill="white" />
    <circle cx="8.5"  cy="14.3" r="0.88" fill="#1A0A00" />
    <circle cx="15.5" cy="14.3" r="0.88" fill="#1A0A00" />
    {/* Eye glints */}
    <circle cx="8.0"  cy="13.8" r="0.38" fill="white" opacity="0.85" />
    <circle cx="15.0" cy="13.8" r="0.38" fill="white" opacity="0.85" />
    {/* Open shocked mouth */}
    <ellipse cx="12" cy="20.2" rx="2.8" ry="2.0" fill="#3A1800" />
    <ellipse cx="12" cy="19.5" rx="2.2" ry="0.8" fill="#1A0800" opacity="0.55" />
    <ellipse cx="12" cy="20.2" rx="2.8" ry="2.0" stroke="#6A3E00" strokeWidth="0.45" fill="none" opacity="0.38" />
    {/* Specular arc on face */}
    <path d="M5.5 10Q9 8 14.5 9.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.58" />
    {/* Face outline */}
    <circle cx="12" cy="14.5" r="9.2" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── BitingLip (🫦) ─────────────────────────────────────────────────────────
export const BitingLipEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reBLLip" x1="2" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF5070" />
        <stop offset="45%"  stopColor="#E81840" />
        <stop offset="100%" stopColor="#A00820" />
      </linearGradient>
      <radialGradient id="reBLGl" cx="35%" cy="22%" r="65%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Full lip silhouette */}
    <path
      d="M2.5 11 C2.5 7.5 5.5 3.5 12 3.5 C18.5 3.5 21.5 7.5 21.5 11 Q21.5 22 12 22.5 Q2.5 22 2.5 11 Z"
      fill="url(#reBLLip)"
    />
    {/* White teeth */}
    <path d="M3.5 11 Q12 9 20.5 11 L20.5 15 Q12 15.5 3.5 15 Z" fill="#FDFAF0" />
    {/* Tooth dividers */}
    <line x1="8"  y1="10.8" x2="7.8"  y2="14.8" stroke="#D8D0A8" strokeWidth="0.55" opacity="0.58" />
    <line x1="12" y1="10"   x2="12"   y2="15"   stroke="#D8D0A8" strokeWidth="0.55" opacity="0.58" />
    <line x1="16" y1="10.8" x2="16.2" y2="14.8" stroke="#D8D0A8" strokeWidth="0.55" opacity="0.58" />
    {/* Upper lip (Cupid's bow) drawn on top */}
    <path
      d="M2.5 11 C2.5 7.5 5.5 3.5 12 3.5 C18.5 3.5 21.5 7.5 21.5 11 Q12 13 2.5 11 Z"
      fill="url(#reBLLip)"
    />
    {/* Upper lip gloss */}
    <path
      d="M2.5 11 C2.5 7.5 5.5 3.5 12 3.5 C18.5 3.5 21.5 7.5 21.5 11 Q12 13 2.5 11 Z"
      fill="url(#reBLGl)"
    />
    {/* Cupid's bow highlight */}
    <path d="M6 7.5 Q8.5 4.5 12 5 Q15.5 4.5 18 7.5" stroke="#FF9AB0" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.65" />
    {/* Lower lip gloss */}
    <path d="M7 18 Q12 21 17 18" stroke="#FF9AB0" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Outline */}
    <path
      d="M2.5 11 C2.5 7.5 5.5 3.5 12 3.5 C18.5 3.5 21.5 7.5 21.5 11 Q21.5 22 12 22.5 Q2.5 22 2.5 11 Z"
      stroke="#900018" strokeWidth="0.5" fill="none" opacity="0.45"
    />
  </svg>
);

// ── Kiss (😘) ──────────────────────────────────────────────────────────────
export const KissEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reKsFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reKsGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.60" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reKsFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reKsGl)" />
    {/* Left cheek blush */}
    <ellipse cx="6.5" cy="14.5" rx="2.5" ry="1.6" fill="#FF7878" opacity="0.28" />
    {/* Left eye — open */}
    <circle cx="8.5"  cy="10.5" r="2.2" fill="#3A2000" />
    <circle cx="8.5"  cy="9.8"  r="1.2" fill="white" />
    <circle cx="8.5"  cy="10.4" r="0.82" fill="#1A0A00" />
    <circle cx="8.0"  cy="9.8"  r="0.35" fill="white" opacity="0.85" />
    {/* Right eye — winking */}
    <path d="M13.5 11 Q15.5 12.8 17.5 11" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    {/* Kiss mouth — puckered */}
    <path d="M8.5 17.5 Q8.5 15 11 15 Q13.5 15 13.5 17.5 Q13.5 20 11 20.5 Q8.5 20 8.5 17.5 Z" fill="#C84020" />
    <path d="M8.5 17.5 Q11 16.8 13.5 17.5" stroke="#A83010" strokeWidth="0.55" strokeLinecap="round" fill="none" opacity="0.55" />
    <path d="M9.2 17 Q11 16.2 12.8 17" stroke="#FF9070" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Floating heart */}
    <path d="M17.5 15.5 C16 14 15.5 13 16.2 12.3 C16.8 11.8 17.2 12 17.5 12.6 C17.8 12 18.2 11.8 18.8 12.3 C19.5 13 19 14 17.5 15.5 Z" fill="#E01030" />
    <path d="M16.5 12.8 Q17.5 12.2 18.5 12.8" stroke="#FF7090" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Specular arc */}
    <path d="M5.5 5.8 Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── Ribbon (🎀) ────────────────────────────────────────────────────────────
export const RibbonEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reRbOuter" x1="1" y1="4" x2="23" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF4090" />
        <stop offset="50%"  stopColor="#E01060" />
        <stop offset="100%" stopColor="#A00038" />
      </linearGradient>
      <radialGradient id="reRbGl" cx="32%" cy="25%" r="62%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="reRbKnot" x1="9.5" y1="9.5" x2="14.5" y2="14.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF80B0" />
        <stop offset="100%" stopColor="#C00050" />
      </linearGradient>
    </defs>
    {/* Left ribbon tail */}
    <path d="M10.5 14 C9.5 16.5 8.5 19 9.5 22 L11 22 C11.5 19 11.5 16.5 12 14 Z" fill="url(#reRbOuter)" />
    {/* Right ribbon tail */}
    <path d="M13.5 14 C14.5 16.5 15.5 19 14.5 22 L13 22 C12.5 19 12.5 16.5 12 14 Z" fill="url(#reRbOuter)" />
    {/* Left loop */}
    <path d="M12 12 C12 8 10 5 6 5.5 C2 6 1 9.5 1.5 12.5 C2.5 16 5.5 18 12 12 Z" fill="url(#reRbOuter)" />
    {/* Right loop */}
    <path d="M12 12 C12 8 14 5 18 5.5 C22 6 23 9.5 22.5 12.5 C21.5 16 18.5 18 12 12 Z" fill="url(#reRbOuter)" />
    {/* Left loop gloss */}
    <path d="M12 12 C12 8 10 5 6 5.5 C2 6 1 9.5 1.5 12.5 C2.5 16 5.5 18 12 12 Z" fill="url(#reRbGl)" />
    {/* Right loop gloss */}
    <path d="M12 12 C12 8 14 5 18 5.5 C22 6 23 9.5 22.5 12.5 C21.5 16 18.5 18 12 12 Z" fill="url(#reRbGl)" />
    {/* Loop specular arcs */}
    <path d="M3 7 Q5.5 5 9 7" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />
    <path d="M15 7 Q18.5 5 21 7" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Loop outlines */}
    <path d="M12 12 C12 8 10 5 6 5.5 C2 6 1 9.5 1.5 12.5 C2.5 16 5.5 18 12 12 Z" stroke="#A00038" strokeWidth="0.45" fill="none" opacity="0.40" />
    <path d="M12 12 C12 8 14 5 18 5.5 C22 6 23 9.5 22.5 12.5 C21.5 16 18.5 18 12 12 Z" stroke="#A00038" strokeWidth="0.45" fill="none" opacity="0.40" />
    {/* Center knot */}
    <circle cx="12" cy="12" r="2.8" fill="url(#reRbKnot)" />
    <circle cx="12" cy="12" r="2.8" fill="url(#reRbGl)" />
  </svg>
);

// ── Hundred (💯) ───────────────────────────────────────────────────────────
export const HundredEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reHnRed" x1="2" y1="2" x2="21" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF3030" />
        <stop offset="50%"  stopColor="#E80000" />
        <stop offset="100%" stopColor="#A80000" />
      </linearGradient>
    </defs>
    {/* "1" bar */}
    <rect x="3" y="3" width="3" height="11" rx="0.8" fill="url(#reHnRed)" />
    {/* "1" top serif */}
    <line x1="3" y1="3.5" x2="1.2" y2="5" stroke="url(#reHnRed)" strokeWidth="1.6" strokeLinecap="round" />
    {/* "0" — first */}
    <path
      fillRule="evenodd"
      d="M6.5 8.5 A3.5 5.5 0 0 1 13.5 8.5 A3.5 5.5 0 0 1 6.5 8.5 Z M8 8.5 A2 3.5 0 0 1 12 8.5 A2 3.5 0 0 1 8 8.5 Z"
      fill="url(#reHnRed)"
    />
    {/* "0" — second */}
    <path
      fillRule="evenodd"
      d="M14 8.5 A3.5 5.5 0 0 1 21 8.5 A3.5 5.5 0 0 1 14 8.5 Z M15.5 8.5 A2 3.5 0 0 1 19.5 8.5 A2 3.5 0 0 1 15.5 8.5 Z"
      fill="url(#reHnRed)"
    />
    {/* Double underline */}
    <rect x="1" y="15.5" width="21" height="1.8" rx="0.9" fill="url(#reHnRed)" />
    <rect x="1" y="18.5" width="21" height="1.8" rx="0.9" fill="url(#reHnRed)" />
    {/* Top highlights */}
    <path d="M7.5 3.2 Q10 2.2 12.5 3.2" stroke="#FF7070" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.55" />
    <path d="M15 3.2 Q17.5 2.2 20 3.2" stroke="#FF7070" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.55" />
  </svg>
);

// ── Tada (🎉) ──────────────────────────────────────────────────────────────
export const TadaEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reTdCone" x1="6" y1="8" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C060F0" />
        <stop offset="100%" stopColor="#601090" />
      </linearGradient>
      <radialGradient id="reTdGl" cx="28%" cy="22%" r="68%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Streamers / ribbons */}
    <path d="M1.5 3 Q4.5 6 2 9 Q0 12 3 14.5" stroke="#FF4040" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M10 1 Q12.5 4 10 6.5 Q7.5 9 11 11" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Confetti dots */}
    <circle cx="8"  cy="2"   r="1.5" fill="#30C040" />
    <circle cx="14" cy="3"   r="1.2" fill="#4080FF" />
    <circle cx="3"  cy="15"  r="1.1" fill="#20C0A0" />
    {/* Confetti shapes */}
    <rect x="14" y="5.5" width="2.5" height="1.8" rx="0.4" fill="#FF7000" transform="rotate(25 15.25 6.4)" />
    <rect x="16" y="1.5" width="2.2" height="1.6" rx="0.3" fill="#FF40A0" transform="rotate(-22 17.1 2.3)" />
    <path d="M11.5 13 L12.8 15 L10.2 15 Z" fill="#9030E0" />
    {/* Star sparkle */}
    <path d="M4 5 L4.6 6.8 L6.5 7.2 L4.6 7.6 L4 9.5 L3.4 7.6 L1.5 7.2 L3.4 6.8 Z" fill="#FF5020" />
    {/* Cone body */}
    <path d="M6.5 9 L13.5 16.5 L20.5 21 L19 17 Z" fill="url(#reTdCone)" />
    <path d="M6.5 9 L13.5 16.5 L20.5 21 L19 17 Z" fill="url(#reTdGl)" />
    {/* Cone stripes */}
    <path d="M8 10 L19.2 17.5" stroke="#E090FF" strokeWidth="0.75" opacity="0.50" fill="none" />
    <path d="M9.5 11.5 L20 18.5" stroke="#E090FF" strokeWidth="0.75" opacity="0.50" fill="none" />
    {/* Cone opening shadow */}
    <ellipse cx="10" cy="12.8" rx="2" ry="3.5" fill="#28006A" transform="rotate(-45 10 12.8)" />
    {/* Cone outline */}
    <path d="M6.5 9 L13.5 16.5 L20.5 21 L19 17 Z" stroke="#4C0880" strokeWidth="0.5" fill="none" opacity="0.45" />
  </svg>
);

// ── Fire (🔥) ──────────────────────────────────────────────────────────────
export const FireEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reFrOut" x1="4" y1="2" x2="18" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFD030" />
        <stop offset="30%"  stopColor="#FF8000" />
        <stop offset="72%"  stopColor="#E83000" />
        <stop offset="100%" stopColor="#AA2000" />
      </linearGradient>
      <linearGradient id="reFrIn" x1="10" y1="5" x2="15" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFA0" />
        <stop offset="40%"  stopColor="#FFD820" />
        <stop offset="100%" stopColor="#FFA000" />
      </linearGradient>
      <radialGradient id="reFrGl" cx="38%" cy="18%" r="65%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Outer flame */}
    <path
      d="M12 23 C8 23 3 19 4 14 C5 9 7 7 8 5 C9 3 10 1 11 2 C12 4 11 8 14 6 C16 4 18 3 18 6 C18 10 17 14 18 18 C19 21 16 23 12 23 Z"
      fill="url(#reFrOut)"
    />
    {/* Gloss */}
    <path
      d="M12 23 C8 23 3 19 4 14 C5 9 7 7 8 5 C9 3 10 1 11 2 C12 4 11 8 14 6 C16 4 18 3 18 6 C18 10 17 14 18 18 C19 21 16 23 12 23 Z"
      fill="url(#reFrGl)"
    />
    {/* Inner flame */}
    <path
      d="M12 23 C10 22 8 20 9 17 C10 14 11 12 12 10 C13 12 12 16 15 14 C16 12 16 16 16 19 C16 21 14 23 12 23 Z"
      fill="url(#reFrIn)"
    />
    {/* Dark base shadow */}
    <path d="M8 22.5 Q12 21 16 22.5 Q12 23.2 8 22.5 Z" fill="#180800" opacity="0.38" />
    {/* Specular at tip */}
    <path d="M10.5 3.5 Q11.5 2 13 3" stroke="#FFFDE0" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.65" />
    {/* Outline */}
    <path
      d="M12 23 C8 23 3 19 4 14 C5 9 7 7 8 5 C9 3 10 1 11 2 C12 4 11 8 14 6 C16 4 18 3 18 6 C18 10 17 14 18 18 C19 21 16 23 12 23 Z"
      stroke="#AA3000" strokeWidth="0.4" fill="none" opacity="0.35"
    />
  </svg>
);

// ── Adore (🥰) ─────────────────────────────────────────────────────────────
export const AdoreEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reAdFace" x1="3" y1="5" x2="21" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reAdGl" cx="35%" cy="28%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.60" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="reAdHt" x1="0%" y1="0%" x2="65%" y2="100%">
        <stop offset="0%"   stopColor="#FF7090" />
        <stop offset="100%" stopColor="#C80028" />
      </linearGradient>
    </defs>
    {/* Face (shifted down to make room for floating hearts) */}
    <circle cx="12" cy="14.5" r="8.5" fill="url(#reAdFace)" />
    <circle cx="12" cy="14.5" r="8.5" fill="url(#reAdGl)" />
    {/* Rosy cheeks */}
    <ellipse cx="6.2"  cy="17" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.30" />
    <ellipse cx="17.8" cy="17" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.30" />
    {/* Heart eyes */}
    <path d="M8.5 13.5 C7 12 6 11.2 6.2 10 C6.5 9.2 7.2 9.2 8.5 10.5 C9.8 9.2 10.5 9.2 10.8 10 C11 11.2 10 12 8.5 13.5 Z" fill="url(#reAdHt)" />
    <path d="M15.5 13.5 C14 12 13 11.2 13.2 10 C13.5 9.2 14.2 9.2 15.5 10.5 C16.8 9.2 17.5 9.2 17.8 10 C18 11.2 17 12 15.5 13.5 Z" fill="url(#reAdHt)" />
    {/* Heart eye glints */}
    <path d="M7.3 10.3 Q8.5 9.5 9.7 10.3" stroke="#FF9CB8" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.65" />
    <path d="M14.3 10.3 Q15.5 9.5 16.7 10.3" stroke="#FF9CB8" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.65" />
    {/* Big smile */}
    <path d="M7.5 18.5 Q12 22.5 16.5 18.5" fill="#7A4000" />
    <path d="M7.5 18.5 Q12 22.5 16.5 18.5" stroke="#5A3000" strokeWidth="0.45" fill="none" opacity="0.45" />
    {/* Teeth */}
    <path d="M8 18.8 Q12 20.5 16 18.8 Q15.5 17.8 12 17.8 Q8.5 17.8 8 18.8 Z" fill="#FFFDF2" />
    {/* Specular arc */}
    <path d="M5.5 9 Q9 6.8 14.5 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Face outline */}
    <circle cx="12" cy="14.5" r="8.5" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
    {/* Floating hearts — drawn last so they sit on top */}
    <path d="M12 9 C10.5 7.5 9.2 7.5 9.4 6.0 C9.6 4.8 10.4 4.8 12 6.2 C13.6 4.8 14.4 4.8 14.6 6.0 C14.8 7.5 13.5 7.5 12 9 Z" fill="url(#reAdHt)" />
    <path d="M5 8.5 C3.8 7.4 2.8 7.4 3.0 6.3 C3.2 5.4 3.9 5.4 5 6.4 C6.1 5.4 6.8 5.4 7.0 6.3 C7.2 7.4 6.2 7.4 5 8.5 Z" fill="url(#reAdHt)" />
    <path d="M19 7.5 C17.8 6.4 16.8 6.4 17.0 5.3 C17.2 4.4 17.9 4.4 19 5.4 C20.1 4.4 20.8 4.4 21.0 5.3 C21.2 6.4 20.2 6.4 19 7.5 Z" fill="url(#reAdHt)" />
  </svg>
);

// ── Smile (😊) ─────────────────────────────────────────────────────────────
export const SmileEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reSmFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reSmGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.60" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reSmFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reSmGl)" />
    {/* Prominent rosy cheeks — defining feature of 😊 */}
    <ellipse cx="5.5"  cy="14.5" rx="3.2" ry="2.0" fill="#FF7878" opacity="0.34" />
    <ellipse cx="18.5" cy="14.5" rx="3.2" ry="2.0" fill="#FF7878" opacity="0.34" />
    {/* Happy squinting eyes */}
    <path d="M6.8 10.8 Q8.5 8.8 10.2 10.8" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    <path d="M13.8 10.8 Q15.5 8.8 17.2 10.8" stroke="#6A3E00" strokeWidth="2.0" strokeLinecap="round" fill="none" />
    {/* Gentle closed smile */}
    <path d="M8.5 15.8 Q12 19.8 15.5 15.8" stroke="#6A3E00" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Specular arc */}
    <path d="M5.5 5.8 Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── Amazing (🤩) ───────────────────────────────────────────────────────────
export const AmazingEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reAzFace" x1="3" y1="1.5" x2="21" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFF90" />
        <stop offset="30%"  stopColor="#FFD820" />
        <stop offset="68%"  stopColor="#FFA808" />
        <stop offset="100%" stopColor="#CC7808" />
      </linearGradient>
      <radialGradient id="reAzGl" cx="35%" cy="22%" r="58%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="reAzStar" x1="5" y1="8" x2="19" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFAAA" />
        <stop offset="50%"  stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA000" />
      </linearGradient>
    </defs>
    {/* Face */}
    <circle cx="12" cy="12" r="11" fill="url(#reAzFace)" />
    <circle cx="12" cy="12" r="11" fill="url(#reAzGl)" />
    {/* Cheeks */}
    <ellipse cx="5.8"  cy="14.5" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.26" />
    <ellipse cx="18.2" cy="14.5" rx="2.8" ry="1.7" fill="#FF7878" opacity="0.26" />
    {/* Left star eye */}
    <path d="M8 9 L9.2 10.8 L11 12 L9.2 13.2 L8 15 L6.8 13.2 L5 12 L6.8 10.8 Z" fill="url(#reAzStar)" />
    <path d="M8 9 L9.2 10.8 L11 12 L9.2 13.2 L8 15 L6.8 13.2 L5 12 L6.8 10.8 Z" stroke="#CC8A00" strokeWidth="0.4" fill="none" opacity="0.40" />
    {/* Right star eye */}
    <path d="M16 9 L17.2 10.8 L19 12 L17.2 13.2 L16 15 L14.8 13.2 L13 12 L14.8 10.8 Z" fill="url(#reAzStar)" />
    <path d="M16 9 L17.2 10.8 L19 12 L17.2 13.2 L16 15 L14.8 13.2 L13 12 L14.8 10.8 Z" stroke="#CC8A00" strokeWidth="0.4" fill="none" opacity="0.40" />
    {/* Star eye glints */}
    <path d="M6.5 10.2 Q8 9.2 9.5 10" stroke="#FFFDE0" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.72" />
    <path d="M14.5 10.2 Q16 9.2 17.5 10" stroke="#FFFDE0" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.72" />
    {/* Wide open smile */}
    <path d="M7 17.5 Q12 22.5 17 17.5" fill="#7A4000" />
    <path d="M7 17.5 Q12 22.5 17 17.5" stroke="#5A3000" strokeWidth="0.45" fill="none" opacity="0.45" />
    {/* Teeth */}
    <path d="M7.5 17.8 Q12 19.5 16.5 17.8 Q16 16.8 12 16.8 Q8 16.8 7.5 17.8 Z" fill="#FFFDF2" />
    {/* Outer sparkle marks */}
    <path d="M19.5 4.5 L20.3 5.8 L21.8 6 L20.3 6.2 L19.5 7.5 L18.7 6.2 L17.2 6 L18.7 5.8 Z" fill="#FFD700" />
    <path d="M3.5 5.5 L4.2 6.6 L5.5 6.8 L4.2 7.0 L3.5 8.1 L2.8 7.0 L1.5 6.8 L2.8 6.6 Z" fill="#FFD700" />
    {/* Specular arc */}
    <path d="M5.5 5.8 Q10 3.5 15 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Outline */}
    <circle cx="12" cy="12" r="11" stroke="#CC7808" strokeWidth="0.45" fill="none" opacity="0.36" />
  </svg>
);

// ── Like (👍) ──────────────────────────────────────────────────────────────
export const LikeEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reLkSkin" x1="3" y1="1" x2="18" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFD426" />
        <stop offset="45%"  stopColor="#FFAA00" />
        <stop offset="100%" stopColor="#CC8000" />
      </linearGradient>
      <linearGradient id="reLkCuff" x1="3" y1="20" x2="3" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#E0DFF0" />
        <stop offset="100%" stopColor="#A0A0C0" />
      </linearGradient>
      <radialGradient id="reLkGl" cx="30%" cy="18%" r="65%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Sleeve / cuff */}
    <rect x="3" y="20" width="14.5" height="2.5" rx="1" fill="url(#reLkCuff)" />
    {/* Fist + thumb */}
    <path
      d="M3 12 Q3 11 4.5 11 L8 11 C8 11 8.5 7 8.5 4.5 Q9 2 11 2 Q13 2 13.5 4.5 C13.5 7 14 11 14 11 L16 11 Q17.5 11 17.5 12.5 L17.5 20 L3 20 Z"
      fill="url(#reLkSkin)"
    />
    {/* Gloss */}
    <path
      d="M3 12 Q3 11 4.5 11 L8 11 C8 11 8.5 7 8.5 4.5 Q9 2 11 2 Q13 2 13.5 4.5 C13.5 7 14 11 14 11 L16 11 Q17.5 11 17.5 12.5 L17.5 20 L3 20 Z"
      fill="url(#reLkGl)"
    />
    {/* Knuckle folds on fist top */}
    <path d="M14.8 11.5 L14.8 13" stroke="#A87800" strokeWidth="0.7" strokeLinecap="round" opacity="0.40" />
    <path d="M15.8 11.5 L15.8 13" stroke="#A87800" strokeWidth="0.7" strokeLinecap="round" opacity="0.40" />
    <path d="M16.8 11.5 L16.8 13" stroke="#A87800" strokeWidth="0.7" strokeLinecap="round" opacity="0.40" />
    {/* Thumb nail */}
    <ellipse cx="11" cy="3.8" rx="1.8" ry="1.1" fill="#FFE880" opacity="0.58" />
    {/* Specular arc on thumb */}
    <path d="M9.2 3.2 Q11 2 12.8 3.2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.58" />
    {/* Outline */}
    <path
      d="M3 12 Q3 11 4.5 11 L8 11 C8 11 8.5 7 8.5 4.5 Q9 2 11 2 Q13 2 13.5 4.5 C13.5 7 14 11 14 11 L16 11 Q17.5 11 17.5 12.5 L17.5 20 L3 20 Z"
      stroke="#A07000" strokeWidth="0.5" fill="none" opacity="0.38"
    />
  </svg>
);

// ── Ok (👌) ────────────────────────────────────────────────────────────────
export const OkEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reOkSkin" x1="3" y1="2" x2="20" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFD426" />
        <stop offset="45%"  stopColor="#FFAA00" />
        <stop offset="100%" stopColor="#CC8000" />
      </linearGradient>
      <linearGradient id="reOkCuff" x1="9" y1="20" x2="9" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#E0DFF0" />
        <stop offset="100%" stopColor="#A0A0C0" />
      </linearGradient>
      <radialGradient id="reOkGl" cx="65%" cy="22%" r="62%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Ring (thumb + index) — evenodd donut */}
    <path
      fillRule="evenodd"
      d="M4 18 A4 4 0 0 1 12 18 A4 4 0 0 1 4 18 Z M5.5 18 A2.5 2.5 0 0 1 10.5 18 A2.5 2.5 0 0 1 5.5 18 Z"
      fill="url(#reOkSkin)"
    />
    {/* Middle finger */}
    <path d="M11.5 14 L11.5 5 Q11.5 4 12.5 4 Q13.5 4 13.5 5 L13.5 14 Z" fill="url(#reOkSkin)" />
    {/* Ring finger */}
    <path d="M14 14 L14 6.5 Q14 5.5 15 5.5 Q16 5.5 16 6.5 L16 14 Z" fill="url(#reOkSkin)" />
    {/* Pinky */}
    <path d="M16.5 14 L16.5 9 Q16.5 8 17.3 8 Q18.1 8 18.1 9 L18.1 14 Z" fill="url(#reOkSkin)" />
    {/* Palm — drawn on top to bridge ring and fingers */}
    <path d="M10 14 Q9 14 9 15 L9 20.5 Q9 21.5 10 21.5 L18.5 21.5 Q19.5 21.5 19.5 20.5 L19.5 15 Q19.5 14 18.5 14 Z" fill="url(#reOkSkin)" />
    {/* Cuff */}
    <rect x="9" y="20.5" width="10.5" height="2" rx="0.8" fill="url(#reOkCuff)" />
    {/* Palm gloss */}
    <path d="M10 14 Q9 14 9 15 L9 20.5 Q9 21.5 10 21.5 L18.5 21.5 Q19.5 21.5 19.5 20.5 L19.5 15 Q19.5 14 18.5 14 Z" fill="url(#reOkGl)" />
    {/* Ring specular arc */}
    <path d="M5 15.5 Q7 13.5 10.5 15" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Finger nails */}
    <ellipse cx="12.5" cy="5"   rx="0.9" ry="0.7" fill="#FFE880" opacity="0.55" />
    <ellipse cx="15"   cy="6.5" rx="0.9" ry="0.7" fill="#FFE880" opacity="0.55" />
    <ellipse cx="17.3" cy="9"   rx="0.7" ry="0.6" fill="#FFE880" opacity="0.55" />
    {/* Ring outline */}
    <path
      fillRule="evenodd"
      d="M4 18 A4 4 0 0 1 12 18 A4 4 0 0 1 4 18 Z M5.5 18 A2.5 2.5 0 0 1 10.5 18 A2.5 2.5 0 0 1 5.5 18 Z"
      stroke="#A07000" strokeWidth="0.5" fill="none" opacity="0.38"
    />
    {/* Palm outline */}
    <path d="M10 14 Q9 14 9 15 L9 20.5 Q9 21.5 10 21.5 L18.5 21.5 Q19.5 21.5 19.5 20.5 L19.5 15 Q19.5 14 18.5 14 Z" stroke="#A07000" strokeWidth="0.5" fill="none" opacity="0.38" />
  </svg>
);

// ── Skull (💀) ─────────────────────────────────────────────────────────────
export const SkullEmoji: FC<EmojiProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="reSkBody" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F0EEF2" />
        <stop offset="50%"  stopColor="#D4D0D8" />
        <stop offset="100%" stopColor="#B0ACB8" />
      </linearGradient>
      <radialGradient id="reSkGl" cx="33%" cy="20%" r="60%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.75" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Skull body (cranium + jaw) */}
    <path
      d="M12 2 C7 2 3 5 3 10 C3 14.5 5.5 16.5 7.5 17.5 L7.5 21 Q7.5 22.5 9 22.5 L15 22.5 Q16.5 22.5 16.5 21 L16.5 17.5 C18.5 16.5 21 14.5 21 10 C21 5 17 2 12 2 Z"
      fill="url(#reSkBody)"
    />
    {/* Gloss */}
    <path
      d="M12 2 C7 2 3 5 3 10 C3 14.5 5.5 16.5 7.5 17.5 L7.5 21 Q7.5 22.5 9 22.5 L15 22.5 Q16.5 22.5 16.5 21 L16.5 17.5 C18.5 16.5 21 14.5 21 10 C21 5 17 2 12 2 Z"
      fill="url(#reSkGl)"
    />
    {/* Left eye socket */}
    <ellipse cx="8.5"  cy="11" rx="3"   ry="3.5" fill="#2A2030" />
    {/* Right eye socket */}
    <ellipse cx="15.5" cy="11" rx="3"   ry="3.5" fill="#2A2030" />
    {/* Nose cavity */}
    <path d="M11 15.5 Q12 14 13 15.5 Q13 17 12 17 Q11 17 11 15.5 Z" fill="#2A2030" />
    {/* Jaw separator */}
    <line x1="7.5"  y1="19" x2="16.5" y2="19" stroke="#9890A0" strokeWidth="0.8" opacity="0.65" />
    {/* Teeth dividers */}
    <line x1="9.5"  y1="19" x2="9.5"  y2="22.5" stroke="#9890A0" strokeWidth="0.75" opacity="0.60" />
    <line x1="12"   y1="19" x2="12"   y2="22.5" stroke="#9890A0" strokeWidth="0.75" opacity="0.60" />
    <line x1="14.5" y1="19" x2="14.5" y2="22.5" stroke="#9890A0" strokeWidth="0.75" opacity="0.60" />
    {/* Specular arc */}
    <path d="M5.5 5.5 Q10 3 16 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.65" />
    {/* Outline */}
    <path
      d="M12 2 C7 2 3 5 3 10 C3 14.5 5.5 16.5 7.5 17.5 L7.5 21 Q7.5 22.5 9 22.5 L15 22.5 Q16.5 22.5 16.5 21 L16.5 17.5 C18.5 16.5 21 14.5 21 10 C21 5 17 2 12 2 Z"
      stroke="#9890A0" strokeWidth="0.5" fill="none" opacity="0.45"
    />
  </svg>
);

// ── ReactionEmoji — renders SVG for core 10, falls back to raw string ───────
const REACTION_SVG_MAP: Partial<Record<string, FC<EmojiProps>>> = {
  heart:        HeartEmoji,
  love:         HeartEmoji,
  broken_heart: BrokenHeartEmoji,
  laugh:        LaughEmoji,
  haha:         LaughEmoji,
  lol:          LaughEmoji,
  sad:          SadEmoji,
  cry:          SadEmoji,
  angry:        AngryEmoji,
  mad:          AngryEmoji,
  wow:          WowEmoji,
  surprised:    WowEmoji,
  mind_blown:   MindBlownEmoji,
  mindblown:    MindBlownEmoji,
  biting_lip:   BitingLipEmoji,
  lip:          BitingLipEmoji,
  kiss:         KissEmoji,
  kissing:      KissEmoji,
  blown_kiss:   KissEmoji,
  ribbon:       RibbonEmoji,
  bow:          RibbonEmoji,
  hundred:      HundredEmoji,
  "100":        HundredEmoji,
  tada:         TadaEmoji,
  celebrate:    TadaEmoji,
  party:        TadaEmoji,
  fire:         FireEmoji,
  flame:        FireEmoji,
  lit:          FireEmoji,
  adore:        AdoreEmoji,
  love_eyes:    AdoreEmoji,
  smile:        SmileEmoji,
  blush:        SmileEmoji,
  amazing:      AmazingEmoji,
  starstruck:   AmazingEmoji,
  star_struck:  AmazingEmoji,
  like:         LikeEmoji,
  thumbsup:     LikeEmoji,
  thumbs_up:    LikeEmoji,
  ok:           OkEmoji,
  okay:         OkEmoji,
  skull:        SkullEmoji,
  death:        SkullEmoji,
};

type ReactionEmojiProps = { reactionKey: string; fallback: string; size?: number };

export const ReactionEmoji: FC<ReactionEmojiProps> = ({ reactionKey, fallback, size = 20 }) => {
  const SvgIcon = REACTION_SVG_MAP[reactionKey.trim().toLowerCase()];
  if (SvgIcon) return <SvgIcon size={size} />;
  return <>{fallback}</>;
};
