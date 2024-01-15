import { BORDER_RADIUS, PALETTE } from "@/theme";
import styled from "styled-components";

export const Card = styled.div`
	width: 600px;
	height: 800px;
	background-color: ${PALETTE.WHIPPED_CREAM};
	border-radius: ${BORDER_RADIUS};
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 20px;
	user-select: none;
`;

export const CardHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-around;
`;

export const Title = styled.div`
	font-size: 24px;
	font-weight: 600;
	color: ${PALETTE.TEXT};
`;

export const Avatar = styled.div`
	width: 200px;
	height: 200px;
	border-radius: 50%;
	background-color: #000;
	box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);

	/* border: 8px solid ${PALETTE.PRIMARY}; */

	img {
		width: 200px;
		height: 200px;
		object-fit: cover;
		border-radius: 50%;
	}
`;

export const NovelistInfo = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

export const Username = styled.div`
	font-size: 18px;
	font-weight: 500;
	color: ${PALETTE.TEXT};
`;

export const Email = styled.div`
	font-size: 16px;
	font-weight: 400;
	color: ${PALETTE.TEXT};
`;

export const MuseListContainer = styled.div`
	margin-top: 40px;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;
export const MuseList = styled.div`
	border-top: 1px solid ${PALETTE.PRIMARY};

	width: 100%;
	height: 500px;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;

	&::-webkit-scrollbar {
		width: 10px; /* Mostly for vertical scrollbars */
		height: 10px; /* Mostly for horizontal scrollbars */
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

export const MuseListFade = styled.div`
	height: 100%;
	pointer-events: none;
	background: linear-gradient(
		to bottom,
		${PALETTE.WHIPPED_CREAM} 0%,
		rgba(255, 255, 255, 0) 10%,
		rgba(255, 255, 255, 0) 80%,
		${PALETTE.WHIPPED_CREAM} 100%
	);
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
`;

const MuseComponent = styled.div`
	width: 500px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 10px 0;
	border-radius: ${BORDER_RADIUS};
	padding: 12px 40px;

	&:hover {
		cursor: pointer;
		background-color: ${PALETTE.HOVER_GREY};
	}
`;

const MuseAvatar = styled.div`
	width: 70px;
	height: 70px;
	border-radius: 50%;
	box-shadow: 0px 0px 5px 3px rgba(0, 0, 0, 0.4);
	/* border: 4px solid ${PALETTE.PRIMARY}; */

	img {
		width: 70px;
		height: 70px;
		object-fit: cover;
		border-radius: 50%;
	}
`;

const MuseName = styled.div`
	font-size: 18px;
	font-weight: 500;
	color: ${PALETTE.TEXT};
`;

export const Muse = Object.assign(MuseComponent, {
	Avatar: MuseAvatar,
	Name: MuseName,
});
