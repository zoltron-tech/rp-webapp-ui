"use client";

import {
  authenticateAction,
  getUser,
  loginAction,
  logoutAction,
  signupAction,
} from "@/app/actions";
import { PageLoader } from "@/components";
import { ShouldRender } from "@/components/common";
import { LoginPayload, LoginResponse, User } from "@/types";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    const response: LoginResponse = await loginAction(payload);
    if ("message" in response && response.message === "success") {
      setLoggedIn(true);
      const _user = await getUser();
      setUser(_user);
    }
    setLoading(false);
    return response;
  };

  const signup = async (payload: SignUpPayload) => {
    setLoading(true);
    const response: WithMessage = await signupAction(payload);
    if (response.message === "success") {
      setLoggedIn(true);
      const _user = await getUser();
      setUser(_user);
    }
    setLoading(false);
    return response;
  };

  const logout = async () => {
    setLoggedIn(false);
    setUser(null);
    await logoutAction();
  };

  const refreshAuthState = async () => {
    Logger.log("refreshAuthState");
    const verified = await authenticateAction();
    if (!verified) {
      setLoggedIn(false);
      setUser(null);
    }
  };

  const verifyInitialAuthState = async () => {
    Logger.log("verifyInitialAuthSTate");
    setLoading(true);

    try {
      const authenticated = await authenticateAction();
      if (authenticated) {
        setLoggedIn(true);
        const _user = await getUser();
        setUser(_user);
      }

      setLoading(false);
    } catch (e) {
      Logger.log("Error in verifyInitialAuthState", e);

      setLoading(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (!loggedIn) {
        verifyInitialAuthState();
      }
    }
  }, []);

  useEffect(() => {
    Logger.log("auth state changed: ", loading, user, loggedIn);
  }, [loading, user, loggedIn]);

  useEffect(() => {
    if (loggedIn) {
      refreshAuthState();
    }
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ loggedIn, user, login, signup, logout, loading: !!loading }}
    >
      <ShouldRender if={!!loading}>
        <PageLoader />
      </ShouldRender>
      {children}
    </AuthContext.Provider>
  );
};
