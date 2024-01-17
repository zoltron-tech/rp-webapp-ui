import { pSBC } from "@/lib/pSBC";

export type Theme = {
	background: string;
	modalBackground: string;
	text: string;
	primary: string;
	primaryHover: string;
	navbar: string;
	cardBackgroundTint: string;
	cardBackgroundGradient: string[];
	hoverGrey: string;
	hoverGreyAlpha: string;
	danger: string;
	success: string;
};

export const accentColor = "#158560";

export const THEME_LIGHT: Theme = {
	background: "#aeaeae",
	modalBackground: "#fff",
	text: "#242424",
	primary: pSBC(0.1, accentColor) as string,
	primaryHover: pSBC(-0.2, accentColor) as string,
	navbar: pSBC(0.6, accentColor) as string,
	cardBackgroundTint: "rgba(185, 182, 182, 0.003)",
	cardBackgroundGradient: [
		"rgba(0, 0, 0, 0)",
		"rgba(208, 208, 208, 0.546) 40%",
		"#dedede",
	],
	hoverGrey: "#e6e6e6",
	hoverGreyAlpha: "rgba(230, 230, 230, 0.5)",
	danger: pSBC(0.3, "#ff0000") as string,
	success: pSBC(0.3, "#00ff00") as string,
};

export const THEME_DARK: Theme = {
	background: "#232323",
	modalBackground: "#1f1f1f",
	text: "#ded9d9",
	primary: pSBC(-0.5, accentColor) as string,
	primaryHover: pSBC(-0.1, accentColor) as string,
	navbar: "#474646",
	cardBackgroundTint: "rgba(0, 0, 0, 0.339)",
	cardBackgroundGradient: [
		"rgba(255, 255, 255, 0)",
		"rgba(0, 0, 0, 0.8) 60%",
		"rgba(0, 0, 0, 1)",
	],
	hoverGrey: "#333333",
	hoverGreyAlpha: "rgba(51, 51, 51, 0.5)",
	danger: pSBC(-0.3, "#ff0000") as string,
	success: pSBC(-0.3, "#00ff00") as string,
};
