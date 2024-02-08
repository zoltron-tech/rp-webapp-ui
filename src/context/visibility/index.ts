import { createContext, useContext } from "react";

export interface VisibilityContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  name: string;
}

export const VisibilityContext = createContext<VisibilityContextType>({
  isVisible: false,
  toggleVisibility: () => {},
  name: "visibility-provider",
});

export const useVisibilityContext = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
};
