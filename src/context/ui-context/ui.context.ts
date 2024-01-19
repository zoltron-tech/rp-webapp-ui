import { Dispatch, SetStateAction, createContext } from "react";

export type UIContextType = {
  cardExpanded: boolean;
  setCardExpanded: Dispatch<SetStateAction<boolean>>;
  signupModal: boolean;
  setSignupModal: Dispatch<SetStateAction<boolean>>;
  signupModalOpen: boolean;
  setSignupModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const UI_INITIAL_STATE: UIContextType = {
  cardExpanded: false,
  setCardExpanded: () => {},
  signupModal: true,
  setSignupModal: () => {},
  signupModalOpen: true,
  setSignupModalOpen: () => {},
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
