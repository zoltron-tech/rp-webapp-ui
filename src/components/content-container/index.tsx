import { FC, useContext } from "react";
import * as S from "./styles";
import { ThemeContext } from "@/context";

type Props = {
	children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
	const { theme } = useContext(ThemeContext);

	return <S.Container theme={theme}>{children}</S.Container>;
};
