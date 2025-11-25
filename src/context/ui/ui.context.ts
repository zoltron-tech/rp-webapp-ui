import { createContext } from "react";
import { Logger } from "@/utils/services";

export type UIContextType = {
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
  warningToast: (message: string) => void;
  infoToast: (message: string) => void;
};

export const UI_INITIAL_STATE: UIContextType = {
  errorToast: (_message) => Logger.debug(`toast service not started!`),
  infoToast: (_message) => Logger.debug(`toast service not started!`),
  successToast: (_message) => Logger.debug(`toast service not started!`),
  warningToast: (_message) => Logger.debug(`toast service not started!`),
};

export const UIContext = createContext<UIContextType>(UI_INITIAL_STATE);
