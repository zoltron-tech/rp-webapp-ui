import { PALLETE } from "@/theme";
import styled from "styled-components";

export type ContainerProps = {
	variant: "primary" | "secondary";
};

export const Container = styled.div<ContainerProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: ${({ variant }) =>
		variant === "primary" ? PALLETE.PRIMARY : PALLETE.SECONDARY};
	border: ${({ variant }) =>
		variant === "primary" ? "none" : `2px solid ${PALLETE.PRIMARY}`};
	color: ${({ variant }) =>
		variant === "primary" ? PALLETE.SECONDARY : PALLETE.TEXT};
	font-weight: 600;
	border-radius: 15px;
	padding: ${({ variant }) =>
		variant === "primary" ? "10px 20px" : "8px 18px"};
	cursor: pointer;
`;
