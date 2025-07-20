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
  name: "light",
  background: "#f3f1f1",
  primary: pSBC(-0.15, accentColor) as string,
  primaryHover: pSBC(0.1, accentColor) as string,
  primaryDisabled: pSBC(0.4, accentColor) as string,
  primaryLoading: pSBC(-0.4, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.4),
  modalBackground: "#fff",
  toastBackground: "#e7e7e7",
  inputBackground: "#c5c5c5",
  pillExpandedContentBackground: "#dcdbdb",
  searchBar: "#dfdede",
  text: "#111111",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#8d8b8b",
  textStark: "#000",
  navbar: "#c5c5c5", // pSBC(0.6, accentColor) as string,
  cardBackgroundTint: "rgba(255, 255, 255, 0.339)",
  cardBackgroundGradient: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.546) 80%",
    "#dedede",
  ],
  cardDarkerBackgroundGradient: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.546) 80%",
    "#dedede",
  ],
  cardBackgroundColor: "#e7e7e7",
  cardBoxShadowColor: "rgba(0, 0, 0, 0.3)",
  hoverGrey: "#e6e6e6",
  hoverGreyAlpha: "rgba(230, 230, 230, 0.5)",
  error: pSBC(-0.1, "#bd0000") as string,
  success: pSBC(-0.1, "#58d158") as string,
  warning: pSBC(-0.1, "#d1a000") as string,
  processing: pSBC(-0.1, "#5c5c5c") as string,
  unreadMark: "#1599eb",
  unreadBadge: "#b32c2c",
};

export const THEME_DARK: Theme = {
  name: "dark",
  background: "#1d1c1c",
  primary: pSBC(-0.45, accentColor) as string,
  primaryHover: pSBC(-0.6, accentColor) as string,
  primaryDisabled: pSBC(-0.8, accentColor) as string,
  primaryLoading: pSBC(-0.2, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.2),
  modalBackground: "#292828",
  toastBackground: "#1b1b1b",
  inputBackground: "#3a3a3a",
  pillExpandedContentBackground: "#3d3c3c",
  searchBar: "#6a6969",
  text: "#dedede",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#727272",
  textStark: "#fff",
  navbar: "#1f1b1b",
  cardBackgroundTint: "rgba(0, 0, 0, 0.339)",
  cardBackgroundGradient: [
    "rgba(255, 255, 255, 0)",
    "rgba(0, 0, 0, 0.8) 80%",
    "rgba(0, 0, 0, 1)",
  ],
  cardDarkerBackgroundGradient: [
    "rgba(0, 0, 0, 0.671) 20%",
    "rgba(0, 0, 0, 0.877) 80%",
    "rgba(0, 0, 0, 1)",
  ],
  cardBackgroundColor: "#1e1e1eb8",
  cardBoxShadowColor: "rgba(0, 0, 0, 0.6)",
  hoverGrey: "#333333",
  hoverGreyAlpha: "rgba(51, 51, 51, 0.5)",

  error: pSBC(0.1, "#bd0000") as string,
  success: pSBC(0.1, "#58d158") as string,
  warning: pSBC(0.1, "#d1a000") as string,
  processing: pSBC(0.1, "#5c5c5c") as string,
  unreadMark: "#1599eb",
  unreadBadge: "#b32c2c",
};
