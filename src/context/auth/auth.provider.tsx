"use client";

import {
  authenticateAction,
  getUser,
  verifyAccountAction,
} from "@/app/actions";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useStateMachine } from "@/hooks";
import { Novelist } from "@/types";
import { SignUpPayload } from "@/types/register";
import { AuthState } from "@/types/state";
import { Logger } from "@/utils/services";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useCallback, useEffect, useRef } from "react";
import { AuthContext } from "./auth.context";
import { useGlobalState, useGlobalStoreSet } from "../store/stores";
import { API_MESSAGE } from "@/utils/constants";

interface Props {
  children: ReactNode;
}

export const AuthProvider: FC<Props> = ({ children }) => {
  const initialRender = useRef(true);
  const pathname = usePathname();
  const { push } = useRouter();

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

      if ("message" in _novelist) {
        if (_novelist.message === API_MESSAGE.NotFound) {
          pushToCreateProfile();
          return;
        } else {
          transition("LOGGED_OUT");
          return;
        }
      }

      setGlobalState({ novelist: _novelist, authState: "LOGGED_IN" });
    } catch (e) {
      transition("LOGGED_OUT");
    }
  };

  const verifyAccount = async (jwt: string) => {
    transition("LOADING");
    const response = await verifyAccountAction(jwt);
    transition("LOGGED_OUT");
    return response;
  };

  const refreshAuthState = async () => {
    const verified = await authenticateAction();

    if (!verified) {
      transition("LOGGED_OUT");
    }
  };

  const verifyInitialAuthState = async () => {
    transition("LOADING");
    console.log("verifyInitialAuthState:");
    try {
      const authenticated = await authenticateAction();
      console.log("Authenticated:", authenticated);

      if (authenticated) {
        const _user = await getUser();
        Logger.info("User", _user);
        setGlobalState({ user: _user.user! });
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
        verifyAccount,
        updateNovelist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
