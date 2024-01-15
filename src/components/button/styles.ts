import { BORDER_RADIUS, PALETTE } from "@/theme";
import styled from "styled-components";

export type ContainerProps = {
	variant: "primary" | "secondary";
	shape: "rounded" | "square";
};

export const Container = styled.div<ContainerProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: ${({ variant }) =>
		variant === "primary" ? PALETTE.PRIMARY : PALETTE.SECONDARY};
	border: ${({ variant }) =>
		variant === "primary" ? "none" : `2px solid ${PALETTE.PRIMARY}`};
	color: ${({ variant }) =>
		variant === "primary" ? PALETTE.TEXT : PALETTE.PRIMARY};
	font-weight: 600;
	border-radius: ${({ shape }) =>
		shape === "rounded" ? BORDER_RADIUS : "0px"};
	padding: ${({ variant }) =>
		variant === "primary" ? "10px 20px" : "8px 18px"};
	cursor: pointer;
`;
