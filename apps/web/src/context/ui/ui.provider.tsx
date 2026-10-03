"use client";

import type { FC } from "react";
import { useTheme } from "styled-components";
import type { Theme } from "@/theme";
import {
  generateToastError,
  generateToastInfo,
  generateToastSuccess,
  generateToastWarning,
} from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { UIContext, type UIContextType } from "./ui.context";

type Props = {
  children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
  const theme = useTheme() as Theme;

  const success: UIContextType["successToast"] = (message: string) => {
    generateToastSuccess(message, theme);
  };

  const error: UIContextType["errorToast"] = (message: string) => {
    generateToastError(message, theme);
  };

  const warning: UIContextType["warningToast"] = (message: string) => {
    generateToastWarning(message, theme);
  };

  const info: UIContextType["infoToast"] = (message: string) => {
    generateToastInfo(message, theme);
  };

  const contextValue: UIContextType = {
    errorToast: error,
    infoToast: info,
    successToast: success,
    warningToast: warning,
  };

  Logger.info("UIContextProvider rendered");

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};
