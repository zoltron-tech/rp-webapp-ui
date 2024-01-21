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
  text: string;
  textPrimary: string;
  textLink: string;
  textLinkHover: string;
  textGray: string;
  textStark: string;
  navbar: string;
  cardBackgroundTint: string;
  cardBackgroundGradient: string[];
  cardBackgroundColor: string;
  cardBoxShadowColor: string;
  hoverGrey: string;
  hoverGreyAlpha: string;
  error: string;
  success: string;
  warning: string;
  processing: string;
};

export const accentColor = "#227cc5"; // "#8e5e9c"; //"#1ca0a0"; //"#227da1"; //;

export const THEME_LIGHT: Theme = {
  name: "light",
  background: "#aeaeae",
  primary: pSBC(-0.15, accentColor) as string,
  primaryHover: pSBC(0.1, accentColor) as string,
  primaryDisabled: pSBC(0.4, accentColor) as string,
  primaryLoading: pSBC(-0.4, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.4),
  modalBackground: "#fff",
  toastBackground: "#e7e7e7",
  inputBackground: "#c5c5c5",
  text: "#242424",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#5f5f5f",
  textStark: "#000",
  navbar: pSBC(0.6, accentColor) as string,
  cardBackgroundTint: "rgba(185, 182, 182, 0.003)",
  cardBackgroundGradient: [
    "rgba(0, 0, 0, 0)",
    "rgba(208, 208, 208, 0.546) 40%",
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
};

export const THEME_DARK: Theme = {
  name: "dark",
  background: "#232323",
  primary: pSBC(-0.45, accentColor) as string,
  primaryHover: pSBC(-0.6, accentColor) as string,
  primaryDisabled: pSBC(-0.8, accentColor) as string,
  primaryLoading: pSBC(-0.2, accentColor) as string,
  primaryAlpha: setOpacity(accentColor, 0.4),
  modalBackground: "#292828",
  toastBackground: "#1b1b1b",
  inputBackground: "#3a3a3a",
  text: "#dedede",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#727272",
  textStark: "#fff",
  navbar: "#474646",
  cardBackgroundTint: "rgba(0, 0, 0, 0.339)",
  cardBackgroundGradient: [
    "rgba(255, 255, 255, 0)",
    "rgba(0, 0, 0, 0.8) 60%",
    "rgba(0, 0, 0, 1)",
  ],
  cardBackgroundColor: "#1b1b1b",
  cardBoxShadowColor: "rgba(0, 0, 0, 0.6)",
  hoverGrey: "#333333",
  hoverGreyAlpha: "rgba(51, 51, 51, 0.5)",

  error: pSBC(0.1, "#bd0000") as string,
  success: pSBC(0.1, "#58d158") as string,
  warning: pSBC(0.1, "#d1a000") as string,
  processing: pSBC(0.1, "#5c5c5c") as string,
};
