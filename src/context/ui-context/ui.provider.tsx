import { generateToastError, generateToastSuccess } from "@/utils/helpers";
import { FC, useState } from "react";
import { useTheme } from "styled-components";
import { UIContext, UIContextType } from "./ui.context";

type Props = {
  children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
  const [cardExpanded, setCardExpanded] =
    useState<UIContextType["cardExpanded"]>(false);
  const [signupModal, setSignupModal] = useState<boolean>(false);
  const [signupModalOpen, setSignupModalOpen] = useState<boolean>(false);
  const theme = useTheme();

  const success: UIContextType["successToast"] = (message: string) => {
    generateToastSuccess(message, theme);
  };

  const error: UIContextType["errorToast"] = (message: string) => {
    generateToastError(message, theme);
  };

  const contextValue: UIContextType = {
    cardExpanded,
    setCardExpanded,
    signupModal,
    setSignupModal,
    signupModalOpen,
    setSignupModalOpen,
    successToast: success,
    errorToast: error,
  };

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};
