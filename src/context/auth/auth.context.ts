import { LoginPayload, LoginResponse, Novelist, User } from "@/types";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import { AuthState } from "@/types/state";
import { createContext } from "react";

export interface AuthContextType {
  state: AuthState;
  user: User | null;
  novelist: Novelist | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  signup: (payload: SignUpPayload) => Promise<WithMessage>;
  logout: () => Promise<void>;
  updateNovelist: (novelist: Novelist) => void;
}

export const AUTH_CONTEXT_INITIAL_STATE: AuthContextType = {
  state: "LOGGED_OUT",
  user: null,
  novelist: null,
  login: async (): Promise<LoginResponse> => ({
    message: "Context not initialized!",
  }),
  signup: async (): Promise<WithMessage> => ({
    message: "Context not initialized!",
  }),
  logout: async (): Promise<void> => {},
  updateNovelist: () => {},
};

export const AuthContext = createContext<AuthContextType>(
  AUTH_CONTEXT_INITIAL_STATE
);
