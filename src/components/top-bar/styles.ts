import { PALLETE } from "@/theme";
import styled from "styled-components";

export const Bar = styled.div`
	height: 80px;
	width: 100%;
	background-color: ${PALLETE.NAVBAR};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 40px;
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const Logo = styled.div`
	height: 60px;
	width: 60px;
	/* border-radius: 10px; */
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30px;
	font-weight: 300;
	font-style: italic;
	color: ${PALLETE.SECONDARY};
	background-color: ${PALLETE.PRIMARY};
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.6);
`;

export const ButtonsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 200px;
`;
