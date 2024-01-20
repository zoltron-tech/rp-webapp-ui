import { pSBC } from "@/lib/pSBC";

export type Theme = {
  name: string;
  background: string;
  modalBackground: string;
  toastBackground: string;
  text: string;
  textPrimary: string;
  textLink: string;
  textLinkHover: string;
  textGray: string;
  primary: string;
  primaryHover: string;
  primaryDisabled: string;
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

export const accentColor = "#ff1a40";

export const THEME_LIGHT: Theme = {
  name: "light",
  background: "#aeaeae",
  modalBackground: "#fff",
  toastBackground: "#e7e7e7",
  text: "#242424",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#5f5f5f",
  primary: pSBC(-0.15, accentColor) as string,
  primaryHover: pSBC(0.1, accentColor) as string,
  primaryDisabled: "#a5a5a5",
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
  modalBackground: "#292828",
  toastBackground: "#1b1b1b",
  text: "#dedede",
  textPrimary: "#dedede",
  textLink: accentColor,
  textLinkHover: pSBC(-0.3, accentColor) as string,
  textGray: "#727272",
  primary: pSBC(-0.5, accentColor) as string,
  primaryHover: pSBC(-0.2, accentColor) as string,
  primaryDisabled: "#585858",
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
