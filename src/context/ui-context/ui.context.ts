import { Logger } from "@/utils/services";
import { Dispatch, SetStateAction, createContext } from "react";

export type UIContextType = {
  cardExpanded: boolean;
  setCardExpanded: Dispatch<SetStateAction<boolean>>;
  signupModal: boolean;
  setSignupModal: Dispatch<SetStateAction<boolean>>;
  signupModalOpen: boolean;
  setSignupModalOpen: Dispatch<SetStateAction<boolean>>;
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
};

export const UI_INITIAL_STATE: UIContextType = {
  cardExpanded: false,
  setCardExpanded: () => {},
  signupModal: true,
  setSignupModal: () => {},
  signupModalOpen: true,
  setSignupModalOpen: () => {},
  successToast: (message) => Logger.log(`toast service not started!`),
  errorToast: (message) => Logger.log(`toast service not started!`),
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
