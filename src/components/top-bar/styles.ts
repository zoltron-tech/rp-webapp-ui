import { NO_USER_SELECT, PALETTE } from "@/theme";
import { ThemeProp } from "@/types";
import styled from "styled-components";

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
	container-name: top-bar;
	container-type: inline-size;

	@container (max-width: 800px) {
		& {
			padding: 0 20px;
		}
	}

	@container (max-width: 650px) {
		& {
			padding: 0px;
		}
	}
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

	@container (max-width: 800px) {
		& {
			font-size: 24px;
		}
	}

	@container (max-width: 650px) {
		& {
			display: none;
		}
	}
`;

export const ActionsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ButtonsContainerDesktop = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 200px;

	@container (max-width: 800px) {
		& {
			display: none;
		}
	}
`;

export const ButtonsContainerMobile = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-direction: column;
	width: 100px;

	@container (min-width: 800px) {
		& {
			display: none;
		}
	}

	& > .button:not(:last-child) {
		border-bottom: 1px solid ${PALETTE.PRIMARY};
	}
`;
