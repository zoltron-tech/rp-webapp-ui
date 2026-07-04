import type { FC } from "react";

type SvgProps = { size?: number };

// ── 1. Open Book — iOS-style: gradient parchment pages, embossed burgundy spine, shadow folds, ribbon bookmark ──
const BookIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Left page: light upper-left → amber lower-right */}
      <linearGradient id="bkPgL" x1="2" y1="4" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFDE8" />
        <stop offset="55%"  stopColor="#F0D878" />
        <stop offset="100%" stopColor="#C49028" />
      </linearGradient>
      {/* Right page: bright upper-right → warm lower-left */}
      <linearGradient id="bkPgR" x1="22" y1="4" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="60%"  stopColor="#F8EFC0" />
        <stop offset="100%" stopColor="#D8B848" />
      </linearGradient>
      {/* Spine: dark edge → burgundy highlight → dark edge */}
      <linearGradient id="bkSp" x1="10.5" y1="13" x2="13.5" y2="13" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#520A18" />
        <stop offset="38%"  stopColor="#A01E3A" />
        <stop offset="62%"  stopColor="#C83058" />
        <stop offset="100%" stopColor="#600A1E" />
      </linearGradient>
      {/* Bookmark: vivid crimson left → rose highlight → deep right */}
      <linearGradient id="bkBm" x1="17.5" y1="7" x2="20.5" y2="7" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D81430" />
        <stop offset="42%"  stopColor="#FF3C58" />
        <stop offset="100%" stopColor="#A00820" />
      </linearGradient>
    </defs>

    {/* ── Pages ── */}
    <path d="M12 6.5Q4.5 4 2 7v13.5Q4.5 23 12 21z" fill="url(#bkPgL)" />
    <path d="M12 6.5Q19.5 4 22 7v13.5Q19.5 23 12 21z" fill="url(#bkPgR)" />

    {/* Shadow fold — left page darkens toward spine */}
    <path d="M12 6.5Q10.2 5.8 9.2 6.6v15Q10.5 22 12 21z" fill="#8B6010" opacity="0.22" />
    {/* Shadow fold — right page darkens toward spine */}
    <path d="M12 6.5Q13.8 5.8 14.8 6.6v15Q13.5 22 12 21z" fill="#9A7018" opacity="0.18" />

    {/* Specular sheen — left page upper edge */}
    <path d="M3 8.5Q5.5 7.2 8.5 8" stroke="#FFFEF0" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    {/* Specular sheen — right page upper edge */}
    <path d="M21 8.5Q18.5 7.2 15.5 8" stroke="#FFFFFB" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />

    {/* Visible page-stack edge — left side */}
    <path d="M2.2 7.2Q1.4 10 1.4 14Q1.4 18 2.2 21" stroke="#D4B050" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Visible page-stack edge — right side */}
    <path d="M21.8 7.2Q22.6 10 22.6 14Q22.6 18 21.8 21" stroke="#E8D080" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.5" />

    {/* ── Text lines — left page (slightly angled for natural feel) ── */}
    <line x1="4.2" y1="11"   x2="10.6" y2="10.7" stroke="#A87828" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="4.2" y1="13.8" x2="10.6" y2="13.5" stroke="#A87828" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="4.2" y1="16.5" x2="8.2"  y2="16.3" stroke="#A87828" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
    {/* Decorative drop-cap block */}
    <rect x="4.2" y="8.8" width="1.8" height="1.6" rx="0.3" fill="#A87828" opacity="0.45" />

    {/* ── Text lines — right page ── */}
    <line x1="13.4" y1="11"   x2="19.8" y2="10.7" stroke="#B89030" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="13.4" y1="13.8" x2="19.8" y2="13.5" stroke="#B89030" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="15.6" y1="16.5" x2="19.8" y2="16.3" stroke="#B89030" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />

    {/* ── Spine ── */}
    <rect x="10.8" y="6.5" width="2.4" height="14.5" fill="url(#bkSp)" rx="0.4" />
    {/* Spine highlight streak */}
    <line x1="12.6" y1="7" x2="12.6" y2="20.5" stroke="#E07898" strokeWidth="0.45" opacity="0.38" />
    {/* Spine stitching dots */}
    <circle cx="12" cy="9.2"  r="0.5" fill="#3A0610" />
    <circle cx="12" cy="12"   r="0.5" fill="#3A0610" />
    <circle cx="12" cy="14.8" r="0.5" fill="#3A0610" />
    <circle cx="12" cy="17.6" r="0.5" fill="#3A0610" />
    {/* Gold binding cap — top */}
    <path d="M10.5 6.5h3" stroke="#C8A028" strokeWidth="1.3" strokeLinecap="round" />
    {/* Gold binding cap — bottom */}
    <path d="M10.5 21h3"  stroke="#C8A028" strokeWidth="1.3" strokeLinecap="round" />

    {/* ── Bookmark ribbon ── */}
    <path d="M17.5 6.8v9l1.5-2.1 1.5 2.1V6.8z" fill="url(#bkBm)" />
    {/* Ribbon highlight streak */}
    <line x1="18.15" y1="7.2" x2="18.15" y2="13.4" stroke="#FF8898" strokeWidth="0.45" opacity="0.55" />
    {/* Ribbon gold tip accent */}
    <path d="M18.2 16.2L19 14.6L19.8 16.2" stroke="#C8A028" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65" />

    {/* ── Page outlines ── */}
    <path d="M12 6.5Q4.5 4 2 7v13.5Q4.5 23 12 21z"   stroke="#7A4510" strokeWidth="0.8" fill="none" />
    <path d="M12 6.5Q19.5 4 22 7v13.5Q19.5 23 12 21z" stroke="#7A4510" strokeWidth="0.8" fill="none" />
  </svg>
);

// ── 2. Quill — iOS-style: gradient vanes, dense barbs, gold rachis highlight, glossy ink drip ──
const QuillIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Shadow vane: warm tan base → muted amber */}
      <linearGradient id="qlVS" x1="4" y1="20" x2="18" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A89050" />
        <stop offset="55%"  stopColor="#CEC088" />
        <stop offset="100%" stopColor="#B0985A" />
      </linearGradient>
      {/* Highlight vane: bright ivory top → pale gold base */}
      <linearGradient id="qlVH" x1="20" y1="4" x2="5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FDFAF0" />
        <stop offset="55%"  stopColor="#F0E8C8" />
        <stop offset="100%" stopColor="#D8C080" />
      </linearGradient>
      {/* Rachis: dull gold tip → bright gold mid → amber base */}
      <linearGradient id="qlRa" x1="20" y1="4" x2="5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7218" />
        <stop offset="35%"  stopColor="#E8C838" />
        <stop offset="70%"  stopColor="#D0A820" />
        <stop offset="100%" stopColor="#806010" />
      </linearGradient>
      {/* Ink drip: deep-blue highlight core → midnight edge */}
      <radialGradient id="qlInk" cx="38%" cy="32%" r="68%">
        <stop offset="0%"   stopColor="#2E3E80" />
        <stop offset="100%" stopColor="#07091E" />
      </radialGradient>
    </defs>

    {/* ── Shadow vane (lower / left face of feather) ── */}
    <path d="M4.5 19.5C6.5 13.5 10.5 8.5 20 4C15.5 9 9.5 14 5.5 19.5z" fill="url(#qlVS)" />
    {/* Outer-edge darkening on shadow vane */}
    <path d="M5 19C6.5 14 9.5 10 13 7" stroke="#806018" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.28" />

    {/* ── Highlight vane (upper / right face) ── */}
    <path d="M4.5 19.5C7.5 14.5 12.5 9.5 20 4C18.5 9.5 14 15 7 19.5z" fill="url(#qlVH)" />
    {/* Specular sheen along highlight vane */}
    <path d="M18.8 5.5C17 9 13.5 12.5 10 16" stroke="#FFFEF4" strokeWidth="1.05" strokeLinecap="round" opacity="0.65" />

    {/* ── Barbs — shadow side (left of rachis) ── */}
    <path d="M17 6.5C15 8.5 13 11 12 13"   stroke="#A89040" strokeWidth="0.55" strokeLinecap="round" opacity="0.72" />
    <path d="M14.8 8C13 10 11 12.5 10 15"   stroke="#A89040" strokeWidth="0.55" strokeLinecap="round" opacity="0.65" />
    <path d="M12.5 10C11 12 9.5 14.5 8.5 17" stroke="#A89040" strokeWidth="0.55" strokeLinecap="round" opacity="0.58" />
    <path d="M10.5 12C9 14 8 16.5 7 18.5"   stroke="#A89040" strokeWidth="0.55" strokeLinecap="round" opacity="0.52" />

    {/* ── Barbs — highlight side (right of rachis) ── */}
    <path d="M18.5 5.5C18 7.5 17 10 16 12"   stroke="#C8A838" strokeWidth="0.55" strokeLinecap="round" opacity="0.62" />
    <path d="M17 7C16 9.5 15 12 13.5 14"     stroke="#C8A838" strokeWidth="0.55" strokeLinecap="round" opacity="0.56" />
    <path d="M15 9C13.8 11.5 12.5 14 11.5 16" stroke="#C8A838" strokeWidth="0.55" strokeLinecap="round" opacity="0.50" />

    {/* ── Rachis (central shaft) ── */}
    <line x1="20" y1="4" x2="5" y2="19" stroke="url(#qlRa)" strokeWidth="1.35" strokeLinecap="round" />
    {/* Rachis specular streak */}
    <line x1="19.3" y1="4.7" x2="5.7" y2="18.3" stroke="#FFF090" strokeWidth="0.4" strokeLinecap="round" opacity="0.52" />

    {/* ── Calamus (translucent hollow base) ── */}
    <path d="M7 17.5Q5.8 18.5 5.2 19" stroke="#C8B860" strokeWidth="2.0" strokeLinecap="round" opacity="0.42" />

    {/* ── Ink nib ── */}
    <path d="M5.2 18.8L3.7 21.3" stroke="#141C50" strokeWidth="2.3" strokeLinecap="round" />
    {/* Nib ink-channel slit */}
    <line x1="4.8" y1="19.5" x2="4.0" y2="21.1" stroke="#2C3E80" strokeWidth="0.5" strokeLinecap="round" opacity="0.62" />

    {/* ── Ink drip ── */}
    <circle cx="3.5" cy="21.9" r="1.15" fill="url(#qlInk)" />
    {/* Drip gloss spot */}
    <circle cx="3.1" cy="21.45" r="0.40" fill="#4A5CA8" opacity="0.62" />
  </svg>
);

// ── 3. Fountain Pen — iOS-style: lacquer barrel gradient, gold band, faceted nib, glossy ink drip ──
const PenIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Barrel: very dark shadow edge → rich green body → highlight face */}
      <linearGradient id="pnBr" x1="5" y1="19" x2="21" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0C2015" />
        <stop offset="35%"  stopColor="#1B4D2C" />
        <stop offset="68%"  stopColor="#2C6E3E" />
        <stop offset="100%" stopColor="#194824" />
      </linearGradient>
      {/* Cap end */}
      <linearGradient id="pnCap" x1="18" y1="6" x2="22" y2="3.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#245E34" />
        <stop offset="100%" stopColor="#173E22" />
      </linearGradient>
      {/* Gold nib: amber base → bright gold center */}
      <linearGradient id="pnNib" x1="3.5" y1="23.5" x2="8.5" y2="18.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7010" />
        <stop offset="48%"  stopColor="#EAC830" />
        <stop offset="100%" stopColor="#C09808" />
      </linearGradient>
      {/* Gold band */}
      <linearGradient id="pnBnd" x1="15.5" y1="7.5" x2="19.5" y2="11.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#EED048" />
        <stop offset="50%"  stopColor="#FFF078" />
        <stop offset="100%" stopColor="#B88C18" />
      </linearGradient>
      {/* Ink drip */}
      <radialGradient id="pnInk" cx="36%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#2C3C80" />
        <stop offset="100%" stopColor="#07091C" />
      </radialGradient>
    </defs>

    {/* ── Barrel ── */}
    <path d="M5.5 18.5L18 6L21 9L8.5 21.5z" fill="url(#pnBr)" />
    {/* Lacquer gloss streak (left face) */}
    <path d="M7.5 16.8L17 7.3" stroke="#5AAA70" strokeWidth="0.9" strokeLinecap="round" opacity="0.38" />
    {/* Shadow edge (right face) */}
    <path d="M10 21L21 10" stroke="#050F08" strokeWidth="0.85" strokeLinecap="round" opacity="0.28" />
    {/* Fine specular line */}
    <path d="M8.2 15.8L15.8 8.2" stroke="#C0E8C8" strokeWidth="0.45" strokeLinecap="round" opacity="0.32" />

    {/* ── Cap end ── */}
    <path d="M18 6L20.5 3.5C21.7 4.1 22.3 6.4 21 9z" fill="url(#pnCap)" />
    {/* Cap specular */}
    <path d="M19.5 4.4L21 5.6" stroke="#68B880" strokeWidth="0.7" strokeLinecap="round" opacity="0.52" />
    {/* Press-button at tip */}
    <circle cx="20.9" cy="3.6" r="0.85" fill="#C8A828" />
    <circle cx="20.6" cy="3.3" r="0.32" fill="#FFE870" opacity="0.72" />

    {/* ── Gold bands ── */}
    <line x1="15.8" y1="7.8" x2="18.8" y2="10.8" stroke="url(#pnBnd)" strokeWidth="2.1" strokeLinecap="round" />
    <line x1="14.7" y1="8.9" x2="17.7" y2="11.9" stroke="#D4A828" strokeWidth="0.8" strokeLinecap="round" opacity="0.68" />

    {/* ── Gold nib ── */}
    <path d="M5.5 18.5L8.5 21.5L3.4 23.6z" fill="url(#pnNib)" />
    {/* Nib facet highlight */}
    <line x1="5.9" y1="19.0" x2="7.6" y2="20.8" stroke="#FFE870" strokeWidth="0.5" strokeLinecap="round" opacity="0.52" />
    {/* Ink channel slit */}
    <line x1="5.8" y1="19.3" x2="4.4" y2="22.3" stroke="#0A1020" strokeWidth="0.78" strokeLinecap="round" />

    {/* ── Ink drip ── */}
    <circle cx="3.4" cy="23.3" r="1.05" fill="url(#pnInk)" />
    <circle cx="3.0" cy="22.9" r="0.36" fill="#3A50A8" opacity="0.60" />
  </svg>
);

// ── 4. Rose — iOS-style: directional petal gradients, velvet spiral center, stem gradient, dew drop ──
const RoseIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Top petal: dark maroon tip → bright crimson base */}
      <linearGradient id="rsTP" x1="12" y1="1" x2="12" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#720A18" />
        <stop offset="55%"  stopColor="#D01E48" />
        <stop offset="100%" stopColor="#F04070" />
      </linearGradient>
      {/* Bottom petal: dark maroon tip → bright crimson base */}
      <linearGradient id="rsBP" x1="12" y1="22" x2="12" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#680818" />
        <stop offset="55%"  stopColor="#C01A40" />
        <stop offset="100%" stopColor="#E82E60" />
      </linearGradient>
      {/* Left petal: dark maroon tip → bright base */}
      <linearGradient id="rsLP" x1="1" y1="11" x2="11" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#600818" />
        <stop offset="55%"  stopColor="#BE1840" />
        <stop offset="100%" stopColor="#E02858" />
      </linearGradient>
      {/* Right petal: dark maroon tip → bright base */}
      <linearGradient id="rsRP" x1="23" y1="11" x2="13" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#680818" />
        <stop offset="55%"  stopColor="#C41A42" />
        <stop offset="100%" stopColor="#E83060" />
      </linearGradient>
      {/* Velvet center: rose highlight → deep maroon → near-black core */}
      <radialGradient id="rsCtr" cx="36%" cy="32%" r="72%">
        <stop offset="0%"   stopColor="#C02848" />
        <stop offset="52%"  stopColor="#780E22" />
        <stop offset="100%" stopColor="#38040E" />
      </radialGradient>
      {/* Stem */}
      <linearGradient id="rsSt" x1="11" y1="22" x2="13" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#18481A" />
        <stop offset="50%"  stopColor="#387838" />
        <stop offset="100%" stopColor="#1C5020" />
      </linearGradient>
    </defs>

    {/* ── Four petals ── */}
    <ellipse cx="12" cy="5.5"  rx="3.2" ry="4.8" fill="url(#rsTP)" />
    <ellipse cx="6"  cy="11"   rx="4.8" ry="3.2" fill="url(#rsLP)" />
    <ellipse cx="18" cy="11"   rx="4.8" ry="3.2" fill="url(#rsRP)" />
    <ellipse cx="12" cy="16.5" rx="3.2" ry="4.8" fill="url(#rsBP)" />

    {/* Petal center veins */}
    <line x1="12" y1="2.5"  x2="12" y2="9.5"  stroke="#F87098" strokeWidth="0.52" strokeLinecap="round" opacity="0.52" />
    <line x1="2.5" y1="11"  x2="9.5" y2="11"  stroke="#E86080" strokeWidth="0.52" strokeLinecap="round" opacity="0.48" />
    <line x1="21.5" y1="11" x2="14.5" y2="11" stroke="#F06888" strokeWidth="0.52" strokeLinecap="round" opacity="0.48" />
    <line x1="12" y1="19.8" x2="12"  y2="13"  stroke="#E06080" strokeWidth="0.52" strokeLinecap="round" opacity="0.42" />

    {/* Top petal outer-edge specular */}
    <path d="M10.4 2.4Q12 1.6 13.6 2.4" stroke="#FF9AB0" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.62" />
    {/* Left petal outer-edge specular */}
    <path d="M2.4 9.4Q1.6 11 2.4 12.6" stroke="#F07090" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.55" />

    {/* ── Velvet center ── */}
    <circle cx="12" cy="11" r="3.5" fill="url(#rsCtr)" />
    {/* Spiral petal curl */}
    <path d="M12 9.0Q13.8 9.8 13.2 11.5Q12.2 12.8 10.8 12.0Q10.0 10.8 11.0 9.9Q11.7 9.2 12 9.0Z"
          fill="#9E1830" opacity="0.58" />
    {/* Center specular glint */}
    <circle cx="10.9" cy="9.7" r="0.72" fill="#E04F70" opacity="0.42" />
    <circle cx="10.5" cy="9.4" r="0.30" fill="#FF90A8" opacity="0.50" />

    {/* ── Stem ── */}
    <line x1="12" y1="20.5" x2="12" y2="23.8" stroke="url(#rsSt)" strokeWidth="2.3" strokeLinecap="round" />
    {/* Thorn */}
    <path d="M11.2 22.2Q9.6 21.6 10.1 20.4" stroke="#286020" strokeWidth="0.95" strokeLinecap="round" fill="none" />

    {/* ── Leaf ── */}
    <path d="M12 22.8Q8.8 21.2 9.3 18.5Q11.9 20.6 12 22.8Z" fill="#2C6C2C" />
    <path d="M12 22.4Q10.4 20.8 9.7 19.0" stroke="#3A8A3A" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.62" />

    {/* ── Dew drop on top petal ── */}
    <ellipse cx="13.9" cy="4.3" rx="0.95" ry="0.68" fill="#FFFFFF" opacity="0.26" />
    <ellipse cx="13.65" cy="4.05" rx="0.42" ry="0.30" fill="#FFFFFF" opacity="0.48" />
  </svg>
);

// ── 6. Scroll — iOS-style: gradient parchment, cylindrical roll-caps with highlight, aged edges, wax seal ──
const ScrollIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Parchment: bright warm top-left → amber lower-right */}
      <linearGradient id="scParch" x1="5" y1="6.5" x2="19" y2="17.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFF9DC" />
        <stop offset="50%"  stopColor="#F2D878" />
        <stop offset="100%" stopColor="#C69828" />
      </linearGradient>
      {/* Roll cap: dark edge → bright gold crest → dark edge */}
      <linearGradient id="scRoll" x1="5" y1="6.5" x2="19" y2="6.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7018" />
        <stop offset="28%"  stopColor="#DCB438" />
        <stop offset="58%"  stopColor="#F0D060" />
        <stop offset="100%" stopColor="#A07820" />
      </linearGradient>
      {/* Roll inner highlight */}
      <linearGradient id="scRollH" x1="7" y1="6.5" x2="17" y2="6.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C8A028" />
        <stop offset="44%"  stopColor="#FAEEA0" />
        <stop offset="100%" stopColor="#C8A028" />
      </linearGradient>
    </defs>

    {/* ── Parchment body ── */}
    <rect x="5" y="6.5" width="14" height="11" fill="url(#scParch)" />
    {/* Aged edge shadow — left */}
    <rect x="5" y="6.5" width="2" height="11" fill="#9A7010" opacity="0.20" />
    {/* Aged edge shadow — right */}
    <rect x="17" y="6.5" width="2" height="11" fill="#886008" opacity="0.20" />
    {/* Parchment outline */}
    <rect x="5" y="6.5" width="14" height="11" stroke="#9A7018" strokeWidth="0.75" fill="none" />

    {/* ── Top roll cap ── */}
    <ellipse cx="12" cy="6.5"  rx="7"   ry="2.6"  fill="url(#scRoll)" />
    <ellipse cx="12" cy="6.5"  rx="5.4" ry="1.55" fill="url(#scRollH)" />
    {/* Top roll cast shadow on parchment */}
    <ellipse cx="12" cy="7.9"  rx="6.8" ry="0.95" fill="#7A5808" opacity="0.16" />

    {/* ── Bottom roll cap ── */}
    <ellipse cx="12" cy="17.5" rx="7"   ry="2.6"  fill="url(#scRoll)" />
    <ellipse cx="12" cy="17.5" rx="5.4" ry="1.55" fill="url(#scRollH)" />
    {/* Bottom roll top-edge highlight on parchment */}
    <ellipse cx="12" cy="16.2" rx="6.4" ry="0.80" fill="#F0E080" opacity="0.18" />

    {/* ── Sepia writing lines ── */}
    <line x1="7.5" y1="9.5"  x2="16.5" y2="9.5"  stroke="#7A4818" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="7.5" y1="11.5" x2="16.5" y2="11.5" stroke="#7A4818" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="7.5" y1="13.5" x2="16.5" y2="13.5" stroke="#7A4818" strokeWidth="0.88" strokeLinecap="round" />
    <line x1="7.5" y1="15.5" x2="12.5" y2="15.5" stroke="#7A4818" strokeWidth="0.88" strokeLinecap="round" opacity="0.72" />
    {/* Drop-cap block */}
    <rect x="7.5" y="8.2" width="2.0" height="1.0" rx="0.25" fill="#7A4818" opacity="0.48" />
    {/* Wax seal */}
    <circle cx="15.5" cy="15.2" r="1.15" fill="#A01828" opacity="0.58" />
    <circle cx="15.5" cy="15.2" r="0.55" fill="#CC2838" opacity="0.48" />
    <circle cx="15.2" cy="14.9" r="0.25" fill="#FF6070" opacity="0.40" />
  </svg>
);

// ── 7. Inkwell — iOS-style: glassy midnight jar gradient, radial ink pool, gold trim, gradient quill ──
const InkwellIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Jar body: near-black left shadow → deep navy → slate-blue highlight */}
      <linearGradient id="iwJar" x1="6.5" y1="14" x2="17.5" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#050A1A" />
        <stop offset="22%"  stopColor="#0D1A34" />
        <stop offset="65%"  stopColor="#192C52" />
        <stop offset="100%" stopColor="#091220" />
      </linearGradient>
      {/* Shoulder */}
      <linearGradient id="iwSh" x1="6" y1="5" x2="18" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0C1828" />
        <stop offset="55%"  stopColor="#1C2C48" />
        <stop offset="100%" stopColor="#0A1422" />
      </linearGradient>
      {/* Ink pool: deep navy center → near-black edge */}
      <radialGradient id="iwInk" cx="40%" cy="38%" r="72%">
        <stop offset="0%"   stopColor="#0C1430" />
        <stop offset="100%" stopColor="#020306" />
      </radialGradient>
      {/* Gold band: dark edge → bright crest → dark edge */}
      <linearGradient id="iwGold" x1="6.5" y1="8" x2="17.5" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7010" />
        <stop offset="45%"  stopColor="#F2D050" />
        <stop offset="100%" stopColor="#9A7010" />
      </linearGradient>
      {/* Quill shaft: amber base → ivory tip */}
      <linearGradient id="iwQu" x1="15.5" y1="8" x2="15.5" y2="3.2" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#BEA450" />
        <stop offset="100%" stopColor="#F8F0D0" />
      </linearGradient>
    </defs>

    {/* ── Jar body ── */}
    <path d="M6.5 8h11v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V8z" fill="url(#iwJar)" />
    {/* Glass highlight — left face */}
    <path d="M8.0 9.5v8.0" stroke="#1E3A60" strokeWidth="1.45" strokeLinecap="round" opacity="0.72" />
    {/* Glass specular streak */}
    <path d="M8.6 10.5v5.5" stroke="#2A4878" strokeWidth="0.48" strokeLinecap="round" opacity="0.42" />
    {/* Right edge subtle reflection */}
    <path d="M16.8 10v6.5" stroke="#0D1E38" strokeWidth="0.6" strokeLinecap="round" opacity="0.32" />

    {/* ── Ink pool ── */}
    <ellipse cx="12" cy="13.5" rx="4.5" ry="1.08" fill="url(#iwInk)" />
    {/* Pool surface rim highlight */}
    <ellipse cx="11.4" cy="13.2" rx="2.0"  ry="0.38" fill="#182840" opacity="0.42" />

    {/* ── Shoulder / mouth ── */}
    <path d="M8 5h8l2 3H6L8 5z" fill="url(#iwSh)" />
    <path d="M8.5 5.5h7" stroke="#283C58" strokeWidth="0.58" strokeLinecap="round" opacity="0.48" />

    {/* ── Gold trim ── */}
    <path d="M6.5 8h11" stroke="url(#iwGold)" strokeWidth="1.65" strokeLinecap="round" />
    <line x1="9" y1="8" x2="15" y2="8" stroke="#FFF0A0" strokeWidth="0.42" strokeLinecap="round" opacity="0.52" />
    <line x1="8" y1="5" x2="16" y2="5" stroke="#D4A828" strokeWidth="0.95" strokeLinecap="round" />

    {/* ── Quill shaft ── */}
    <line x1="15.5" y1="8" x2="15.5" y2="3.2" stroke="url(#iwQu)" strokeWidth="1.72" strokeLinecap="round" />
    {/* Rachis specular */}
    <line x1="15.75" y1="3.5" x2="15.75" y2="7.5" stroke="#FFF0C8" strokeWidth="0.38" strokeLinecap="round" opacity="0.46" />
    {/* Feather vane — highlight side */}
    <path d="M15.5 3.2C13.2 3.9 12.8 5.5 15.5 5.7" stroke="#D4C888" strokeWidth="1.08" fill="none" strokeLinecap="round" />
    {/* Feather vane — shadow side */}
    <path d="M15.5 3.2C14.2 4.1 14.0 5.2 15.5 5.7" stroke="#A89040" strokeWidth="0.58" fill="none" strokeLinecap="round" opacity="0.58" />
    {/* Barb lines */}
    <path d="M15.5 4.5C14.6 4.7 14.0 5.1 13.8 5.5" stroke="#C8B060" strokeWidth="0.45" strokeLinecap="round" opacity="0.55" />
    <path d="M15.5 5.2C14.5 5.3 14.0 5.6 13.9 5.9" stroke="#C8B060" strokeWidth="0.45" strokeLinecap="round" opacity="0.45" />
  </svg>
);

// ── 8. Candle — iOS-style: gradient wax body, multi-layer flame with blue base, glow halo, double drips ──
const CandleIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Wax body: bright left face → warm cream center → amber right shadow */}
      <linearGradient id="cdWax" x1="8" y1="16" x2="16" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#EED8B8" />
        <stop offset="38%"  stopColor="#FAF0DC" />
        <stop offset="100%" stopColor="#D4BA88" />
      </linearGradient>
      {/* Wax pool: bright center → warm amber rim */}
      <radialGradient id="cdPool" cx="42%" cy="42%" r="72%">
        <stop offset="0%"   stopColor="#FFFAE8" />
        <stop offset="100%" stopColor="#D4B880" />
      </radialGradient>
      {/* Flame outer: deep orange base → bright amber mid → pale gold tip */}
      <linearGradient id="cdFlO" x1="12" y1="8" x2="12" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D87008" />
        <stop offset="48%"  stopColor="#F09020" />
        <stop offset="100%" stopColor="#FFC050" />
      </linearGradient>
      {/* Flame inner: bright yellow base → near-white hot tip */}
      <linearGradient id="cdFlI" x1="12" y1="7.5" x2="12" y2="3.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFE028" />
        <stop offset="65%"  stopColor="#FFF880" />
        <stop offset="100%" stopColor="#FFFFF4" />
      </linearGradient>
    </defs>

    {/* ── Flame glow halo ── */}
    <ellipse cx="12" cy="5.2" rx="3.8" ry="4.2" fill="#F09020" opacity="0.11" />

    {/* ── Flame outer ── */}
    <path d="M12 8c-2.3-3.2-2.1-5.3 0-6.3s2.3 3.1 0 6.3z" fill="url(#cdFlO)" />
    {/* Flame inner */}
    <path d="M12 7.6c-1.1-1.9-1.05-3.3 0-3.9s1.1 2.0 0 3.9z" fill="url(#cdFlI)" />
    {/* Blue combustion zone at base of flame */}
    <ellipse cx="12" cy="7.85" rx="0.95" ry="0.58" fill="#90C0FF" opacity="0.42" />
    {/* Hot bright core tip */}
    <circle cx="12" cy="3.9" r="0.62" fill="#FFFFF8" opacity="0.92" />

    {/* ── Wick ── */}
    <path d="M12 8.3Q11.65 9.6 12 11" stroke="#281005" strokeWidth="1.58" strokeLinecap="round" fill="none" />
    {/* Ember glow at wick tip */}
    <circle cx="12" cy="8.25" r="0.55" fill="#FF5C10" opacity="0.72" />

    {/* ── Wax pool ── */}
    <ellipse cx="12" cy="11" rx="4.1" ry="1.08" fill="url(#cdPool)" />
    <ellipse cx="12" cy="11" rx="4.1" ry="1.08" stroke="#C0A058" strokeWidth="0.48" fill="none" />

    {/* ── Candle body ── */}
    <rect x="8" y="11" width="8" height="11" rx="1" fill="url(#cdWax)" />
    {/* Left face specular streak */}
    <line x1="9.2" y1="11.8" x2="9.2" y2="21.5" stroke="#FFF8EE" strokeWidth="0.65" strokeLinecap="round" opacity="0.42" />
    {/* Right face shadow edge */}
    <line x1="15.2" y1="11.8" x2="15.2" y2="21.5" stroke="#A88840" strokeWidth="0.65" strokeLinecap="round" opacity="0.32" />
    {/* Wax texture rings */}
    <line x1="9" y1="14.2" x2="15" y2="14.2" stroke="#DCCA98" strokeWidth="0.78" strokeLinecap="round" opacity="0.68" />
    <line x1="9" y1="17.2" x2="15" y2="17.2" stroke="#DCCA98" strokeWidth="0.78" strokeLinecap="round" opacity="0.58" />
    <line x1="9" y1="20.2" x2="15" y2="20.2" stroke="#DCCA98" strokeWidth="0.78" strokeLinecap="round" opacity="0.48" />

    {/* ── Wax drips ── */}
    <path d="M8.5 13.8Q7.5 15.5 7.7 17.8Q8.2 17.8 8.5 16Q8.75 14.6 8.5 13.8Z" fill="#EDD5A8" />
    <path d="M15.5 16.2Q14.7 17.8 14.9 19.4Q15.25 19.4 15.5 18Q15.72 17.0 15.5 16.2Z" fill="#E8CE9E" opacity="0.82" />
  </svg>
);

// ── 9. Star — iOS-style: gradient gold body, shadow facets, specular streaks, radial center glow ──
const StarIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Star body: bright ivory-gold top-left → rich amber → deep shadow lower-right */}
      <linearGradient id="stGld" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFF090" />
        <stop offset="35%"  stopColor="#F0C820" />
        <stop offset="70%"  stopColor="#D4A010" />
        <stop offset="100%" stopColor="#A87808" />
      </linearGradient>
      {/* Center radial glow: near-white core → warm gold edge */}
      <radialGradient id="stCtr" cx="40%" cy="38%" r="68%">
        <stop offset="0%"   stopColor="#FFFDE0" />
        <stop offset="55%"  stopColor="#FFE840" />
        <stop offset="100%" stopColor="#E0C010" />
      </radialGradient>
    </defs>

    {/* ── Star base body ── */}
    <path
      d="M12 3L14.2 8.9L20.6 9.2L15.6 13.2L17.3 19.3L12 15.8L6.7 19.3L8.4 13.2L3.4 9.2L9.8 8.9Z"
      fill="url(#stGld)"
    />

    {/* Shadow overlay on lower-right half — gives 3D depth */}
    <path d="M12 15.8L17.3 19.3L15.6 13.2L20.6 9.2L14.2 8.9Z" fill="#9A6808" opacity="0.22" />

    {/* Specular tint on upper-left half */}
    <path d="M12 3L9.8 8.9L3.4 9.2L8.4 13.2L6.7 19.3L12 15.8z" fill="#FFE870" opacity="0.18" />

    {/* ── Inner faceted layer ── */}
    <path
      d="M12 6.5L13.4 10.4L17.5 10.6L14.3 12.9L15.4 17L12 14.8L8.6 17L9.7 12.9L6.5 10.6L10.6 10.4Z"
      fill="url(#stCtr)"
      opacity="0.72"
    />

    {/* Specular streaks on upper-left points */}
    <path d="M9.8 8.9L11.4 9.8"   stroke="#FFFA90" strokeWidth="0.7" strokeLinecap="round" opacity="0.65" />
    <path d="M12 3L10.6 5.8"       stroke="#FFFCE0" strokeWidth="0.55" strokeLinecap="round" opacity="0.58" />

    {/* ── Bright center radial glow ── */}
    <circle cx="12" cy="12" r="2.1" fill="#FFFCE0" opacity="0.72" />
    {/* Center specular glint */}
    <circle cx="11.2" cy="11.2" r="0.72" fill="#FFFFFF" opacity="0.58" />
  </svg>
);

// ── 10. Crescent Moon — iOS-style: gradient crescent, shadow fold, specular arc, crater texture, glowing companion star ──
const MoonIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Crescent: bright ivory-gold outer left → rich gold → deep amber inner shadow */}
      <linearGradient id="mnCr" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFF8C8" />
        <stop offset="30%"  stopColor="#F0D840" />
        <stop offset="65%"  stopColor="#D4AA18" />
        <stop offset="100%" stopColor="#A07808" />
      </linearGradient>
      {/* Ambient soft glow behind crescent */}
      <radialGradient id="mnGlow" cx="32%" cy="40%" r="72%">
        <stop offset="0%"   stopColor="#FFF0A0" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#E8C000" stopOpacity="0" />
      </radialGradient>
      {/* Companion star: warm white core → gold edge */}
      <radialGradient id="mnStar" cx="42%" cy="36%" r="70%">
        <stop offset="0%"   stopColor="#FFFDE0" />
        <stop offset="100%" stopColor="#D4A818" />
      </radialGradient>
    </defs>

    {/* ── Soft glow halo ── */}
    <ellipse cx="8" cy="12" rx="8" ry="10" fill="url(#mnGlow)" />

    {/* ── Crescent body ── */}
    <path
      fillRule="evenodd"
      d="M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2ZM15 4.5A7.5 7.5 0 1 0 15 19.5A7.5 7.5 0 1 0 15 4.5Z"
      fill="url(#mnCr)"
    />

    {/* Shadow fold along inner concave edge */}
    <path d="M15 4.5A7.5 7.5 0 1 0 15 19.5" stroke="#9A7010" strokeWidth="2.0" fill="none" opacity="0.22" />

    {/* Inner-edge ivory highlight */}
    <path d="M15 4.5A7.5 7.5 0 1 0 15 19.5" stroke="#FFFFFB" strokeWidth="0.9" fill="none" opacity="0.52" />

    {/* Outer-edge specular arc — upper-left lit face */}
    <path d="M4.5 7.5A9.5 9.5 0 0 1 12 2.1" stroke="#FFFEF0" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.48" />

    {/* Surface texture — subtle crater ellipses */}
    <ellipse cx="6"   cy="9"  rx="1.5" ry="1.0" fill="#B08808" opacity="0.14" transform="rotate(-20 6 9)" />
    <ellipse cx="5"   cy="15" rx="1.2" ry="0.8" fill="#A07808" opacity="0.12" transform="rotate(10 5 15)" />
    <ellipse cx="8.5" cy="18" rx="0.9" ry="0.6" fill="#A07808" opacity="0.10" />

    {/* ── Companion star — radial gradient ── */}
    <circle cx="20" cy="7"  r="1.1"  fill="url(#mnStar)" />
    <circle cx="19.6" cy="6.6" r="0.4" fill="#FFFFEC" opacity="0.62" />
    {/* Tiny far star */}
    <circle cx="22" cy="12" r="0.7"  fill="#EAD060" opacity="0.5" />
    <circle cx="21.8" cy="11.8" r="0.25" fill="#FFFFF0" opacity="0.55" />
  </svg>
);

// ── 11. Gem — iOS-style: gradient amethyst facets, radial table glow, gloss overlay, specular glint ──
const GemIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Base body: deep left shadow → mid amethyst */}
      <linearGradient id="gmBase" x1="3" y1="9" x2="21" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#280A50" />
        <stop offset="45%"  stopColor="#4A1A80" />
        <stop offset="100%" stopColor="#3A1468" />
      </linearGradient>
      {/* Crown girdle: dark left → bright lavender → mid right */}
      <linearGradient id="gmCrn" x1="3" y1="5" x2="21" y2="5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#5A2898" />
        <stop offset="40%"  stopColor="#9860C8" />
        <stop offset="70%"  stopColor="#7848B0" />
        <stop offset="100%" stopColor="#4A1A88" />
      </linearGradient>
      {/* Table facet: bright lavender core → deep amethyst */}
      <radialGradient id="gmTbl" cx="38%" cy="35%" r="72%">
        <stop offset="0%"   stopColor="#C090F0" />
        <stop offset="55%"  stopColor="#8848C8" />
        <stop offset="100%" stopColor="#4A1880" />
      </radialGradient>
      {/* Gloss overlay */}
      <radialGradient id="gmGlw" cx="32%" cy="28%" r="68%">
        <stop offset="0%"   stopColor="#E8D8FF" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#9060C0" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ── Base diamond silhouette ── */}
    <path d="M12 2L21 9L12 22L3 9Z" fill="url(#gmBase)" />

    {/* ── Crown girdle (top) ── */}
    <path d="M12 2L21 9H3Z" fill="url(#gmCrn)" />

    {/* Shadow fold — left pavilion */}
    <path d="M3 9L12 15L12 22Z" fill="#280A50" opacity="0.45" />

    {/* Right pavilion facet */}
    <path d="M21 9L12 15L12 22Z" fill="#5A28A0" opacity="0.72" />
    {/* Shadow overlay — right pavilion bottom */}
    <path d="M12 15L12 22L17 17Z" fill="#1A0838" opacity="0.28" />

    {/* ── Table facet (center, brightest) ── */}
    <path d="M12 2L16.5 9L12 15L7.5 9Z" fill="url(#gmTbl)" />
    {/* Gloss overlay on table */}
    <path d="M12 2L16.5 9L12 15L7.5 9Z" fill="url(#gmGlw)" />

    {/* Specular streak on upper-left crown */}
    <path d="M10 4L7 9" stroke="#D0A8F8" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
    {/* Left crown facet edge */}
    <path d="M3 9L7.5 9" stroke="#9060C0" strokeWidth="0.6" strokeLinecap="round" opacity="0.42" />

    {/* ── Glint at top ── */}
    <circle cx="10"  cy="4.5" r="0.8"  fill="#E0C8FF" opacity="0.68" />
    <circle cx="9.5" cy="4.0" r="0.38" fill="#FFFFFF"  opacity="0.52" />

    {/* Girdle edge line */}
    <path d="M3 9L12 2L21 9" stroke="#6A38A8" strokeWidth="0.5" fill="none" opacity="0.38" />
  </svg>
);

// ── 12. Crown — iOS-style: gradient gold body, shadow folds, specular peak streaks, radial gem cabochons ──
const CrownIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Crown body: shadow base left → bright gold crest → shadow right */}
      <linearGradient id="crBdy" x1="3" y1="10" x2="21" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A07818" />
        <stop offset="30%"  stopColor="#E8C838" />
        <stop offset="60%"  stopColor="#F0D048" />
        <stop offset="100%" stopColor="#A87C18" />
      </linearGradient>
      {/* Band: dark edge → bright gold crest → dark edge */}
      <linearGradient id="crBnd" x1="3" y1="19" x2="21" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#906010" />
        <stop offset="45%"  stopColor="#D8A828" />
        <stop offset="100%" stopColor="#906010" />
      </linearGradient>
      {/* Red gem: bright rose core → deep crimson */}
      <radialGradient id="crGm1" cx="38%" cy="34%" r="68%">
        <stop offset="0%"   stopColor="#FF5070" />
        <stop offset="100%" stopColor="#780A20" />
      </radialGradient>
      {/* Blue gem: bright sky core → deep navy */}
      <radialGradient id="crGm2" cx="38%" cy="34%" r="68%">
        <stop offset="0%"   stopColor="#5090FF" />
        <stop offset="100%" stopColor="#0A2880" />
      </radialGradient>
      {/* Green gem: bright mint core → deep forest */}
      <radialGradient id="crGm3" cx="38%" cy="34%" r="68%">
        <stop offset="0%"   stopColor="#50D880" />
        <stop offset="100%" stopColor="#0A5020" />
      </radialGradient>
    </defs>

    {/* ── Crown body ── */}
    <path d="M3 20V10L7.5 15L12 4L16.5 15L21 10V20Z" fill="url(#crBdy)" />

    {/* Shadow fold — left inner face */}
    <path d="M3 20V10L7.5 15L3 20Z" fill="#7A5808" opacity="0.28" />
    {/* Shadow fold — right inner face */}
    <path d="M21 20V10L16.5 15L21 20Z" fill="#7A5808" opacity="0.22" />

    {/* Specular streaks on each peak */}
    <path d="M7.5 15L5.5 11"  stroke="#FFFEE0" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />
    <path d="M12 4L12 8"      stroke="#FFFEE0" strokeWidth="0.7" strokeLinecap="round" opacity="0.52" />
    <path d="M16.5 15L18.5 11" stroke="#FFFEE0" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />

    {/* ── Bottom band ── */}
    <rect x="3" y="18" width="18" height="2" rx="0.5" fill="url(#crBnd)" />
    {/* Band highlight line */}
    <line x1="4" y1="18.6" x2="20" y2="18.6" stroke="#FFF080" strokeWidth="0.4" strokeLinecap="round" opacity="0.45" />

    {/* ── Gem cabochons ── */}
    <circle cx="7.5"  cy="19" r="1.6" fill="url(#crGm1)" />
    <circle cx="12"   cy="19" r="1.6" fill="url(#crGm2)" />
    <circle cx="16.5" cy="19" r="1.6" fill="url(#crGm3)" />

    {/* Gem gloss highlights */}
    <circle cx="7.0"  cy="18.5" r="0.5" fill="#FFCCD8" opacity="0.72" />
    <circle cx="11.5" cy="18.5" r="0.5" fill="#A8C8FF" opacity="0.72" />
    <circle cx="16.0" cy="18.5" r="0.5" fill="#90F0B8" opacity="0.72" />

    {/* Crown outline */}
    <path d="M3 20V10L7.5 15L12 4L16.5 15L21 10V20" stroke="#906010" strokeWidth="0.7" fill="none" strokeLinejoin="round" opacity="0.55" />
  </svg>
);

// ── 13. Magic Wand — iOS-style: gradient wood handle, specular streak, gradient star tip with shadow facets, radial glints ──
const WandIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Handle: dark shadow edge → warm chestnut highlight → dark edge */}
      <linearGradient id="wndHdl" x1="4" y1="22" x2="16" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#2A1005" />
        <stop offset="35%"  stopColor="#6A380C" />
        <stop offset="65%"  stopColor="#8A5018" />
        <stop offset="100%" stopColor="#3A1A08" />
      </linearGradient>
      {/* Star tip: bright white-gold core → rich gold → deep amber edge */}
      <radialGradient id="wndStar" cx="38%" cy="32%" r="72%">
        <stop offset="0%"   stopColor="#FFFDE0" />
        <stop offset="40%"  stopColor="#FFD820" />
        <stop offset="100%" stopColor="#C09008" />
      </radialGradient>
      {/* Ferrule: dark edge → gold crest → dark edge */}
      <linearGradient id="wndFrl" x1="14.5" y1="10.5" x2="17" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#9A7810" />
        <stop offset="50%"  stopColor="#F0D040" />
        <stop offset="100%" stopColor="#A88018" />
      </linearGradient>
    </defs>

    {/* ── Handle ── */}
    <path d="M4 22L16 9" stroke="url(#wndHdl)" strokeWidth="3" strokeLinecap="round" />
    {/* Handle specular streak */}
    <path d="M5 21L15 10" stroke="#A06828" strokeWidth="0.9" strokeLinecap="round" opacity="0.42" />
    {/* Handle shadow edge */}
    <path d="M4.8 22.5L16.8 9.5" stroke="#150802" strokeWidth="1.0" strokeLinecap="round" opacity="0.22" />

    {/* ── Gold ferrule ── */}
    <path d="M14.5 10.5L17 8" stroke="url(#wndFrl)" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.8 10.2L16.7 8.3" stroke="#FFE870" strokeWidth="0.45" strokeLinecap="round" opacity="0.52" />

    {/* ── Star tip ── */}
    <path
      d="M18 2.5L18.88 4.79L21.33 4.92L19.43 6.46L20.06 8.83L18 7.5L15.94 8.83L16.57 6.46L14.67 4.92L17.12 4.79Z"
      fill="url(#wndStar)"
    />
    {/* Shadow facets — lower-right points */}
    <path d="M18 7.5L20.06 8.83L19.43 6.46L21.33 4.92L18.88 4.79Z" fill="#A07808" opacity="0.22" />
    {/* Specular tint — upper-left points */}
    <path d="M18 2.5L17.12 4.79L14.67 4.92L16.57 6.46L15.94 8.83L18 7.5z" fill="#FFFACC" opacity="0.18" />

    {/* Star inner glow */}
    <circle cx="18"  cy="5.7" r="1.3"  fill="#FFFCE0" opacity="0.78" />
    <circle cx="17.5" cy="5.2" r="0.52" fill="#FFFFFF"  opacity="0.58" />

    {/* ── Sparkle trails ── */}
    <circle cx="22"  cy="3"  r="0.8"  fill="#FFE040" opacity="0.8" />
    <circle cx="21.7" cy="2.7" r="0.32" fill="#FFFFFF"  opacity="0.58" />
    <circle cx="23"  cy="8"  r="0.55" fill="#FFE040" opacity="0.5" />
    <circle cx="20"  cy="11" r="0.55" fill="#FFE040" opacity="0.4" />
  </svg>
);

// ── 14. Potion — iOS-style: glassy indigo flask gradient, radial liquid glow, cork gradient, bubble gloss ──
const PotionIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Flask body: near-black left shadow → deep navy → slate-blue right highlight */}
      <linearGradient id="ptFlsk" x1="5" y1="16" x2="19" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#060410" />
        <stop offset="30%"  stopColor="#100828" />
        <stop offset="70%"  stopColor="#1C1248" />
        <stop offset="100%" stopColor="#0C0820" />
      </linearGradient>
      {/* Liquid: bright violet-magenta core → deep purple edge */}
      <radialGradient id="ptLiq" cx="36%" cy="32%" r="72%">
        <stop offset="0%"   stopColor="#C050F0" />
        <stop offset="55%"  stopColor="#7018B0" />
        <stop offset="100%" stopColor="#300870" />
      </radialGradient>
      {/* Cork: warm light top → amber shadow base */}
      <linearGradient id="ptCork" x1="9.2" y1="5.5" x2="9.2" y2="8.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C8903A" />
        <stop offset="55%"  stopColor="#9B6830" />
        <stop offset="100%" stopColor="#6A4018" />
      </linearGradient>
      {/* Neck */}
      <linearGradient id="ptNeck" x1="10" y1="8" x2="14" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#100830" />
        <stop offset="55%"  stopColor="#20184A" />
        <stop offset="100%" stopColor="#0C0825" />
      </linearGradient>
    </defs>

    {/* ── Flask body ── */}
    <circle cx="12" cy="16" r="7" fill="url(#ptFlsk)" />
    {/* Glass highlight left face */}
    <path d="M7.5 12Q6 14 6 16Q6 18 7 19.5" stroke="#1E1060" strokeWidth="1.4" strokeLinecap="round" opacity="0.72" fill="none" />
    {/* Glass specular streak */}
    <path d="M8 12.5Q7.2 14 7.2 16" stroke="#2A1878" strokeWidth="0.48" strokeLinecap="round" opacity="0.42" fill="none" />
    {/* Right edge subtle reflection */}
    <path d="M16.5 13Q17.2 15 17 17" stroke="#0E083A" strokeWidth="0.6" strokeLinecap="round" opacity="0.32" fill="none" />

    {/* ── Liquid ── */}
    <path d="M5.3 14A7 7 0 1 1 18.7 14Z" fill="url(#ptLiq)" />
    {/* Liquid surface sheen */}
    <ellipse cx="10" cy="15" rx="2.5" ry="1.5" fill="#D870F8" opacity="0.28" />
    {/* Liquid surface gloss line */}
    <path d="M7.5 14.5Q10 13.8 14 14.5" stroke="#E090FF" strokeWidth="0.5" strokeLinecap="round" opacity="0.38" fill="none" />

    {/* ── Bubbles ── */}
    <circle cx="10.5" cy="13"   r="1.1"  fill="#C060E0" opacity="0.55" />
    <circle cx="10.2" cy="12.6" r="0.38" fill="#E8A8FF" opacity="0.48" />
    <circle cx="14"   cy="11.5" r="0.75" fill="#D880F8" opacity="0.45" />
    <circle cx="13.7" cy="11.1" r="0.28" fill="#F0C0FF" opacity="0.42" />

    {/* Glass shine on upper body */}
    <path d="M7 11.5C7.5 9.5 9 8.5 10.5 8.5" stroke="#3A2880" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />

    {/* ── Neck ── */}
    <rect x="10" y="8" width="4" height="2.5" rx="0.5" fill="url(#ptNeck)" />
    <line x1="10.4" y1="8.4" x2="10.4" y2="10" stroke="#2A1878" strokeWidth="0.4" strokeLinecap="round" opacity="0.42" />

    {/* ── Cork ── */}
    <rect x="9.2" y="5.5" width="5.6" height="3" rx="1" fill="url(#ptCork)" />
    <line x1="10" y1="6.2" x2="14" y2="6.2" stroke="#D8A850" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
    <path d="M10 6.0Q11.5 5.7 13 6.0" stroke="#E8C870" strokeWidth="0.4" strokeLinecap="round" opacity="0.48" fill="none" />
  </svg>
);

// ── 15. Butterfly — iOS-style: radial gradient wings, shadow fold overlays, specular sheen, gloss eye-spots ──
const ButterflyIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Upper wing: bright violet highlight → deep purple edge */}
      <radialGradient id="bfUpW" cx="60%" cy="35%" r="75%">
        <stop offset="0%"   stopColor="#B070E0" />
        <stop offset="50%"  stopColor="#7040A0" />
        <stop offset="100%" stopColor="#3A1860" />
      </radialGradient>
      {/* Lower wing: deep violet base */}
      <radialGradient id="bfLoW" cx="40%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#7840A8" />
        <stop offset="100%" stopColor="#3A1868" />
      </radialGradient>
      {/* Body: dark plum highlight → near-black */}
      <radialGradient id="bfBdy" cx="35%" cy="25%" r="70%">
        <stop offset="0%"   stopColor="#4A2070" />
        <stop offset="100%" stopColor="#180830" />
      </radialGradient>
    </defs>

    {/* ── Upper wings ── */}
    <path d="M12 12C9 8 4 7.5 3 11.5C2 15 6 17 12 12Z" fill="url(#bfUpW)" />
    <path d="M12 12C15 8 20 7.5 21 11.5C22 15 18 17 12 12Z" fill="url(#bfUpW)" />
    {/* Shadow fold at inner edge of upper wings */}
    <path d="M12 12C10.5 9 8 8 6 9" stroke="#2A0858" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" fill="none" />
    <path d="M12 12C13.5 9 16 8 18 9" stroke="#2A0858" strokeWidth="1.2" strokeLinecap="round" opacity="0.24" fill="none" />
    {/* Specular sheen on upper wings */}
    <path d="M12 12C10 9.5 6.5 8.5 4 9.5" stroke="#C898E8" strokeWidth="0.65" strokeLinecap="round" opacity="0.42" fill="none" />
    <path d="M12 12C14 9.5 17.5 8.5 20 9.5" stroke="#C898E8" strokeWidth="0.65" strokeLinecap="round" opacity="0.38" fill="none" />

    {/* ── Lower wings ── */}
    <path d="M12 12C9 15 5.5 16.5 5 14.5C4.5 12.5 7.5 12 12 12Z" fill="url(#bfLoW)" />
    <path d="M12 12C15 15 18.5 16.5 19 14.5C19.5 12.5 16.5 12 12 12Z" fill="url(#bfLoW)" />

    {/* ── Wing eye-spots ── */}
    <circle cx="8"    cy="11"   r="1.9" fill="#9060C0" opacity="0.65" />
    <circle cx="16"   cy="11"   r="1.9" fill="#9060C0" opacity="0.65" />
    <circle cx="8"    cy="11"   r="0.9" fill="#C898E8" opacity="0.45" />
    <circle cx="16"   cy="11"   r="0.9" fill="#C898E8" opacity="0.45" />
    <circle cx="7.6"  cy="10.6" r="0.35" fill="#EED8FF" opacity="0.48" />
    <circle cx="15.6" cy="10.6" r="0.35" fill="#EED8FF" opacity="0.48" />
    <circle cx="7.5"  cy="13.5" r="1"   fill="#B080D8" opacity="0.42" />
    <circle cx="16.5" cy="13.5" r="1"   fill="#B080D8" opacity="0.42" />

    {/* ── Body ── */}
    <ellipse cx="12" cy="11.5" rx="1" ry="4.5" fill="url(#bfBdy)" />
    <line x1="12" y1="8" x2="12" y2="15" stroke="#6A40A0" strokeWidth="0.4" strokeLinecap="round" opacity="0.38" />

    {/* ── Antennae ── */}
    <path d="M11.5 7.5C10.5 6 9.5 5 9 4"  stroke="#4A2870" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    <path d="M12.5 7.5C13.5 6 14.5 5 15 4" stroke="#4A2870" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    <circle cx="9"  cy="4" r="0.9" fill="#7A58A8" />
    <circle cx="15" cy="4" r="0.9" fill="#7A58A8" />
    <circle cx="8.7"  cy="3.7" r="0.32" fill="#C0A0E0" opacity="0.52" />
    <circle cx="14.7" cy="3.7" r="0.32" fill="#C0A0E0" opacity="0.52" />
  </svg>
);

// ── 16. Sparkle — 4-pointed gold starburst with diagonal rays, bright core ──
const SparkleIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Vertical long ray */}
    <path d="M12 2C11.6 7 11 10 11 12C11 14 11.6 17 12 22C12.4 17 13 14 13 12C13 10 12.4 7 12 2Z" fill="#E8C820" />
    {/* Horizontal long ray */}
    <path d="M2 12C7 11.6 10 11 12 11C14 11 17 11.6 22 12C17 12.4 14 13 12 13C10 13 7 12.4 2 12Z" fill="#E8C820" />
    {/* Diagonal rays (shorter, slightly lighter) */}
    <path d="M5.5 5.5C8 8.5 10 10.5 12 12C14 13.5 16 15.5 18.5 18.5C16 15.5 14 13.5 12 12C10 10.5 8 8.5 5.5 5.5Z" fill="#F5DC40" opacity="0.6" />
    <path d="M18.5 5.5C16 8.5 14 10.5 12 12C10 13.5 8 15.5 5.5 18.5C8 15.5 10 13.5 12 12C14 10.5 16 8.5 18.5 5.5Z" fill="#F5DC40" opacity="0.6" />
    {/* Bright core */}
    <circle cx="12" cy="12" r="2" fill="#FFFA80" />
  </svg>
);

// ── 17. Vampire Fangs — blood-red gum, ivory fangs, crimson drips ──
const FangsIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Upper gum / mouth roof */}
    <path d="M3 6Q12 2 21 6v4Q16 13 12 13Q8 13 3 10Z" fill="#6B0A1A" />
    {/* Gum ridge highlight */}
    <path d="M5 8Q12 6.5 19 8" stroke="#8B1A2A" strokeWidth="1" fill="none" strokeLinecap="round" />
    {/* Left fang */}
    <path d="M7 10L10 10L8.5 21Z" fill="#F0E8E0" />
    <path d="M7 10L8.2 15.5L8.5 21Z" fill="#DCCEBB" />
    {/* Right fang */}
    <path d="M14 10L17 10L15.5 21Z" fill="#F0E8E0" />
    <path d="M14 10L15.2 15.5L15.5 21Z" fill="#DCCEBB" />
    {/* Blood drip — left */}
    <path d="M8.5 21Q8.2 22 8.5 22.5" stroke="#C00020" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <circle cx="8.5" cy="22.7" r="0.9" fill="#C00020" />
    {/* Blood drip — right */}
    <path d="M15.5 21Q15.2 22 15.5 22.5" stroke="#C00020" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <circle cx="15.5" cy="22.7" r="0.9" fill="#C00020" />
  </svg>
);

// ── 18. Wolf — dark-grey face, amber slit eyes, pink inner ear, snout ──
const WolfIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Head */}
    <ellipse cx="12" cy="14" rx="8.5" ry="8.5" fill="#3A3A4A" />
    {/* Lighter snout */}
    <ellipse cx="12" cy="17.5" rx="4.5" ry="3.5" fill="#5A5A6A" />
    {/* Left ear + inner */}
    <path d="M4.5 9L3 2L10 7.5Z" fill="#3A3A4A" />
    <path d="M5 8.5L4 3.5L9.5 7.5Z" fill="#8B5A5A" />
    {/* Right ear + inner */}
    <path d="M19.5 9L21 2L14 7.5Z" fill="#3A3A4A" />
    <path d="M19 8.5L20 3.5L14.5 7.5Z" fill="#8B5A5A" />
    {/* Eyes — amber glow */}
    <circle cx="9"  cy="12.5" r="2.3" fill="#C8A020" />
    <circle cx="15" cy="12.5" r="2.3" fill="#C8A020" />
    {/* Vertical slit pupils */}
    <ellipse cx="9"  cy="12.5" rx="0.8" ry="1.6" fill="#080808" />
    <ellipse cx="15" cy="12.5" rx="0.8" ry="1.6" fill="#080808" />
    {/* Eye glint */}
    <circle cx="8.5"  cy="11.8" r="0.5" fill="#F0D050" opacity="0.55" />
    <circle cx="14.5" cy="11.8" r="0.5" fill="#F0D050" opacity="0.55" />
    {/* Nose */}
    <ellipse cx="12" cy="17" rx="1.8" ry="1.2" fill="#1A1A2A" />
    <circle cx="11.4" cy="16.5" r="0.4" fill="#3A3A4A" opacity="0.7" />
    {/* Muzzle line */}
    <path d="M9.5 19Q12 20.5 14.5 19" stroke="#2A2A3A" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);

// ── 19. Witch Hat — black cone, purple band + gold buckle, tiny star ──
const WitchHatIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Hat cone */}
    <path d="M12 2L4.5 17H19.5Z" fill="#1A1A2A" />
    {/* Shadow on left face */}
    <path d="M12 2L9 14" stroke="#0A0A14" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    {/* Brim */}
    <ellipse cx="12" cy="17" rx="10" ry="2.5" fill="#252535" />
    {/* Purple band */}
    <rect x="5.5" y="15.5" width="13" height="2" fill="#6B2A8A" />
    {/* Gold buckle frame */}
    <rect x="10.5" y="15.5" width="3" height="2" rx="0.2" fill="#C9A830" />
    {/* Buckle hole */}
    <rect x="11.2" y="16"   width="1.6" height="1" rx="0.1" fill="#3A1A60" />
    {/* Tiny star on hat */}
    <path d="M16 8L16.5 9.5L18 9.5L16.8 10.4L17.3 12L16 11.1L14.7 12L15.2 10.4L14 9.5L15.5 9.5Z" fill="#7B3A9A" />
  </svg>
);

// ── 20. Cauldron — iOS-style: gradient iron body, specular streak, radial brew glow, bubble gloss, shadow fold ──
const CauldronIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Cauldron body: dark left edge → slate highlight → dark right */}
      <linearGradient id="cdlBdy" x1="3" y1="17" x2="21" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0C0C14" />
        <stop offset="28%"  stopColor="#1A1A2A" />
        <stop offset="60%"  stopColor="#262638" />
        <stop offset="100%" stopColor="#0E0E18" />
      </linearGradient>
      {/* Rim: dark edge → slate crest → dark edge */}
      <linearGradient id="cdlRim" x1="5" y1="11" x2="19" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#181820" />
        <stop offset="45%"  stopColor="#323248" />
        <stop offset="100%" stopColor="#181820" />
      </linearGradient>
      {/* Brew surface: bright lime-green core → deep forest edge */}
      <radialGradient id="cdlBrew" cx="40%" cy="36%" r="72%">
        <stop offset="0%"   stopColor="#50D860" />
        <stop offset="52%"  stopColor="#1A7A2A" />
        <stop offset="100%" stopColor="#0A3A10" />
      </radialGradient>
    </defs>

    {/* ── Steam wisps ── */}
    <path d="M9 9Q8 6.5 9 4"   stroke="#40B050" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M12 8Q11 5.5 12 3" stroke="#50C060" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M15 9Q14 6.5 15 4" stroke="#40B050" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />

    {/* ── Cauldron body ── */}
    <path d="M5 11C4 11 3 14 3 17C3 20 7 23 12 23C17 23 21 20 21 17C21 14 20 11 19 11H5Z" fill="url(#cdlBdy)" />
    {/* Left-face specular streak */}
    <path d="M5 14Q4.5 17 5.5 20" stroke="#2E2E44" strokeWidth="1.1" strokeLinecap="round" opacity="0.62" fill="none" />
    {/* Fine specular line */}
    <path d="M5.8 14.5Q5.4 17 6.2 19.5" stroke="#383850" strokeWidth="0.42" strokeLinecap="round" opacity="0.42" fill="none" />
    {/* Right shadow edge */}
    <path d="M19 14Q19.5 17 18.5 20" stroke="#07070C" strokeWidth="0.7" strokeLinecap="round" opacity="0.28" fill="none" />
    {/* Shadow fold at bottom */}
    <path d="M7 22Q12 24 17 22" stroke="#050508" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" fill="none" />

    {/* ── Rim ── */}
    <ellipse cx="12" cy="11"   rx="7"   ry="2"   fill="url(#cdlRim)" />
    <ellipse cx="12" cy="10.7" rx="5.8" ry="1.3" fill="#303048"      opacity="0.38" />

    {/* ── Brew surface ── */}
    <ellipse cx="12"   cy="11"   rx="5.5" ry="1.4" fill="url(#cdlBrew)" />
    <ellipse cx="10.5" cy="10.6" rx="2.2" ry="0.55" fill="#90F0A0"      opacity="0.28" />

    {/* ── Bubbles ── */}
    <circle cx="10.5" cy="10.5" r="1.2"  fill="#30A040" />
    <circle cx="10.2" cy="10.1" r="0.42" fill="#80E890" opacity="0.52" />
    <circle cx="14"   cy="10"   r="0.9"  fill="#38B048" />
    <circle cx="13.7" cy="9.65" r="0.32" fill="#90F0A0" opacity="0.48" />
    <circle cx="12"   cy="11.5" r="0.7"  fill="#28983A" />
  </svg>
);

// ── 21. Ghost — iOS-style: gradient body, shadow fold, specular streak, radial eye sockets, hem highlight ──
const GhostIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Body: bright cool white upper-left → soft blue-grey lower */}
      <linearGradient id="ghBdy" x1="5" y1="10" x2="19" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F2F8FF" />
        <stop offset="45%"  stopColor="#DDE6F4" />
        <stop offset="100%" stopColor="#B8C8E0" />
      </linearGradient>
      {/* Eye socket: deep navy-purple radial */}
      <radialGradient id="ghEye" cx="38%" cy="34%" r="72%">
        <stop offset="0%"   stopColor="#3A3A60" />
        <stop offset="100%" stopColor="#1A1A38" />
      </radialGradient>
    </defs>

    {/* ── Ghost body ── */}
    <path d="M5 22V11A7 7 0 0 1 19 11V22L16.5 20L14 22L11.5 20L9 22L6.5 20Z" fill="url(#ghBdy)" />
    {/* Shadow fold — right face */}
    <path d="M17.5 11.5V21.5L19 22V11A7 7 0 0 0 17.5 11.5Z" fill="#90A8C8" opacity="0.22" />
    {/* Specular highlight — left face upper */}
    <path d="M6.5 12.5Q5.8 15 6 18"  stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" fill="none" />
    <path d="M7.2 12.2Q6.8 14.5 7 17" stroke="#F0F8FF" strokeWidth="0.45" strokeLinecap="round" opacity="0.38" fill="none" />

    {/* Inner glow */}
    <path d="M7 21V12A5 5 0 0 1 17 12V21L15.5 19.5L14 21L11.5 19.5L9 21L7.5 19.5Z" fill="#EEF3FC" opacity="0.58" />

    {/* ── Eye sockets ── */}
    <ellipse cx="9.5"  cy="14" rx="2"   ry="2.2" fill="url(#ghEye)" />
    <ellipse cx="14.5" cy="14" rx="2"   ry="2.2" fill="url(#ghEye)" />
    <circle cx="10"   cy="13.4" r="0.65" fill="#5A5A88" opacity="0.42" />
    <circle cx="15"   cy="13.4" r="0.65" fill="#5A5A88" opacity="0.42" />
    <circle cx="9.8"  cy="13.1" r="0.28" fill="#8888B0" opacity="0.32" />
    <circle cx="14.8" cy="13.1" r="0.28" fill="#8888B0" opacity="0.32" />

    {/* ── Mouth ── */}
    <ellipse cx="12" cy="17.5" rx="1.5" ry="1.2" fill="url(#ghEye)" />

    {/* Hem wave specular */}
    <path d="M6.5 20Q9 21.5 11.5 20Q14 18.5 16.5 20" stroke="#FFFFFF" strokeWidth="0.55" strokeLinecap="round" fill="none" opacity="0.35" />
  </svg>
);

// ── 22. Bat — iOS-style: gradient wings with specular edge, radial head/body, pink inner ear, radial glowing eyes ──
const BatIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Outer wing: near-black shadow left → dark purple */}
      <linearGradient id="btWng" x1="2" y1="8" x2="12" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#160A22" />
        <stop offset="55%"  stopColor="#2A1A3A" />
        <stop offset="100%" stopColor="#1E1030" />
      </linearGradient>
      {/* Wing membrane: slightly lighter purple */}
      <linearGradient id="btMem" x1="5" y1="8" x2="12" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#221438" />
        <stop offset="100%" stopColor="#3A2A4A" />
      </linearGradient>
      {/* Head/body: dark plum highlight → near-black */}
      <radialGradient id="btHead" cx="38%" cy="32%" r="72%">
        <stop offset="0%"   stopColor="#3E2856" />
        <stop offset="100%" stopColor="#1A0E28" />
      </radialGradient>
      {/* Eye: bright red core → deep crimson */}
      <radialGradient id="btEye" cx="40%" cy="36%" r="72%">
        <stop offset="0%"   stopColor="#FF3050" />
        <stop offset="100%" stopColor="#880010" />
      </radialGradient>
    </defs>

    {/* ── Left outer wing ── */}
    <path d="M12 13C10 10 5 6 2 8C4 9 5 11 6 14Z" fill="url(#btWng)" />
    {/* Left wing membrane */}
    <path d="M12 13C10 10 6 8 5 10C5.5 11 6 13 7.5 14Z" fill="url(#btMem)" />
    {/* Left wing specular upper edge */}
    <path d="M12 13C10.5 10.5 7 7.5 4 7.8" stroke="#3E2858" strokeWidth="0.55" strokeLinecap="round" opacity="0.42" fill="none" />

    {/* ── Right outer wing ── */}
    <path d="M12 13C14 10 19 6 22 8C20 9 19 11 18 14Z" fill="url(#btWng)" />
    {/* Right wing membrane */}
    <path d="M12 13C14 10 18 8 19 10C18.5 11 18 13 16.5 14Z" fill="url(#btMem)" />
    {/* Right wing specular upper edge */}
    <path d="M12 13C13.5 10.5 17 7.5 20 7.8" stroke="#3E2858" strokeWidth="0.55" strokeLinecap="round" opacity="0.38" fill="none" />

    {/* Wing veins */}
    <path d="M5 9L7 14M2 8L6 14"    stroke="#110820" strokeWidth="0.7" strokeLinecap="round" />
    <path d="M19 9L17 14M22 8L18 14" stroke="#110820" strokeWidth="0.7" strokeLinecap="round" />

    {/* ── Body ── */}
    <ellipse cx="12" cy="14" rx="2.5" ry="3" fill="url(#btHead)" />
    <path d="M11 11.8Q11 15 11.2 17" stroke="#3E2858" strokeWidth="0.55" strokeLinecap="round" opacity="0.42" fill="none" />

    {/* ── Head ── */}
    <circle cx="12" cy="11" r="2.5" fill="url(#btHead)" />
    <path d="M10.8 9.8Q10.2 10.4 10.2 11.2" stroke="#4A3068" strokeWidth="0.7" strokeLinecap="round" opacity="0.42" fill="none" />

    {/* ── Ears ── */}
    <path d="M10.5 9.5L9.5 6.5L12 9Z"  fill="#2A1A3A" />
    <path d="M13.5 9.5L14.5 6.5L12 9Z" fill="#2A1A3A" />
    {/* Inner ear pink */}
    <path d="M10.4 9.2L9.8 7.2L11.5 9Z"  fill="#6A3058" opacity="0.45" />
    <path d="M13.6 9.2L14.2 7.2L12.5 9Z" fill="#6A3058" opacity="0.45" />

    {/* ── Red glowing eyes ── */}
    <circle cx="11" cy="11" r="0.75" fill="url(#btEye)" />
    <circle cx="13" cy="11" r="0.75" fill="url(#btEye)" />
    <circle cx="11" cy="11" r="0.35" fill="#FF7080" opacity="0.62" />
    <circle cx="13" cy="11" r="0.35" fill="#FF7080" opacity="0.62" />
  </svg>
);

// ── 23. Skull — iOS-style: radial bone dome, gradient jaw, gradient teeth with gloss, shadow fold, crack highlight ──
const SkullIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Dome: bright ivory upper-left → warm bone → shadow lower-right */}
      <radialGradient id="skDome" cx="34%" cy="28%" r="78%">
        <stop offset="0%"   stopColor="#F8F4EC" />
        <stop offset="48%"  stopColor="#E0D8C8" />
        <stop offset="100%" stopColor="#B8B0A0" />
      </radialGradient>
      {/* Jaw: warm pale top → amber shadow base */}
      <linearGradient id="skJaw" x1="12" y1="16" x2="12" y2="22.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D8D0C0" />
        <stop offset="100%" stopColor="#B8B0A0" />
      </linearGradient>
      {/* Tooth: cool white top → warm bone base */}
      <linearGradient id="skTooth" x1="8" y1="18.5" x2="8" y2="21.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#D8D4C8" />
        <stop offset="100%" stopColor="#B4AFA0" />
      </linearGradient>
    </defs>

    {/* ── Dome ── */}
    <ellipse cx="12" cy="11" rx="8.5" ry="8" fill="url(#skDome)" />
    {/* Shadow fold — right dome */}
    <path d="M17 5.5Q20.5 8 20.5 11Q20.5 15 17.5 17" stroke="#A8A098" strokeWidth="2.5" strokeLinecap="round" opacity="0.22" fill="none" />
    {/* Specular sheen */}
    <ellipse cx="9.5" cy="7" rx="2.5" ry="1.5" fill="#FFFFFB" opacity="0.52" />
    <path d="M7.5 6Q9.5 4.5 12 4.5" stroke="#FFFFFB" strokeWidth="0.7" strokeLinecap="round" opacity="0.38" fill="none" />

    {/* ── Jaw ── */}
    <path d="M5.5 16H18.5V20Q16 22.5 12 22.5Q8 22.5 5.5 20Z" fill="url(#skJaw)" />
    {/* Jaw shadow fold — right side */}
    <path d="M17.5 16.5V20Q18.5 19 18.5 16.5Z" fill="#9A9488" opacity="0.18" />

    {/* ── Eye sockets ── */}
    <ellipse cx="9"  cy="11" rx="2.5" ry="2.8" fill="#1A1A2A" />
    <ellipse cx="15" cy="11" rx="2.5" ry="2.8" fill="#1A1A2A" />
    <circle cx="8.4"  cy="10" r="0.55" fill="#2E2E48" opacity="0.42" />
    <circle cx="14.4" cy="10" r="0.55" fill="#2E2E48" opacity="0.42" />

    {/* ── Nasal cavity ── */}
    <path d="M11 15L12 16.5L13 15L12.5 13.5H11.5Z" fill="#1A1A2A" />

    {/* ── Teeth ── */}
    <rect x="7"    y="18.5" width="2.5" height="3"   rx="0.5" fill="url(#skTooth)" />
    <rect x="10.8" y="18.5" width="2.5" height="3"   rx="0.5" fill="url(#skTooth)" />
    <rect x="14.5" y="18.5" width="2.5" height="3"   rx="0.5" fill="url(#skTooth)" />
    <line x1="7.4"  y1="19.0" x2="7.4"  y2="20.8" stroke="#E8E4D8" strokeWidth="0.38" strokeLinecap="round" opacity="0.45" />
    <line x1="11.2" y1="19.0" x2="11.2" y2="20.8" stroke="#E8E4D8" strokeWidth="0.38" strokeLinecap="round" opacity="0.45" />
    <line x1="14.9" y1="19.0" x2="14.9" y2="20.8" stroke="#E8E4D8" strokeWidth="0.38" strokeLinecap="round" opacity="0.45" />

    {/* ── Gothic crack ── */}
    <path d="M14 5.5L15.5 9.5L13.5 12.5" stroke="#C0B8A8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    <path d="M14 5.5L15.5 9.5L13.5 12.5" stroke="#D8D4C8" strokeWidth="0.35" fill="none" strokeLinecap="round" opacity="0.52" />
  </svg>
);

// ── 26. Sunflower — iOS-style: gradient petals, radial disc, seed gloss, stem gradient, leaf vein ──
const SunflowerIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Petal bright: lit upper-left petals */}
      <radialGradient id="sfPtB" cx="50%" cy="20%" r="80%">
        <stop offset="0%"   stopColor="#FFE050" />
        <stop offset="55%"  stopColor="#F5C000" />
        <stop offset="100%" stopColor="#C89000" />
      </radialGradient>
      {/* Petal shadow: darker side petals */}
      <radialGradient id="sfPtS" cx="50%" cy="20%" r="80%">
        <stop offset="0%"   stopColor="#F0C030" />
        <stop offset="55%"  stopColor="#E8B000" />
        <stop offset="100%" stopColor="#B87800" />
      </radialGradient>
      {/* Disc: warm highlight upper-left → deep mahogany core */}
      <radialGradient id="sfDisc" cx="36%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#7A3A10" />
        <stop offset="52%"  stopColor="#5A2A08" />
        <stop offset="100%" stopColor="#2E1004" />
      </radialGradient>
      {/* Stem: dark left → bright green → dark right */}
      <linearGradient id="sfStem" x1="11" y1="19" x2="13" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#1A4A1A" />
        <stop offset="50%"  stopColor="#3A8A3A" />
        <stop offset="100%" stopColor="#1E521E" />
      </linearGradient>
    </defs>

    {/* ── 8 petals — lit (top, right, bottom, left) ── */}
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtB)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtB)" transform="rotate(90 12 12)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtB)" transform="rotate(180 12 12)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtB)" transform="rotate(270 12 12)" />
    {/* ── Diagonal petals — slightly shadowed ── */}
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtS)" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtS)" transform="rotate(135 12 12)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtS)" transform="rotate(225 12 12)" />
    <ellipse cx="12" cy="7" rx="1.8" ry="3.2" fill="url(#sfPtS)" transform="rotate(315 12 12)" />

    {/* Petal shadow fold at base of each petal */}
    <circle cx="12" cy="12" r="4.8" fill="#C89000" opacity="0.14" />

    {/* ── Brown disc ── */}
    <circle cx="12" cy="12" r="4" fill="url(#sfDisc)" />
    {/* Disc specular gloss */}
    <ellipse cx="10.8" cy="10.8" rx="1.4" ry="0.9" fill="#9A5020" opacity="0.32" transform="rotate(-20 10.8 10.8)" />
    {/* Seed texture */}
    <circle cx="11"   cy="11"   r="0.6" fill="#7A4020" />
    <circle cx="13"   cy="11"   r="0.6" fill="#7A4020" />
    <circle cx="12"   cy="13"   r="0.6" fill="#7A4020" />
    <circle cx="10.5" cy="12.6" r="0.5" fill="#7A4020" />
    <circle cx="13.5" cy="12.6" r="0.5" fill="#7A4020" />
    {/* Seed gloss highlights */}
    <circle cx="10.8" cy="10.7" r="0.22" fill="#B86030" opacity="0.48" />
    <circle cx="12.8" cy="10.7" r="0.22" fill="#B86030" opacity="0.42" />

    {/* ── Stem ── */}
    <line x1="12" y1="16" x2="12" y2="23" stroke="url(#sfStem)" strokeWidth="2" strokeLinecap="round" />
    {/* Stem specular */}
    <line x1="11.6" y1="16.5" x2="11.6" y2="22.5" stroke="#5AAA5A" strokeWidth="0.45" strokeLinecap="round" opacity="0.38" />

    {/* ── Leaf ── */}
    <path d="M12 20Q9 18 8.5 15Q11.5 17.5 12 20Z" fill="#3A8A3A" />
    <path d="M12 19.5Q10 17.8 9.2 16" stroke="#5AAA5A" strokeWidth="0.45" strokeLinecap="round" fill="none" opacity="0.52" />
  </svg>
);

// ── 27. Cherry Blossom — iOS-style: gradient petals, shadow fold at base, radial stamen glow, gloss dew drop ──
const CherryBlossomIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Bright petal: pale pink tip → rose base */}
      <radialGradient id="cbPtB" cx="50%" cy="18%" r="80%">
        <stop offset="0%"   stopColor="#FFD8EC" />
        <stop offset="55%"  stopColor="#F4AECA" />
        <stop offset="100%" stopColor="#D87098" />
      </radialGradient>
      {/* Shadow petal: slightly deeper pink */}
      <radialGradient id="cbPtS" cx="50%" cy="18%" r="80%">
        <stop offset="0%"   stopColor="#F8C8E0" />
        <stop offset="55%"  stopColor="#EFA0C0" />
        <stop offset="100%" stopColor="#C8608A" />
      </radialGradient>
      {/* Stamen centre: bright yellow core → amber rim */}
      <radialGradient id="cbStm" cx="40%" cy="36%" r="70%">
        <stop offset="0%"   stopColor="#FFF280" />
        <stop offset="60%"  stopColor="#F8E040" />
        <stop offset="100%" stopColor="#D4A020" />
      </radialGradient>
      {/* Branch: warm brown shadow edge → lighter mid */}
      <linearGradient id="cbBr" x1="10.5" y1="19" x2="13.5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#5A3010" />
        <stop offset="50%"  stopColor="#9B6A38" />
        <stop offset="100%" stopColor="#6A3C18" />
      </linearGradient>
    </defs>

    {/* ── 5 petals at 72° intervals ── */}
    <ellipse cx="12" cy="7" rx="2.4" ry="3.5" fill="url(#cbPtB)" />
    <ellipse cx="12" cy="7" rx="2.4" ry="3.5" fill="url(#cbPtB)" transform="rotate(72 12 12)" />
    <ellipse cx="12" cy="7" rx="2.4" ry="3.5" fill="url(#cbPtS)" transform="rotate(144 12 12)" />
    <ellipse cx="12" cy="7" rx="2.4" ry="3.5" fill="url(#cbPtS)" transform="rotate(216 12 12)" />
    <ellipse cx="12" cy="7" rx="2.4" ry="3.5" fill="url(#cbPtB)" transform="rotate(288 12 12)" />

    {/* Shadow fold at petal bases */}
    <circle cx="12" cy="12" r="4.8" fill="#C86090" opacity="0.14" />

    {/* Deeper-pink ring blending petals */}
    <circle cx="12" cy="12" r="4.2" fill="#E890B4" />
    {/* Shadow fold on right side of ring */}
    <path d="M14.5 9.5Q16.2 10.8 16.2 12Q16.2 13.8 14.5 14.8" stroke="#C06090" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" fill="none" />

    {/* Pale inner disc */}
    <circle cx="12" cy="12" r="2.8" fill="#FDE8F2" />
    {/* Inner disc specular */}
    <ellipse cx="11.2" cy="11.2" rx="1.0" ry="0.65" fill="#FFFFFF" opacity="0.38" transform="rotate(-20 11.2 11.2)" />

    {/* ── Stamen centre ── */}
    <circle cx="12" cy="12" r="1.6" fill="url(#cbStm)" />
    {/* Stamen gloss glint */}
    <circle cx="11.4" cy="11.4" r="0.45" fill="#FFFCE0" opacity="0.52" />
    {/* Anther dots */}
    <circle cx="12"   cy="10.5" r="0.45" fill="#C8A020" />
    <circle cx="13.5" cy="11.3" r="0.45" fill="#C8A020" />
    <circle cx="13"   cy="13"   r="0.45" fill="#C8A020" />
    <circle cx="11"   cy="13"   r="0.45" fill="#C8A020" />
    <circle cx="10.5" cy="11.3" r="0.45" fill="#C8A020" />
    {/* Anther gloss highlights */}
    <circle cx="12"   cy="10.2" r="0.18" fill="#FFE880" opacity="0.52" />
    <circle cx="13.7" cy="11.0" r="0.18" fill="#FFE880" opacity="0.48" />

    {/* ── Branch ── */}
    <line x1="12" y1="22" x2="12" y2="19.5" stroke="url(#cbBr)" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 19.5Q10 18.5 9 16.5" stroke="url(#cbBr)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    {/* Branch specular */}
    <line x1="12" y1="21.5" x2="12" y2="19.8" stroke="#B8845A" strokeWidth="0.42" strokeLinecap="round" opacity="0.42" />
  </svg>
);

// ── 29. Monarch Butterfly — iOS-style: radial gradient wings, shadow folds, specular veins, gloss edge dots ──
const MonarchIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Upper wing: bright amber-orange highlight → deep burnt orange edge */}
      <radialGradient id="mkUpW" cx="62%" cy="32%" r="75%">
        <stop offset="0%"   stopColor="#FFA030" />
        <stop offset="50%"  stopColor="#E86000" />
        <stop offset="100%" stopColor="#8A3000" />
      </radialGradient>
      {/* Lower wing: warm orange highlight → deep burnt shadow */}
      <radialGradient id="mkLoW" cx="38%" cy="28%" r="72%">
        <stop offset="0%"   stopColor="#E07020" />
        <stop offset="100%" stopColor="#7A2C00" />
      </radialGradient>
      {/* Body: dark near-black with slight warm tint */}
      <radialGradient id="mkBdy" cx="36%" cy="28%" r="70%">
        <stop offset="0%"   stopColor="#302010" />
        <stop offset="100%" stopColor="#100800" />
      </radialGradient>
    </defs>

    {/* ── Upper wings ── */}
    <path d="M12 12C9 8 3.5 6.5 2 10C1 13 5 16 12 12Z"     fill="url(#mkUpW)" />
    <path d="M12 12C15 8 20.5 6.5 22 10C23 13 19 16 12 12Z" fill="url(#mkUpW)" />
    {/* Shadow fold at wing inner edge */}
    <path d="M12 12C9.5 9 6 8 3.5 9.2" stroke="#3A1800" strokeWidth="1.0" strokeLinecap="round" opacity="0.28" fill="none" />
    <path d="M12 12C14.5 9 18 8 20.5 9.2" stroke="#3A1800" strokeWidth="1.0" strokeLinecap="round" opacity="0.24" fill="none" />
    {/* Wing vein border lines */}
    <path d="M12 12C9 8.5 5 7.5 3 9.5"   stroke="#180C00" strokeWidth="1"   fill="none" strokeLinecap="round" />
    <path d="M12 12C8.5 10 6 10.5 4 11.5" stroke="#180C00" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    <path d="M12 12C15 8.5 19 7.5 21 9.5"   stroke="#180C00" strokeWidth="1"   fill="none" strokeLinecap="round" />
    <path d="M12 12C15.5 10 18 10.5 20 11.5" stroke="#180C00" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    {/* Specular sheen on upper wings */}
    <path d="M12 12C10 9.2 6.5 8.2 4.5 9.0" stroke="#FFB850" strokeWidth="0.55" strokeLinecap="round" opacity="0.38" fill="none" />
    <path d="M12 12C14 9.2 17.5 8.2 19.5 9.0" stroke="#FFB850" strokeWidth="0.55" strokeLinecap="round" opacity="0.34" fill="none" />

    {/* ── Lower wings ── */}
    <path d="M12 12C8.5 14.5 5 17.5 5.5 15C6 13 9 12.5 12 12Z"   fill="url(#mkLoW)" />
    <path d="M12 12C15.5 14.5 19 17.5 18.5 15C18 13 15 12.5 12 12Z" fill="url(#mkLoW)" />

    {/* ── Wing-edge white dots ── */}
    <circle cx="3"  cy="12.5" r="0.65" fill="#F8F8F8" opacity="0.88" />
    <circle cx="4"  cy="14.5" r="0.5"  fill="#F8F8F8" opacity="0.72" />
    <circle cx="21" cy="12.5" r="0.65" fill="#F8F8F8" opacity="0.88" />
    <circle cx="20" cy="14.5" r="0.5"  fill="#F8F8F8" opacity="0.72" />
    {/* Dot gloss highlights */}
    <circle cx="2.8" cy="12.2" r="0.25" fill="#FFFFFF" opacity="0.52" />
    <circle cx="20.8" cy="12.2" r="0.25" fill="#FFFFFF" opacity="0.52" />

    {/* ── Body ── */}
    <ellipse cx="12" cy="12" rx="1" ry="4.5" fill="url(#mkBdy)" />
    <line x1="12" y1="8.5" x2="12" y2="15.5" stroke="#382818" strokeWidth="0.4" strokeLinecap="round" opacity="0.42" />

    {/* ── Head ── */}
    <circle cx="12" cy="8" r="1.1" fill="url(#mkBdy)" />

    {/* ── Antennae ── */}
    <path d="M11.5 7C10.5 5.5 9.5 5 9 4"  stroke="#180C00" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    <path d="M12.5 7C13.5 5.5 14.5 5 15 4" stroke="#180C00" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    <circle cx="9"  cy="4" r="0.7" fill="#281808" />
    <circle cx="15" cy="4" r="0.7" fill="#281808" />
    <circle cx="8.7"  cy="3.7" r="0.25" fill="#604030" opacity="0.48" />
    <circle cx="14.7" cy="3.7" r="0.25" fill="#604030" opacity="0.48" />
  </svg>
);

// ── 30. Diamond — iOS-style: gradient ice facets, shadow pavilion, radial gloss table, specular glint, sparkle rays ──
const IceDiamondIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Main body: pale ice blue left → deeper blue right shadow */}
      <linearGradient id="idBody" x1="3" y1="9" x2="21" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A8D8F0" />
        <stop offset="45%"  stopColor="#D0E8F8" />
        <stop offset="100%" stopColor="#88B8D8" />
      </linearGradient>
      {/* Crown: bright near-white top → pale ice */}
      <linearGradient id="idCrn" x1="3" y1="2" x2="21" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F0FAFF" />
        <stop offset="55%"  stopColor="#EAF5FD" />
        <stop offset="100%" stopColor="#C0DCEE" />
      </linearGradient>
      {/* Table facet: near-white bright core → pale ice */}
      <radialGradient id="idTbl" cx="38%" cy="32%" r="72%">
        <stop offset="0%"   stopColor="#FAFEFF" />
        <stop offset="55%"  stopColor="#E8F6FF" />
        <stop offset="100%" stopColor="#B8D8F0" />
      </radialGradient>
    </defs>

    {/* ── Main body ── */}
    <path d="M12 2L21 9L12 22L3 9Z" fill="url(#idBody)" />

    {/* ── Crown (top) ── */}
    <path d="M12 2L21 9H3Z" fill="url(#idCrn)" />

    {/* ── Left pavilion — shadow ── */}
    <path d="M3 9L12 16L12 22Z" fill="#88B8D8" opacity="0.82" />
    {/* Shadow fold deepens toward bottom-left */}
    <path d="M3 9L7 13L12 22Z" fill="#5890B8" opacity="0.22" />

    {/* ── Right pavilion ── */}
    <path d="M21 9L12 16L12 22Z" fill="#B8D8F0" />

    {/* ── Table facet ── */}
    <path d="M12 2L16 9L12 16L8 9Z" fill="url(#idTbl)" />

    {/* ── Crown triangles ── */}
    <path d="M3 9L8 9L12 2Z"  fill="#D8EFFC" />
    <path d="M21 9L16 9L12 2Z" fill="#C8E8F8" />
    {/* Crown shadow fold — right triangle */}
    <path d="M21 9L16 9L12 2Z" fill="#98C0D8" opacity="0.18" />

    {/* Girdle edge line */}
    <path d="M3 9L12 16L21 9" stroke="#A0C8E0" strokeWidth="0.5" fill="none" />

    {/* ── Glint on left facet ── */}
    <path d="M6 9.5L8.5 13" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
    <circle cx="6.5" cy="8.5" r="0.8"  fill="#FFFFFF" opacity="0.82" />
    <circle cx="6.2" cy="8.2" r="0.32" fill="#FFFFFF" opacity="0.55" />

    {/* Table specular streak */}
    <path d="M10 5L11.5 8" stroke="#FFFFFF" strokeWidth="0.55" strokeLinecap="round" opacity="0.58" />

    {/* ── Sparkle rays top-right ── */}
    <path d="M19 4L20.5 2.5M20 6.5L22 6M18.5 2L19.5 0.5" stroke="#C0DCEC" strokeWidth="0.8" strokeLinecap="round" opacity="0.72" />
    <circle cx="20.5" cy="2.5" r="0.3" fill="#FFFFFF" opacity="0.58" />
  </svg>
);

// ── 31. 100 — bold red numeral with double underline ──
const OneHundredIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* "1" — vertical stroke + top serif + base */}
    <line x1="3.5" y1="5"  x2="3.5" y2="17"  stroke="#CC0000" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="1.8" y1="6.2" x2="3.5" y2="5"   stroke="#CC0000" strokeWidth="2"   strokeLinecap="round" />
    <line x1="1"   y1="17"  x2="5.5" y2="17"  stroke="#CC0000" strokeWidth="2"   strokeLinecap="round" />
    {/* First "0" — thick ellipse ring */}
    <ellipse cx="11" cy="11" rx="3.8" ry="6.2" fill="none" stroke="#CC0000" strokeWidth="2.6" />
    {/* Second "0" */}
    <ellipse cx="20" cy="11" rx="3.2" ry="6.2" fill="none" stroke="#CC0000" strokeWidth="2.6" />
    {/* Double emphasis underline */}
    <line x1="1" y1="20.5" x2="23" y2="20.5" stroke="#FF1818" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="1" y1="23"   x2="23" y2="23"   stroke="#FF1818" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// ── 32. Rainbow — iOS-style: vivid gradient arcs, shadow fold under arcs, gradient clouds with specular gloss ──
const RainbowIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Cloud body: bright white upper → soft blue-grey base */}
      <radialGradient id="rbCld" cx="40%" cy="28%" r="75%">
        <stop offset="0%"   stopColor="#FFFFFF" />
        <stop offset="55%"  stopColor="#EEF0F8" />
        <stop offset="100%" stopColor="#D0D4E8" />
      </radialGradient>
    </defs>

    {/* ── Rainbow arcs — each slightly brighter than flat ── */}
    <path d="M1 18A11 11 0 0 1 23 18"         fill="none" stroke="#F02020" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M3.5 18A8.5 8.5 0 0 1 20.5 18"   fill="none" stroke="#F08820" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M6 18A6 6 0 0 1 18 18"            fill="none" stroke="#EEE020" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M8.5 18A3.5 3.5 0 0 1 15.5 18"   fill="none" stroke="#20B830" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M10.5 18A1.5 1.5 0 0 1 13.5 18"  fill="none" stroke="#2050F0" strokeWidth="2.2" strokeLinecap="round" />

    {/* Arc shadow fold — subtle darker stroke just below each arc */}
    <path d="M1.4 18.6A10.7 10.7 0 0 1 22.6 18.6"       fill="none" stroke="#B01010" strokeWidth="0.5" strokeLinecap="round" opacity="0.18" />
    <path d="M3.9 18.6A8.2 8.2 0 0 1 20.1 18.6"          fill="none" stroke="#C06010" strokeWidth="0.5" strokeLinecap="round" opacity="0.18" />
    <path d="M6.4 18.6A5.7 5.7 0 0 1 17.6 18.6"          fill="none" stroke="#B0A810" strokeWidth="0.5" strokeLinecap="round" opacity="0.18" />

    {/* Arc specular highlight — thin bright stroke just above each arc */}
    <path d="M1 17.5A11 11 0 0 1 23 17.5"        fill="none" stroke="#FF8888" strokeWidth="0.45" strokeLinecap="round" opacity="0.32" />
    <path d="M3.5 17.5A8.5 8.5 0 0 1 20.5 17.5"  fill="none" stroke="#FFCC88" strokeWidth="0.45" strokeLinecap="round" opacity="0.28" />

    {/* ── Cloud puffs ── */}
    <ellipse cx="5.5"  cy="18" rx="4"   ry="2.5" fill="url(#rbCld)" />
    <ellipse cx="18.5" cy="18" rx="4"   ry="2.5" fill="url(#rbCld)" />
    <ellipse cx="12"   cy="20" rx="3"   ry="2"   fill="url(#rbCld)" />
    {/* Cloud bumps */}
    <circle cx="3.5"  cy="17.2" r="1.8" fill="url(#rbCld)" />
    <circle cx="6.5"  cy="16.8" r="1.5" fill="url(#rbCld)" />
    <circle cx="20.5" cy="17.2" r="1.8" fill="url(#rbCld)" />
    <circle cx="17.5" cy="16.8" r="1.5" fill="url(#rbCld)" />
    {/* Cloud specular gloss */}
    <ellipse cx="4.2"  cy="16.8" rx="1.2" ry="0.55" fill="#FFFFFF" opacity="0.52" />
    <ellipse cx="19.2" cy="16.8" rx="1.2" ry="0.55" fill="#FFFFFF" opacity="0.52" />
    <ellipse cx="12"   cy="19.2" rx="1.0" ry="0.42" fill="#FFFFFF" opacity="0.42" />
    {/* Cloud shadow fold — bottom edge */}
    <path d="M2 18.8Q5.5 20.2 9 18.8"   stroke="#B8C0D8" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" fill="none" />
    <path d="M15 18.8Q18.5 20.2 22 18.8" stroke="#B8C0D8" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" fill="none" />
  </svg>
);

// ── 33. Open Book with Coffee — iOS-style: gradient pages, shadow folds, gradient cup, radial coffee surface, saucer gloss ──
const OpenBookCoffeeIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Left page: bright ivory upper-left → warm amber lower */}
      <linearGradient id="obcPgL" x1="1" y1="11" x2="12" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="55%"  stopColor="#F5EED8" />
        <stop offset="100%" stopColor="#D8C478" />
      </linearGradient>
      {/* Right page */}
      <linearGradient id="obcPgR" x1="23" y1="11" x2="12" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F8F2E4" />
        <stop offset="55%"  stopColor="#EDE5C8" />
        <stop offset="100%" stopColor="#CCBA68" />
      </linearGradient>
      {/* Cup body: dark left shadow → warm chestnut → dark right */}
      <linearGradient id="obcCup" x1="14" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#4A1A08" />
        <stop offset="38%"  stopColor="#8B4020" />
        <stop offset="70%"  stopColor="#9B4A22" />
        <stop offset="100%" stopColor="#521808" />
      </linearGradient>
      {/* Coffee surface: warm espresso centre → dark rim */}
      <radialGradient id="obcCof" cx="40%" cy="38%" r="72%">
        <stop offset="0%"   stopColor="#5A2808" />
        <stop offset="100%" stopColor="#1E0A02" />
      </radialGradient>
      {/* Saucer: warm tan left → light crest → amber right */}
      <linearGradient id="obcSau" x1="13" y1="15.5" x2="22" y2="15.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A07848" />
        <stop offset="45%"  stopColor="#D8B888" />
        <stop offset="100%" stopColor="#A87848" />
      </linearGradient>
    </defs>

    {/* ── Pages ── */}
    <path d="M12 11Q5 10 1 12V23H12Z"  fill="url(#obcPgL)" />
    <path d="M12 11Q19 10 23 12V23H12Z" fill="url(#obcPgR)" />
    {/* Shadow fold toward spine */}
    <path d="M12 11Q10.5 10.6 9.8 11.3V23H12Z" fill="#A87828" opacity="0.13" />
    <path d="M12 11Q13.5 10.6 14.2 11.3V23H12Z" fill="#9A7020" opacity="0.11" />
    <line x1="12" y1="11" x2="12" y2="23" stroke="#C0A060" strokeWidth="1" />
    <path d="M1 23Q12 24 23 23" stroke="#7B2A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Text lines — left page */}
    <line x1="3" y1="14" x2="10" y2="14" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="3" y1="16" x2="10" y2="16" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="3" y1="18" x2="10" y2="18" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="3" y1="20" x2="9"  y2="20" stroke="#D0B870" strokeWidth="0.7" />
    {/* Text lines — right page */}
    <line x1="14" y1="18" x2="21" y2="18" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="14" y1="20" x2="20" y2="20" stroke="#D0B870" strokeWidth="0.7" />

    {/* ── Steam wisps ── */}
    <path d="M16 8Q15.4 6.5 16 5Q16.6 3.5 16 2"     stroke="#C0B8A8" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    <path d="M19.5 8Q18.9 6.5 19.5 5Q20.1 3.5 19.5 2" stroke="#C0B8A8" strokeWidth="1.1" fill="none" strokeLinecap="round" />

    {/* ── Cup body ── */}
    <path d="M14 9H21L20.2 15H14.8Z" fill="url(#obcCup)" />
    {/* Cup specular streak */}
    <line x1="14.6" y1="10.5" x2="14.8" y2="14.5" stroke="#C06838" strokeWidth="0.8" strokeLinecap="round" opacity="0.52" />
    {/* Cup shadow edge */}
    <line x1="19.8" y1="10.5" x2="19.6" y2="14.2" stroke="#2A0C04" strokeWidth="0.55" strokeLinecap="round" opacity="0.32" />

    {/* ── Coffee surface ── */}
    <rect x="14" y="9" width="7" height="1.5" rx="0.3" fill="url(#obcCof)" />
    {/* Coffee surface sheen */}
    <ellipse cx="16.5" cy="9.5" rx="1.5" ry="0.42" fill="#7A4018" opacity="0.32" />

    {/* ── Handle ── */}
    <path d="M21 10.5Q23 10.5 23 12Q23 13.5 21 13.5" stroke="url(#obcCup)" strokeWidth="1.3" fill="none" strokeLinecap="round" />

    {/* ── Saucer ── */}
    <ellipse cx="17.5" cy="15.5" rx="4.5" ry="1.2" fill="url(#obcSau)" />
    {/* Saucer specular gloss */}
    <ellipse cx="16.5" cy="15.1" rx="1.8" ry="0.42" fill="#F0D8B0" opacity="0.45" />
  </svg>
);

// ── 34. Three Stacked Closed Books — iOS-style: gradient covers, specular streaks, shadow folds, page-edge gloss ──
const StackedBooksIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Garnet cover: dark left shadow → vivid crimson → dark right */}
      <linearGradient id="sbGar" x1="5" y1="19" x2="17" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#5A0808" />
        <stop offset="38%"  stopColor="#9A2020" />
        <stop offset="70%"  stopColor="#A82828" />
        <stop offset="100%" stopColor="#601010" />
      </linearGradient>
      {/* Garnet spine: near-black → deep crimson highlight */}
      <linearGradient id="sbGarSp" x1="1" y1="19" x2="5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#300404" />
        <stop offset="55%"  stopColor="#6A0C0C" />
        <stop offset="100%" stopColor="#3A0606" />
      </linearGradient>
      {/* Navy cover: dark left → rich navy → shadow right */}
      <linearGradient id="sbNav" x1="7" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#0A1840" />
        <stop offset="40%"  stopColor="#1E3878" />
        <stop offset="75%"  stopColor="#243A80" />
        <stop offset="100%" stopColor="#0C1848" />
      </linearGradient>
      {/* Navy spine */}
      <linearGradient id="sbNavSp" x1="3" y1="12" x2="7" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#060E28" />
        <stop offset="55%"  stopColor="#142860" />
        <stop offset="100%" stopColor="#081230" />
      </linearGradient>
      {/* Forest cover: dark left → rich green → shadow right */}
      <linearGradient id="sbFor" x1="9" y1="5" x2="21" y2="5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#082010" />
        <stop offset="40%"  stopColor="#1E6830" />
        <stop offset="75%"  stopColor="#226A32" />
        <stop offset="100%" stopColor="#0A2A14" />
      </linearGradient>
      {/* Forest spine */}
      <linearGradient id="sbForSp" x1="5" y1="5" x2="9" y2="5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#041008" />
        <stop offset="55%"  stopColor="#10441A" />
        <stop offset="100%" stopColor="#061410" />
      </linearGradient>
      {/* Page edges: warm ivory */}
      <linearGradient id="sbPg" x1="17" y1="19" x2="19.5" y2="19" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F0E8D8" />
        <stop offset="100%" stopColor="#D8CEB8" />
      </linearGradient>
    </defs>

    {/* === BOTTOM BOOK — garnet === */}
    <rect x="17" y="16" width="2.5" height="7"  rx="0.4" fill="url(#sbPg)" />
    <rect x="5"  y="16" width="12" height="7"  rx="0.4" fill="url(#sbGar)" />
    {/* Cover specular streak */}
    <line x1="6.2" y1="16.5" x2="6.2" y2="22.5" stroke="#C83838" strokeWidth="0.5" strokeLinecap="round" opacity="0.42" />
    {/* Cover shadow edge */}
    <line x1="16.2" y1="16.5" x2="16.2" y2="22.5" stroke="#380808" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" />
    <rect x="1"  y="16" width="4"  height="7"  rx="0.4" fill="url(#sbGarSp)" />
    <line x1="5"   y1="16" x2="5"   y2="23"   stroke="#7A1818" strokeWidth="0.5" />
    <line x1="1.8" y1="18.5" x2="4.6" y2="18.5" stroke="#8A2020" strokeWidth="0.6" />
    <line x1="1.8" y1="20.5" x2="4.6" y2="20.5" stroke="#8A2020" strokeWidth="0.6" />
    <rect x="6.5" y="18.2" width="9" height="1"   rx="0.3" fill="#C03030" opacity="0.72" />
    <rect x="6.5" y="20.2" width="6" height="0.7" rx="0.3" fill="#C03030" opacity="0.48" />
    {/* Page edge gloss */}
    <line x1="17.4" y1="16.5" x2="17.4" y2="22.5" stroke="#F8F0E0" strokeWidth="0.35" strokeLinecap="round" opacity="0.48" />

    {/* === MIDDLE BOOK — navy === */}
    <rect x="19" y="9"  width="2.5" height="7"  rx="0.4" fill="url(#sbPg)" />
    <rect x="7"  y="9"  width="12" height="7"  rx="0.4" fill="url(#sbNav)" />
    <line x1="8.2"  y1="9.5"  x2="8.2"  y2="15.5" stroke="#2E4A90" strokeWidth="0.5" strokeLinecap="round" opacity="0.42" />
    <line x1="18.2" y1="9.5"  x2="18.2" y2="15.5" stroke="#0A1438" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" />
    <rect x="3"  y="9"  width="4"  height="7"  rx="0.4" fill="url(#sbNavSp)" />
    <line x1="7"   y1="9"    x2="7"   y2="16"   stroke="#2A408A" strokeWidth="0.5" />
    <line x1="3.8" y1="11.5" x2="6.6" y2="11.5" stroke="#2A4080" strokeWidth="0.6" />
    <line x1="3.8" y1="13.5" x2="6.6" y2="13.5" stroke="#2A4080" strokeWidth="0.6" />
    <rect x="8.5" y="11.2" width="9" height="1"   rx="0.3" fill="#3050A0" opacity="0.72" />
    <rect x="8.5" y="13.2" width="6" height="0.7" rx="0.3" fill="#3050A0" opacity="0.48" />
    <line x1="19.4" y1="9.5" x2="19.4" y2="15.5" stroke="#F8F0E0" strokeWidth="0.35" strokeLinecap="round" opacity="0.48" />

    {/* === TOP BOOK — forest green === */}
    <rect x="21" y="2"  width="2.5" height="7"  rx="0.4" fill="url(#sbPg)" />
    <rect x="9"  y="2"  width="12" height="7"  rx="0.4" fill="url(#sbFor)" />
    <line x1="10.2" y1="2.5" x2="10.2" y2="8.5" stroke="#2A7038" strokeWidth="0.5" strokeLinecap="round" opacity="0.42" />
    <line x1="20.2" y1="2.5" x2="20.2" y2="8.5" stroke="#061A0C" strokeWidth="0.5" strokeLinecap="round" opacity="0.32" />
    <rect x="5"  y="2"  width="4"  height="7"  rx="0.4" fill="url(#sbForSp)" />
    <line x1="9"   y1="2"   x2="9"   y2="9"   stroke="#2A6A3A" strokeWidth="0.5" />
    <line x1="5.8" y1="4.5" x2="8.6" y2="4.5" stroke="#1A5828" strokeWidth="0.6" />
    <line x1="5.8" y1="6.5" x2="8.6" y2="6.5" stroke="#1A5828" strokeWidth="0.6" />
    <rect x="10.5" y="4.2" width="9" height="1"   rx="0.3" fill="#307840" opacity="0.72" />
    <rect x="10.5" y="6.2" width="6" height="0.7" rx="0.3" fill="#307840" opacity="0.48" />
    <line x1="21.4" y1="2.5" x2="21.4" y2="8.5" stroke="#F8F0E0" strokeWidth="0.35" strokeLinecap="round" opacity="0.48" />

    {/* Separator shadow lines */}
    <line x1="3"  y1="16" x2="19.5" y2="16" stroke="#00000030" strokeWidth="0.8" />
    <line x1="5"  y1="9"  x2="21.5" y2="9"  stroke="#00000030" strokeWidth="0.8" />
  </svg>
);

// ── 35. Black Rose Bouquet — three near-black roses, stems, ribbon ──
const BlackRoseBouquetIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Stems */}
    <path d="M7.5 14Q8.5 17 12 18.5" stroke="#2A4A18" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M16.5 14Q15.5 17 12 18.5" stroke="#2A4A18" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <line x1="12" y1="10" x2="12" y2="18.5" stroke="#2A4A18" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="18.5" x2="12" y2="23" stroke="#2A4A18" strokeWidth="2" strokeLinecap="round" />
    {/* Leaves */}
    <path d="M9 17Q7 15.5 5 16Q7 17.5 9 17Z" fill="#1E4A18" />
    <path d="M15 17Q17 15.5 19 16Q17 17.5 15 17Z" fill="#1E4A18" />
    {/* Ribbon bow */}
    <path d="M12 19Q9.5 17.5 9 18.5Q9.8 19.8 12 19Z" fill="#780018" />
    <path d="M12 19Q14.5 17.5 15 18.5Q14.2 19.8 12 19Z" fill="#780018" />
    <circle cx="12" cy="19" r="0.9" fill="#580010" />
    {/* BACK CENTER ROSE — (12, 7) */}
    <ellipse cx="8.8"  cy="7"  rx="2.5" ry="1.8" fill="#16081A" />
    <ellipse cx="15.2" cy="7"  rx="2.5" ry="1.8" fill="#1A0820" />
    <ellipse cx="12"   cy="4"  rx="1.8" ry="2.5" fill="#16081A" />
    <ellipse cx="12"   cy="10" rx="1.8" ry="2.5" fill="#1A0820" />
    <circle  cx="12"   cy="7"  r="2.8"            fill="#1A0820" />
    <path d="M10 7Q12 5.5 14 7Q12 8.5 10 7Z" fill="#240A2C" />
    <circle  cx="12"   cy="7"  r="1.3"            fill="#0E0512" />
    {/* FRONT LEFT ROSE — (7.5, 11) */}
    <ellipse cx="4.3"  cy="11" rx="2.5" ry="1.7" fill="#16081A" />
    <ellipse cx="10.7" cy="11" rx="2.5" ry="1.7" fill="#220830" />
    <ellipse cx="7.5"  cy="8"  rx="1.7" ry="2.5" fill="#1A0820" />
    <ellipse cx="7.5"  cy="14" rx="1.7" ry="2.5" fill="#16081A" />
    <circle  cx="7.5"  cy="11" r="2.8"            fill="#200828" />
    <path d="M5.5 11Q7.5 9.5 9.5 11Q7.5 12.5 5.5 11Z" fill="#2C0A34" />
    <circle  cx="7.5"  cy="11" r="1.3"            fill="#0E0512" />
    {/* FRONT RIGHT ROSE — (16.5, 11) */}
    <ellipse cx="13.3" cy="11" rx="2.5" ry="1.7" fill="#220830" />
    <ellipse cx="19.7" cy="11" rx="2.5" ry="1.7" fill="#16081A" />
    <ellipse cx="16.5" cy="8"  rx="1.7" ry="2.5" fill="#1A0820" />
    <ellipse cx="16.5" cy="14" rx="1.7" ry="2.5" fill="#16081A" />
    <circle  cx="16.5" cy="11" r="2.8"            fill="#200828" />
    <path d="M14.5 11Q16.5 9.5 18.5 11Q16.5 12.5 14.5 11Z" fill="#2C0A34" />
    <circle  cx="16.5" cy="11" r="1.3"            fill="#0E0512" />
  </svg>
);

// ── 36. Book with Butterflies — iOS-style: gradient pages, shadow folds, radial-gradient butterfly wings, gloss glints ──
const BookButterfliesIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Left page: bright ivory upper-left → warm amber lower-right */}
      <linearGradient id="bbPgL" x1="1" y1="12" x2="12" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#FFFFFB" />
        <stop offset="55%"  stopColor="#F5EED8" />
        <stop offset="100%" stopColor="#D8C480" />
      </linearGradient>
      {/* Right page */}
      <linearGradient id="bbPgR" x1="23" y1="12" x2="12" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#F8F2E4" />
        <stop offset="55%"  stopColor="#EDE5C8" />
        <stop offset="100%" stopColor="#CCBA70" />
      </linearGradient>
      {/* Violet butterfly: bright highlight → deep violet */}
      <radialGradient id="bbB1U" cx="36%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#C070F0" />
        <stop offset="55%"  stopColor="#8030B0" />
        <stop offset="100%" stopColor="#4A1070" />
      </radialGradient>
      {/* Gold butterfly: bright yellow core → deep amber */}
      <radialGradient id="bbB2U" cx="36%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#F8E060" />
        <stop offset="55%"  stopColor="#D09020" />
        <stop offset="100%" stopColor="#885808" />
      </radialGradient>
      {/* Teal butterfly: bright cyan core → deep teal */}
      <radialGradient id="bbB3U" cx="36%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#40D8E0" />
        <stop offset="55%"  stopColor="#108890" />
        <stop offset="100%" stopColor="#064850" />
      </radialGradient>
    </defs>

    {/* ── Open book ── */}
    <path d="M12 12Q5 11 1 13V23H12Z" fill="url(#bbPgL)" />
    <path d="M12 12Q19 11 23 13V23H12Z" fill="url(#bbPgR)" />
    {/* Shadow fold toward spine — left page */}
    <path d="M12 12Q10.5 11.5 9.8 12.2V23H12Z" fill="#A87828" opacity="0.14" />
    {/* Shadow fold toward spine — right page */}
    <path d="M12 12Q13.5 11.5 14.2 12.2V23H12Z" fill="#9A7020" opacity="0.12" />
    <line x1="12" y1="12" x2="12" y2="23" stroke="#C0A060" strokeWidth="1" />
    <path d="M1 23Q12 24 23 23" stroke="#7B2A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <line x1="3" y1="15" x2="10" y2="15" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="3" y1="17" x2="10" y2="17" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="3" y1="19" x2="9"  y2="19" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="14" y1="15" x2="21" y2="15" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="14" y1="17" x2="21" y2="17" stroke="#D0B870" strokeWidth="0.7" />
    <line x1="14" y1="19" x2="20" y2="19" stroke="#D0B870" strokeWidth="0.7" />
    {/* Spine sparkle */}
    <path d="M12 12L11.4 10M12 12L12.6 10M12 12L10.8 11.2M12 12L13.2 11.2"
          stroke="#C8A020" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />

    {/* ── BUTTERFLY 1 — violet ── */}
    <ellipse cx="4"   cy="6.5" rx="2.2" ry="1.6" fill="url(#bbB1U)" />
    <ellipse cx="8"   cy="6.5" rx="2.2" ry="1.6" fill="url(#bbB1U)" />
    <ellipse cx="4.5" cy="9"   rx="1.6" ry="1"   fill="#5018A0" />
    <ellipse cx="7.5" cy="9"   rx="1.6" ry="1"   fill="#5018A0" />
    <ellipse cx="4"   cy="6.8" rx="1.0" ry="0.7" fill="#2A0850" opacity="0.22" />
    <ellipse cx="8"   cy="6.8" rx="1.0" ry="0.7" fill="#2A0850" opacity="0.18" />
    <ellipse cx="6"   cy="7.5" rx="0.6" ry="1.8" fill="#1A0828" />
    <circle  cx="4.8" cy="6.5" r="0.5"  fill="#D898F8" opacity="0.62" />
    <circle  cx="7.2" cy="6.5" r="0.5"  fill="#D898F8" opacity="0.62" />
    <circle  cx="4.5" cy="6.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />
    <circle  cx="7.5" cy="6.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />

    {/* ── BUTTERFLY 2 — golden ── */}
    <ellipse cx="10"   cy="2.5" rx="2.2" ry="1.6" fill="url(#bbB2U)" />
    <ellipse cx="14"   cy="2.5" rx="2.2" ry="1.6" fill="url(#bbB2U)" />
    <ellipse cx="10.5" cy="5"   rx="1.6" ry="1"   fill="#906010" />
    <ellipse cx="13.5" cy="5"   rx="1.6" ry="1"   fill="#906010" />
    <ellipse cx="10"   cy="2.8" rx="1.0" ry="0.7" fill="#6A3A00" opacity="0.20" />
    <ellipse cx="14"   cy="2.8" rx="1.0" ry="0.7" fill="#6A3A00" opacity="0.18" />
    <ellipse cx="12"   cy="3.5" rx="0.6" ry="1.8" fill="#201808" />
    <circle  cx="10.8" cy="2.5" r="0.5"  fill="#FFF080" opacity="0.65" />
    <circle  cx="13.2" cy="2.5" r="0.5"  fill="#FFF080" opacity="0.65" />
    <circle  cx="10.5" cy="2.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />
    <circle  cx="13.5" cy="2.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />

    {/* ── BUTTERFLY 3 — teal ── */}
    <ellipse cx="16"   cy="6.5" rx="2.2" ry="1.6" fill="url(#bbB3U)" />
    <ellipse cx="20"   cy="6.5" rx="2.2" ry="1.6" fill="url(#bbB3U)" />
    <ellipse cx="16.5" cy="9"   rx="1.6" ry="1"   fill="#065870" />
    <ellipse cx="19.5" cy="9"   rx="1.6" ry="1"   fill="#065870" />
    <ellipse cx="16"   cy="6.8" rx="1.0" ry="0.7" fill="#022830" opacity="0.22" />
    <ellipse cx="20"   cy="6.8" rx="1.0" ry="0.7" fill="#022830" opacity="0.18" />
    <ellipse cx="18"   cy="7.5" rx="0.6" ry="1.8" fill="#082020" />
    <circle  cx="16.8" cy="6.5" r="0.5"  fill="#80F8FF" opacity="0.65" />
    <circle  cx="19.2" cy="6.5" r="0.5"  fill="#80F8FF" opacity="0.65" />
    <circle  cx="16.5" cy="6.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />
    <circle  cx="19.5" cy="6.2" r="0.22" fill="#FFFFFF"  opacity="0.42" />
  </svg>
);

// ── 38. Sword — tapered blade, gold crossguard, leather grip, pommel ──
const SwordIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Blade */}
    <path d="M12 1L10.5 15H13.5Z" fill="#B8C8D8" />
    {/* Fuller groove */}
    <line x1="12" y1="3" x2="12" y2="13" stroke="#90A0B0" strokeWidth="0.8" />
    {/* Edge highlight */}
    <path d="M12 1L10.7 14" stroke="#D8E8F0" strokeWidth="0.5" />
    {/* Crossguard */}
    <rect x="7" y="15" width="10" height="2.5" rx="1.25" fill="#C8A820" />
    <line x1="12" y1="15" x2="12" y2="17.5" stroke="#A08018" strokeWidth="0.7" />
    <circle cx="7.8"  cy="16.25" r="1"   fill="#D8B840" />
    <circle cx="16.2" cy="16.25" r="1"   fill="#D8B840" />
    {/* Grip */}
    <rect x="10.5" y="17.5" width="3" height="4" rx="0.75" fill="#4A2818" />
    <line x1="10.5" y1="19"   x2="13.5" y2="19"   stroke="#3A1810" strokeWidth="0.7" />
    <line x1="10.5" y1="20.5" x2="13.5" y2="20.5" stroke="#3A1810" strokeWidth="0.7" />
    {/* Pommel */}
    <circle cx="12" cy="22.5" r="1.6" fill="#C8A820" />
    <circle cx="11.5" cy="22" r="0.6" fill="#D8B840" />
  </svg>
);

// ── 39. Scepter — iOS-style: gradient finial, radial amethyst orb with gloss, gradient shaft, band highlights ──
const ScepterIcon: FC<SvgProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      {/* Finial gold: dark edge → bright crest → dark edge */}
      <linearGradient id="scpFnl" x1="9" y1="2.5" x2="15" y2="2.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#A88010" />
        <stop offset="45%"  stopColor="#F0D050" />
        <stop offset="100%" stopColor="#A88010" />
      </linearGradient>
      {/* Orb: bright lavender upper-left → deep amethyst → near-black core */}
      <radialGradient id="scpOrb" cx="34%" cy="30%" r="72%">
        <stop offset="0%"   stopColor="#9858D8" />
        <stop offset="45%"  stopColor="#5828A0" />
        <stop offset="100%" stopColor="#1A0848" />
      </radialGradient>
      {/* Shaft: dark left shadow → bright amber → dark right */}
      <linearGradient id="scpShft" x1="10.8" y1="17" x2="13.2" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#7A5C08" />
        <stop offset="45%"  stopColor="#D4A020" />
        <stop offset="100%" stopColor="#886808" />
      </linearGradient>
      {/* Band: dark edge → bright gold crest → dark edge */}
      <linearGradient id="scpBnd" x1="10.2" y1="16" x2="13.8" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#906010" />
        <stop offset="50%"  stopColor="#E8C030" />
        <stop offset="100%" stopColor="#906010" />
      </linearGradient>
    </defs>

    {/* ── Cross finial ── */}
    <line x1="12" y1="1.5" x2="12" y2="4"   stroke="url(#scpFnl)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9"  y1="2.5" x2="15" y2="2.5" stroke="url(#scpFnl)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Finial specular streaks */}
    <line x1="9.5" y1="2.2" x2="14.5" y2="2.2" stroke="#FFF090" strokeWidth="0.4" strokeLinecap="round" opacity="0.52" />
    <line x1="12"  y1="1.8" x2="12"   y2="3.6"  stroke="#FFF090" strokeWidth="0.4" strokeLinecap="round" opacity="0.48" />
    <circle cx="12"  cy="1.5" r="0.8"  fill="#F0D050" />
    <circle cx="11.7" cy="1.2" r="0.32" fill="#FFFCE0" opacity="0.58" />
    <circle cx="9"   cy="2.5" r="0.7"  fill="#E8C830" />
    <circle cx="15"  cy="2.5" r="0.7"  fill="#E8C830" />

    {/* Neck */}
    <line x1="12" y1="4" x2="12" y2="5" stroke="url(#scpFnl)" strokeWidth="1.5" />

    {/* ── Orb ── */}
    <circle cx="12" cy="8.5" r="3.5" fill="url(#scpOrb)" />
    <circle cx="12" cy="8.5" r="3.5" fill="none" stroke="#C8A820" strokeWidth="0.9" />
    {/* Orb glass highlight arc */}
    <path d="M9.5 6.5Q10.5 5.5 12 5.5" stroke="#B890E8" strokeWidth="1.1" strokeLinecap="round" opacity="0.52" fill="none" />
    {/* Orb specular glint */}
    <circle cx="10.5" cy="7"   r="1.2"  fill="#7840C8" opacity="0.5" />
    <circle cx="10.7" cy="6.8" r="0.7"  fill="#EAD8F8" opacity="0.72" />
    <circle cx="10.3" cy="6.5" r="0.3"  fill="#FFFFFF"  opacity="0.52" />
    {/* Equator band */}
    <path d="M8.5 8.5Q12 10.5 15.5 8.5Q12 6.5 8.5 8.5Z" fill="#6030A8" opacity="0.4" />
    {/* Shadow fold — lower right */}
    <path d="M13.5 10.5Q14.8 9.5 15.3 8Q14.5 10 13.5 10.5Z" fill="#1A0840" opacity="0.28" />

    {/* ── Collar ── */}
    <rect x="9.5" y="11.5" width="5" height="1.5" rx="0.5" fill="url(#scpBnd)" />
    <line x1="10" y1="12.0" x2="14" y2="12.0" stroke="#FFF080" strokeWidth="0.38" strokeLinecap="round" opacity="0.42" />

    {/* ── Shaft ── */}
    <rect x="10.8" y="13" width="2.4" height="9" rx="0.8" fill="url(#scpShft)" />
    {/* Shaft specular streak */}
    <line x1="11.5" y1="13" x2="11.5" y2="22" stroke="#E8C840" strokeWidth="0.5" />
    {/* Shaft shadow edge */}
    <line x1="13.0" y1="13.4" x2="13.0" y2="21.5" stroke="#5A4008" strokeWidth="0.4" strokeLinecap="round" opacity="0.38" />

    {/* Shaft bands */}
    <rect x="10.2" y="15"   width="3.6" height="1"   rx="0.4" fill="url(#scpBnd)" />
    <rect x="10.2" y="18"   width="3.6" height="1"   rx="0.4" fill="url(#scpBnd)" />
    <rect x="10.2" y="20.8" width="3.6" height="0.8" rx="0.4" fill="url(#scpBnd)" />
    <line x1="10.6" y1="15.35" x2="13.4" y2="15.35" stroke="#FFF080" strokeWidth="0.35" strokeLinecap="round" opacity="0.42" />
    <line x1="10.6" y1="18.35" x2="13.4" y2="18.35" stroke="#FFF080" strokeWidth="0.35" strokeLinecap="round" opacity="0.42" />

    {/* ── Ferrule tip ── */}
    <path d="M10.5 22H13.5L12 24Z" fill="url(#scpBnd)" />
    <line x1="11.5" y1="22.5" x2="12.5" y2="22.5" stroke="#FFF080" strokeWidth="0.35" strokeLinecap="round" opacity="0.38" />
  </svg>
);

export type CustomEmoji = {
  key: string;
  label: string;
  Icon: FC<SvgProps>;
  rotate: boolean;
};

export const CUSTOM_EMOJI_SET: CustomEmoji[] = [
  { key: "book",      label: "Book",      Icon: BookIcon,      rotate: true  },
  { key: "quill",     label: "Quill",     Icon: QuillIcon,     rotate: false },
  { key: "pen",       label: "Pen",       Icon: PenIcon,       rotate: false },
  { key: "rose",      label: "Rose",      Icon: RoseIcon,      rotate: true  },
  { key: "scroll",    label: "Scroll",    Icon: ScrollIcon,    rotate: false  },
  { key: "inkwell",   label: "Inkwell",   Icon: InkwellIcon,   rotate: false },
  { key: "candle",    label: "Candle",    Icon: CandleIcon,    rotate: false },
  { key: "star",      label: "Star",      Icon: StarIcon,      rotate: true  },
  { key: "moon",      label: "Moon",      Icon: MoonIcon,      rotate: false },
  { key: "gem",       label: "Gem",       Icon: GemIcon,       rotate: true  },
  { key: "crown",     label: "Crown",     Icon: CrownIcon,     rotate: true },
  { key: "wand",      label: "Wand",      Icon: WandIcon,      rotate: false  },
  { key: "potion",    label: "Potion",    Icon: PotionIcon,    rotate: false },
  { key: "butterfly", label: "Butterfly", Icon: ButterflyIcon, rotate: true },
  { key: "sparkle",   label: "Sparkle",   Icon: SparkleIcon,   rotate: true  },
  { key: "fangs",     label: "Fangs",     Icon: FangsIcon,     rotate: false },
  { key: "wolf",      label: "Wolf",      Icon: WolfIcon,      rotate: false },
  { key: "witchhat",  label: "Witch Hat", Icon: WitchHatIcon,  rotate: true  },
  { key: "cauldron",  label: "Cauldron",  Icon: CauldronIcon,  rotate: false },
  { key: "ghost",     label: "Ghost",     Icon: GhostIcon,     rotate: false  },
  { key: "bat",       label: "Bat",       Icon: BatIcon,       rotate: true },
  { key: "skull",     label: "Skull",     Icon: SkullIcon,     rotate: false  },
  { key: "sunflower",    label: "Sunflower",     Icon: SunflowerIcon,    rotate: true },
  { key: "cherryblossom",label: "Cherry Blossom",Icon: CherryBlossomIcon,rotate: true  },
  { key: "monarch",      label: "Monarch",       Icon: MonarchIcon,      rotate: true },
  { key: "icediamond",   label: "Diamond",       Icon: IceDiamondIcon,   rotate: true  },
  { key: "onehundred",   label: "100",           Icon: OneHundredIcon,   rotate: true },
  { key: "rainbow",       label: "Rainbow",        Icon: RainbowIcon,       rotate: true },
  { key: "openbookcoffee", label: "Reading Time",  Icon: OpenBookCoffeeIcon, rotate: false },
  { key: "stackedbooks",   label: "Stack of Books", Icon: StackedBooksIcon,     rotate: false },
  { key: "blackrosebouquet", label: "Black Roses", Icon: BlackRoseBouquetIcon, rotate: false },
  { key: "bookbutterflies",  label: "Butterflies",  Icon: BookButterfliesIcon,  rotate: false },
  { key: "sword",            label: "Sword",        Icon: SwordIcon,            rotate: true  },
  { key: "scepter",          label: "Scepter",      Icon: ScepterIcon,          rotate: true  },
];
