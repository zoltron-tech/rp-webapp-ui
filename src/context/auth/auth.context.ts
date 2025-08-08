import { LoginPayload, LoginResponse, Novelist, User } from "@/types";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import { AuthState } from "@/types/state";
import { createContext } from "react";

export interface AuthContextType {
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  signup: (payload: SignUpPayload) => Promise<WithMessage>;
  forgotPassword: (email: string) => Promise<WithMessage>;
  resetPassword: (payload: LoginPayload, jwt: string) => Promise<WithMessage>;
  verifyAccount: (jwt: string) => Promise<WithMessage>;
  logout: () => Promise<void>;
  updateNovelist: (novelist: Novelist) => void;
}

export const AUTH_CONTEXT_INITIAL_STATE: AuthContextType = {
  login: async (): Promise<LoginResponse> => ({
    message: "Context not initialized!",
  }),
  signup: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  forgotPassword: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  resetPassword: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  verifyAccount: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  logout: async (): Promise<void> => {},
  updateNovelist: () => {},
};

export const AuthContext = createContext<AuthContextType>(
  AUTH_CONTEXT_INITIAL_STATE
);
