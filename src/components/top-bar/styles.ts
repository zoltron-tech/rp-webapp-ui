import { BORDER_RADIUS, PALETTE } from "@/theme";
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

export const NovelistCarouselContainer = styled.div`
	width: 80vw;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	border-radius: ${BORDER_RADIUS};
	overflow-x: scroll;
	overflow-y: hidden;
	margin: auto;
	margin-top: 10px;

	@media (max-width: 1000px) {
		height: calc(100vh - 80px);
		overflow-y: scroll;
		overflow-x: hidden;
		align-items: flex-start;
		justify-content: center;
	}

	&::-webkit-scrollbar {
		padding-top: 10px;
		width: 0px;
		height: 0px;
	}
	&::-webkit-scrollbar-thumb {
		/* Foreground */
		background: ${PALETTE.WHIPPED_CREAM};
		border-radius: 10px;
	}
	&::-webkit-scrollbar-track {
		/* Background */
		background: transparent;
	}
`;

export const NovelistCarousel = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;

	@media screen and (max-width: 1000px) {
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		margin: auto;
	}

	::-webkit-scrollbar {
		display: none; /* Hide scrollbar for Chrome, Safari and Opera */
	}

	-ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
	scrollbar-width: none; /* Hide scrollbar for Firefox */
`;
