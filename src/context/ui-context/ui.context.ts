import { Logger } from "@/utils/services";
import { createContext } from "react";

export type UIContextType = {
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
};

export const UI_INITIAL_STATE: UIContextType = {
  successToast: (message) => Logger.log(`toast service not started!`),
  errorToast: (message) => Logger.log(`toast service not started!`),
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
