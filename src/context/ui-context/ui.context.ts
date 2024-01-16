import { Dispatch, SetStateAction, createContext } from "react";

export type UIContextType = {
	cardExpanded: boolean;
	setCardExpanded: Dispatch<SetStateAction<boolean>>;
};

export const UI_INITIAL_STATE: UIContextType = {
	cardExpanded: false,
	setCardExpanded: () => {},
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
