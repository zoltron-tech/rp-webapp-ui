"use client";
import {
  authenticateAction,
  getUser,
  loginAction,
  logoutAction,
  signupAction,
} from "@/app/actions";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useStateMachine } from "@/hooks";
import { LoginPayload, Novelist, User } from "@/types";
import { SignUpPayload } from "@/types/register";
import { AuthState } from "@/types/state";
import { Logger } from "@/utils/services";
import { usePathname } from "next/navigation";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth.context";

interface Props {
  children: ReactNode;
}

export const AuthProvider: FC<Props> = ({ children }) => {
  const initialRender = useRef(true);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [novelist, setNovelist] = useState<Novelist | null>(null);

  const { state, is, transition } = useStateMachine<AuthState>({
    initial: "LOGGED_OUT",
    transitions: {
      LOGGED_IN: {
        LOADING: true,
        LOGGED_OUT: () => {
          setUser(null);
          setNovelist(null);
        },
      },
      LOGGED_OUT: {
        LOADING: true,
        LOGGED_IN: true,
      },
      LOADING: {
        LOGGED_IN: true,
        LOGGED_OUT: () => {
          setUser(null);
          setNovelist(null);
        },
      },
    },
  });

  const fetchProfile = async () => {
    transition("LOADING");
    try {
      const _novelist = await getUserNovelist();

      if (_novelist) {
        setNovelist(_novelist);
        transition("LOGGED_IN");
      } else {
        transition("LOGGED_OUT");
      }
    } catch (e) {
      transition("LOGGED_OUT");
    }
  };

  const login = async (payload: LoginPayload) => {
    transition("LOADING");
    const response = await loginAction(payload);

    if ("user" in response) {
      setUser(response.user);
      await fetchProfile();
    } else {
      transition("LOGGED_OUT");
    }
    return response;
  };

  const signup = async (payload: SignUpPayload) => {
    transition("LOADING");
    const response = await signupAction(payload);
    if ("user" in response) {
      setUser(response.user);
      transition("LOGGED_IN");
    }
    return response;
  };

  const logout = async () => {
    await logoutAction();
    transition("LOGGED_OUT");
  };

  const refreshAuthState = async () => {
    const verified = await authenticateAction();

    if (!verified) {
      transition("LOGGED_OUT");
    }
  };

  const verifyInitialAuthState = async () => {
    transition("LOADING");

    try {
      const authenticated = await authenticateAction();

      if (authenticated) {
        const _user = await getUser();
        setUser(_user);
        await fetchProfile();
      } else {
        transition("LOGGED_OUT");
      }
    } catch (e) {
      Logger.log("Error in verifyInitialAuthState", e);
      transition("LOGGED_OUT");
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (is("LOGGED_OUT")) {
        verifyInitialAuthState();
      }
    }
  }, []);

  useEffect(() => {
    Logger.log("auth state changed: ", state);
  }, [state]);

  useEffect(() => {
    if (is("LOGGED_IN")) {
      refreshAuthState();
    }
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        state,
        user,
        novelist,
        login,
        signup,
        logout,
        updateNovelist: setNovelist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
