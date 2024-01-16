import { NO_USER_SELECT, PALETTE } from "@/theme";
import styled from "styled-components";

type ThemeProp = {
	theme: "light" | "dark";
};

export const Bar = styled.div<ThemeProp>`
	height: 80px;
	width: 100%;
	background-color: ${PALETTE.NAVBAR};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 40px;
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
	position: sticky;
`;

export const Logo = styled.div`
	height: 80px;
	width: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36px;
	font-weight: 300;
	font-style: italic;
	color: ${PALETTE.SECONDARY};
	background-color: ${PALETTE.PRIMARY};
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.6);
	${NO_USER_SELECT}
`;

export const LogoContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const LogoText = styled.div`
	margin-left: 20px;
	text-transform: uppercase;
	font-size: 28px;
	font-weight: 500;
	color: ${PALETTE.TEXT};
	font-style: italic;

	${NO_USER_SELECT}
`;

export const ActionsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-right: 40px;
`;

export const ButtonsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 200px;
`;
