"use client";

import { usePathname, useRouter } from "next/navigation";
import { type FC, type ReactNode, useCallback, useEffect, useRef } from "react";
import {
  authenticateAction,
  getUser,
  verifyAccountAction,
} from "@/app/actions";
import { getUnreadConversationIdsAction } from "@/app/rp/conversations/actions";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useStateMachine } from "@/hooks";
import type { AuthState } from "@/types/state";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { useGlobalState, useGlobalStoreSet } from "../store/stores";
import { AuthContext } from "./auth.context";

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
    push(ROUTES.Onboarding);
  }, [setGlobalState, push]);

  const { state, is, transition } = useStateMachine<AuthState>({
    initial: authState,
    transitions: {
      LOADING: {
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
        LOGGED_OUT: () => {
          setGlobalState({
            authState: "LOGGED_OUT",
            novelist: null,
            user: null,
          });
        },
        UNINITIALIZED: pushToCreateProfile,
      },
      LOGGED_IN: {
        LOADING: () => setGlobalState({ authState: "LOADING" }),
        LOGGED_OUT: () => {
          setGlobalState({
            authState: "LOGGED_OUT",
            novelist: null,
            user: null,
          });
        },
      },
      LOGGED_OUT: {
        LOADING: () => setGlobalState({ authState: "LOADING" }),
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
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

      setGlobalState({
        authState: _novelist.isOnboarded ? "LOGGED_IN" : "UNINITIALIZED",
        novelist: _novelist,
      });

      if (_novelist.isOnboarded) {
        const unreadResult = await getUnreadConversationIdsAction();
        if (Array.isArray(unreadResult)) {
          setGlobalState({ unreadConversationIds: unreadResult });
        }
      }
    } catch (_e) {
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
    try {
      const authenticated = await authenticateAction();

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

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      verifyInitialAuthState();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        verifyAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
