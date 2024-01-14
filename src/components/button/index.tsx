"use client";

import { FC } from "react";
import * as S from "./styles";

type Props = {
	children?: React.ReactNode;
	variant?: S.ContainerProps["variant"];
};
export const Button: FC<Props> = ({ children, variant = "primary" }) => {
	return <S.Container variant={variant}>{children}</S.Container>;
};
