"use client";

import { usePathname } from "next/navigation";
import { type FC, type ReactNode, useCallback, useEffect, useRef } from "react";
import {
  authenticateAction,
  getUser,
  verifyAccountAction,
} from "@/app/actions";
import { getUnreadConversationIdsAction } from "@/app/rp/conversations/actions";
import { getNovelistRankByIdAction } from "@/app/rp/leaderboard/actions";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { getUnreadReplyCount } from "@/app/rp/outgoing-threads/actions";
import { useStateMachine } from "@/hooks";
import { initialisePushNotifications } from "@/lib/push";
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

  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();

  const pushToCreateProfile = useCallback(() => {
    setGlobalState({ authState: "UNINITIALIZED", showInstallAppPrompt: true });
  }, [setGlobalState]);

  const { state, is, transition } = useStateMachine<AuthState>({
    initial: authState,
    transitions: {
      LOADING: {
        LOGGED_IN: () => setGlobalState({ authState: "LOGGED_IN" }),
        LOGGED_OUT: () => {
          setGlobalState({
            authState: "LOGGED_OUT",
            notifications: null,
            novelist: null,
            novelistRank: null,
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
            notifications: null,
            novelist: null,
            novelistRank: null,
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
        // Load unread counts in the background so they never block the app
        // from becoming interactive. The unread marker stays hidden while
        // these are null and appears as soon as they resolve.
        void Promise.all([
          getUnreadConversationIdsAction(),
          getUnreadReplyCount(),
        ]).then(([unreadIds, unreadReplyCount]) => {
          setGlobalState({
            unreadConversationIds: Array.isArray(unreadIds) ? unreadIds : [],
            unreadReplyCount:
              typeof unreadReplyCount === "number" ? unreadReplyCount : 0,
          });
        });
        void getNovelistRankByIdAction(_novelist.id).then((rankResult) => {
          setGlobalState({
            novelistRank:
              "message" in rankResult ? undefined : rankResult.rank,
          });
        });
        initialisePushNotifications(); // fire-and-forget — errors caught inside
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
      // The OAuth callback page owns the auth handshake itself (it calls
      // handlePostLogin / setGlobalState directly). Running this flow too
      // races both against it for authState/user/novelist, and whichever
      // resolves last can stomp the other's result — e.g. leaving authState
      // stuck on "LOADING" after the callback page already finished and
      // navigated away.
      if (pathname === ROUTES.Oauth.Callback) return;
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
