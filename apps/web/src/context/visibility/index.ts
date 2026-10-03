"use client";

import { createContext, useContext } from "react";

export interface VisibilityContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  name: string;
}

export const VisibilityContext = createContext<VisibilityContextType>({
  isVisible: false,
  name: "visibility-provider",
  toggleVisibility: () => {},
});

export const useVisibilityContext = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
};
