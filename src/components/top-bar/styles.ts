import { PALETTE } from "@/theme";
import styled from "styled-components";

export const Bar = styled.div`
	height: 80px;
	width: 100%;
	background-color: ${PALETTE.NAVBAR};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 40px;
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const Logo = styled.div`
	height: 80px;
	width: 80px;
	/* border-radius: 10px; */
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36px;
	font-weight: 300;
	font-style: italic;
	color: ${PALETTE.SECONDARY};
	background-color: ${PALETTE.PRIMARY};
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.6);
	user-select: none;
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
	user-select: none;
	font-style: italic;
`;

export const ButtonsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 200px;
`;
