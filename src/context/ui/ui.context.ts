import { createContext } from "react";
import { Logger } from "@/utils/services";

export type UIContextType = {
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
};

export const UI_INITIAL_STATE: UIContextType = {
  successToast: (_message) => Logger.debug(`toast service not started!`),
  errorToast: (_message) => Logger.debug(`toast service not started!`),
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
