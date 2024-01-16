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

	background-color: ${({ variant, theme }) =>
		is(variant, "primary") ? theme.primary : "transparent"};

	border: ${({ variant, theme }) =>
		is(variant, "secondary") ? `2px solid ${theme.text}` : "none"};

	color: ${({ theme }) => theme.text};

	padding: ${({ variant }) =>
		is(variant, "secondary") ? "8px 18px" : "10px 20px"};

	transition: background-color 0.1s ease-in-out;
`;
