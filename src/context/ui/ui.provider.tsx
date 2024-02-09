import { generateToastError, generateToastSuccess } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FC } from "react";
import { useTheme } from "styled-components";
import { UIContext, UIContextType } from "./ui.context";

type Props = {
  children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
  const theme = useTheme();

  const success: UIContextType["successToast"] = (message: string) => {
    generateToastSuccess(message, theme);
  };

  const error: UIContextType["errorToast"] = (message: string) => {
    generateToastError(message, theme);
  };

  const contextValue: UIContextType = {
    successToast: success,
    errorToast: error,
  };

  Logger.info("UIContextProvider rendered");

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};
