import { FC } from "react";
import * as S from "./styles";

type Props = {
	children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
	return <S.Container>{children}</S.Container>;
};
