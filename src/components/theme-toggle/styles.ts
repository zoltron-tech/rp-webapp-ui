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
`;

export const ThemeSwitchInner = styled.div<{ theme: string }>`
	width: 50%;
	height: 100%;
	background-color: ${({ theme }) =>
		THEME_SWITCHER.FRONT[theme.toUpperCase() as "DARK" | "LIGHT"]};
	border-radius: 50%;
	position: absolute;
	left: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s ease-in;

	@keyframes lightModeToDarkMode {
		0% {
			width: 50%;
			transform: translateX(0);
		}
		50% {
			width: 100%;
			transform: translateX(0);
		}
		100% {
			width: 50%;
			transform: translateX(100%);
		}
	}

	@keyframes darkModeToLightMode {
		0% {
			width: 50%;
			transform: translateX(100%);
		}
		50% {
			width: 100%;
			transform: translateX(0);
		}
		100% {
			width: 50%;
			transform: translateX(0);
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
