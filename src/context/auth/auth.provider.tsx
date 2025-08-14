"use client";

import {
  authenticateAction,
  getUser,
  loginAction,
  logoutAction,
  verifyAccountAction,
  signupAction,
} from "@/app/actions";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useStateMachine } from "@/hooks";
import { LoginPayload, Novelist, User } from "@/types";
import { SignUpPayload } from "@/types/register";
import { AuthState } from "@/types/state";
import { Logger } from "@/utils/services";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth.context";
import { useGlobalState, useGlobalStoreSet } from "../store/stores";

interface Props {
  children: ReactNode;
}

export const AuthProvider: FC<Props> = ({ children }) => {
  const initialRender = useRef(true);
  const pathname = usePathname();
  const { push } = useRouter();

  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();

  const pushToCreateProfile = useCallback(() => {
    setGlobalState({ authState: "UNINITIALIZED" });
    push("/rp/profile/edit");
  }, [setGlobalState, push]);

  const { state, is, transition } = useStateMachine<AuthState>({
    initial: authState,
    transitions: {
      LOGGED_IN: {
        LOADING: () => setGlobalState({ authState: "LOADING" }),
        LOGGED_OUT: () => {
          setGlobalState({
            authState: "LOGGED_OUT",
            user: null,
            novelist: null,
          });
        },
      },
      LOGGED_OUT: {
        LOADING: () => setGlobalState({ authState: "LOADING" }),
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
      },
      LOADING: {
        UNINITIALIZED: pushToCreateProfile,
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
        LOGGED_OUT: () => {
          setGlobalState({
            authState: "LOGGED_OUT",
            user: null,
            novelist: null,
          });
        },
      },
      UNINITIALIZED: {
        LOADING: () => setGlobalState({ authState: "LOADING" }),
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
        LOGGED_OUT: () => setGlobalState({ authState: "LOGGED_OUT" }),
      },
    },
  });

  const fetchProfile = async () => {
    transition("LOADING");
    try {
      const _novelist = await getUserNovelist();

      if (_novelist) {
        setGlobalState({ novelist: _novelist });
        transition("LOGGED_IN");
      } else {
        transition("UNINITIALIZED");
      }
    } catch (e) {
      transition("LOGGED_OUT");
    }
  };

  const login = async (payload: LoginPayload) => {
    transition("LOADING");
    const response = await loginAction(payload);

    if ("user" in response) {
      setGlobalState({ user: response.user });
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
      setGlobalState({ user: response.user });
      transition("UNINITIALIZED");
    }
    return response;
  };

  const verifyAccount = async (jwt: string) => {
    transition("LOADING");
    const response = await verifyAccountAction(jwt);
    transition("LOGGED_OUT");
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
        Logger.info("User", _user);
        setGlobalState({ user: _user });
        await fetchProfile();
      } else {
        transition("LOGGED_OUT");
      }
    } catch (e) {
      Logger.debug("Error in verifyInitialAuthState", e);
      transition("LOGGED_OUT");
    }
  };

  const updateNovelist = (novelist: Novelist) => {
    setGlobalState({ novelist });
    if (is("UNINITIALIZED")) {
      transition("LOGGED_IN");
      push(`/rp/profile/${novelist.username}`);
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      verifyInitialAuthState();
    }
  }, []);

  useEffect(() => {
    Logger.debug("auth state changed: ", state);
  }, [state]);

  useEffect(() => {
    if (is("LOGGED_IN")) {
      refreshAuthState();
    } else if (is("UNINITIALIZED")) {
      pushToCreateProfile();
    }
  }, [pathname]);

  Logger.info("AuthProvider rendered");

  return (
    <AuthContext.Provider
      value={{
        login,
        signup,
        logout,
        verifyAccount,
        updateNovelist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
