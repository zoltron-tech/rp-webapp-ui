import { Novelist } from "@/types";
import { WithMessage } from "@/types/common";
import { createContext } from "react";

export interface AuthContextType {
  verifyAccount: (jwt: string) => Promise<WithMessage>;
  updateNovelist: (novelist: Novelist) => void;
}

export const AUTH_CONTEXT_INITIAL_STATE: AuthContextType = {
  verifyAccount: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  updateNovelist: () => {},
};

export const AuthContext = createContext<AuthContextType>(
  AUTH_CONTEXT_INITIAL_STATE
);
