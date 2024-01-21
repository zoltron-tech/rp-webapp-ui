import { FC, useState } from "react";
import { UIContext, UIContextType } from "./ui.context";
import { useUIContext } from "@/hooks";

type Props = {
  children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
  const [cardExpanded, setCardExpanded] =
    useState<UIContextType["cardExpanded"]>(false);
  const [signupModal, setSignupModal] = useState<boolean>(false);
  const [signupModalOpen, setSignupModalOpen] = useState<boolean>(false);

  const { successToast } = useUIContext();
  const success: UIContextType["successToast"] = (message: string) => {
    successToast(message);
  };

  const error: UIContextType["errorToast"] = (message: string) => {
    successToast(message);
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
