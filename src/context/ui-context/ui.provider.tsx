import { FC, useState } from "react";
import { UIContext, UIContextType } from "./ui.context";

type Props = {
	children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
	const [cardExpanded, setCardExpanded] =
		useState<UIContextType["cardExpanded"]>(false);

	const contextValue: UIContextType = {
		cardExpanded,
		setCardExpanded,
	};

	return (
		<UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
	);
};
