import type { FC } from "react";

type SvgProps = { size?: number };

// ── Explore — iOS-style: gradient gold bezel, parchment face, red/steel compass needle, glass dome, pivot glint ──
export const ExploreIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bezel: dark shadow edges → rich gold crest → dark shadow */}
      <linearGradient id="umCpBzl" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#8A6010" />
        <stop offset="38%"  stopColor="#D4A828" />
        <stop offset="65%"  stopColor="#F0C840" />
        <stop offset="100%" stopColor="#7A5010" />
      </linearGradient>
      {/* Face: bright ivory upper-left → warm cream → amber lower-right */}
      <linearGradient id="umCpFace" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="50%"  stopColor="#F8F4E8" />
        <stop offset="100%" stopColor="#E8D8B0" />
      </linearGradient>
      {/* North needle: bright coral tip → deep crimson base */}
      <linearGradient id="umCpNdlN" x1="12" y1="7" x2="12" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF4040" />
        <stop offset="55%"  stopColor="#CC1828" />
        <stop offset="100%" stopColor="#8A0A18" />
      </linearGradient>
      {/* South needle: light steel → dark slate */}
      <linearGradient id="umCpNdlS" x1="12" y1="12" x2="12" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C8D0D8" />
        <stop offset="55%"  stopColor="#909AA8" />
        <stop offset="100%" stopColor="#505870" />
      </linearGradient>
      {/* Glass dome: white gloss core → transparent edge */}
      <radialGradient id="umCpGlass" cx="32%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Center pivot: bright gold core → deep amber */}
      <radialGradient id="umCpPiv" cx="38%" cy="35%" r="70%">
        <stop offset="0%"   stopColor="#F0D040" />
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
    <line x1="12" y1="4.5"  x2="12" y2="6.5"  stroke="#9A6E18" strokeWidth="1.1" strokeLinecap="round" />
    <line x1="12" y1="17.5" x2="12" y2="19.5" stroke="#9A6E18" strokeWidth="0.8" strokeLinecap="round" opacity="0.70" />
    <line x1="4.5"  y1="12" x2="6.5"  y2="12" stroke="#9A6E18" strokeWidth="0.8" strokeLinecap="round" opacity="0.70" />
    <line x1="17.5" y1="12" x2="19.5" y2="12" stroke="#9A6E18" strokeWidth="0.8" strokeLinecap="round" opacity="0.70" />

    {/* Diagonal minor ticks */}
    <line x1="8.1"  y1="5.8"  x2="8.8"  y2="7.1"  stroke="#C8A040" strokeWidth="0.5" strokeLinecap="round" opacity="0.55" />
    <line x1="15.9" y1="5.8"  x2="15.2" y2="7.1"  stroke="#C8A040" strokeWidth="0.5" strokeLinecap="round" opacity="0.55" />
    <line x1="8.1"  y1="18.2" x2="8.8"  y2="16.9" stroke="#C8A040" strokeWidth="0.5" strokeLinecap="round" opacity="0.45" />
    <line x1="15.9" y1="18.2" x2="15.2" y2="16.9" stroke="#C8A040" strokeWidth="0.5" strokeLinecap="round" opacity="0.45" />

    {/* North marker dot (crimson) */}
    <circle cx="12" cy="5.0" r="0.78" fill="#CC1828" opacity="0.85" />

    {/* ── North needle (red, diamond tip) ── */}
    <path d="M12 12L10.2 13.5L12 7L13.8 13.5Z" fill="url(#umCpNdlN)" />
    {/* North needle specular highlight */}
    <path d="M12 7L11.6 9.5L12 10.2" stroke="#FF7878" strokeWidth="0.4" strokeLinecap="round" opacity="0.55" />

    {/* ── South needle (steel, diamond tail) ── */}
    <path d="M12 12L10.2 10.5L12 17L13.8 10.5Z" fill="url(#umCpNdlS)" />
    {/* South needle specular highlight */}
    <path d="M11.7 12.8L11.4 14.5" stroke="#E0E8F0" strokeWidth="0.38" strokeLinecap="round" opacity="0.50" />

    {/* Needle ground shadow on face */}
    <ellipse cx="12" cy="12.8" rx="1.6" ry="0.48" fill="#8A6010" opacity="0.10" />

    {/* ── Center pivot ── */}
    <circle cx="12" cy="12" r="1.2" fill="url(#umCpPiv)" />
    {/* Pivot gloss glint */}
    <circle cx="11.6" cy="11.6" r="0.38" fill="#FFE860" opacity="0.62" />

    {/* ── Glass dome highlight overlay ── */}
    <circle cx="12" cy="12" r="8.8" fill="url(#umCpGlass)" />
    {/* Specular arc — upper-left rim */}
    <path d="M7.5 7.5A7 7 0 0 1 13.5 5.5" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />

    {/* ── Bezel rim outlines ── */}
    <circle cx="12" cy="12" r="10.2" stroke="#7A5810" strokeWidth="0.5" fill="none" opacity="0.45" />
    <circle cx="12" cy="12" r="9.2"  stroke="#B88C18" strokeWidth="0.35" fill="none" opacity="0.38" />
  </svg>
);

// ── Interactions — iOS-style: gradient teal primary bubble, gradient violet secondary bubble, glass dome, message dots ──
export const InteractionsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Primary bubble: deep teal left shadow → bright aqua center → teal right */}
      <linearGradient id="umItBbl1" x1="2" y1="3" x2="16" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#047A6A" />
        <stop offset="38%"  stopColor="#0BA88E" />
        <stop offset="68%"  stopColor="#14C8A8" />
        <stop offset="100%" stopColor="#06806C" />
      </linearGradient>
      {/* Secondary bubble: deep violet left → bright amethyst center */}
      <linearGradient id="umItBbl2" x1="8" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#4A1888" />
        <stop offset="42%"  stopColor="#7830C0" />
        <stop offset="78%"  stopColor="#9848D8" />
        <stop offset="100%" stopColor="#3A1070" />
      </linearGradient>
      {/* Primary tail: teal body colour */}
      <linearGradient id="umItTl1" x1="3" y1="14" x2="7" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0BA88E" />
        <stop offset="100%" stopColor="#047A6A" />
      </linearGradient>
      {/* Secondary tail: violet body colour */}
      <linearGradient id="umItTl2" x1="17" y1="18" x2="21" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#7830C0" />
        <stop offset="100%" stopColor="#4A1888" />
      </linearGradient>
      {/* Glass dome — primary bubble */}
      <radialGradient id="umItGl1" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Glass dome — secondary bubble */}
      <radialGradient id="umItGl2" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Primary bubble tail ── */}
    <path d="M4.5 14.5Q3.5 17 2.5 19.5L7.5 16.5Z" fill="url(#umItTl1)" />

    {/* ── Primary bubble body (teal, larger, top-left) ── */}
    <rect x="2" y="3" width="15" height="13" rx="4.5" fill="url(#umItBbl1)" />
    {/* Shadow fold — right-bottom edge */}
    <path d="M14 3.5Q16.5 5 17 8Q17.2 11.5 16.2 15.5L14 16Q16 13 16 8Q15.8 5.2 14 3.5Z" fill="#04604E" opacity="0.28" />
    {/* Specular arc — upper-left */}
    <path d="M4.5 5.5A9 9 0 0 1 11 3.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Glass dome overlay */}
    <rect x="2" y="3" width="15" height="13" rx="4.5" fill="url(#umItGl1)" />

    {/* Message dots — primary bubble */}
    <circle cx="7"   cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />
    <circle cx="9.5" cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />
    <circle cx="12"  cy="9.5" r="1.3" fill="#FFFFFF" opacity="0.88" />

    {/* ── Secondary bubble tail ── */}
    <path d="M19.5 18.5Q20.5 21 21.5 22.5L17.5 20.5Z" fill="url(#umItTl2)" />

    {/* ── Secondary bubble body (violet, smaller, bottom-right) ── */}
    <rect x="9" y="11" width="13" height="10" rx="3.5" fill="url(#umItBbl2)" />
    {/* Shadow fold — right-bottom edge */}
    <path d="M19.5 11.5Q22 13 22.2 16Q22.4 18.8 21.2 20.5L19 21Q21 19 21 16Q20.8 13 19.5 11.5Z" fill="#300870" opacity="0.25" />
    {/* Specular arc — upper-left */}
    <path d="M11 13A6 6 0 0 1 16 11.5" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.45" />
    {/* Glass dome overlay */}
    <rect x="9" y="11" width="13" height="10" rx="3.5" fill="url(#umItGl2)" />

    {/* Message dots — secondary bubble */}
    <circle cx="13.5" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />
    <circle cx="15.8" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />
    <circle cx="18.1" cy="16" r="1.1" fill="#FFFFFF" opacity="0.82" />

    {/* ── Outlines ── */}
    <rect x="2" y="3"  width="15" height="13" rx="4.5" stroke="#047060" strokeWidth="0.55" fill="none" opacity="0.42" />
    <rect x="9" y="11" width="13" height="10" rx="3.5" stroke="#381080" strokeWidth="0.50" fill="none" opacity="0.38" />
  </svg>
);

// ── Characters — iOS-style: gold comedy mask front, indigo tragedy mask behind, gloss domes, eye-hole glints, tear drop ──
export const CharactersIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Comedy face: bright ivory-gold highlight → warm amber → deep gold shadow */}
      <linearGradient id="umChCo" x1="3" y1="4" x2="17" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFF0A8" />
        <stop offset="42%"  stopColor="#F0C830" />
        <stop offset="100%" stopColor="#C08810" />
      </linearGradient>
      {/* Tragedy face: near-black left → deep indigo → slate-amethyst right */}
      <linearGradient id="umChTr" x1="9" y1="8" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#130C40" />
        <stop offset="40%"  stopColor="#2A1870" />
        <stop offset="78%"  stopColor="#4030A0" />
        <stop offset="100%" stopColor="#1E1058" />
      </linearGradient>
      {/* Comedy gloss dome */}
      <radialGradient id="umChCoGl" cx="32%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.58" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Tragedy gloss dome */}
      <radialGradient id="umChTrGl" cx="32%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Tragedy mask (behind, indigo, shifted bottom-right) ── */}
    <ellipse cx="14.5" cy="14" rx="7.5" ry="6.8" fill="url(#umChTr)" />
    {/* Shadow fold — right edge */}
    <path d="M20 10.5Q22 13 22 15Q22 18 20 19.5" stroke="#0A0828" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.28" />
    {/* Specular arc — upper-left */}
    <path d="M9.5 10.5A6.5 6.5 0 0 1 13.5 8.5" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38" />
    {/* Gloss dome */}
    <ellipse cx="14.5" cy="14" rx="7.5" ry="6.8" fill="url(#umChTrGl)" />
    {/* Tragedy eye holes */}
    <ellipse cx="12.0" cy="12.5" rx="1.2" ry="1.5" fill="#08061E" opacity="0.90" />
    <ellipse cx="17.0" cy="12.5" rx="1.2" ry="1.5" fill="#08061E" opacity="0.90" />
    {/* Eye glints */}
    <circle cx="11.6" cy="12.0" r="0.42" fill="#5040B0" opacity="0.55" />
    <circle cx="16.6" cy="12.0" r="0.42" fill="#5040B0" opacity="0.55" />
    {/* Frown */}
    <path d="M11.5 17.5Q14.5 15.5 17.5 17.5" stroke="#08061E" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.85" />
    {/* Tear drop */}
    <path d="M11.8 14.8Q11.3 16.2 11.9 16.8Q12.5 17.2 12.2 15.8Z" fill="#6070D8" opacity="0.68" />
    {/* Outline */}
    <ellipse cx="14.5" cy="14" rx="7.5" ry="6.8" stroke="#1A1060" strokeWidth="0.5" fill="none" opacity="0.42" />

    {/* ── Comedy mask (front, gold, upper-left) ── */}
    <ellipse cx="9.5" cy="10" rx="7.5" ry="6.8" fill="url(#umChCo)" />
    {/* Shadow fold — right edge */}
    <path d="M15 6.8Q17 9 17 11Q17 14 15 15.5" stroke="#A07808" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.30" />
    {/* Specular arc — upper-left */}
    <path d="M4 7.5A6.5 6.5 0 0 1 8.5 5.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.60" />
    {/* Gloss dome */}
    <ellipse cx="9.5" cy="10" rx="7.5" ry="6.8" fill="url(#umChCoGl)" />
    {/* Comedy eye holes */}
    <ellipse cx="7.0"  cy="9.0" rx="1.2" ry="1.5" fill="#6A4008" opacity="0.85" />
    <ellipse cx="12.0" cy="9.0" rx="1.2" ry="1.5" fill="#6A4008" opacity="0.85" />
    {/* Eye glints */}
    <circle cx="6.6"  cy="8.5" r="0.42" fill="#FFF0A0" opacity="0.65" />
    <circle cx="11.6" cy="8.5" r="0.42" fill="#FFF0A0" opacity="0.65" />
    {/* Smile */}
    <path d="M6 12.5Q9.5 16 13 12.5" stroke="#6A4008" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.85" />
    {/* Outline */}
    <ellipse cx="9.5" cy="10" rx="7.5" ry="6.8" stroke="#A07808" strokeWidth="0.55" fill="none" opacity="0.45" />
  </svg>
);

// ── Inbox — iOS-style: deep navy envelope body, open flap, parchment letter with text lines, gloss overlay ──
export const InboxIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Envelope body: near-black left shadow → deep navy → slate highlight right */}
      <linearGradient id="umIbEnv" x1="2" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0A1830" />
        <stop offset="38%"  stopColor="#182E50" />
        <stop offset="72%"  stopColor="#284468" />
        <stop offset="100%" stopColor="#0C1C38" />
      </linearGradient>
      {/* Flap: slightly lighter navy than body */}
      <linearGradient id="umIbFlap" x1="2" y1="10" x2="22" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#182C58" />
        <stop offset="50%"  stopColor="#2C4468" />
        <stop offset="100%" stopColor="#162440" />
      </linearGradient>
      {/* Letter: bright ivory top → warm parchment → amber base */}
      <linearGradient id="umIbLtr" x1="9" y1="3" x2="15" y2="13" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="55%"  stopColor="#F8F0DC" />
        <stop offset="100%" stopColor="#ECD8A8" />
      </linearGradient>
      {/* Envelope gloss dome */}
      <radialGradient id="umIbGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.48" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Letter peeking above the envelope ── */}
    <rect x="7.5" y="3" width="9" height="11" rx="1.2" fill="url(#umIbLtr)" />
    {/* Letter text lines */}
    <line x1="9.5" y1="6.0"  x2="14.5" y2="6.0"  stroke="#B09030" strokeWidth="0.72" strokeLinecap="round" opacity="0.65" />
    <line x1="9.5" y1="7.8"  x2="14.5" y2="7.8"  stroke="#B09030" strokeWidth="0.72" strokeLinecap="round" opacity="0.60" />
    <line x1="9.5" y1="9.6"  x2="12.8" y2="9.6"  stroke="#B09030" strokeWidth="0.72" strokeLinecap="round" opacity="0.50" />
    {/* Letter outline */}
    <rect x="7.5" y="3" width="9" height="11" rx="1.2" stroke="#C8A840" strokeWidth="0.5" fill="none" opacity="0.42" />

    {/* ── Envelope body ── */}
    <rect x="2" y="10" width="20" height="12" rx="2" fill="url(#umIbEnv)" />
    {/* Left face specular streak */}
    <path d="M3.8 11.5V21.5" stroke="#3A5888" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" />
    {/* Right face shadow edge */}
    <path d="M20.2 11.5V21.5" stroke="#060E1C" strokeWidth="0.7" strokeLinecap="round" opacity="0.22" />
    {/* Interior V-crease shadow */}
    <path d="M2 22L12 16.5L22 22" stroke="#06101E" strokeWidth="1.0" fill="none" opacity="0.32" />
    {/* Gloss dome */}
    <rect x="2" y="10" width="20" height="12" rx="2" fill="url(#umIbGl)" />

    {/* ── Open flap (V-shape, pointing down, open upward) ── */}
    <path d="M2 10L12 17.5L22 10Z" fill="url(#umIbFlap)" />
    {/* Flap fold crease edge */}
    <path d="M2 10L12 17.5L22 10" stroke="#2E4870" strokeWidth="0.6" fill="none" opacity="0.45" />
    {/* Flap left-face specular */}
    <path d="M3.5 10.8L8.5 14.2" stroke="#FFFFFF" strokeWidth="0.65" strokeLinecap="round" opacity="0.30" />

    {/* ── Envelope outline ── */}
    <rect x="2" y="10" width="20" height="12" rx="2" stroke="#0C1E38" strokeWidth="0.55" fill="none" opacity="0.42" />
  </svg>
);

// ── Music — iOS-style: crimson beamed eighth notes, rotated note heads with gloss glints, subtle gold staff lines ──
export const MusicIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Note body: bright rose highlight → deep crimson → burgundy shadow */}
      <linearGradient id="umMsNote" x1="4" y1="6" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F04070" />
        <stop offset="42%"  stopColor="#C01840" />
        <stop offset="100%" stopColor="#780A28" />
      </linearGradient>
      {/* Beam: brighter rose → deep crimson */}
      <linearGradient id="umMsBeam" x1="7" y1="8" x2="17" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D82858" />
        <stop offset="100%" stopColor="#A01838" />
      </linearGradient>
      {/* Left note head gloss */}
      <radialGradient id="umMsGl1" cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#FF8AAA" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#C01840" stopOpacity="0" />
      </radialGradient>
      {/* Right note head gloss */}
      <radialGradient id="umMsGl2" cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#FF8AAA" stopOpacity="0.60" />
        <stop offset="100%" stopColor="#A01438" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Staff lines (subtle gold background context) ── */}
    <line x1="2" y1="15" x2="22" y2="15" stroke="#D0A040" strokeWidth="0.55" opacity="0.28" />
    <line x1="2" y1="17" x2="22" y2="17" stroke="#D0A040" strokeWidth="0.55" opacity="0.28" />
    <line x1="2" y1="19" x2="22" y2="19" stroke="#D0A040" strokeWidth="0.55" opacity="0.28" />
    <line x1="2" y1="21" x2="22" y2="21" stroke="#D0A040" strokeWidth="0.55" opacity="0.28" />

    {/* ── Beam (connects top of both stems, angled naturally) ── */}
    <path d="M7 8.5L17 6.5V9L7 11Z" fill="url(#umMsBeam)" />
    {/* Beam specular streak */}
    <line x1="7.5" y1="8.8" x2="16.5" y2="6.8" stroke="#FF88AA" strokeWidth="0.42" strokeLinecap="round" opacity="0.45" />

    {/* ── Left stem ── */}
    <line x1="7" y1="8.5" x2="7" y2="19.5" stroke="url(#umMsNote)" strokeWidth="1.7" strokeLinecap="round" />

    {/* ── Right stem ── */}
    <line x1="17" y1="6.5" x2="17" y2="17.5" stroke="url(#umMsNote)" strokeWidth="1.7" strokeLinecap="round" />

    {/* ── Left note head ── */}
    <ellipse cx="5.3" cy="19.5" rx="2.7" ry="1.8" transform="rotate(-15 5.3 19.5)" fill="url(#umMsNote)" />
    {/* Left note head gloss */}
    <ellipse cx="5.3" cy="19.5" rx="2.7" ry="1.8" transform="rotate(-15 5.3 19.5)" fill="url(#umMsGl1)" />
    {/* Left note head specular glint */}
    <circle cx="4.2" cy="18.7" r="0.68" fill="#FFFFFF" opacity="0.45" />

    {/* ── Right note head ── */}
    <ellipse cx="15.3" cy="17.5" rx="2.7" ry="1.8" transform="rotate(-15 15.3 17.5)" fill="url(#umMsNote)" />
    {/* Right note head gloss */}
    <ellipse cx="15.3" cy="17.5" rx="2.7" ry="1.8" transform="rotate(-15 15.3 17.5)" fill="url(#umMsGl2)" />
    {/* Right note head specular glint */}
    <circle cx="14.2" cy="16.7" r="0.68" fill="#FFFFFF" opacity="0.38" />
  </svg>
);

// ── NovelistsLeaderboard — iOS-style: gradient gold trophy cup, arched handles, faceted rim, star emblem, gold base ──
export const NovelistsLeaderboardIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Cup body: dark gold shadow left → bright amber highlight → deep shadow right */}
      <linearGradient id="umNLBody" x1="5" y1="8" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7010" />
        <stop offset="32%"  stopColor="#EEC030" />
        <stop offset="62%"  stopColor="#F0C838" />
        <stop offset="100%" stopColor="#886008" />
      </linearGradient>
      {/* Rim: dark edge → bright ivory-gold crest → dark edge */}
      <linearGradient id="umNLRim" x1="5" y1="8" x2="19" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A07818" />
        <stop offset="44%"  stopColor="#FFF080" />
        <stop offset="100%" stopColor="#A07818" />
      </linearGradient>
      {/* Handles: warm gold arc → bright crest → deep base */}
      <linearGradient id="umNLHdl" x1="2" y1="9" x2="6" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C09020" />
        <stop offset="50%"  stopColor="#F0D040" />
        <stop offset="100%" stopColor="#987010" />
      </linearGradient>
      {/* Stem: dark shadow edges → bright gold center */}
      <linearGradient id="umNLStem" x1="9.5" y1="19" x2="14.5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#806008" />
        <stop offset="50%"  stopColor="#D4A020" />
        <stop offset="100%" stopColor="#806008" />
      </linearGradient>
      {/* Base: dark shadow edges → bright gold crest */}
      <linearGradient id="umNLBase" x1="6" y1="21" x2="18" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#7A5808" />
        <stop offset="45%"  stopColor="#E8C030" />
        <stop offset="100%" stopColor="#7A5808" />
      </linearGradient>
      {/* Gloss dome on cup */}
      <radialGradient id="umNLGl" cx="32%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Star emblem: bright ivory-gold core → warm amber */}
      <radialGradient id="umNLStar" cx="38%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#FFFDE0" />
        <stop offset="100%" stopColor="#E8C020" />
      </radialGradient>
    </defs>

    {/* ── Left handle ── */}
    <path d="M5.5 9Q2 10 2 12.5Q2 15 5.5 15.5" stroke="url(#umNLHdl)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Left handle inner concave shadow */}
    <path d="M5.5 9.5Q3 10.5 3 12.5Q3 14.5 5.5 15" stroke="#9A7010" strokeWidth="0.55" strokeLinecap="round" fill="none" opacity="0.32" />

    {/* ── Right handle ── */}
    <path d="M18.5 9Q22 10 22 12.5Q22 15 18.5 15.5" stroke="url(#umNLHdl)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Right handle inner concave shadow */}
    <path d="M18.5 9.5Q21 10.5 21 12.5Q21 14.5 18.5 15" stroke="#9A7010" strokeWidth="0.55" strokeLinecap="round" fill="none" opacity="0.25" />

    {/* ── Cup body ── */}
    <path d="M5.5 8C4.5 11 5 15 9 17.5L9 19L15 19L15 17.5C19 15 19.5 11 18.5 8Z" fill="url(#umNLBody)" />
    {/* Shadow fold — right half */}
    <path d="M15 17.5C18.5 15.5 19.5 12 18.5 9L14.5 8.2C17 11 17 15 14.5 17Z" fill="#7A5808" opacity="0.22" />
    {/* Specular streak — left face */}
    <path d="M7 9.5C6.8 12 7.2 14.5 8.5 16" stroke="#FFE870" strokeWidth="0.82" strokeLinecap="round" fill="none" opacity="0.45" />
    {/* Gloss dome overlay */}
    <path d="M5.5 8C4.5 11 5 15 9 17.5L9 19L15 19L15 17.5C19 15 19.5 11 18.5 8Z" fill="url(#umNLGl)" />
    {/* Cup body outline */}
    <path d="M5.5 8C4.5 11 5 15 9 17.5L9 19L15 19L15 17.5C19 15 19.5 11 18.5 8" stroke="#9A7010" strokeWidth="0.55" fill="none" opacity="0.42" />

    {/* ── Rim (top opening) ── */}
    <ellipse cx="12" cy="8" rx="6.8" ry="1.8" fill="url(#umNLRim)" />
    {/* Rim inner shadow depth */}
    <ellipse cx="12" cy="8.4" rx="5.5" ry="1.1" fill="#6A4808" opacity="0.20" />
    {/* Rim specular highlight */}
    <ellipse cx="10" cy="7.6" rx="3.0" ry="0.6" fill="#FFFDE0" opacity="0.55" />
    {/* Rim outline */}
    <ellipse cx="12" cy="8" rx="6.8" ry="1.8" stroke="#9A7010" strokeWidth="0.45" fill="none" opacity="0.40" />

    {/* ── Star emblem on cup front ── */}
    <path d="M12 10.8L12.7 12.7L14.7 12.7L13.15 13.8L13.8 15.7L12 14.6L10.2 15.7L10.85 13.8L9.3 12.7L11.3 12.7Z" fill="url(#umNLStar)" opacity="0.78" />
    {/* Star shadow facets */}
    <path d="M12 14.6L13.8 15.7L13.15 13.8L14.7 12.7L12.7 12.7Z" fill="#9A7008" opacity="0.22" />
    {/* Star glint */}
    <circle cx="11.4" cy="13.2" r="0.48" fill="#FFFDE0" opacity="0.58" />

    {/* ── Stem ── */}
    <rect x="9.5" y="18.5" width="5" height="2.5" fill="url(#umNLStem)" rx="0.3" />
    {/* Stem specular */}
    <line x1="10.5" y1="18.9" x2="13.5" y2="18.9" stroke="#F0D040" strokeWidth="0.4" strokeLinecap="round" opacity="0.48" />

    {/* ── Base plate ── */}
    <rect x="6" y="21" width="12" height="2.2" fill="url(#umNLBase)" rx="0.5" />
    {/* Base specular line */}
    <line x1="7.5" y1="21.6" x2="16.5" y2="21.6" stroke="#F0D850" strokeWidth="0.4" strokeLinecap="round" opacity="0.45" />
    {/* Base outline */}
    <rect x="6" y="21" width="12" height="2.2" stroke="#7A5808" strokeWidth="0.45" fill="none" rx="0.5" opacity="0.40" />
  </svg>
);

// ── MusesLeaderboard — iOS-style: three-tier gradient podium (gold/silver/bronze), top-face highlights, stars above each tier ──
export const MusesLeaderboardIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* 1st gold body: bright amber top → deep gold shadow */}
      <linearGradient id="umML1st" x1="9" y1="10" x2="15" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F0C830" />
        <stop offset="48%"  stopColor="#D4A018" />
        <stop offset="100%" stopColor="#9A7008" />
      </linearGradient>
      {/* 1st top face: dark edge → bright gold crest → dark edge */}
      <linearGradient id="umML1stTop" x1="8.5" y1="10" x2="15.5" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C89018" />
        <stop offset="50%"  stopColor="#FAE060" />
        <stop offset="100%" stopColor="#C89018" />
      </linearGradient>
      {/* 2nd silver body: bright steel top → dark slate shadow */}
      <linearGradient id="umML2nd" x1="2" y1="13" x2="9" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C8D0D8" />
        <stop offset="48%"  stopColor="#909AA8" />
        <stop offset="100%" stopColor="#505868" />
      </linearGradient>
      {/* 2nd top face */}
      <linearGradient id="umML2ndTop" x1="2" y1="13" x2="9" y2="13" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#8090A0" />
        <stop offset="50%"  stopColor="#D8E0E8" />
        <stop offset="100%" stopColor="#8090A0" />
      </linearGradient>
      {/* 3rd bronze body: warm amber-orange top → deep bronze shadow */}
      <linearGradient id="umML3rd" x1="15" y1="16" x2="22" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D8840C" />
        <stop offset="48%"  stopColor="#A85C08" />
        <stop offset="100%" stopColor="#6A3804" />
      </linearGradient>
      {/* 3rd top face */}
      <linearGradient id="umML3rdTop" x1="15" y1="16" x2="22" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A5A08" />
        <stop offset="50%"  stopColor="#F0A030" />
        <stop offset="100%" stopColor="#9A5A08" />
      </linearGradient>
      {/* Gold star: bright ivory-gold core → deep amber */}
      <radialGradient id="umMLStar1" cx="38%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#FFFDE0" />
        <stop offset="45%"  stopColor="#FFD820" />
        <stop offset="100%" stopColor="#B88808" />
      </radialGradient>
      {/* Silver star */}
      <radialGradient id="umMLStar2" cx="38%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#8090A8" />
      </radialGradient>
      {/* Bronze star */}
      <radialGradient id="umMLStar3" cx="38%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#FFD0A0" />
        <stop offset="100%" stopColor="#9A5808" />
      </radialGradient>
    </defs>

    {/* ── 2nd place block (left, silver) ── */}
    <rect x="2" y="13" width="7" height="10" fill="url(#umML2nd)" rx="0.5" />
    {/* 2nd top face */}
    <rect x="2" y="12.2" width="7" height="1.2" fill="url(#umML2ndTop)" rx="0.5" />
    {/* 2nd left specular */}
    <line x1="3.2" y1="14" x2="3.2" y2="22.5" stroke="#D8E0E8" strokeWidth="0.75" strokeLinecap="round" opacity="0.38" />
    {/* 2nd right shadow */}
    <line x1="8.2" y1="14" x2="8.2" y2="22.5" stroke="#38404A" strokeWidth="0.55" strokeLinecap="round" opacity="0.25" />
    {/* 2nd outline */}
    <rect x="2" y="13" width="7" height="10" stroke="#60707A" strokeWidth="0.45" fill="none" rx="0.5" opacity="0.35" />

    {/* ── 3rd place block (right, bronze) ── */}
    <rect x="15" y="16" width="7" height="7" fill="url(#umML3rd)" rx="0.5" />
    {/* 3rd top face */}
    <rect x="15" y="15.2" width="7" height="1.2" fill="url(#umML3rdTop)" rx="0.5" />
    {/* 3rd left specular */}
    <line x1="16.2" y1="17" x2="16.2" y2="22.5" stroke="#F0A838" strokeWidth="0.75" strokeLinecap="round" opacity="0.35" />
    {/* 3rd right shadow */}
    <line x1="21.2" y1="17" x2="21.2" y2="22.5" stroke="#3A1A02" strokeWidth="0.55" strokeLinecap="round" opacity="0.22" />
    {/* 3rd outline */}
    <rect x="15" y="16" width="7" height="7" stroke="#7A4A08" strokeWidth="0.45" fill="none" rx="0.5" opacity="0.35" />

    {/* ── 1st place block (center, gold, tallest) ── */}
    <rect x="8.5" y="10" width="7" height="13" fill="url(#umML1st)" rx="0.5" />
    {/* 1st top face */}
    <rect x="8.5" y="9" width="7" height="1.4" fill="url(#umML1stTop)" rx="0.5" />
    {/* 1st left specular */}
    <line x1="9.8" y1="11" x2="9.8" y2="22.5" stroke="#FFE860" strokeWidth="0.82" strokeLinecap="round" opacity="0.40" />
    {/* 1st right shadow */}
    <line x1="14.7" y1="11" x2="14.7" y2="22.5" stroke="#5A3A04" strokeWidth="0.6" strokeLinecap="round" opacity="0.25" />
    {/* 1st outline */}
    <rect x="8.5" y="10" width="7" height="13" stroke="#9A7008" strokeWidth="0.5" fill="none" rx="0.5" opacity="0.40" />

    {/* ── Gold star above 1st (large) ── */}
    <path d="M12 2.5L12.85 5.0L15.5 5.1L13.5 6.7L14.2 9.1L12 7.8L9.8 9.1L10.5 6.7L8.5 5.1L11.15 5.0Z" fill="url(#umMLStar1)" />
    {/* 1st star shadow facets */}
    <path d="M12 7.8L14.2 9.1L13.5 6.7L15.5 5.1L12.85 5.0Z" fill="#9A7008" opacity="0.22" />
    {/* 1st star glint */}
    <circle cx="11.4" cy="5.4" r="0.52" fill="#FFFDE0" opacity="0.68" />

    {/* ── Silver star above 2nd (small) ── */}
    <path d="M5.5 6.5L6.05 7.9L7.55 7.95L6.4 8.85L6.8 10.2L5.5 9.45L4.2 10.2L4.6 8.85L3.45 7.95L4.95 7.9Z" fill="url(#umMLStar2)" />
    {/* 2nd star glint */}
    <circle cx="5.15" cy="7.6" r="0.36" fill="#FFFFFF" opacity="0.55" />

    {/* ── Bronze star above 3rd (small) ── */}
    <path d="M18.5 9.5L19.05 10.9L20.55 10.95L19.4 11.85L19.8 13.2L18.5 12.45L17.2 13.2L17.6 11.85L16.45 10.95L17.95 10.9Z" fill="url(#umMLStar3)" />
    {/* 3rd star glint */}
    <circle cx="18.15" cy="10.6" r="0.32" fill="#FFD0A0" opacity="0.55" />
  </svg>
);

// ── InstallApp — iOS-style: dark metallic phone body, deep teal screen with gloss, bright emerald download arrow ──
export const InstallAppIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Phone body: near-black left → deep slate → blue-slate highlight right */}
      <linearGradient id="umInstBody" x1="6" y1="12" x2="18" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#080C18" />
        <stop offset="35%"  stopColor="#12182C" />
        <stop offset="70%"  stopColor="#1C2640" />
        <stop offset="100%" stopColor="#0A0E1E" />
      </linearGradient>
      {/* Screen: near-black teal left → deep teal → mid teal right */}
      <linearGradient id="umInstScr" x1="7.5" y1="4.5" x2="16.5" y2="17.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#031418" />
        <stop offset="45%"  stopColor="#073040" />
        <stop offset="100%" stopColor="#0A4050" />
      </linearGradient>
      {/* Download arrow: bright emerald top → deep teal base */}
      <linearGradient id="umInstArr" x1="12" y1="6.5" x2="12" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#22E8B0" />
        <stop offset="55%"  stopColor="#10A880" />
        <stop offset="100%" stopColor="#087858" />
      </linearGradient>
      {/* Screen gloss dome */}
      <radialGradient id="umInstGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Home button: dark center → slightly lighter rim */}
      <radialGradient id="umInstBtn" cx="40%" cy="35%" r="70%">
        <stop offset="0%"   stopColor="#283050" />
        <stop offset="100%" stopColor="#080C18" />
      </radialGradient>
    </defs>

    {/* ── Phone body ── */}
    <rect x="6" y="1.5" width="12" height="21" rx="2.5" fill="url(#umInstBody)" />
    {/* Left edge specular */}
    <line x1="7" y1="2.5" x2="7" y2="22" stroke="#283060" strokeWidth="0.7" strokeLinecap="round" opacity="0.42" />
    {/* Right edge shadow */}
    <line x1="17" y1="2.5" x2="17" y2="22" stroke="#03050C" strokeWidth="0.6" strokeLinecap="round" opacity="0.28" />
    {/* Volume buttons — left */}
    <rect x="5.2" y="7"  width="0.8" height="2.8" rx="0.4" fill="#1C2640" opacity="0.70" />
    <rect x="5.2" y="11" width="0.8" height="2.0" rx="0.4" fill="#1C2640" opacity="0.70" />
    {/* Power button — right */}
    <rect x="18" y="8.5" width="0.8" height="3.2" rx="0.4" fill="#1C2640" opacity="0.70" />
    {/* Top speaker grille */}
    <rect x="10.2" y="3" width="3.6" height="0.75" rx="0.38" fill="#08101C" opacity="0.65" />
    {/* Front camera dot */}
    <circle cx="14.5" cy="3.4" r="0.5" fill="#06080E" opacity="0.60" />

    {/* ── Screen ── */}
    <rect x="7.5" y="4.5" width="9" height="13" rx="1.2" fill="url(#umInstScr)" />
    {/* Screen gloss overlay */}
    <rect x="7.5" y="4.5" width="9" height="13" rx="1.2" fill="url(#umInstGl)" />
    {/* Screen specular arc */}
    <path d="M8.5 5.5A5 5 0 0 1 12 4.8" stroke="#FFFFFF" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.28" />

    {/* ── Download arrow on screen ── */}
    {/* Shaft */}
    <line x1="12" y1="6.5" x2="12" y2="12.5" stroke="url(#umInstArr)" strokeWidth="1.85" strokeLinecap="round" />
    {/* Arrowhead */}
    <path d="M9.2 11.2L12 14.5L14.8 11.2" stroke="url(#umInstArr)" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Tray / base line */}
    <line x1="9.2" y1="16" x2="14.8" y2="16" stroke="url(#umInstArr)" strokeWidth="1.6" strokeLinecap="round" />
    {/* Arrow soft glow halo */}
    <line x1="12" y1="6.5" x2="12" y2="12.5" stroke="#22E8B0" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" />

    {/* ── Home button ── */}
    <circle cx="12" cy="20" r="1.3" fill="url(#umInstBtn)" />
    <circle cx="12" cy="20" r="0.85" stroke="#283060" strokeWidth="0.45" fill="none" opacity="0.55" />

    {/* ── Body outline ── */}
    <rect x="6" y="1.5" width="12" height="21" rx="2.5" stroke="#1C2438" strokeWidth="0.5" fill="none" opacity="0.45" />
  </svg>
);

// ── Terms — iOS-style: parchment page with folded corner, gold header band, sepia text lines, crimson wax seal ──
export const TermsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Page: bright ivory upper-left → warm cream → amber lower-right */}
      <linearGradient id="umTcPage" x1="4" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="52%"  stopColor="#F8F0DC" />
        <stop offset="100%" stopColor="#ECD8A8" />
      </linearGradient>
      {/* Gold header band: dark edge → bright gold crest → dark edge */}
      <linearGradient id="umTcBand" x1="4" y1="2" x2="18" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7010" />
        <stop offset="44%"  stopColor="#E8C030" />
        <stop offset="100%" stopColor="#9A7010" />
      </linearGradient>
      {/* Wax seal: bright rose core → deep crimson edge */}
      <radialGradient id="umTcSeal" cx="36%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#FF5070" />
        <stop offset="52%"  stopColor="#B81828" />
        <stop offset="100%" stopColor="#6A0810" />
      </radialGradient>
      {/* Folded corner shadow: slightly darker parchment */}
      <linearGradient id="umTcFold" x1="14" y1="2" x2="18" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#E8D8A8" />
        <stop offset="100%" stopColor="#C8B888" />
      </linearGradient>
    </defs>

    {/* ── Page body (clipped top-right corner) ── */}
    <path d="M4 2H14L18 6V22H4Z" fill="url(#umTcPage)" />
    {/* Left edge specular */}
    <line x1="4" y1="2" x2="4" y2="22" stroke="#FFFEF4" strokeWidth="0.6" strokeLinecap="round" opacity="0.60" />
    {/* Right edge shadow */}
    <line x1="18" y1="6" x2="18" y2="22" stroke="#C8A840" strokeWidth="0.6" strokeLinecap="round" opacity="0.35" />

    {/* ── Folded corner ── */}
    <path d="M14 2L18 6H14Z" fill="url(#umTcFold)" />
    <path d="M14 2L18 6" stroke="#A88820" strokeWidth="0.5" opacity="0.42" />
    <path d="M14 2L18 6H14Z" stroke="#C8A840" strokeWidth="0.45" fill="none" opacity="0.42" />

    {/* ── Gold header band ── */}
    <rect x="4" y="2" width="10" height="2.8" fill="url(#umTcBand)" />
    {/* Band specular line */}
    <line x1="5" y1="2.9" x2="13" y2="2.9" stroke="#FFF080" strokeWidth="0.38" strokeLinecap="round" opacity="0.48" />

    {/* ── Text lines ── */}
    <rect x="6.5" y="7.2" width="1.8" height="2.0" rx="0.25" fill="#A87828" opacity="0.40" />
    <line x1="6.5" y1="7.5"  x2="15.5" y2="7.5"  stroke="#A87828" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="6.5" y1="9.8"  x2="15.5" y2="9.8"  stroke="#A87828" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="6.5" y1="12.1" x2="15.5" y2="12.1" stroke="#A87828" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="6.5" y1="14.4" x2="15.5" y2="14.4" stroke="#A87828" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="6.5" y1="16.7" x2="11.5" y2="16.7" stroke="#A87828" strokeWidth="0.88" strokeLinecap="round" opacity="0.72" />

    {/* ── Wax seal ── */}
    <circle cx="14.8" cy="19" r="2.7" fill="url(#umTcSeal)" />
    {/* Seal inner ring */}
    <circle cx="14.8" cy="19" r="1.85" stroke="#FF7888" strokeWidth="0.48" fill="none" opacity="0.42" />
    {/* Seal star impression */}
    <path d="M14.8 17.2L15.28 18.5L16.6 18.5L15.6 19.28L15.98 20.6L14.8 19.85L13.62 20.6L14.0 19.28L13.0 18.5L14.32 18.5Z" fill="#FFFFFF" opacity="0.28" />
    {/* Seal specular glint */}
    <circle cx="14.1" cy="18.2" r="0.46" fill="#FF90A0" opacity="0.55" />

    {/* ── Page outline ── */}
    <path d="M4 2H14L18 6V22H4Z" stroke="#C8A840" strokeWidth="0.5" fill="none" opacity="0.42" />
  </svg>
);

// ── FAQs — iOS-style: deep blue gradient speech bubble, glass dome, white stroke question mark, bright tail ──
export const FAQsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bubble: deep navy left → cornflower blue center → mid blue right */}
      <linearGradient id="umFaqBbl" x1="2" y1="2" x2="22" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0C1A60" />
        <stop offset="38%"  stopColor="#1E40C0" />
        <stop offset="70%"  stopColor="#2E58D8" />
        <stop offset="100%" stopColor="#0E1E70" />
      </linearGradient>
      {/* Tail: matches bubble base color */}
      <linearGradient id="umFaqTl" x1="2" y1="17" x2="8" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#1E40C0" />
        <stop offset="100%" stopColor="#0C1A60" />
      </linearGradient>
      {/* Glass dome gloss */}
      <radialGradient id="umFaqGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.52" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Bubble tail ── */}
    <path d="M4 17.5Q3 20.5 2 23L8 18Z" fill="url(#umFaqTl)" />

    {/* ── Bubble body ── */}
    <rect x="2" y="2" width="20" height="16" rx="5" fill="url(#umFaqBbl)" />
    {/* Shadow fold — right-bottom edge */}
    <path d="M19 2.5Q22 5 22.2 8Q22.4 12 21.5 17.5L19 18Q21 14 21 9Q20.8 5.2 19 2.5Z" fill="#0A1450" opacity="0.28" />
    {/* Specular arc — upper-left */}
    <path d="M4.5 4.5A10 10 0 0 1 11 2.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.52" />
    {/* Glass dome overlay */}
    <rect x="2" y="2" width="20" height="16" rx="5" fill="url(#umFaqGl)" />

    {/* ── Question mark (white stroke paths) ── */}
    {/* Arc of the ? */}
    <path d="M9.2 9.2Q9.2 5.5 12 5.5Q14.8 5.5 14.8 8Q14.8 10.2 12 11L12 12.8"
          stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
    {/* Dot of the ? */}
    <circle cx="12" cy="14.5" r="1.2" fill="#FFFFFF" opacity="0.95" />

    {/* ── Bubble outline ── */}
    <rect x="2" y="2" width="20" height="16" rx="5" stroke="#1030A0" strokeWidth="0.55" fill="none" opacity="0.42" />
  </svg>
);

// ── HelpSupport — iOS-style: metallic graphite headset arc, gradient ear cups with grille, mic boom arm and capsule ──
export const HelpSupportIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Headband: dark shadow edge → bright silver crest → dark shadow edge */}
      <linearGradient id="umHlpBand" x1="4.5" y1="15" x2="4.5" y2="5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#282C38" />
        <stop offset="42%"  stopColor="#6A7080" />
        <stop offset="70%"  stopColor="#8A9098" />
        <stop offset="100%" stopColor="#1C2028" />
      </linearGradient>
      {/* Ear cup body: near-black left → dark slate → charcoal-blue highlight right */}
      <linearGradient id="umHlpCup" x1="0" y1="15" x2="9" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#10141E" />
        <stop offset="40%"  stopColor="#1C2030" />
        <stop offset="75%"  stopColor="#283040" />
        <stop offset="100%" stopColor="#0C1018" />
      </linearGradient>
      {/* Ear cup gloss dome */}
      <radialGradient id="umHlpGl" cx="32%" cy="28%" r="70%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      {/* Mic arm and capsule: dark steel → silver highlight */}
      <linearGradient id="umHlpMic" x1="4" y1="18" x2="10" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#484C58" />
        <stop offset="55%"  stopColor="#787C88" />
        <stop offset="100%" stopColor="#303440" />
      </linearGradient>
      {/* Padding strip on headband */}
      <linearGradient id="umHlpPad" x1="8" y1="8" x2="16" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#1C2028" />
        <stop offset="50%"  stopColor="#383C48" />
        <stop offset="100%" stopColor="#1C2028" />
      </linearGradient>
    </defs>

    {/* ── Headband arc ── */}
    <path d="M4.5 15Q4.5 3 19.5 15" stroke="url(#umHlpBand)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    {/* Headband specular streak */}
    <path d="M5.5 13Q5.8 5 18.5 13" stroke="#A0A8B0" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.38" />
    {/* Headband padding strip */}
    <path d="M8.5 9Q12 5.5 15.5 9" stroke="url(#umHlpPad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

    {/* ── Left ear cup ── */}
    <circle cx="4.5" cy="15.5" r="3.5" fill="url(#umHlpCup)" />
    {/* Left cup gloss */}
    <circle cx="4.5" cy="15.5" r="3.5" fill="url(#umHlpGl)" />
    {/* Left cup inner grille ring */}
    <circle cx="4.5" cy="15.5" r="2.2" stroke="#384050" strokeWidth="0.55" fill="none" opacity="0.55" />
    {/* Left cup grille dots */}
    <circle cx="4.5"  cy="14.5" r="0.5" fill="#384050" opacity="0.50" />
    <circle cx="3.55" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    <circle cx="5.45" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    {/* Left cup specular glint */}
    <circle cx="3.4" cy="14.3" r="0.55" fill="#7A8090" opacity="0.52" />
    {/* Left cup outline */}
    <circle cx="4.5" cy="15.5" r="3.5" stroke="#1A1E28" strokeWidth="0.5" fill="none" opacity="0.45" />

    {/* ── Right ear cup ── */}
    <circle cx="19.5" cy="15.5" r="3.5" fill="url(#umHlpCup)" />
    {/* Right cup gloss */}
    <circle cx="19.5" cy="15.5" r="3.5" fill="url(#umHlpGl)" />
    {/* Right cup inner grille ring */}
    <circle cx="19.5" cy="15.5" r="2.2" stroke="#384050" strokeWidth="0.55" fill="none" opacity="0.55" />
    {/* Right cup grille dots */}
    <circle cx="19.5" cy="14.5" r="0.5" fill="#384050" opacity="0.50" />
    <circle cx="18.55" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    <circle cx="20.45" cy="15.8" r="0.5" fill="#384050" opacity="0.45" />
    {/* Right cup specular glint */}
    <circle cx="18.4" cy="14.3" r="0.55" fill="#7A8090" opacity="0.52" />
    {/* Right cup outline */}
    <circle cx="19.5" cy="15.5" r="3.5" stroke="#1A1E28" strokeWidth="0.5" fill="none" opacity="0.45" />

    {/* ── Mic boom arm ── */}
    <path d="M3.2 18.2Q3.5 21.5 8.5 21.5" stroke="url(#umHlpMic)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Mic arm specular */}
    <path d="M3.5 18.5Q3.8 21 8.5 21" stroke="#8890A0" strokeWidth="0.4" strokeLinecap="round" fill="none" opacity="0.38" />
    {/* Mic capsule */}
    <rect x="8.5" y="20" width="3.2" height="3" rx="1.5" fill="url(#umHlpMic)" />
    {/* Capsule specular */}
    <rect x="8.9" y="20.4" width="1.2" height="0.7" rx="0.35" fill="#8890A0" opacity="0.42" />
    {/* Capsule outline */}
    <rect x="8.5" y="20" width="3.2" height="3" rx="1.5" stroke="#1A1E28" strokeWidth="0.42" fill="none" opacity="0.42" />
  </svg>
);

// ── Logout — iOS-style: three-piece mahogany door bracket, gold knob, crimson exit arrow with glow ──
export const LogoutIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bracket: near-black shadow left → warm mahogany → brown highlight right */}
      <linearGradient id="umLoBkt" x1="3" y1="12" x2="15.2" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#180A04" />
        <stop offset="35%"  stopColor="#502010" />
        <stop offset="68%"  stopColor="#6E3018" />
        <stop offset="100%" stopColor="#240E06" />
      </linearGradient>
      {/* Exit arrow: bright crimson → deep red → burgundy */}
      <linearGradient id="umLoArr" x1="8" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FF4848" />
        <stop offset="50%"  stopColor="#D01828" />
        <stop offset="100%" stopColor="#8A0A18" />
      </linearGradient>
      {/* Gold knob: bright ivory-gold core → deep amber */}
      <radialGradient id="umLoKnob" cx="38%" cy="32%" r="70%">
        <stop offset="0%"   stopColor="#F0D040" />
        <stop offset="55%"  stopColor="#C89018" />
        <stop offset="100%" stopColor="#8A6008" />
      </radialGradient>
      {/* Bracket gloss dome */}
      <radialGradient id="umLoGl" cx="30%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Left vertical bar ── */}
    <rect x="3" y="3" width="3.2" height="18" rx="1" fill="url(#umLoBkt)" />
    <rect x="3" y="3" width="3.2" height="18" rx="1" fill="url(#umLoGl)" />
    <line x1="4.2" y1="4" x2="4.2" y2="20" stroke="#C06030" strokeWidth="0.55" strokeLinecap="round" opacity="0.35" />
    <rect x="3" y="3" width="3.2" height="18" rx="1" stroke="#180A04" strokeWidth="0.45" fill="none" opacity="0.45" />

    {/* ── Top horizontal bar ── */}
    <rect x="3" y="3" width="12.2" height="3.2" rx="1" fill="url(#umLoBkt)" />
    <rect x="3" y="3" width="12.2" height="3.2" rx="1" fill="url(#umLoGl)" />
    <line x1="4" y1="4.1" x2="14.5" y2="4.1" stroke="#C06030" strokeWidth="0.55" strokeLinecap="round" opacity="0.35" />
    <rect x="3" y="3" width="12.2" height="3.2" rx="1" stroke="#180A04" strokeWidth="0.45" fill="none" opacity="0.45" />

    {/* ── Bottom horizontal bar ── */}
    <rect x="3" y="17.8" width="12.2" height="3.2" rx="1" fill="url(#umLoBkt)" />
    <rect x="3" y="17.8" width="12.2" height="3.2" rx="1" fill="url(#umLoGl)" />
    <line x1="4" y1="18.9" x2="14.5" y2="18.9" stroke="#C06030" strokeWidth="0.55" strokeLinecap="round" opacity="0.35" />
    <rect x="3" y="17.8" width="12.2" height="3.2" rx="1" stroke="#180A04" strokeWidth="0.45" fill="none" opacity="0.45" />

    {/* ── Door interior panel detail lines ── */}
    <line x1="7" y1="8.5"  x2="13.5" y2="8.5"  stroke="#5A2810" strokeWidth="0.6" strokeLinecap="round" opacity="0.45" />
    <line x1="7" y1="15.5" x2="13.5" y2="15.5" stroke="#5A2810" strokeWidth="0.6" strokeLinecap="round" opacity="0.40" />

    {/* ── Exit arrow shaft (rendered before knob so knob sits on top) ── */}
    <line x1="8" y1="12" x2="20.5" y2="12" stroke="url(#umLoArr)" strokeWidth="2.0" strokeLinecap="round" />
    {/* Arrow soft glow halo */}
    <line x1="8" y1="12" x2="20.5" y2="12" stroke="#FF4848" strokeWidth="0.5" strokeLinecap="round" opacity="0.28" />

    {/* ── Gold door knob (on top of arrow shaft) ── */}
    <circle cx="13.2" cy="12" r="1.4" fill="url(#umLoKnob)" />
    <circle cx="12.75" cy="11.55" r="0.46" fill="#FFFDE0" opacity="0.62" />

    {/* ── Exit arrowhead ── */}
    <path d="M17.5 9L21 12L17.5 15" stroke="url(#umLoArr)" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
