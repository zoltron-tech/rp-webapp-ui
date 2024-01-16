import { NO_SCROLLBAR, PALETTE } from "@/theme";
import { ThemeProp } from "@/types";
import styled from "styled-components";

export const Container = styled.div<ThemeProp>`
	width: 100%;
	height: 100%;
	min-height: calc(100vh - 80px);
	position: relative;
	background-color: ${PALETTE.BACKGROUND};
	overflow: hidden;

	container-name: content-container;
	container-type: inline-size;

	${NO_SCROLLBAR}
`;
