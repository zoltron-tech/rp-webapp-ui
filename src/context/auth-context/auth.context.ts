import { LoginPayload, LoginResponse, User } from "@/types";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import { createContext } from "react";

export interface AuthContextType {
  loggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  signup: (payload: SignUpPayload) => Promise<WithMessage>;
  logout: () => Promise<void>;
}

export const AUTH_CONTEXT_INITIAL_STATE: AuthContextType = {
  loggedIn: false,
  user: null,
  loading: false,
  login: async (): Promise<LoginResponse> => ({
    message: "Context not initialized!",
  }),
  signup: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  logout: async (): Promise<void> => {},
};

export const AuthContext = createContext<AuthContextType>(
  AUTH_CONTEXT_INITIAL_STATE
);
