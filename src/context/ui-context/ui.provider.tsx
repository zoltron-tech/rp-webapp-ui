import { FC, useState } from "react";
import { UIContext, UIContextType } from "./ui.context";

type Props = {
  children: React.ReactNode;
};

export const UIContextProvider: FC<Props> = ({ children }) => {
  const [cardExpanded, setCardExpanded] =
    useState<UIContextType["cardExpanded"]>(false);
  const [signupModal, setSignupModal] = useState<boolean>(false);
  const [signupModalOpen, setSignupModalOpen] = useState<boolean>(false);

  const contextValue: UIContextType = {
    cardExpanded,
    setCardExpanded,
    signupModal,
    setSignupModal,
    signupModalOpen,
    setSignupModalOpen,
  };

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};
