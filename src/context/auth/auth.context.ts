import { createContext } from "react";
import type { WithMessage } from "@/types/common";

export interface AuthContextType {
  verifyAccount: (jwt: string) => Promise<WithMessage>;
}

export const AUTH_CONTEXT_INITIAL_STATE: AuthContextType = {
  verifyAccount: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
};

export const AuthContext = createContext<AuthContextType>(
  AUTH_CONTEXT_INITIAL_STATE,
);
