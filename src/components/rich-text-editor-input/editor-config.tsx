import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
} from "react-icons/fa6";
import { RiFontColor } from "react-icons/ri";
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
