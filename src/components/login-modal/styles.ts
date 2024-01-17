import styled from "styled-components";

export const Container = styled.div`
	height: 100%;
	width: 100%;
	padding: 20px;
	display: flex;
	flex-direction: column;
`;

export const Header = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 10px;
	width: 100%;
	margin-bottom: 30px;
	padding-bottom: 10px;
	font-size: 18px;
	font-weight: 400;
	position: relative;
	color: ${({ theme }) => theme.text};

	&::after {
		content: "";
		position: absolute;
		height: 1px;
		background-color: ${({ theme }) => theme.primary};
		width: calc(100% + 35px);
		left: calc(35px * -1);
		bottom: -4px;
	}

	& .link {
		color: ${({ theme }) => theme.primary};
		cursor: pointer;
		font-weight: 600;

		&:hover {
			color: ${({ theme }) => theme.primaryHover};
		}
	}
`;
export const Content = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const Buttons = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 10px;
	width: 100%;

	&.button {
		width: 100%;
	}
`;
