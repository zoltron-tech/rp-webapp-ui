import styled from "styled-components";

export const InputWrapper = styled.div`
	margin-bottom: 10px;
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
`;

export const InputContainer = styled.div`
	position: relative;
	width: 100%;
	height: 48px;

	&.long-err {
		height: 64px;
	}
`;

export const InputLabel = styled.label`
	position: absolute;
	top: 10px;
	left: 10px;
	color: ${({ theme }) => theme.text};
	cursor: text;
	pointer-events: none;
	transition: all 0.1s ease-in;
`;

export const Input = styled.input`
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	border: 2px solid ${({ theme }) => theme.primary};
	border-radius: 10px;
	background: none;
	outline: none;
	padding: 10px;
	color: ${({ theme }) => theme.text};

	&:hover {
		border-color: ${({ theme }) => theme.primaryHover};
	}

	&:focus {
		border-color: ${({ theme }) => theme.primaryHover};
	}

	&:focus ~ label,
	&:not(:placeholder-shown):not(:focus) ~ label {
		top: -0.8rem;
		font-size: 0.8rem;
		padding: 0px 5px;
		background-color: ${({ theme }) => theme.modalBackground};
	}

	&.left-icon {
		padding-left: 40px;
	}

	&.right-icon {
		padding-right: 40px;
	}
`;

export const ErrorMsg = styled.div`
	font-style: normal;
	font-weight: 600;
	font-size: 12px;
	line-height: 16px;
	color: #ff3d3d;
	position: absolute;
	left: 0;
	top: calc(100% + 4px);
	display: flex;

	&.long-err {
		position: relative;
	}

	& span {
		display: flex;
		margin-right: 4px;
	}
`;

export const RightIconBox = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	right: 16px;
	height: 100%;
	top: 0px;

	& svg {
		fill: ${({ theme }) => theme.text};
		path {
			fill: ${({ theme }) => theme.text} !important;
		}
	}
`;
