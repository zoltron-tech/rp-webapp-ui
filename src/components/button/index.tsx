"use client";

import { ButtonHTMLAttributes, FC } from "react";
import * as S from "./styles";
import classNames from "classnames";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children?: React.ReactNode;
	variant?: S.ContainerProps["variant"];
	shape?: S.ContainerProps["shape"];
	onClick?: () => void;
	loading?: boolean;
};
export const Button: FC<ButtonProps> = ({
	children,
	variant = "primary",
	shape = "square",
	disabled,
	loading,
	onClick,
}) => {
	return (
		<S.Container
			className={classNames([
				"button",
				{
					loading,
					disabled,
					primary: variant === "primary",
					secondary: variant === "secondary",
					square: shape === "square",
					rounded: shape === "rounded",
				},
			])}
			onClick={onClick}
			variant={variant}
			shape={shape}
		>
			{children}
		</S.Container>
	);
};
