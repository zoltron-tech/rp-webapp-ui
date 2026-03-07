import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
} from "react-icons/fa6";
import { RiFontColor, RiListOrdered2, RiListUnordered } from "react-icons/ri";
import { RxFontBold, RxFontItalic } from "react-icons/rx";

export const FONTS = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Montserrat",
  "MontserratUnderline",
  "Savate",
  "PlayfairDisplaySC",
  "ZillaSlab",
  "ShantellSans",
  "Genos",
  "BodoniModaSC",
  "Tourney",
];

export const DEFAULT_FONT = "Arial";

export const FONT_SIZES = [
  { label: "H1", value: "var(--font-size-h1)" },
  { label: "H2", value: "var(--font-size-h2)" },
  { label: "H3", value: "var(--font-size-h3)" },
  { label: "H4", value: "var(--font-size-h4)" },
  { label: "H5", value: "var(--font-size-h5)" },
  { label: "H6", value: "var(--font-size-h6)" },
  { label: "16", value: "var(--font-size-input)" },
];

export const DEFAULT_FONT_SIZE = "var(--font-size-input)";

export const FORMAT_BUTTONS = [
  { command: "bold", icon: RxFontBold, id: "bold", title: "Bold" },
  { command: "italic", icon: RxFontItalic, id: "italic", title: "Italic" },
  {
    command: "underline",
    icon: RiFontColor,
    id: "underline",
    title: "Underline",
  },
];

export const ALIGNMENT_BUTTONS = [
  {
    command: "justifyLeft",
    icon: FaAlignLeft,
    id: "left",
    title: "Align Left",
  },
  {
    command: "justifyCenter",
    icon: FaAlignCenter,
    id: "center",
    title: "Align Center",
  },
  {
    command: "justifyRight",
    icon: FaAlignRight,
    id: "right",
    title: "Align Right",
  },
  {
    command: "justifyFull",
    icon: FaAlignJustify,
    id: "justify",
    title: "Justify",
  },
];

export const LIST_BUTTONS = [
  {
    command: "insertUnorderedList",
    icon: RiListUnordered,
    id: "unordered",
    title: "Bulleted List",
  },
  {
    command: "insertOrderedList",
    icon: RiListOrdered2,
    id: "ordered",
    title: "Numbered List",
  },
];

// Organized bullet point symbols by category for better UX
export const BULLET_POINT_CATEGORIES = {
  a_basic: {
    name: "Basic Bullets",
    symbols: [
      { label: "•", value: "bullet" },
      { label: "·", value: "middle-dot" },
      { label: "○", value: "white-circle" },
      { label: "●", value: "black-circle" },
      { label: "◉", value: "fisheye" },
    ],
  },
  arrows: {
    name: "Arrows",
    symbols: [
      { label: "↠", value: "arrow-two-head" },
      { label: "↣", value: "arrow-tail" },
      { label: "↦", value: "arrow-bar" },
      { label: "↬", value: "arrow-loop" },
      { label: "⇛", value: "arrow-triple" },
      { label: "⇝", value: "arrow-squiggle" },
      { label: "⇢", value: "arrow-dashed" },
      { label: "⇨", value: "arrow-white" },
      { label: "➔", value: "arrow-heavy" },
      { label: "➙", value: "arrow-heavy-right" },
      { label: "➛", value: "arrow-drafting" },
      { label: "➜", value: "arrow-round" },
      { label: "➝", value: "arrow-triangle-head" },
      { label: "➞", value: "arrow-triangle-heavy" },
      { label: "➟", value: "arrow-triangle-dashed" },
      { label: "➠", value: "arrow-triangle-heavy-dashed" },
      { label: "➡", value: "arrow-black" },
      { label: "➢", value: "arrow-top-light" },
      { label: "➣", value: "arrow-bottom-light" },
      { label: "➤", value: "arrowhead-black" },
      { label: "➥", value: "arrow-curved-down" },
      { label: "➦", value: "arrow-curved-up" },
      { label: "➧", value: "arrow-squat" },
      { label: "➨", value: "arrow-concave" },
      { label: "➮", value: "arrow-shadowed" },
      { label: "➱", value: "arrow-notched" },
      { label: "➲", value: "arrow-circled" },
      { label: "➳", value: "arrow-feathered" },
      { label: "➵", value: "arrow-feathered-black" },
      { label: "➸", value: "arrow-feathered-heavy" },
      { label: "➼", value: "arrow-wedge" },
      { label: "➽", value: "arrow-wedge-heavy" },
      { label: "➾", value: "arrow-open-outline" },
      { label: "→", value: "arrow-simple" },
      { label: "⇾", value: "arrow-open-head" },
      { label: "⇒", value: "arrow-double" },
    ],
  },
  checkmarks: {
    name: "Checkmarks & Boxes",
    symbols: [
      { label: "☐", value: "ballot-box" },
      { label: "☑", value: "ballot-box-check" },
      { label: "☒", value: "ballot-box-x" },
      { label: "✓", value: "check-mark" },
      { label: "✔", value: "heavy-check-mark" },
    ],
  },
  circles: {
    name: "Circle Variants",
    symbols: [
      { label: "⊙", value: "circled-dot" },
      { label: "⊚", value: "circled-ring" },
      { label: "⊛", value: "circled-asterisk" },
      { label: "◌", value: "dotted-circle" },
      { label: "◍", value: "circle-vertical-fill" },
      { label: "◎", value: "bullseye" },
      { label: "◦", value: "white-bullet" },
      { label: "☉", value: "sun" },
      { label: "⦾", value: "circled-white" },
      { label: "⦿", value: "circled-black" },
    ],
  },
  dashes: {
    name: "Dashes & Special",
    symbols: [
      { label: "⁃", value: "hyphen-bullet" },
      { label: "⁌", value: "left-bullet" },
      { label: "⁍", value: "right-bullet" },
    ],
  },
  decorative: {
    name: "Decorative",
    symbols: [
      { label: "❥", value: "rotated-heavy-heart" },
      { label: "❧", value: "rotated-floral-heart" },
      { label: "☙", value: "reversed-floral-heart" },
      { label: "☸", value: "dharma-wheel" },
      { label: "✤", value: "asterisk-four-spoke" },
      { label: "✱", value: "heavy-asterisk" },
      { label: "✲", value: "open-asterisk" },
    ],
  },
  diamonds: {
    name: "Diamonds",
    symbols: [
      { label: "◆", value: "black-diamond" },
      { label: "◇", value: "white-diamond" },
      { label: "◈", value: "white-diamond-black" },
    ],
  },
  squares: {
    name: "Squares & Boxes",
    symbols: [
      { label: "■", value: "black-square" },
      { label: "□", value: "white-square" },
      { label: "◾", value: "small-square-filled" },
      { label: "▪", value: "small-filled" },
      { label: "◘", value: "inverse-bullet" },
    ],
  },
  stars: {
    name: "Stars",
    symbols: [
      { label: "★", value: "black-star" },
      { label: "☆", value: "white-star" },
    ],
  },
  triangles: {
    name: "Triangles & Pointers",
    symbols: [
      { label: "▸", value: "small-triangle" },
      { label: "▹", value: "white-small-triangle" },
      { label: "▶", value: "triangle-right" },
      { label: "▷", value: "white-triangle-right" },
      { label: "►", value: "pointer" },
      { label: "▻", value: "white-pointer" },
      { label: "‣", value: "triangular-bullet" },
    ],
  },
};

// Flattened list for use in the editor (all symbols in order)
// Organized quotation mark symbols by category
export const QUOTATION_MARK_CATEGORIES = {
  angle_quotes: {
    name: "Angle Quotes",
    symbols: [
      { id: "left-angle-quote", label: "«", value: "«" },
      { id: "right-angle-quote", label: "»", value: "»" },
      { id: "single-left-angle", label: "‹", value: "‹" },
      { id: "single-right-angle", label: "›", value: "›" },
    ],
  },
  double_quotes: {
    name: "Double Quotes",
    symbols: [
      { id: "left-double-quote", label: "\u201C", value: "\u201C" },
      { id: "right-double-quote", label: "\u201D", value: "\u201D" },
      { id: "double-low-quote", label: "\u201E", value: "\u201E" },
      { id: "double-high-reversed", label: "\u201F", value: "\u201F" },
      { id: "fullwidth-quote", label: "\uFF02", value: "\uFF02" },
    ],
  },
  fullwidth: {
    name: "Fullwidth",
    symbols: [
      { id: "fullwidth-apostrophe", label: "＇", value: "＇" },
      { id: "grave-accent", label: "`", value: "`" },
      { id: "modifier-plus-letter", label: "ˊ", value: "ˊ" },
    ],
  },
  ornamental: {
    name: "Ornamental",
    symbols: [
      { id: "heavy-single-turned", label: "❛", value: "❛" },
      { id: "heavy-single-comma", label: "❜", value: "❜" },
      { id: "heavy-double-turned", label: "❝", value: "❝" },
      { id: "heavy-double-comma", label: "❞", value: "❞" },
    ],
  },
  prime_marks: {
    name: "Prime Marks",
    symbols: [
      { id: "prime", label: "′", value: "′" },
      { id: "double-prime", label: "″", value: "″" },
      { id: "triple-prime", label: "‴", value: "‴" },
      { id: "quadruple-prime", label: "⁗", value: "⁗" },
      { id: "reversed-prime", label: "‵", value: "‵" },
      { id: "reversed-double-prime", label: "‶", value: "‶" },
      { id: "reversed-triple-prime", label: "‷", value: "‷" },
    ],
  },
  reversed_marks: {
    name: "Reversed Marks",
    symbols: [
      { id: "reversed-double-prime-mark", label: "〝", value: "〝" },
      { id: "double-prime-mark", label: "〞", value: "〞" },
      { id: "low-double-prime", label: "〟", value: "〟" },
    ],
  },
  single_quotes: {
    name: "Single Quotes",
    symbols: [
      { id: "left-single-quote", label: "'", value: "'" },
      { id: "right-single-quote", label: "'", value: "'" },
      { id: "single-low-quote", label: "‚", value: "‚" },
      { id: "single-high-reversed", label: "‛", value: "‛" },
    ],
  },
};

// Flattened list for use in the editor (all symbols in order)
export const UNORDERED_LIST_STYLES = Object.values(
  BULLET_POINT_CATEGORIES,
).flatMap((category) => category.symbols);

// Flattened list of all quotation mark symbols
export const QUOTATION_MARK_SYMBOLS = Object.values(
  QUOTATION_MARK_CATEGORIES,
).flatMap((category) => category.symbols);

export const ORDERED_LIST_STYLES = [
  { label: "1", value: "decimal" },
  { label: "a", value: "lower-alpha" },
  { label: "A", value: "upper-alpha" },
  { label: "i", value: "lower-roman" },
  { label: "I", value: "upper-roman" },
];

export const DEFAULT_UNORDERED_LIST_STYLE = "bullet";
export const DEFAULT_ORDERED_LIST_STYLE = "decimal";
