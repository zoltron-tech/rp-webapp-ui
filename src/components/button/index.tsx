"use client";

import { FC } from "react";
import * as S from "./styles";
import classNames from "classnames";

export type ButtonProps = {
	children?: React.ReactNode;
	variant?: S.ContainerProps["variant"];
	shape?: S.ContainerProps["shape"];
	onClick?: () => void;
};
export const Button: FC<ButtonProps> = ({
	children,
	variant = "primary",
	shape = "square",
	onClick,
}) => {
	return (
		<S.Container
			className={classNames(["button"])}
			onClick={onClick}
			variant={variant}
			shape={shape}
		>
			{children}
		</S.Container>
	);
};
