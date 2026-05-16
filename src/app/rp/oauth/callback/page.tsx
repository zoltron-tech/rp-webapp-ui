"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoMdCheckmark } from "react-icons/io";
import { PiSpinnerGapLight } from "react-icons/pi";
import {
  authenticateAction,
  getAuthCookie,
  getUser,
  setAuthCookie,
} from "@/app/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePostLogin } from "@/hooks/use-post-login";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
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

  const validateToken = useCallback(async () => {
    const isValid = await authenticateAction();
    if (!isValid) {
      setOperationState("ERROR");
      return;
    }

    // Re-set the cookie with the correct domain for the current environment.
    // The backend always issues the cookie scoped to novelist.world; on localhost
    // that domain won't match, so we promote it to a locally-scoped cookie here.
    const jwt = await getAuthCookie();
    await setAuthCookie(jwt);

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
        _novelist.friends?.length === 0 ? ROUTES.Fellows : ROUTES.Home,
      );
    } else {
      setGlobalState({ showInstallAppPrompt: true });
    }
  }, []);

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
