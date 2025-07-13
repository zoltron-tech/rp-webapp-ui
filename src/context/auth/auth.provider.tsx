"use client";

import {
  authenticateAction,
  forgotPasswordAction,
  getUser,
  loginAction,
  logoutAction,
  resetPasswordAction,
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
  const { push } = useRouter();
  const pushToCreateProfile = () => push("/rp/profile/edit");
  const pushToProfile = () => push(`/rp/profile/${novelist?.username}`);

  const { state, is, transition } = useStateMachine<AuthState>({
    initial: "LOADING",
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
        UNINITIALIZED: pushToCreateProfile,
        LOGGED_IN: true,
        LOGGED_OUT: () => {
          setUser(null);
          setNovelist(null);
        },
      },
      UNINITIALIZED: {
        LOADING: true,
        LOGGED_IN: true,
        LOGGED_OUT: true,
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
      transition("UNINITIALIZED");
    }
    return response;
  };

  const forgotPassword = async (email: string) => {
    transition("LOADING");
    const response = await forgotPasswordAction(email);
    transition("LOGGED_OUT");
    return response;
  };

  const resetPassword = async (payload: LoginPayload, jwt: string) => {
    transition("LOADING");
    const response = await resetPasswordAction(payload, jwt);
    transition("LOGGED_OUT");
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
        setUser(_user);
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
    setNovelist(novelist);
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
        state,
        user,
        novelist,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        verifyAccount,
        updateNovelist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
