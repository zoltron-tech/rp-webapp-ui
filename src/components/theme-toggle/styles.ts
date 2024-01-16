import { PALETTE } from "@/theme";
import styled from "styled-components";

const { THEME_SWITCHER } = PALETTE;

export const ThemeSwitcher = styled.div`
	width: 60px;
	height: 30px;
	background-color: ${THEME_SWITCHER.BACKGROUND};
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-right: 20px;
	position: relative;
	box-shadow: inset 0px 0px 1px 0px rgba(0, 0, 0, 0.4);
`;

export const ThemeSwitchInner = styled.div<{ theme: string }>`
	width: 50%;
	height: 100%;
	border-radius: 50%;
	position: absolute;
	left: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.4);

	@keyframes lightModeToDarkMode {
		0% {
			width: 50%;
			transform: translateX(0);
			background-color: ${THEME_SWITCHER.FRONT.DAY};
		}
		50% {
			width: 100%;
			transform: translateX(0);
			background-color: ${THEME_SWITCHER.FRONT.DAY};
		}
		100% {
			width: 50%;
			transform: translateX(100%);
			background-color: ${THEME_SWITCHER.FRONT.NIGHT};
		}
	}

	@keyframes darkModeToLightMode {
		0% {
			width: 50%;
			transform: translateX(100%);
			background-color: ${THEME_SWITCHER.FRONT.NIGHT};
		}
		50% {
			width: 100%;
			transform: translateX(0);
			background-color: ${THEME_SWITCHER.FRONT.NIGHT};
		}
		100% {
			width: 50%;
			transform: translateX(0);
			background-color: ${THEME_SWITCHER.FRONT.DAY};
		}
	}

	&.dark {
		animation: lightModeToDarkMode 0.4s forwards;
	}

	&.light {
		animation: darkModeToLightMode 0.4s forwards;
	}
`;

export const ThemeIconContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;

	& svg {
		transition: all 0.1s ease-in;
	}
`;
