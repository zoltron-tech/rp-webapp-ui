import { FC } from "react";

type Props = {
	children: React.ReactNode;
	if: boolean;
};

export const ShouldRender: FC<Props> = ({ children, if: condition }) => {
	return condition ? <>{children}</> : null;
};
