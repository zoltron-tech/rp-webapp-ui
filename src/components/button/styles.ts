import { BORDER_RADIUS, PALETTE } from "@/theme";
import styled from "styled-components";

export type ContainerProps = {
	variant: "primary" | "secondary" | "link";
	shape: "rounded" | "square";
};

export const is = <T>(unionProp: T, prop: T): boolean => unionProp === prop;
export const Container = styled.div<ContainerProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	border-radius: 2px;
	cursor: pointer;
	white-space: nowrap;

	background-color: ${({ variant }) =>
		is(variant, "primary")
			? PALETTE.PRIMARY
			: is(variant, "secondary")
			? PALETTE.SECONDARY
			: "transparent"};

	border: ${({ variant }) =>
		is(variant, "secondary") ? `2px solid ${PALETTE.PRIMARY}` : "none"};

	color: ${({ variant }) =>
		is(variant, "secondary") ? PALETTE.PRIMARY : PALETTE.TEXT};

	padding: ${({ variant }) =>
		is(variant, "secondary") ? "8px 18px" : "10px 20px"};

	transition: background-color 0.1s ease-in-out;
`;
