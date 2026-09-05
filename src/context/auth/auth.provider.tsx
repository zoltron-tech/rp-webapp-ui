"use client";

import type { AuthState } from "@nw/types/state";
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
import { refreshSessionNow } from "@/lib/api";
import { dropLegacyAuthCookie } from "@/lib/auth-cookie";
import { usePathname } from "@/lib/navigation";
import { initialisePushNotifications } from "@/lib/push";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { useGlobalState, useGlobalStoreSet } from "../store/stores";
import { AuthContext } from "./auth.context";

interface Props {
  children: ReactNode;
}

/** Must match `auth.jwt.access-ttl-minutes` in user-service. */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Comfortably inside the access token's life, so a renewal has landed well
 * before the old one lapses even if one attempt fails.
 */
const PROACTIVE_REFRESH_MS = 12 * 60 * 1000;

export const AuthProvider: FC<Props> = ({ children }) => {
  const initialRender = useRef(true);
  const pathname = usePathname();
  /** When the tab was last hidden, so a long absence can be told from a glance away. */
  const hiddenSinceRef = useRef<number | null>(null);

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
            novelistRank: "message" in rankResult ? undefined : rankResult.rank,
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
      // A browser signed in before the httpOnly migration is still carrying the
      // old script-visible cookie of the same name. The browser would send both,
      // and the stale one can win — so it goes before the first request. The
      // refresh cookie then re-establishes the session with no visible break.
      dropLegacyAuthCookie();
      verifyInitialAuthState();
    }
  }, []);

  /**
   * Renew the access token before anything has to fail on it.
   *
   * Everything still works without this: the API client refreshes and retries
   * on the first 401 it sees. But that costs the user a round trip on whichever
   * request happened to be first, which on a cold tab is the one rendering the
   * screen. Refreshing on a timer and on return to a tab that has been away
   * longer than the token lives keeps that entirely off the critical path.
   *
   * Both paths go through the same single-flight coordinator as the reactive
   * refresh, so a timer firing while a 401 retry is already rotating does not
   * start a second rotation — which the server would read as token reuse and
   * answer by revoking the session.
   */
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refreshSessionNow();
    }, PROACTIVE_REFRESH_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
        return;
      }

      const hiddenSince = hiddenSinceRef.current;
      hiddenSinceRef.current = null;
      // A glance at another tab does not need a refresh; a phone in a pocket
      // overnight does, and that is the case where the first request back would
      // otherwise be the one that discovers the token has expired.
      if (hiddenSince && Date.now() - hiddenSince > ACCESS_TOKEN_TTL_MS) {
        void refreshSessionNow();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [authState]);

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
