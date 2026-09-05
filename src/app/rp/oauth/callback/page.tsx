"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoMdCheckmark } from "react-icons/io";
import { PiSpinnerGapLight } from "react-icons/pi";
import { authenticateAction, getUser } from "@/app/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePostLogin } from "@/hooks/use-post-login";
import { dropLegacyAuthCookie } from "@/lib/auth-cookie";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { getUserNovelist } from "../../novelists/actions";
import * as S from "./styled";

type OperationState = "LOADING" | "SUCCESS" | "ERROR";

type ContentType = {
  icon: React.ReactNode | null;
  headingText: React.ReactNode | null;
  descriptionText: React.ReactNode | null;
};

const Content: Record<OperationState, ContentType> = {
  ERROR: {
    descriptionText: "There was an error while logging you in.",
    headingText: "Error logging in",
    icon: <CgClose className="error" />,
  },
  LOADING: {
    descriptionText: "Please wait while we process your request.",
    headingText: "Loading...",
    icon: <PiSpinnerGapLight className="loading" />,
  },
  SUCCESS: {
    descriptionText:
      "You have successfully logged in. You will be redirected shortly.",
    headingText: "Login successful",
    icon: <IoMdCheckmark className="success" />,
  },
};

export default function LoginOAuthCallbackPage() {
  const [operationState, setOperationState] =
    useState<OperationState>("LOADING");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage } = usePageRouter();
  const { handlePostLogin } = usePostLogin();

  const content = useMemo(() => {
    return Content[operationState];
  }, [operationState]);

  const runLoginFlow = useCallback(async () => {
    // Before anything else, and specifically here.
    //
    // A browser signed in before the httpOnly migration still holds the old
    // script-visible `X-NW-AUTH-TOKEN`. That is a *different cookie* from the
    // one user-service just set — different scope, same name — so the browser
    // sends both, and the stale one, being older, tends to be listed first.
    // `AuthProvider` clears it on every other route but deliberately skips this
    // one, because this page owns the handshake; without this line the first
    // call below reads a token signed with a retired key and the whole callback
    // reports failure, on a login that in fact succeeded.
    dropLegacyAuthCookie();

    const isValid = await authenticateAction();
    if (!isValid) {
      setOperationState("ERROR");
      return;
    }

    // No cookie handling here any more. The OAuth success handler opens the
    // session and sets both `httpOnly` cookies on the redirect that brought the
    // browser here, so there is nothing for this page to promote, re-scope or
    // copy — and nothing it could read if there were. It used to re-write the
    // cookie with a different domain, which quietly produced a *second* cookie
    // of the same name that logout then failed to clear.
    const response = await getUser();
    if (response.message === API_MESSAGE.Unauthorized) {
      setOperationState("ERROR");
      return;
    }

    const _novelist = await getUserNovelist();

    if ("message" in _novelist) {
      if (_novelist.message === API_MESSAGE.NotFound) {
        setOperationState("SUCCESS");
        setGlobalState({
          authState: "UNINITIALIZED",
          showInstallAppPrompt: true,
          user: response.user!,
        });
        return;
      } else {
        setOperationState("ERROR");
        return;
      }
    }

    // handlePostLogin sets novelist/user, fetches unread counts, then sets authState.
    // This page has no authState watcher, so we navigate explicitly after it resolves.
    const onboarded = await handlePostLogin(_novelist, response.user!);
    setOperationState("SUCCESS");
    if (onboarded) {
      routeToPage(
        _novelist.friends?.length === 0
          ? ROUTES.Fellows
          : ROUTES.Profile.View(_novelist.username).Index,
      );
    } else {
      setGlobalState({ showInstallAppPrompt: true });
    }
  }, []);

  const validateToken = useCallback(async () => {
    try {
      await runLoginFlow();
    } catch (error) {
      // Without this the spinner never resolves: a rejected step would leave
      // operationState on "LOADING" with nothing to move it off.
      Logger.error("OAuth callback failed", error);
      setOperationState("ERROR");
    }
  }, [runLoginFlow]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  return (
    <S.PageRoot>
      <S.ContentCard>
        <S.Heading>
          {content.icon}
          <h1>{content.headingText}</h1>
        </S.Heading>
        <S.Description>{content.descriptionText}</S.Description>
      </S.ContentCard>
    </S.PageRoot>
  );
}
