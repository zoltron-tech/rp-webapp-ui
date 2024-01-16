import { BORDER_RADIUS, NO_USER_SELECT, PALETTE } from "@/theme";
import styled from "styled-components";

export const CardWrapper = styled.div`
	position: relative;
	width: 600px;
	height: 250px;
	border-radius: ${BORDER_RADIUS};
	/* box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4); */
	overflow: hidden;
	transition: all 0.3s ease-in-out;

	&.expanded {
		height: 600px;
	}
`;

type CardProps = {
	banner: string;
};

export const CardBackground = styled.div<CardProps>`
	position: absolute;
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: cover;
	background-image: linear-gradient(
			rgba(0, 0, 0, 0.339),
			rgba(0, 0, 0, 0.301)
		),
		url(${(props): string => props.banner});

	filter: blur(20px);
	-webkit-filter: blur(20px);
	-moz-filter: blur(20px);
	-o-filter: blur(20px);
	-ms-filter: blur(20px);
`;

export const Card = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 20px 20px 0px;
	position: relative;
	height: 100%;
	background: linear-gradient(
		rgba(255, 255, 255, 0),
		rgba(0, 0, 0, 0.8) 60%,
		rgba(0, 0, 0, 1)
	);
`;

export const CardHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-around;
	position: relative;
`;

export const ExpandButton = styled.div`
	position: absolute;
	top: 200px;
	right: 10px;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${PALETTE.HOVER_GREY_ALPHA};
	border-radius: 50%;
	box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
	z-index: 5;
	transition: background-color 0.1s ease-in-out;

	& svg {
		width: 20px;
		height: 20px;
		fill: ${PALETTE.TEXT};
		transition: transform 0.2s ease-in-out;
	}

	&.expanded svg {
		transform: rotate(180deg);
	}

	&:hover {
		cursor: pointer;
		background-color: ${PALETTE.HOVER_GREY_DARKER};
	}
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
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;
export const MuseList = styled.div`
	border-top: 1px solid ${PALETTE.HOVER_GREY_ALPHA};
	width: 100%;
	height: 100%;
	min-height: 100px;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	margin-top: 40px;
	padding-bottom: 10px;

	&::-webkit-scrollbar {
		width: 0px; /* Mostly for vertical scrollbars */
		height: 0px; /* Mostly for horizontal scrollbars */
	}
	&::-webkit-scrollbar-thumb {
		/* Foreground */
		background: ${PALETTE.HOVER_GREY_ALPHA};
		border-radius: 50px;
	}
	&::-webkit-scrollbar-track {
		/* Background */
		max-width: 10px;
		max-height: 10px;
		background: transparent;
	}
`;

const MuseComponent = styled.div`
	width: 500px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 10px 0;
	border-radius: ${BORDER_RADIUS};
	padding: 12px 40px;
	${NO_USER_SELECT}

	&:hover {
		cursor: pointer;
		background-color: ${PALETTE.HOVER_GREY_ALPHA};
	}
`;

const MuseAvatar = styled.div`
	width: 70px;
	height: 70px;
	border-radius: 50%;
	box-shadow: 0px 0px 5px 3px rgba(0, 0, 0, 0.4);

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
