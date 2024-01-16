import { css } from "styled-components";

export const NO_USER_SELECT = css`
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
`;

export const NO_SCROLLBAR = css`
	&::-webkit-scrollbar {
		display: none;
	}
`;
