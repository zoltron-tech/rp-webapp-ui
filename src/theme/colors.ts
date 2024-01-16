import { pSBC } from "../lib/pSBC";

type Palette = {
	NAVBAR: string;
	TEXT: string;
	PRIMARY: string;
	PRIMARY_HOVER: string;
	SECONDARY: string;
	BACKGROUND: string;
	GREY: string;
	DANGER: string;
	HOVER_GREY_DARKER: string;
	HOVER_GREY: string;
	HOVER_GREY_ALPHA: string;
	WHIPPED_CREAM: string;

	THEME_SWITCHER: {
		BACKGROUND: string;
		FRONT: {
			NIGHT: string;
			DAY: string;
		};
		MOON_COLOR: string;
		SUN_COLOR: string;
		OPTION_DISABLED: string;
	};
};

export const PALETTE: Palette = {
	NAVBAR: "#50577A",
	TEXT: "#F5F4F6",
	PRIMARY: "#16003B",
	PRIMARY_HOVER: "",
	SECONDARY: "#F5F4F6",
	BACKGROUND: "#2e2f3f",
	GREY: "#413F42",
	DANGER: "#d33b5c",
	HOVER_GREY_DARKER: "#3A3D4D",
	HOVER_GREY: "#50577A",
	HOVER_GREY_ALPHA: "rgba(112, 95, 149, 0.231)",
	WHIPPED_CREAM: "#6B728E",
	THEME_SWITCHER: {
		BACKGROUND: "#6B728E",
		FRONT: {
			NIGHT: "#042b52",
			DAY: "#72aae2",
		},
		MOON_COLOR: "#fcea4b",
		SUN_COLOR: "#fbfd87",
		OPTION_DISABLED: "#6B728E",
	},
};

PALETTE.PRIMARY_HOVER = pSBC(0.4, PALETTE.PRIMARY) as string;
