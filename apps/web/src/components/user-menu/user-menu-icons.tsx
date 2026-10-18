import type { FC } from "react";

type SvgProps = { size?: number };

// ── Explore — iOS-style: gradient gold bezel, parchment face, red/steel compass needle, glass dome, pivot glint ──
export const ExploreIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bezel: dark shadow edges → rich gold crest → dark shadow */}
      <linearGradient
        id="umCpBzl"
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#8A6010" />
        <stop offset="38%" stopColor="#D4A828" />
        <stop offset="65%" stopColor="#F0C840" />
        <stop offset="100%" stopColor="#7A5010" />
      </linearGradient>
      {/* Face: bright ivory upper-left → warm cream → amber lower-right */}
      <linearGradient
        id="umCpFace"
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFB" />
        <stop offset="50%" stopColor="#F8F4E8" />
        <stop offset="100%" stopColor="#E8D8B0" />
      </linearGradient>
      {/* North needle: bright coral tip → deep crimson base */}
      <linearGradient
        id="umCpNdlN"
        x1="12"
        y1="7"
        x2="12"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FF4040" />
        <stop offset="55%" stopColor="#CC1828" />
        <stop offset="100%" stopColor="#8A0A18" />
      </linearGradient>
      {/* South needle: light steel → dark slate */}
      <linearGradient
        id="umCpNdlS"
        x1="12"
        y1="12"
        x2="12"
        y2="17"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#C8D0D8" />
        <stop offset="55%" stopColor="#909AA8" />
        <stop offset="100%" stopColor="#505870" />
      </linearGradient>
      {/* Glass dome: white gloss core → transparent edge */}
      <radialGradient id="umCpGlass" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Center pivot: bright gold core → deep amber */}
      <radialGradient id="umCpPiv" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#F0D040" />
        <stop offset="100%" stopColor="#9A7010" />
      </radialGradient>
    </defs>

    {/* ── Outer bezel ring ── */}
    <circle cx="12" cy="12" r="10.2" fill="url(#umCpBzl)" />
    {/* Bezel inner cast shadow */}
    <circle cx="12" cy="12" r="9.2" fill="#6A4808" opacity="0.14" />

    {/* ── Compass face ── */}
    <circle cx="12" cy="12" r="8.8" fill="url(#umCpFace)" />

    {/* Cardinal tick marks */}
    <line
      x1="12"
      y1="4.5"
      x2="12"
      y2="6.5"
      stroke="#9A6E18"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="17.5"
      x2="12"
      y2="19.5"
      stroke="#9A6E18"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.70"
    />
    <line
      x1="4.5"
      y1="12"
      x2="6.5"
      y2="12"
      stroke="#9A6E18"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.70"
    />
    <line
      x1="17.5"
      y1="12"
      x2="19.5"
      y2="12"
      stroke="#9A6E18"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.70"
    />

    {/* Diagonal minor ticks */}
    <line
      x1="8.1"
      y1="5.8"
      x2="8.8"
      y2="7.1"
      stroke="#C8A040"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="15.9"
      y1="5.8"
      x2="15.2"
      y2="7.1"
      stroke="#C8A040"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="8.1"
      y1="18.2"
      x2="8.8"
      y2="16.9"
      stroke="#C8A040"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.45"
    />
    <line
      x1="15.9"
      y1="18.2"
      x2="15.2"
      y2="16.9"
      stroke="#C8A040"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* North marker dot (crimson) */}
    <circle cx="12" cy="5.0" r="0.78" fill="#CC1828" opacity="0.85" />

    {/* ── North needle (red, diamond tip) ── */}
    <path d="M12 12L10.2 13.5L12 7L13.8 13.5Z" fill="url(#umCpNdlN)" />
    {/* North needle specular highlight */}
    <path
      d="M12 7L11.6 9.5L12 10.2"
      stroke="#FF7878"
      strokeWidth="0.4"
      strokeLinecap="round"
      opacity="0.55"
    />

    {/* ── South needle (steel, diamond tail) ── */}
    <path d="M12 12L10.2 10.5L12 17L13.8 10.5Z" fill="url(#umCpNdlS)" />
    {/* South needle specular highlight */}
    <path
      d="M11.7 12.8L11.4 14.5"
      stroke="#E0E8F0"
      strokeWidth="0.38"
      strokeLinecap="round"
      opacity="0.50"
    />

    {/* Needle ground shadow on face */}
    <ellipse
      cx="12"
      cy="12.8"
      rx="1.6"
      ry="0.48"
      fill="#8A6010"
      opacity="0.10"
    />

    {/* ── Center pivot ── */}
    <circle cx="12" cy="12" r="1.2" fill="url(#umCpPiv)" />
    {/* Pivot gloss glint */}
    <circle cx="11.6" cy="11.6" r="0.38" fill="#FFE860" opacity="0.62" />

    {/* ── Glass dome highlight overlay ── */}
    <circle cx="12" cy="12" r="8.8" fill="url(#umCpGlass)" />
    {/* Specular arc — upper-left rim */}
    <path
      d="M7.5 7.5A7 7 0 0 1 13.5 5.5"
      stroke="#FFFFFF"
      strokeWidth="1.0"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />

    {/* ── Bezel rim outlines ── */}
    <circle
      cx="12"
      cy="12"
      r="10.2"
      stroke="#7A5810"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />
    <circle
      cx="12"
      cy="12"
      r="9.2"
      stroke="#B88C18"
      strokeWidth="0.35"
      fill="none"
      opacity="0.38"
    />
  </svg>
);

// ── Interactions — iOS-style: gradient teal primary bubble, gradient violet secondary bubble, glass dome, message dots ──
export const InteractionsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Primary bubble: deep teal left shadow → bright aqua center → teal right */}
      <linearGradient
        id="umItBbl1"
        x1="2"
        y1="3"
        x2="16"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#047A6A" />
        <stop offset="38%" stopColor="#0BA88E" />
        <stop offset="68%" stopColor="#14C8A8" />
        <stop offset="100%" stopColor="#06806C" />
      </linearGradient>
      {/* Secondary bubble: deep violet left → bright amethyst center */}
      <linearGradient
        id="umItBbl2"
        x1="8"
        y1="10"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#4A1888" />
        <stop offset="42%" stopColor="#7830C0" />
        <stop offset="78%" stopColor="#9848D8" />
        <stop offset="100%" stopColor="#3A1070" />
      </linearGradient>
      {/* Primary tail: teal body colour */}
      <linearGradient
        id="umItTl1"
        x1="3"
        y1="14"
        x2="7"
        y2="19"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#0BA88E" />
        <stop offset="100%" stopColor="#047A6A" />
      </linearGradient>
      {/* Secondary tail: violet body colour */}
      <linearGradient
        id="umItTl2"
        x1="17"
        y1="18"
        x2="21"
        y2="23"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#7830C0" />
        <stop offset="100%" stopColor="#4A1888" />
      </linearGradient>
      {/* Glass dome — primary bubble */}
      <radialGradient id="umItGl1" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Glass dome — secondary bubble */}
      <radialGradient id="umItGl2" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Primary bubble tail ── */}
    <path d="M4.5 14.5Q3.5 17 2.5 19.5L7.5 16.5Z" fill="url(#umItTl1)" />

    {/* ── Primary bubble body (teal, larger, top-left) ── */}
    <rect x="2" y="3" width="15" height="13" rx="4.5" fill="url(#umItBbl1)" />
    {/* Shadow fold — right-bottom edge */}
    <path
      d="M14 3.5Q16.5 5 17 8Q17.2 11.5 16.2 15.5L14 16Q16 13 16 8Q15.8 5.2 14 3.5Z"
      fill="#04604E"
      opacity="0.28"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M4.5 5.5A9 9 0 0 1 11 3.8"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />
    {/* Glass dome overlay */}
    <rect x="2" y="3" width="15" height="13" rx="4.5" fill="url(#umItGl1)" />

    {/* Message dots — primary bubble */}
    <circle cx="7" cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />
    <circle cx="9.5" cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />
    <circle cx="12" cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />

    {/* ── Secondary bubble tail ── */}
    <path d="M19.5 18.5Q20.5 21 21.5 22.5L17.5 20.5Z" fill="url(#umItTl2)" />

    {/* ── Secondary bubble body (violet, smaller, bottom-right) ── */}
    <rect x="9" y="11" width="13" height="10" rx="3.5" fill="url(#umItBbl2)" />
    {/* Shadow fold — right-bottom edge */}
    <path
      d="M19.5 11.5Q22 13 22.2 16Q22.4 18.8 21.2 20.5L19 21Q21 19 21 16Q20.8 13 19.5 11.5Z"
      fill="#300870"
      opacity="0.25"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M11 13A6 6 0 0 1 16 11.5"
      stroke="#FFFFFF"
      strokeWidth="1.0"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
    />
    {/* Glass dome overlay */}
    <rect x="9" y="11" width="13" height="10" rx="3.5" fill="url(#umItGl2)" />

    {/* Message dots — secondary bubble */}
    <circle cx="13.5" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />
    <circle cx="15.8" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />
    <circle cx="18.1" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />

    {/* ── Outlines ── */}
    <rect
      x="2"
      y="3"
      width="15"
      height="13"
      rx="4.5"
      stroke="#047060"
      strokeWidth="0.55"
      fill="none"
      opacity="0.42"
    />
    <rect
      x="9"
      y="11"
      width="13"
      height="10"
      rx="3.5"
      stroke="#381080"
      strokeWidth="0.50"
      fill="none"
      opacity="0.38"
    />
  </svg>
);

// ── Characters — iOS-style: gold comedy mask front, indigo tragedy mask behind, gloss domes, eye-hole glints, tear drop ──
export const CharactersIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Comedy face: bright ivory-gold highlight → warm amber → deep gold shadow */}
      <linearGradient
        id="umChCo"
        x1="3"
        y1="4"
        x2="17"
        y2="17"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFF0A8" />
        <stop offset="42%" stopColor="#F0C830" />
        <stop offset="100%" stopColor="#C08810" />
      </linearGradient>
      {/* Tragedy face: near-black left → deep indigo → slate-amethyst right */}
      <linearGradient
        id="umChTr"
        x1="9"
        y1="8"
        x2="22"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#130C40" />
        <stop offset="40%" stopColor="#2A1870" />
        <stop offset="78%" stopColor="#4030A0" />
        <stop offset="100%" stopColor="#1E1058" />
      </linearGradient>
      {/* Comedy gloss dome */}
      <radialGradient id="umChCoGl" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Tragedy gloss dome */}
      <radialGradient id="umChTrGl" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Tragedy mask (behind, indigo, shifted bottom-right) ── */}
    <ellipse cx="14.5" cy="14" rx="7.5" ry="6.8" fill="url(#umChTr)" />
    {/* Shadow fold — right edge */}
    <path
      d="M20 10.5Q22 13 22 15Q22 18 20 19.5"
      stroke="#0A0828"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
      opacity="0.28"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M9.5 10.5A6.5 6.5 0 0 1 13.5 8.5"
      stroke="#FFFFFF"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.38"
    />
    {/* Gloss dome */}
    <ellipse cx="14.5" cy="14" rx="7.5" ry="6.8" fill="url(#umChTrGl)" />
    {/* Tragedy eye holes */}
    <ellipse
      cx="12.0"
      cy="12.5"
      rx="1.2"
      ry="1.5"
      fill="#08061E"
      opacity="0.90"
    />
    <ellipse
      cx="17.0"
      cy="12.5"
      rx="1.2"
      ry="1.5"
      fill="#08061E"
      opacity="0.90"
    />
    {/* Eye glints */}
    <circle cx="11.6" cy="12.0" r="0.42" fill="#5040B0" opacity="0.55" />
    <circle cx="16.6" cy="12.0" r="0.42" fill="#5040B0" opacity="0.55" />
    {/* Frown */}
    <path
      d="M11.5 17.5Q14.5 15.5 17.5 17.5"
      stroke="#08061E"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />
    {/* Tear drop */}
    <path
      d="M11.8 14.8Q11.3 16.2 11.9 16.8Q12.5 17.2 12.2 15.8Z"
      fill="#6070D8"
      opacity="0.68"
    />
    {/* Outline */}
    <ellipse
      cx="14.5"
      cy="14"
      rx="7.5"
      ry="6.8"
      stroke="#1A1060"
      strokeWidth="0.5"
      fill="none"
      opacity="0.42"
    />

    {/* ── Comedy mask (front, gold, upper-left) ── */}
    <ellipse cx="9.5" cy="10" rx="7.5" ry="6.8" fill="url(#umChCo)" />
    {/* Shadow fold — right edge */}
    <path
      d="M15 6.8Q17 9 17 11Q17 14 15 15.5"
      stroke="#A07808"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
      opacity="0.30"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M4 7.5A6.5 6.5 0 0 1 8.5 5.5"
      stroke="#FFFFFF"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.60"
    />
    {/* Gloss dome */}
    <ellipse cx="9.5" cy="10" rx="7.5" ry="6.8" fill="url(#umChCoGl)" />
    {/* Comedy eye holes */}
    <ellipse
      cx="7.0"
      cy="9.0"
      rx="1.2"
      ry="1.5"
      fill="#6A4008"
      opacity="0.85"
    />
    <ellipse
      cx="12.0"
      cy="9.0"
      rx="1.2"
      ry="1.5"
      fill="#6A4008"
      opacity="0.85"
    />
    {/* Eye glints */}
    <circle cx="6.6" cy="8.5" r="0.42" fill="#FFF0A0" opacity="0.65" />
    <circle cx="11.6" cy="8.5" r="0.42" fill="#FFF0A0" opacity="0.65" />
    {/* Smile */}
    <path
      d="M6 12.5Q9.5 16 13 12.5"
      stroke="#6A4008"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />
    {/* Outline */}
    <ellipse
      cx="9.5"
      cy="10"
      rx="7.5"
      ry="6.8"
      stroke="#A07808"
      strokeWidth="0.55"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

// ── Edit Profile — iOS-style: glossy gold pencil at 45°, silver ferrule, pink eraser, wood collar, graphite tip ──
export const EditProfileIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Barrel: dark gold edge → bright crest → dark gold edge (cross-barrel) */}
      <linearGradient
        id="umEpBarrel"
        x1="9.4"
        y1="6"
        x2="14.6"
        y2="6"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#A07808" />
        <stop offset="34%" stopColor="#F0C830" />
        <stop offset="60%" stopColor="#FFF0A8" />
        <stop offset="100%" stopColor="#B48810" />
      </linearGradient>
      {/* Ferrule: light steel → slate */}
      <linearGradient
        id="umEpFerrule"
        x1="9.4"
        y1="4.2"
        x2="14.6"
        y2="6.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#E8ECF2" />
        <stop offset="50%" stopColor="#A8B2C0" />
        <stop offset="100%" stopColor="#6C7686" />
      </linearGradient>
      {/* Eraser: bright rose → deep coral */}
      <linearGradient
        id="umEpEraser"
        x1="9.6"
        y1="3"
        x2="14.4"
        y2="5"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFC2CE" />
        <stop offset="100%" stopColor="#E86A82" />
      </linearGradient>
      {/* Wood collar: pale tan → warm brown */}
      <linearGradient
        id="umEpWood"
        x1="9.4"
        y1="17.5"
        x2="14.6"
        y2="20.8"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F0D8A8" />
        <stop offset="100%" stopColor="#B88840" />
      </linearGradient>
    </defs>

    <g transform="rotate(45 12 12)">
      {/* Eraser */}
      <rect
        x="9.6"
        y="2.6"
        width="4.8"
        height="2.2"
        rx="1.1"
        fill="url(#umEpEraser)"
      />
      {/* Metal ferrule */}
      <rect
        x="9.4"
        y="4.4"
        width="5.2"
        height="2.2"
        rx="0.4"
        fill="url(#umEpFerrule)"
      />
      {/* Ferrule crimp lines */}
      <line
        x1="9.4"
        y1="5.2"
        x2="14.6"
        y2="5.2"
        stroke="#586274"
        strokeWidth="0.4"
        opacity="0.5"
      />
      <line
        x1="9.4"
        y1="5.9"
        x2="14.6"
        y2="5.9"
        stroke="#586274"
        strokeWidth="0.4"
        opacity="0.5"
      />
      {/* Barrel */}
      <rect x="9.4" y="6.4" width="5.2" height="11.2" fill="url(#umEpBarrel)" />
      {/* Barrel specular stripe */}
      <rect
        x="10.0"
        y="6.4"
        width="1.0"
        height="11.2"
        rx="0.5"
        fill="#FFFFFF"
        opacity="0.38"
      />
      {/* Wood cone */}
      <path d="M9.4 17.6 L14.6 17.6 L12 21.0 Z" fill="url(#umEpWood)" />
      {/* Wood shade */}
      <path d="M12 17.6 L14.6 17.6 L12 21.0 Z" fill="#8A6428" opacity="0.30" />
      {/* Graphite tip */}
      <path d="M11.0 19.5 L13.0 19.5 L12 21.1 Z" fill="#2A2A2E" />
      {/* Outline */}
      <rect
        x="9.4"
        y="6.4"
        width="5.2"
        height="11.2"
        stroke="#A07808"
        strokeWidth="0.4"
        fill="none"
        opacity="0.4"
      />
    </g>
  </svg>
);

// ── Inbox — iOS-style: deep navy envelope body, open flap, parchment letter with text lines, gloss overlay ──
export const InboxIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Envelope body: near-black left shadow → deep navy → slate highlight right */}
      <linearGradient
        id="umIbEnv"
        x1="2"
        y1="10"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#0A1830" />
        <stop offset="38%" stopColor="#182E50" />
        <stop offset="72%" stopColor="#284468" />
        <stop offset="100%" stopColor="#0C1C38" />
      </linearGradient>
      {/* Flap: slightly lighter navy than body */}
      <linearGradient
        id="umIbFlap"
        x1="2"
        y1="10"
        x2="22"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#182C58" />
        <stop offset="50%" stopColor="#2C4468" />
        <stop offset="100%" stopColor="#162440" />
      </linearGradient>
      {/* Letter: bright ivory top → warm parchment → amber base */}
      <linearGradient
        id="umIbLtr"
        x1="9"
        y1="3"
        x2="15"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFB" />
        <stop offset="55%" stopColor="#F8F0DC" />
        <stop offset="100%" stopColor="#ECD8A8" />
      </linearGradient>
      {/* Envelope gloss dome */}
      <radialGradient id="umIbGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.48" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Letter peeking above the envelope ── */}
    <rect x="7.5" y="3" width="9" height="11" rx="1.2" fill="url(#umIbLtr)" />
    {/* Letter text lines */}
    <line
      x1="9.5"
      y1="6.0"
      x2="14.5"
      y2="6.0"
      stroke="#B09030"
      strokeWidth="0.72"
      strokeLinecap="round"
      opacity="0.65"
    />
    <line
      x1="9.5"
      y1="7.8"
      x2="14.5"
      y2="7.8"
      stroke="#B09030"
      strokeWidth="0.72"
      strokeLinecap="round"
      opacity="0.60"
    />
    <line
      x1="9.5"
      y1="9.6"
      x2="12.8"
      y2="9.6"
      stroke="#B09030"
      strokeWidth="0.72"
      strokeLinecap="round"
      opacity="0.50"
    />
    {/* Letter outline */}
    <rect
      x="7.5"
      y="3"
      width="9"
      height="11"
      rx="1.2"
      stroke="#C8A840"
      strokeWidth="0.5"
      fill="none"
      opacity="0.42"
    />

    {/* ── Envelope body ── */}
    <rect x="2" y="10" width="20" height="12" rx="2" fill="url(#umIbEnv)" />
    {/* Left face specular streak */}
    <path
      d="M3.8 11.5V21.5"
      stroke="#3A5888"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.35"
    />
    {/* Right face shadow edge */}
    <path
      d="M20.2 11.5V21.5"
      stroke="#060E1C"
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.22"
    />
    {/* Interior V-crease shadow */}
    <path
      d="M2 22L12 16.5L22 22"
      stroke="#06101E"
      strokeWidth="1.0"
      fill="none"
      opacity="0.32"
    />
    {/* Gloss dome */}
    <rect x="2" y="10" width="20" height="12" rx="2" fill="url(#umIbGl)" />

    {/* ── Open flap (V-shape, pointing down, open upward) ── */}
    <path d="M2 10L12 17.5L22 10Z" fill="url(#umIbFlap)" />
    {/* Flap fold crease edge */}
    <path
      d="M2 10L12 17.5L22 10"
      stroke="#2E4870"
      strokeWidth="0.6"
      fill="none"
      opacity="0.45"
    />
    {/* Flap left-face specular */}
    <path
      d="M3.5 10.8L8.5 14.2"
      stroke="#FFFFFF"
      strokeWidth="0.65"
      strokeLinecap="round"
      opacity="0.30"
    />

    {/* ── Envelope outline ── */}
    <rect
      x="2"
      y="10"
      width="20"
      height="12"
      rx="2"
      stroke="#0C1E38"
      strokeWidth="0.55"
      fill="none"
      opacity="0.42"
    />
  </svg>
);

// ── Music — iOS-style: crimson beamed eighth notes, rotated note heads with gloss glints, subtle gold staff lines ──
export const MusicIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Note body: bright rose highlight → deep crimson → burgundy shadow */}
      <linearGradient
        id="umMsNote"
        x1="4"
        y1="6"
        x2="20"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F04070" />
        <stop offset="42%" stopColor="#C01840" />
        <stop offset="100%" stopColor="#780A28" />
      </linearGradient>
      {/* Beam: brighter rose → deep crimson */}
      <linearGradient
        id="umMsBeam"
        x1="7"
        y1="8"
        x2="17"
        y2="6"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#D82858" />
        <stop offset="100%" stopColor="#A01838" />
      </linearGradient>
      {/* Left note head gloss */}
      <radialGradient id="umMsGl1" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FF8AAA" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#C01840" stopOpacity="0" />
      </radialGradient>
      {/* Right note head gloss */}
      <radialGradient id="umMsGl2" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FF8AAA" stopOpacity="0.60" />
        <stop offset="100%" stopColor="#A01438" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Staff lines (subtle gold background context) ── */}
    <line
      x1="2"
      y1="15"
      x2="22"
      y2="15"
      stroke="#D0A040"
      strokeWidth="0.55"
      opacity="0.28"
    />
    <line
      x1="2"
      y1="17"
      x2="22"
      y2="17"
      stroke="#D0A040"
      strokeWidth="0.55"
      opacity="0.28"
    />
    <line
      x1="2"
      y1="19"
      x2="22"
      y2="19"
      stroke="#D0A040"
      strokeWidth="0.55"
      opacity="0.28"
    />
    <line
      x1="2"
      y1="21"
      x2="22"
      y2="21"
      stroke="#D0A040"
      strokeWidth="0.55"
      opacity="0.28"
    />

    {/* ── Beam (connects top of both stems, angled naturally) ── */}
    <path d="M7 8.5L17 6.5V9L7 11Z" fill="url(#umMsBeam)" />
    {/* Beam specular streak */}
    <line
      x1="7.5"
      y1="8.8"
      x2="16.5"
      y2="6.8"
      stroke="#FF88AA"
      strokeWidth="0.42"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* ── Left stem ── */}
    <line
      x1="7"
      y1="8.5"
      x2="7"
      y2="19.5"
      stroke="url(#umMsNote)"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    {/* ── Right stem ── */}
    <line
      x1="17"
      y1="6.5"
      x2="17"
      y2="17.5"
      stroke="url(#umMsNote)"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    {/* ── Left note head ── */}
    <ellipse
      cx="5.3"
      cy="19.5"
      rx="2.7"
      ry="1.8"
      transform="rotate(-15 5.3 19.5)"
      fill="url(#umMsNote)"
    />
    {/* Left note head gloss */}
    <ellipse
      cx="5.3"
      cy="19.5"
      rx="2.7"
      ry="1.8"
      transform="rotate(-15 5.3 19.5)"
      fill="url(#umMsGl1)"
    />
    {/* Left note head specular glint */}
    <circle cx="4.2" cy="18.7" r="0.68" fill="#FFFFFF" opacity="0.45" />

    {/* ── Right note head ── */}
    <ellipse
      cx="15.3"
      cy="17.5"
      rx="2.7"
      ry="1.8"
      transform="rotate(-15 15.3 17.5)"
      fill="url(#umMsNote)"
    />
    {/* Right note head gloss */}
    <ellipse
      cx="15.3"
      cy="17.5"
      rx="2.7"
      ry="1.8"
      transform="rotate(-15 15.3 17.5)"
      fill="url(#umMsGl2)"
    />
    {/* Right note head specular glint */}
    <circle cx="14.2" cy="16.7" r="0.68" fill="#FFFFFF" opacity="0.38" />
  </svg>
);

// ── InstallApp — iOS-style: dark metallic phone body, deep teal screen with gloss, bright emerald download arrow ──
export const InstallAppIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Phone body: near-black left → deep slate → blue-slate highlight right */}
      <linearGradient
        id="umInstBody"
        x1="6"
        y1="12"
        x2="18"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#080C18" />
        <stop offset="35%" stopColor="#12182C" />
        <stop offset="70%" stopColor="#1C2640" />
        <stop offset="100%" stopColor="#0A0E1E" />
      </linearGradient>
      {/* Screen: near-black teal left → deep teal → mid teal right */}
      <linearGradient
        id="umInstScr"
        x1="7.5"
        y1="4.5"
        x2="16.5"
        y2="17.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#031418" />
        <stop offset="45%" stopColor="#073040" />
        <stop offset="100%" stopColor="#0A4050" />
      </linearGradient>
      {/* Download arrow: bright emerald top → deep teal base */}
      <linearGradient
        id="umInstArr"
        x1="12"
        y1="6.5"
        x2="12"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#22E8B0" />
        <stop offset="55%" stopColor="#10A880" />
        <stop offset="100%" stopColor="#087858" />
      </linearGradient>
      {/* Screen gloss dome */}
      <radialGradient id="umInstGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Home button: dark center → slightly lighter rim */}
      <radialGradient id="umInstBtn" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#283050" />
        <stop offset="100%" stopColor="#080C18" />
      </radialGradient>
    </defs>

    {/* ── Phone body ── */}
    <rect
      x="6"
      y="1.5"
      width="12"
      height="21"
      rx="2.5"
      fill="url(#umInstBody)"
    />
    {/* Left edge specular */}
    <line
      x1="7"
      y1="2.5"
      x2="7"
      y2="22"
      stroke="#283060"
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.42"
    />
    {/* Right edge shadow */}
    <line
      x1="17"
      y1="2.5"
      x2="17"
      y2="22"
      stroke="#03050C"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.28"
    />
    {/* Volume buttons — left */}
    <rect
      x="5.2"
      y="7"
      width="0.8"
      height="2.8"
      rx="0.4"
      fill="#1C2640"
      opacity="0.70"
    />
    <rect
      x="5.2"
      y="11"
      width="0.8"
      height="2.0"
      rx="0.4"
      fill="#1C2640"
      opacity="0.70"
    />
    {/* Power button — right */}
    <rect
      x="18"
      y="8.5"
      width="0.8"
      height="3.2"
      rx="0.4"
      fill="#1C2640"
      opacity="0.70"
    />
    {/* Top speaker grille */}
    <rect
      x="10.2"
      y="3"
      width="3.6"
      height="0.75"
      rx="0.38"
      fill="#08101C"
      opacity="0.65"
    />
    {/* Front camera dot */}
    <circle cx="14.5" cy="3.4" r="0.5" fill="#06080E" opacity="0.60" />

    {/* ── Screen ── */}
    <rect
      x="7.5"
      y="4.5"
      width="9"
      height="13"
      rx="1.2"
      fill="url(#umInstScr)"
    />
    {/* Screen gloss overlay */}
    <rect
      x="7.5"
      y="4.5"
      width="9"
      height="13"
      rx="1.2"
      fill="url(#umInstGl)"
    />
    {/* Screen specular arc */}
    <path
      d="M8.5 5.5A5 5 0 0 1 12 4.8"
      stroke="#FFFFFF"
      strokeWidth="0.65"
      strokeLinecap="round"
      fill="none"
      opacity="0.28"
    />

    {/* ── Download arrow on screen ── */}
    {/* Shaft */}
    <line
      x1="12"
      y1="6.5"
      x2="12"
      y2="12.5"
      stroke="url(#umInstArr)"
      strokeWidth="1.85"
      strokeLinecap="round"
    />
    {/* Arrowhead */}
    <path
      d="M9.2 11.2L12 14.5L14.8 11.2"
      stroke="url(#umInstArr)"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Tray / base line */}
    <line
      x1="9.2"
      y1="16"
      x2="14.8"
      y2="16"
      stroke="url(#umInstArr)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Arrow soft glow halo */}
    <line
      x1="12"
      y1="6.5"
      x2="12"
      y2="12.5"
      stroke="#22E8B0"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.32"
    />

    {/* ── Home button ── */}
    <circle cx="12" cy="20" r="1.3" fill="url(#umInstBtn)" />
    <circle
      cx="12"
      cy="20"
      r="0.85"
      stroke="#283060"
      strokeWidth="0.45"
      fill="none"
      opacity="0.55"
    />

    {/* ── Body outline ── */}
    <rect
      x="6"
      y="1.5"
      width="12"
      height="21"
      rx="2.5"
      stroke="#1C2438"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

// ── Bookmarks — iOS-style: crimson gradient ribbon, glossy dome, gold star emblem, notched tail ──
export const BookmarksIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Ribbon body: bright rose highlight → rich crimson → deep burgundy shadow */}
      <linearGradient
        id="umBkRbn"
        x1="6"
        y1="2"
        x2="18"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F0486E" />
        <stop offset="42%" stopColor="#C81838" />
        <stop offset="100%" stopColor="#7A0A1E" />
      </linearGradient>
      {/* Ribbon gloss dome */}
      <radialGradient id="umBkGl" cx="34%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Star emblem: bright ivory-gold core → warm amber */}
      <radialGradient id="umBkStar" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#FFFDE0" />
        <stop offset="100%" stopColor="#E8C020" />
      </radialGradient>
    </defs>

    {/* ── Ribbon body (notched tail at bottom) ── */}
    <path
      d="M6 3.5A1.5 1.5 0 0 1 7.5 2H16.5A1.5 1.5 0 0 1 18 3.5V21.2A0.6 0.6 0 0 1 17.05 21.7L12 18.1L6.95 21.7A0.6 0.6 0 0 1 6 21.2Z"
      fill="url(#umBkRbn)"
    />
    {/* Left edge specular */}
    <path
      d="M7.6 3.4V19.6"
      stroke="#FF88A0"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.42"
    />
    {/* Right edge shadow */}
    <path
      d="M16.4 3.4V19.6"
      stroke="#5A0814"
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.30"
    />
    {/* Gloss dome overlay */}
    <path
      d="M6 3.5A1.5 1.5 0 0 1 7.5 2H16.5A1.5 1.5 0 0 1 18 3.5V21.2A0.6 0.6 0 0 1 17.05 21.7L12 18.1L6.95 21.7A0.6 0.6 0 0 1 6 21.2Z"
      fill="url(#umBkGl)"
    />

    {/* ── Star emblem ── */}
    <path
      d="M12 6.2L12.85 8.6L15.4 8.7L13.4 10.25L14.1 12.7L12 11.25L9.9 12.7L10.6 10.25L8.6 8.7L11.15 8.6Z"
      fill="url(#umBkStar)"
      opacity="0.9"
    />
    {/* Star glint */}
    <circle cx="11.4" cy="9.0" r="0.5" fill="#FFFDE0" opacity="0.62" />

    {/* ── Ribbon outline ── */}
    <path
      d="M6 3.5A1.5 1.5 0 0 1 7.5 2H16.5A1.5 1.5 0 0 1 18 3.5V21.2A0.6 0.6 0 0 1 17.05 21.7L12 18.1L6.95 21.7A0.6 0.6 0 0 1 6 21.2Z"
      stroke="#8A0C1E"
      strokeWidth="0.55"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

// ── Push pin — iOS-style: crimson enamel head with glossy dome, brushed steel collar, tapered needle, cast shadow ──
export const PushPinIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Enamel head: bright rose crest → rich crimson → deep burgundy */}
      <linearGradient
        id="umPinHead"
        x1="7"
        y1="3"
        x2="18"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FF6A88" />
        <stop offset="40%" stopColor="#D81E40" />
        <stop offset="100%" stopColor="#7E0A1E" />
      </linearGradient>
      {/* Head gloss dome */}
      <radialGradient id="umPinGloss" cx="34%" cy="26%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
        <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Collar: brushed steel, lit from the upper left */}
      <linearGradient
        id="umPinCollar"
        x1="7.5"
        y1="12"
        x2="16.5"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F2F5F8" />
        <stop offset="45%" stopColor="#B4BEC8" />
        <stop offset="100%" stopColor="#6A7480" />
      </linearGradient>
      {/* Needle: steel highlight down one edge, shadow down the other */}
      <linearGradient
        id="umPinNeedle"
        x1="10.6"
        y1="16"
        x2="13.4"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#E8EDF2" />
        <stop offset="50%" stopColor="#98A2AE" />
        <stop offset="100%" stopColor="#4A5460" />
      </linearGradient>
    </defs>

    {/* ── Contact shadow under the point ── */}
    <ellipse
      cx="12"
      cy="21.4"
      rx="3.1"
      ry="0.85"
      fill="#0A0A0A"
      opacity="0.16"
    />

    {/* ── Needle, tapering to the point ── */}
    <path
      d="M11.1 15.4H12.9L12.35 20.9A0.35 0.35 0 0 1 11.65 20.9Z"
      fill="url(#umPinNeedle)"
    />
    {/* Needle specular */}
    <path
      d="M11.5 15.8L11.9 20.3"
      stroke="#FFFFFF"
      strokeWidth="0.42"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* ── Steel collar between head and needle ── */}
    <path
      d="M8.5 12.4H15.5A0.9 0.9 0 0 1 15.5 15.6H8.5A0.9 0.9 0 0 1 8.5 12.4Z"
      fill="url(#umPinCollar)"
    />
    {/* Collar top edge highlight */}
    <path
      d="M9.1 13.15H14.9"
      stroke="#FFFFFF"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    {/* Collar underside shadow */}
    <path
      d="M9.3 14.95H14.7"
      stroke="#3A424C"
      strokeWidth="0.45"
      strokeLinecap="round"
      opacity="0.35"
    />

    {/* ── Enamel head ── */}
    <path
      d="M12 2.4A4.6 4.6 0 0 1 16.6 7V11.1A1.3 1.3 0 0 1 15.3 12.4H8.7A1.3 1.3 0 0 1 7.4 11.1V7A4.6 4.6 0 0 1 12 2.4Z"
      fill="url(#umPinHead)"
    />
    {/* Head gloss overlay */}
    <path
      d="M12 2.4A4.6 4.6 0 0 1 16.6 7V11.1A1.3 1.3 0 0 1 15.3 12.4H8.7A1.3 1.3 0 0 1 7.4 11.1V7A4.6 4.6 0 0 1 12 2.4Z"
      fill="url(#umPinGloss)"
    />
    {/* Left specular edge */}
    <path
      d="M9.2 6.4V11.4"
      stroke="#FF9AAE"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Right shadow edge */}
    <path
      d="M14.9 6.4V11.4"
      stroke="#5E0716"
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.32"
    />
    {/* Crown glint */}
    <ellipse
      cx="10.6"
      cy="5.5"
      rx="1.35"
      ry="0.95"
      fill="#FFFFFF"
      opacity="0.5"
      transform="rotate(-24 10.6 5.5)"
    />

    {/* ── Head outline ── */}
    <path
      d="M12 2.4A4.6 4.6 0 0 1 16.6 7V11.1A1.3 1.3 0 0 1 15.3 12.4H8.7A1.3 1.3 0 0 1 7.4 11.1V7A4.6 4.6 0 0 1 12 2.4Z"
      stroke="#7A0A1C"
      strokeWidth="0.55"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

// ── Terms — iOS-style: parchment page with folded corner, gold header band, sepia text lines, crimson wax seal ──
export const TermsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Page: bright ivory upper-left → warm cream → amber lower-right */}
      <linearGradient
        id="umTcPage"
        x1="4"
        y1="2"
        x2="18"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFB" />
        <stop offset="52%" stopColor="#F8F0DC" />
        <stop offset="100%" stopColor="#ECD8A8" />
      </linearGradient>
      {/* Gold header band: dark edge → bright gold crest → dark edge */}
      <linearGradient
        id="umTcBand"
        x1="4"
        y1="2"
        x2="18"
        y2="2"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#9A7010" />
        <stop offset="44%" stopColor="#E8C030" />
        <stop offset="100%" stopColor="#9A7010" />
      </linearGradient>
      {/* Wax seal: bright rose core → deep crimson edge */}
      <radialGradient id="umTcSeal" cx="36%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#FF5070" />
        <stop offset="52%" stopColor="#B81828" />
        <stop offset="100%" stopColor="#6A0810" />
      </radialGradient>
      {/* Folded corner shadow: slightly darker parchment */}
      <linearGradient
        id="umTcFold"
        x1="14"
        y1="2"
        x2="18"
        y2="6"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#E8D8A8" />
        <stop offset="100%" stopColor="#C8B888" />
      </linearGradient>
    </defs>

    {/* ── Page body (clipped top-right corner) ── */}
    <path d="M4 2H14L18 6V22H4Z" fill="url(#umTcPage)" />
    {/* Left edge specular */}
    <line
      x1="4"
      y1="2"
      x2="4"
      y2="22"
      stroke="#FFFEF4"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.60"
    />
    {/* Right edge shadow */}
    <line
      x1="18"
      y1="6"
      x2="18"
      y2="22"
      stroke="#C8A840"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.35"
    />

    {/* ── Folded corner ── */}
    <path d="M14 2L18 6H14Z" fill="url(#umTcFold)" />
    <path d="M14 2L18 6" stroke="#A88820" strokeWidth="0.5" opacity="0.42" />
    <path
      d="M14 2L18 6H14Z"
      stroke="#C8A840"
      strokeWidth="0.45"
      fill="none"
      opacity="0.42"
    />

    {/* ── Gold header band ── */}
    <rect x="4" y="2" width="10" height="2.8" fill="url(#umTcBand)" />
    {/* Band specular line */}
    <line
      x1="5"
      y1="2.9"
      x2="13"
      y2="2.9"
      stroke="#FFF080"
      strokeWidth="0.38"
      strokeLinecap="round"
      opacity="0.48"
    />

    {/* ── Text lines ── */}
    <rect
      x="6.5"
      y="7.2"
      width="1.8"
      height="2.0"
      rx="0.25"
      fill="#A87828"
      opacity="0.40"
    />
    <line
      x1="6.5"
      y1="7.5"
      x2="15.5"
      y2="7.5"
      stroke="#A87828"
      strokeWidth="0.88"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="9.8"
      x2="15.5"
      y2="9.8"
      stroke="#A87828"
      strokeWidth="0.88"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="12.1"
      x2="15.5"
      y2="12.1"
      stroke="#A87828"
      strokeWidth="0.88"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="14.4"
      x2="15.5"
      y2="14.4"
      stroke="#A87828"
      strokeWidth="0.88"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="16.7"
      x2="11.5"
      y2="16.7"
      stroke="#A87828"
      strokeWidth="0.88"
      strokeLinecap="round"
      opacity="0.72"
    />

    {/* ── Wax seal ── */}
    <circle cx="14.8" cy="19" r="2.7" fill="url(#umTcSeal)" />
    {/* Seal inner ring */}
    <circle
      cx="14.8"
      cy="19"
      r="1.85"
      stroke="#FF7888"
      strokeWidth="0.48"
      fill="none"
      opacity="0.42"
    />
    {/* Seal star impression */}
    <path
      d="M14.8 17.2L15.28 18.5L16.6 18.5L15.6 19.28L15.98 20.6L14.8 19.85L13.62 20.6L14.0 19.28L13.0 18.5L14.32 18.5Z"
      fill="#FFFFFF"
      opacity="0.28"
    />
    {/* Seal specular glint */}
    <circle cx="14.1" cy="18.2" r="0.46" fill="#FF90A0" opacity="0.55" />

    {/* ── Page outline ── */}
    <path
      d="M4 2H14L18 6V22H4Z"
      stroke="#C8A840"
      strokeWidth="0.5"
      fill="none"
      opacity="0.42"
    />
  </svg>
);

// ── FAQs — iOS-style: deep blue gradient speech bubble, glass dome, white stroke question mark, bright tail ──
export const FAQsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bubble: deep navy left → cornflower blue center → mid blue right */}
      <linearGradient
        id="umFaqBbl"
        x1="2"
        y1="2"
        x2="22"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#0C1A60" />
        <stop offset="38%" stopColor="#1E40C0" />
        <stop offset="70%" stopColor="#2E58D8" />
        <stop offset="100%" stopColor="#0E1E70" />
      </linearGradient>
      {/* Tail: matches bubble base color */}
      <linearGradient
        id="umFaqTl"
        x1="2"
        y1="17"
        x2="8"
        y2="23"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1E40C0" />
        <stop offset="100%" stopColor="#0C1A60" />
      </linearGradient>
      {/* Glass dome gloss */}
      <radialGradient id="umFaqGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.52" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Bubble tail ── */}
    <path d="M4 17.5Q3 20.5 2 23L8 18Z" fill="url(#umFaqTl)" />

    {/* ── Bubble body ── */}
    <rect x="2" y="2" width="20" height="16" rx="5" fill="url(#umFaqBbl)" />
    {/* Shadow fold — right-bottom edge */}
    <path
      d="M19 2.5Q22 5 22.2 8Q22.4 12 21.5 17.5L19 18Q21 14 21 9Q20.8 5.2 19 2.5Z"
      fill="#0A1450"
      opacity="0.28"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M4.5 4.5A10 10 0 0 1 11 2.8"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.52"
    />
    {/* Glass dome overlay */}
    <rect x="2" y="2" width="20" height="16" rx="5" fill="url(#umFaqGl)" />

    {/* ── Question mark (white stroke paths) ── */}
    {/* Arc of the ? */}
    <path
      d="M9.2 9.2Q9.2 5.5 12 5.5Q14.8 5.5 14.8 8Q14.8 10.2 12 11L12 12.8"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.95"
    />
    {/* Dot of the ? */}
    <circle cx="12" cy="14.5" r="1.2" fill="#FFFFFF" opacity="0.95" />

    {/* ── Bubble outline ── */}
    <rect
      x="2"
      y="2"
      width="20"
      height="16"
      rx="5"
      stroke="#1030A0"
      strokeWidth="0.55"
      fill="none"
      opacity="0.42"
    />
  </svg>
);

// ── HelpSupport — iOS-style: metallic graphite headset arc, gradient ear cups with grille, mic boom arm and capsule ──
export const HelpSupportIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Headband: dark shadow edge → bright silver crest → dark shadow edge */}
      <linearGradient
        id="umHlpBand"
        x1="4.5"
        y1="15"
        x2="4.5"
        y2="5"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#282C38" />
        <stop offset="42%" stopColor="#6A7080" />
        <stop offset="70%" stopColor="#8A9098" />
        <stop offset="100%" stopColor="#1C2028" />
      </linearGradient>
      {/* Ear cup body: near-black left → dark slate → charcoal-blue highlight right */}
      <linearGradient
        id="umHlpCup"
        x1="0"
        y1="15"
        x2="9"
        y2="19"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#10141E" />
        <stop offset="40%" stopColor="#1C2030" />
        <stop offset="75%" stopColor="#283040" />
        <stop offset="100%" stopColor="#0C1018" />
      </linearGradient>
      {/* Ear cup gloss dome */}
      <radialGradient id="umHlpGl" cx="32%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Mic arm and capsule: dark steel → silver highlight */}
      <linearGradient
        id="umHlpMic"
        x1="4"
        y1="18"
        x2="10"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#484C58" />
        <stop offset="55%" stopColor="#787C88" />
        <stop offset="100%" stopColor="#303440" />
      </linearGradient>
      {/* Padding strip on headband */}
      <linearGradient
        id="umHlpPad"
        x1="8"
        y1="8"
        x2="16"
        y2="8"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1C2028" />
        <stop offset="50%" stopColor="#383C48" />
        <stop offset="100%" stopColor="#1C2028" />
      </linearGradient>
    </defs>

    {/* ── Headband arc ── */}
    <path
      d="M4.5 15Q4.5 3 19.5 15"
      stroke="url(#umHlpBand)"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Headband specular streak */}
    <path
      d="M5.5 13Q5.8 5 18.5 13"
      stroke="#A0A8B0"
      strokeWidth="0.65"
      strokeLinecap="round"
      fill="none"
      opacity="0.38"
    />
    {/* Headband padding strip */}
    <path
      d="M8.5 9Q12 5.5 15.5 9"
      stroke="url(#umHlpPad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* ── Left ear cup ── */}
    <circle cx="4.5" cy="15.5" r="3.5" fill="url(#umHlpCup)" />
    {/* Left cup gloss */}
    <circle cx="4.5" cy="15.5" r="3.5" fill="url(#umHlpGl)" />
    {/* Left cup inner grille ring */}
    <circle
      cx="4.5"
      cy="15.5"
      r="2.2"
      stroke="#384050"
      strokeWidth="0.55"
      fill="none"
      opacity="0.55"
    />
    {/* Left cup grille dots */}
    <circle cx="4.5" cy="14.5" r="0.5" fill="#384050" opacity="0.50" />
    <circle cx="3.55" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    <circle cx="5.45" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    {/* Left cup specular glint */}
    <circle cx="3.4" cy="14.3" r="0.55" fill="#7A8090" opacity="0.52" />
    {/* Left cup outline */}
    <circle
      cx="4.5"
      cy="15.5"
      r="3.5"
      stroke="#1A1E28"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />

    {/* ── Right ear cup ── */}
    <circle cx="19.5" cy="15.5" r="3.5" fill="url(#umHlpCup)" />
    {/* Right cup gloss */}
    <circle cx="19.5" cy="15.5" r="3.5" fill="url(#umHlpGl)" />
    {/* Right cup inner grille ring */}
    <circle
      cx="19.5"
      cy="15.5"
      r="2.2"
      stroke="#384050"
      strokeWidth="0.55"
      fill="none"
      opacity="0.55"
    />
    {/* Right cup grille dots */}
    <circle cx="19.5" cy="14.5" r="0.5" fill="#384050" opacity="0.50" />
    <circle cx="18.55" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    <circle cx="20.45" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    {/* Right cup specular glint */}
    <circle cx="18.4" cy="14.3" r="0.55" fill="#7A8090" opacity="0.52" />
    {/* Right cup outline */}
    <circle
      cx="19.5"
      cy="15.5"
      r="3.5"
      stroke="#1A1E28"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />

    {/* ── Mic boom arm ── */}
    <path
      d="M3.2 18.2Q3.5 21.5 8.5 21.5"
      stroke="url(#umHlpMic)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Mic arm specular */}
    <path
      d="M3.5 18.5Q3.8 21 8.5 21"
      stroke="#8890A0"
      strokeWidth="0.4"
      strokeLinecap="round"
      fill="none"
      opacity="0.38"
    />
    {/* Mic capsule */}
    <rect
      x="8.5"
      y="20"
      width="3.2"
      height="3"
      rx="1.5"
      fill="url(#umHlpMic)"
    />
    {/* Capsule specular */}
    <rect
      x="8.9"
      y="20.4"
      width="1.2"
      height="0.7"
      rx="0.35"
      fill="#8890A0"
      opacity="0.42"
    />
    {/* Capsule outline */}
    <rect
      x="8.5"
      y="20"
      width="3.2"
      height="3"
      rx="1.5"
      stroke="#1A1E28"
      strokeWidth="0.42"
      fill="none"
      opacity="0.42"
    />
  </svg>
);

// ── Logout — iOS-style: three-piece mahogany door bracket, gold knob, crimson exit arrow with glow ──
export const LogoutIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bracket: near-black shadow left → warm mahogany → brown highlight right */}
      <linearGradient
        id="umLoBkt"
        x1="3"
        y1="12"
        x2="15.2"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#180A04" />
        <stop offset="35%" stopColor="#502010" />
        <stop offset="68%" stopColor="#6E3018" />
        <stop offset="100%" stopColor="#240E06" />
      </linearGradient>
      {/* Exit arrow: bright crimson → deep red → burgundy */}
      <linearGradient
        id="umLoArr"
        x1="8"
        y1="12"
        x2="21"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FF4848" />
        <stop offset="50%" stopColor="#D01828" />
        <stop offset="100%" stopColor="#8A0A18" />
      </linearGradient>
      {/* Gold knob: bright ivory-gold core → deep amber */}
      <radialGradient id="umLoKnob" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#F0D040" />
        <stop offset="55%" stopColor="#C89018" />
        <stop offset="100%" stopColor="#8A6008" />
      </radialGradient>
      {/* Bracket gloss dome */}
      <radialGradient id="umLoGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Left vertical bar ── */}
    <rect x="3" y="3" width="3.2" height="18" rx="1" fill="url(#umLoBkt)" />
    <rect x="3" y="3" width="3.2" height="18" rx="1" fill="url(#umLoGl)" />
    <line
      x1="4.2"
      y1="4"
      x2="4.2"
      y2="20"
      stroke="#C06030"
      strokeWidth="0.55"
      strokeLinecap="round"
      opacity="0.35"
    />
    <rect
      x="3"
      y="3"
      width="3.2"
      height="18"
      rx="1"
      stroke="#180A04"
      strokeWidth="0.45"
      fill="none"
      opacity="0.45"
    />

    {/* ── Top horizontal bar ── */}
    <rect x="3" y="3" width="12.2" height="3.2" rx="1" fill="url(#umLoBkt)" />
    <rect x="3" y="3" width="12.2" height="3.2" rx="1" fill="url(#umLoGl)" />
    <line
      x1="4"
      y1="4.1"
      x2="14.5"
      y2="4.1"
      stroke="#C06030"
      strokeWidth="0.55"
      strokeLinecap="round"
      opacity="0.35"
    />
    <rect
      x="3"
      y="3"
      width="12.2"
      height="3.2"
      rx="1"
      stroke="#180A04"
      strokeWidth="0.45"
      fill="none"
      opacity="0.45"
    />

    {/* ── Bottom horizontal bar ── */}
    <rect
      x="3"
      y="17.8"
      width="12.2"
      height="3.2"
      rx="1"
      fill="url(#umLoBkt)"
    />
    <rect x="3" y="17.8" width="12.2" height="3.2" rx="1" fill="url(#umLoGl)" />
    <line
      x1="4"
      y1="18.9"
      x2="14.5"
      y2="18.9"
      stroke="#C06030"
      strokeWidth="0.55"
      strokeLinecap="round"
      opacity="0.35"
    />
    <rect
      x="3"
      y="17.8"
      width="12.2"
      height="3.2"
      rx="1"
      stroke="#180A04"
      strokeWidth="0.45"
      fill="none"
      opacity="0.45"
    />

    {/* ── Door interior panel detail lines ── */}
    <line
      x1="7"
      y1="8.5"
      x2="13.5"
      y2="8.5"
      stroke="#5A2810"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.45"
    />
    <line
      x1="7"
      y1="15.5"
      x2="13.5"
      y2="15.5"
      stroke="#5A2810"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.40"
    />

    {/* ── Exit arrow shaft (rendered before knob so knob sits on top) ── */}
    <line
      x1="8"
      y1="12"
      x2="20.5"
      y2="12"
      stroke="url(#umLoArr)"
      strokeWidth="2.0"
      strokeLinecap="round"
    />
    {/* Arrow soft glow halo */}
    <line
      x1="8"
      y1="12"
      x2="20.5"
      y2="12"
      stroke="#FF4848"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.28"
    />

    {/* ── Gold door knob (on top of arrow shaft) ── */}
    <circle cx="13.2" cy="12" r="1.4" fill="url(#umLoKnob)" />
    <circle cx="12.75" cy="11.55" r="0.46" fill="#FFFDE0" opacity="0.62" />

    {/* ── Exit arrowhead ── */}
    <path
      d="M17.5 9L21 12L17.5 15"
      stroke="url(#umLoArr)"
      strokeWidth="2.0"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ── Stories — iOS-style: gradient indigo cover, parchment pages, crimson bookmark ribbon, glass gloss ──
export const StoriesIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Cover: deep indigo shadow → rich violet crest → deep indigo */}
      <linearGradient
        id="umStCvr"
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#2A2080" />
        <stop offset="40%" stopColor="#5040C0" />
        <stop offset="70%" stopColor="#7058E0" />
        <stop offset="100%" stopColor="#282078" />
      </linearGradient>
      {/* Spine: darker vertical band */}
      <linearGradient
        id="umStSpn"
        x1="4"
        y1="12"
        x2="8"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1E1860" />
        <stop offset="100%" stopColor="#4838A8" stopOpacity="0" />
      </linearGradient>
      {/* Pages: bright ivory top → warm cream bottom */}
      <linearGradient
        id="umStPgs"
        x1="12"
        y1="6"
        x2="12"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFB" />
        <stop offset="60%" stopColor="#F6F0DE" />
        <stop offset="100%" stopColor="#E6D6AE" />
      </linearGradient>
      {/* Ribbon: bright coral tip → deep crimson base */}
      <linearGradient
        id="umStRbn"
        x1="16.5"
        y1="4"
        x2="16.5"
        y2="11"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FF5048" />
        <stop offset="100%" stopColor="#A80E20" />
      </linearGradient>
      {/* Glass gloss: white core → transparent edge */}
      <radialGradient id="umStGls" cx="30%" cy="22%" r="75%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Book cover ── */}
    <rect x="4" y="3" width="16" height="18" rx="2.4" fill="url(#umStCvr)" />
    {/* Spine shading */}
    <rect x="4" y="3" width="4" height="18" rx="2.4" fill="url(#umStSpn)" />
    {/* Spine ridge line */}
    <line
      x1="7.2"
      y1="3.4"
      x2="7.2"
      y2="20.6"
      stroke="#1A1450"
      strokeWidth="0.6"
      opacity="0.55"
    />

    {/* ── Page block on fore-edge ── */}
    <path
      d="M20 5.2v13.6c0 .9-.7 1.6-1.6 1.6H18V3.6h.4c.9 0 1.6.7 1.6 1.6Z"
      fill="url(#umStPgs)"
    />
    {/* Page separation lines */}
    <line
      x1="18.5"
      y1="4.6"
      x2="18.5"
      y2="19.4"
      stroke="#C8B078"
      strokeWidth="0.35"
      opacity="0.6"
    />
    <line
      x1="19.2"
      y1="4.9"
      x2="19.2"
      y2="19.1"
      stroke="#C8B078"
      strokeWidth="0.3"
      opacity="0.45"
    />

    {/* ── Bookmark ribbon ── */}
    <path d="M14.6 3h3.6v7.4l-1.8-1.7-1.8 1.7V3Z" fill="url(#umStRbn)" />
    {/* Ribbon center crease */}
    <line
      x1="16.4"
      y1="3.4"
      x2="16.4"
      y2="8.2"
      stroke="#FF8880"
      strokeWidth="0.35"
      opacity="0.5"
    />

    {/* ── Cover embossing: title bars ── */}
    <line
      x1="7"
      y1="9"
      x2="12.6"
      y2="9"
      stroke="#C8BCFF"
      strokeWidth="1.15"
      strokeLinecap="round"
      opacity="0.85"
    />
    <line
      x1="7"
      y1="12"
      x2="14.8"
      y2="12"
      stroke="#A89CF0"
      strokeWidth="0.85"
      strokeLinecap="round"
      opacity="0.6"
    />
    <line
      x1="7"
      y1="14.6"
      x2="13.6"
      y2="14.6"
      stroke="#A89CF0"
      strokeWidth="0.85"
      strokeLinecap="round"
      opacity="0.45"
    />
    {/* Embossed star accent */}
    <path
      d="M9.4 17.4l.5 1 1.1.16-.8.78.19 1.1-.99-.52-.99.52.19-1.1-.8-.78 1.1-.16.5-1Z"
      fill="#E8C848"
      opacity="0.9"
    />

    {/* ── Glass gloss overlay ── */}
    <rect x="4" y="3" width="16" height="18" rx="2.4" fill="url(#umStGls)" />
    {/* Specular arc — upper-left corner */}
    <path
      d="M5.5 6.5A2.5 2.5 0 0 1 8 4.2"
      stroke="#FFFFFF"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />

    {/* ── Cover rim outline ── */}
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2.4"
      stroke="#1E1860"
      strokeWidth="0.5"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

// ── Home — iOS-style: gradient sky-blue roof, parchment wall, gloss overlay, walnut door, porthole window ──
export const HomeIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Roof: bright sky highlight → mid azure → deep navy shadow */}
      <linearGradient
        id="umHmRoof"
        x1="2"
        y1="3"
        x2="22"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#5CC0FF" />
        <stop offset="40%" stopColor="#2E90E8" />
        <stop offset="75%" stopColor="#1A68C0" />
        <stop offset="100%" stopColor="#0E3E88" />
      </linearGradient>
      {/* Wall: bright ivory upper-left → warm cream → amber lower-right */}
      <linearGradient
        id="umHmWall"
        x1="5"
        y1="11"
        x2="19"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#FFFFFB" />
        <stop offset="55%" stopColor="#F8F0DC" />
        <stop offset="100%" stopColor="#ECD8A8" />
      </linearGradient>
      {/* Door: warm walnut top → deep umber base */}
      <linearGradient
        id="umHmDoor"
        x1="9.6"
        y1="14.6"
        x2="14.4"
        y2="21.6"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#8A5A20" />
        <stop offset="55%" stopColor="#6A4010" />
        <stop offset="100%" stopColor="#40260A" />
      </linearGradient>
      {/* Window glass: bright sky core → deep azure edge */}
      <radialGradient id="umHmWin" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#D0F0FF" />
        <stop offset="55%" stopColor="#3AA0E0" />
        <stop offset="100%" stopColor="#1560A8" />
      </radialGradient>
      {/* Gloss dome overlay */}
      <radialGradient id="umHmGl" cx="30%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Chimney ── */}
    <rect x="15" y="4.4" width="2" height="4.2" fill="url(#umHmRoof)" />
    <rect
      x="15"
      y="4.4"
      width="2"
      height="4.2"
      stroke="#0E3E88"
      strokeWidth="0.4"
      fill="none"
      opacity="0.4"
    />

    {/* ── Roof ── */}
    <path
      d="M2 12L12 3L22 12L20.3 13.6L12 6.4L3.7 13.6Z"
      fill="url(#umHmRoof)"
    />
    {/* Roof specular streak */}
    <path
      d="M5.5 11.3L12 5.8"
      stroke="#FFFFFF"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Roof shadow fold — right slope */}
    <path
      d="M12 6.4L19.6 13L18.6 14Q14.8 10.6 12 8.2Z"
      fill="#0A2E68"
      opacity="0.22"
    />
    {/* Roof outline */}
    <path
      d="M2 12L12 3L22 12L20.3 13.6L12 6.4L3.7 13.6Z"
      stroke="#0E3E88"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />

    {/* ── Wall body ── */}
    <rect x="5" y="12" width="14" height="9.6" rx="1" fill="url(#umHmWall)" />
    {/* Left face specular */}
    <line
      x1="6"
      y1="12.7"
      x2="6"
      y2="21.2"
      stroke="#FFFFFF"
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Right face shadow */}
    <line
      x1="18.3"
      y1="12.7"
      x2="18.3"
      y2="21.2"
      stroke="#B89860"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.32"
    />
    {/* Gloss overlay */}
    <rect x="5" y="12" width="14" height="9.6" rx="1" fill="url(#umHmGl)" />
    {/* Wall outline */}
    <rect
      x="5"
      y="12"
      width="14"
      height="9.6"
      rx="1"
      stroke="#B89860"
      strokeWidth="0.5"
      fill="none"
      opacity="0.4"
    />

    {/* ── Porthole window ── */}
    <circle cx="8" cy="15.7" r="1.7" fill="url(#umHmWin)" />
    <line
      x1="6.5"
      y1="15.7"
      x2="9.5"
      y2="15.7"
      stroke="#FFFFFF"
      strokeWidth="0.35"
      opacity="0.55"
    />
    <line
      x1="8"
      y1="14.2"
      x2="8"
      y2="17.2"
      stroke="#FFFFFF"
      strokeWidth="0.35"
      opacity="0.55"
    />
    <circle
      cx="8"
      cy="15.7"
      r="1.7"
      stroke="#1560A8"
      strokeWidth="0.4"
      fill="none"
      opacity="0.45"
    />

    {/* ── Door ── */}
    <rect
      x="9.6"
      y="14.6"
      width="4.8"
      height="7"
      rx="1.6"
      fill="url(#umHmDoor)"
    />
    {/* Doorknob */}
    <circle cx="13.6" cy="18.1" r="0.42" fill="#F0D040" opacity="0.85" />
    {/* Door outline */}
    <rect
      x="9.6"
      y="14.6"
      width="4.8"
      height="7"
      rx="1.6"
      stroke="#40260A"
      strokeWidth="0.45"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

// ── Friends — iOS-style: azure-blue front figure, violet figure behind, gloss domes, specular arcs on each silhouette ──
export const FriendsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Front figure: bright azure highlight → mid blue → deep navy shadow */}
      <linearGradient
        id="umFrBlu"
        x1="2"
        y1="10"
        x2="14"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#57B8FF" />
        <stop offset="40%" stopColor="#2C86E8" />
        <stop offset="75%" stopColor="#1A5CC0" />
        <stop offset="100%" stopColor="#0E3688" />
      </linearGradient>
      {/* Back figure: bright violet highlight → mid amethyst → deep indigo shadow */}
      <linearGradient
        id="umFrVio"
        x1="10"
        y1="6"
        x2="22"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#9860E0" />
        <stop offset="38%" stopColor="#7038C0" />
        <stop offset="72%" stopColor="#5024A0" />
        <stop offset="100%" stopColor="#301468" />
      </linearGradient>
      {/* Gloss dome — front figure */}
      <radialGradient id="umFrGlB" cx="32%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Gloss dome — back figure */}
      <radialGradient id="umFrGlV" cx="32%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Back figure (violet, upper-right) ── */}
    <circle cx="15.6" cy="7.4" r="2.35" fill="url(#umFrVio)" />
    <path
      d="M11.9 19.2Q11.9 11.6 15.6 11.6Q19.3 11.6 19.3 19.2Z"
      fill="url(#umFrVio)"
    />
    {/* Shadow fold — right edge */}
    <path
      d="M17.6 12.2Q19.3 14.5 19.3 17Q19.3 18.4 18.8 19.2"
      stroke="#200E48"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.25"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M13 13Q13.3 12 14.3 11.7"
      stroke="#FFFFFF"
      strokeWidth="0.7"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
    {/* Gloss overlay */}
    <circle cx="15.6" cy="7.4" r="2.35" fill="url(#umFrGlV)" />
    <path
      d="M11.9 19.2Q11.9 11.6 15.6 11.6Q19.3 11.6 19.3 19.2Z"
      fill="url(#umFrGlV)"
    />
    {/* Outlines */}
    <circle
      cx="15.6"
      cy="7.4"
      r="2.35"
      stroke="#2A1060"
      strokeWidth="0.45"
      fill="none"
      opacity="0.4"
    />
    <path
      d="M11.9 19.2Q11.9 11.6 15.6 11.6Q19.3 11.6 19.3 19.2Z"
      stroke="#2A1060"
      strokeWidth="0.45"
      fill="none"
      opacity="0.4"
    />

    {/* ── Front figure (azure blue, lower-left, overlapping) ── */}
    <circle cx="8.3" cy="9" r="2.75" fill="url(#umFrBlu)" />
    <path d="M3.3 21.6Q3.3 13 8.3 13Q13.3 13 13.3 21.6Z" fill="url(#umFrBlu)" />
    {/* Shadow fold — right edge */}
    <path
      d="M11 14Q13.3 16.6 13.3 19.5Q13.3 20.7 12.9 21.6"
      stroke="#0A1E50"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.25"
    />
    {/* Specular arc — upper-left */}
    <path
      d="M4.6 14.3Q5 12.6 6.6 12"
      stroke="#FFFFFF"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />
    {/* Gloss overlay */}
    <circle cx="8.3" cy="9" r="2.75" fill="url(#umFrGlB)" />
    <path d="M3.3 21.6Q3.3 13 8.3 13Q13.3 13 13.3 21.6Z" fill="url(#umFrGlB)" />
    {/* Outlines */}
    <circle
      cx="8.3"
      cy="9"
      r="2.75"
      stroke="#0E2E70"
      strokeWidth="0.48"
      fill="none"
      opacity="0.42"
    />
    <path
      d="M3.3 21.6Q3.3 13 8.3 13Q13.3 13 13.3 21.6Z"
      stroke="#0E2E70"
      strokeWidth="0.48"
      fill="none"
      opacity="0.42"
    />
  </svg>
);

// ── Library — iOS-style: shelf of three gradient book spines (crimson/teal/gold), gloss domes, embossed title bands, wooden shelf ──
export const LibraryIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Book 1 spine: bright rose → rich crimson → deep burgundy */}
      <linearGradient
        id="umLbB1"
        x1="3"
        y1="4"
        x2="8"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F0486E" />
        <stop offset="45%" stopColor="#C81838" />
        <stop offset="100%" stopColor="#7A0A1E" />
      </linearGradient>
      {/* Book 2 spine: bright aqua → teal → deep teal */}
      <linearGradient
        id="umLbB2"
        x1="9"
        y1="3"
        x2="14"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#14C8A8" />
        <stop offset="45%" stopColor="#0BA88E" />
        <stop offset="100%" stopColor="#047A6A" />
      </linearGradient>
      {/* Book 3 spine: bright amber → gold → deep gold */}
      <linearGradient
        id="umLbB3"
        x1="15"
        y1="5"
        x2="20"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#F0C830" />
        <stop offset="45%" stopColor="#D4A018" />
        <stop offset="100%" stopColor="#9A7008" />
      </linearGradient>
      {/* Shelf: warm walnut top → deep umber */}
      <linearGradient
        id="umLbShf"
        x1="3"
        y1="20"
        x2="21"
        y2="22.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#8A5A20" />
        <stop offset="55%" stopColor="#6A4010" />
        <stop offset="100%" stopColor="#40260A" />
      </linearGradient>
      {/* Gloss dome overlay */}
      <radialGradient id="umLbGl" cx="32%" cy="24%" r="74%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Book 1 (crimson, tallest, leftmost) ── */}
    <rect x="3.2" y="4" width="4.4" height="16" rx="1" fill="url(#umLbB1)" />
    <rect x="3.2" y="4" width="4.4" height="16" rx="1" fill="url(#umLbGl)" />
    {/* Title bands */}
    <line
      x1="4.2"
      y1="7"
      x2="6.6"
      y2="7"
      stroke="#FFD0DC"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.85"
    />
    <line
      x1="4.2"
      y1="17"
      x2="6.6"
      y2="17"
      stroke="#FFD0DC"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <rect
      x="3.2"
      y="4"
      width="4.4"
      height="16"
      rx="1"
      stroke="#7A0A1E"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />

    {/* ── Book 2 (teal, mid height) ── */}
    <rect x="8.4" y="3" width="4.4" height="17" rx="1" fill="url(#umLbB2)" />
    <rect x="8.4" y="3" width="4.4" height="17" rx="1" fill="url(#umLbGl)" />
    <line
      x1="9.4"
      y1="6"
      x2="11.8"
      y2="6"
      stroke="#C8FFF0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.85"
    />
    <line
      x1="9.4"
      y1="16"
      x2="11.8"
      y2="16"
      stroke="#C8FFF0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <rect
      x="8.4"
      y="3"
      width="4.4"
      height="17"
      rx="1"
      stroke="#047A6A"
      strokeWidth="0.5"
      fill="none"
      opacity="0.45"
    />

    {/* ── Book 3 (gold, tilted, rightmost) ── */}
    <g transform="rotate(9 17 12)">
      <rect x="14.4" y="5" width="4.4" height="15" rx="1" fill="url(#umLbB3)" />
      <rect x="14.4" y="5" width="4.4" height="15" rx="1" fill="url(#umLbGl)" />
      <line
        x1="15.4"
        y1="8"
        x2="17.8"
        y2="8"
        stroke="#FFF0B0"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.85"
      />
      <line
        x1="15.4"
        y1="17"
        x2="17.8"
        y2="17"
        stroke="#FFF0B0"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.6"
      />
      <rect
        x="14.4"
        y="5"
        width="4.4"
        height="15"
        rx="1"
        stroke="#9A7008"
        strokeWidth="0.5"
        fill="none"
        opacity="0.45"
      />
    </g>

    {/* ── Shelf ── */}
    <rect
      x="2.4"
      y="20"
      width="19.2"
      height="2.4"
      rx="0.8"
      fill="url(#umLbShf)"
    />
    <line
      x1="3.6"
      y1="20.6"
      x2="20.4"
      y2="20.6"
      stroke="#B07830"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <rect
      x="2.4"
      y="20"
      width="19.2"
      height="2.4"
      rx="0.8"
      stroke="#40260A"
      strokeWidth="0.45"
      fill="none"
      opacity="0.45"
    />
  </svg>
);
