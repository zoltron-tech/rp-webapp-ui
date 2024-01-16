import { BORDER_RADIUS } from "@/theme";
import styled from "styled-components";
import { Button } from "@/components";

type ContainerProps = {
	open: boolean;
};

export const Container = styled.div<ContainerProps>`
	position: fixed;
	z-index: 9999;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;

	${({ open }) => !open && "display: none;"}
`;

export const Content = styled.div`
	z-index: 9999;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #fff;
	border-radius: ${BORDER_RADIUS};
	padding: 16px;
	min-height: 200px;
	min-width: 300px;
	border: 2px solid ${({ theme }) => theme.primary};
	box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const CloseButton = styled.div`
	z-index: 9999;
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: all 0.2s ease-in-out;
	width: 30px;
	height: 30px;

	& svg {
		width: 30px;
		height: 30px;
	}
`;
