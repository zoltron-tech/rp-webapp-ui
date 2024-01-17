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
	width: 100%;

	&.primary {
		background-color: ${({ theme }) => theme.primary};
		border: none;
		color: ${({ theme }) => theme.text};
		padding: 10px 20px;

		&:hover {
			background-color: ${({ theme }) => theme.primaryHover};
		}
	}

	&.secondary {
		background-color: transparent;
		border: 2px solid ${({ theme }) => theme.text};
		color: ${({ theme }) => theme.text};
		padding: 8px 18px;

		&:hover {
			border-color: ${({ theme }) => theme.primaryHover};
			color: ${({ theme }) => theme.primaryHover};
		}
	}

	&.link {
		background-color: transparent;
		border: none;
		color: ${({ theme }) => theme.text};
		padding: 10px 20px;

		&:hover {
			color: ${({ theme }) => theme.primaryHover};
		}
	}

	&.rounded {
		border-radius: 20px;
	}

	&.square {
		border-radius: 0px;
	}

	&.disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	&.loading {
		pointer-events: none;

		&.primary {
			background-color: ${({ theme }) => theme.primaryHover};
		}

		&.secondary {
			border-color: ${({ theme }) => theme.primaryHover};
		}

		&.link {
			color: ${({ theme }) => theme.primaryHover};
		}
	}

	transition: background-color 0.1s ease-in-out;
`;
