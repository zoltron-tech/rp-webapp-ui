import { pSBC } from "@/lib/pSBC";
import { setOpacity } from "@/utils/helpers";

export type Theme = {
  name: string;
  background: string;
  primary: string;
  primaryHover: string;
  primaryDisabled: string;
  primaryLoading: string;
  primaryAlpha: string;
  modalBackground: string;
  toastBackground: string;
  inputBackground: string;
  pillExpandedContentBackground: string;
  searchBar: string;
  text: string;
  textPrimary: string;
  textLink: string;
  textLinkHover: string;
  textGray: string;
  textStark: string;
  navbar: string;
  cardBackgroundTint: string;
  cardBackgroundGradient: string[];
  cardDarkerBackgroundGradient: string[];
  cardBackgroundColor: string;
  cardBoxShadowColor: string;
  hoverGrey: string;
  hoverGreyAlpha: string;
  error: string;
  success: string;
  warning: string;
  processing: string;
  unreadMark: string;
  unreadBadge: string;
};

export const accentColor = "#227da1"; //"#018786"; //"#8e5e9c"; //"#1ca0a0"; // "#227cc5";;

export const THEME_LIGHT: Theme = {
  background: "#f3f1f1",
  cardBackgroundColor: "#e7e7e7",
  cardBackgroundGradient: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.546) 80%",
    "#dedede",
  ],
  cardBackgroundTint: "rgba(255, 255, 255, 0.339)",
  cardBoxShadowColor: "rgba(0, 0, 0, 0.3)",
  cardDarkerBackgroundGradient: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.546) 80%",
    "#dedede",
  ],
  error: pSBC(-0.1, "#d13232cc") as string,
  hoverGrey: "#e6e6e6",
  hoverGreyAlpha: "rgba(230, 230, 230, 0.5)",
  inputBackground: "#c5c5c5",
  modalBackground: "#fff",
  name: "light",
  navbar: "#c5c5c5", // pSBC(0.6, accentColor) as string,
  pillExpandedContentBackground: "#dcdbdb",
  primary: pSBC(-0.15, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.4),
  primaryDisabled: pSBC(0.4, accentColor) as string,
  primaryHover: pSBC(0.1, accentColor) as string,
  primaryLoading: pSBC(-0.4, accentColor) as string,
  processing: pSBC(-0.1, "#5c5c5c") as string,
  searchBar: "#dfdede",
  success: pSBC(-0.1, "#58d158") as string,
  text: "#111111",
  textGray: "#8d8b8b",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textPrimary: "#dedede",
  textStark: "#000",
  toastBackground: "#e7e7e7",
  unreadBadge: "#b32c2c",
  unreadMark: "#1599eb",
  warning: pSBC(-0.1, "#d1a000") as string,
};

export const THEME_DARK: Theme = {
  background: "#111210",
  cardBackgroundColor: "#1e1e1eb8",
  cardBackgroundGradient: [
    "rgba(255, 255, 255, 0)",
    "rgba(0, 0, 0, 0.8) 80%",
    "rgba(0, 0, 0, 1)",
  ],
  cardBackgroundTint: "rgba(0, 0, 0, 0.339)",
  cardBoxShadowColor: "rgba(0, 0, 0, 0.6)",
  cardDarkerBackgroundGradient: [
    "rgba(0, 0, 0, 0.671) 20%",
    "rgba(0, 0, 0, 0.877) 80%",
    "rgba(0, 0, 0, 1)",
  ],

  error: pSBC(0.1, "#d13232cc") as string,
  hoverGrey: "#333333",
  hoverGreyAlpha: "rgba(51, 51, 51, 0.5)",
  inputBackground: "#3a3a3a",
  modalBackground: "#292828",
  name: "dark",
  navbar: "#1f1b1b",
  pillExpandedContentBackground: "#3d3c3c",
  primary: pSBC(-0.45, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.2),
  primaryDisabled: pSBC(-0.8, accentColor) as string,
  primaryHover: pSBC(-0.6, accentColor) as string,
  primaryLoading: pSBC(-0.2, accentColor) as string,
  processing: pSBC(0.1, "#5c5c5c") as string,
  searchBar: "#6a6969",
  success: pSBC(0.1, "#58d158") as string,
  text: "#dedede",
  textGray: "#727272",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textPrimary: "#dedede",
  textStark: "#fff",
  toastBackground: "#1b1b1b",
  unreadBadge: "#b32c2c",
  unreadMark: "#9b55d4",
  warning: pSBC(0.1, "#d1a000") as string,
};
