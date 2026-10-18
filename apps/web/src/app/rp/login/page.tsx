"use client";

import { readReferralCookie } from "@/lib/auth-cookie";
import { useNavigate } from "@/lib/navigation";
import {
  usePathname,
  useSearchParams,
  useSetSearchParams,
} from "@/lib/navigation";
import { Separator, Tabs } from "radix-ui";
import { useCallback, useEffect } from "react";
import { setReferralCookie } from "@/app/actions";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { Socials } from "./socials";
import * as S from "./styled";
import { TermsAndConditions } from "./terms-and-conditions";

export default function LoginPage() {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const referralUser = searchParams?.get("referralUser");
  const isRegister =
    searchParams?.get("register") === "1" ||
    (Boolean(referralUser) && searchParams?.get("register") !== "0");
  const { routeToPage, stopPageLoading } = usePageRouter();
  const push = useNavigate();
  const setSearchParams = useSetSearchParams();

  useEffect(() => {
    // Persist the referral so it survives both the email/password signup and
    // the OAuth redirects (Google/Discord) — consumed and cleared on signup.
    if (referralUser) {
      setReferralCookie(referralUser);
      return;
    }
    // And keep it in the address bar for as long as the cookie holds it. The
    // cookie belongs to this browser only: an invite opened inside Instagram's
    // or TikTok's built-in browser, where Google refuses to sign anyone in, is
    // carried to the real browser by its address — and that address has to
    // still say who sent it.
    const stored = readReferralCookie();
    if (stored) {
      setSearchParams((next) => {
        next.set("referralUser", stored);
        // Pin the tab this visit opened on, or a reload would read the
        // restored referral as an invite and switch to Register.
        if (!next.has("register")) next.set("register", isRegister ? "1" : "0");
      });
    }
  }, [referralUser]);

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      routeToPage(
        novelist?.friends?.length === 0
          ? ROUTES.Fellows
          : ROUTES.Profile.View(novelist!.username).Index,
      );
    }
  }, [authState]);

  /** The tab in the address, without losing the invite that may be in it. */
  const tabUrl = useCallback(
    (register: "0" | "1") => {
      const query = new URLSearchParams({ register });
      if (referralUser) query.set("referralUser", referralUser);
      return `${pathname}?${query.toString()}`;
    },
    [pathname, referralUser],
  );

  const handleRegisterClick = useCallback(() => {
    push(tabUrl("1"));
  }, [push, tabUrl]);

  const handleLoginClick = useCallback(() => {
    push(tabUrl("0"));
  }, [push, tabUrl]);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.LoginPageRoot>
      <Tabs.Root
        defaultValue={isRegister ? "register" : "login"}
        className="tabs"
        asChild
      >
        <S.FormContainer>
          <Tabs.List
            className="tabs-list"
            aria-label="Login and Registration"
            tabIndex={0}
          >
            <Tabs.Trigger
              className="tab"
              value="login"
              onClick={handleLoginClick}
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              className="tab"
              value="register"
              onClick={handleRegisterClick}
            >
              Register
            </Tabs.Trigger>
          </Tabs.List>
          <Separator.Root className="separator" orientation="horizontal" />

          <Tabs.Content className="tab-content" value="login" tabIndex={-1}>
            <LoginForm />
          </Tabs.Content>
          <Tabs.Content className="tab-content" value="register" tabIndex={-1}>
            <RegisterForm />
          </Tabs.Content>
          <S.OrHelper />
          <Socials />
          <TermsAndConditions />
        </S.FormContainer>
      </Tabs.Root>
    </S.LoginPageRoot>
  );
}
