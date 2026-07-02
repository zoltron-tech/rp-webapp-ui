"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const { push } = useRouter();

  useEffect(() => {
    // Persist the referral so it survives both the email/password signup and
    // the OAuth redirects (Google/Discord) — consumed and cleared on signup.
    if (referralUser) setReferralCookie(referralUser);
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

  const handleRegisterClick = useCallback(() => {
    push(`${pathname}?register=1`);
  }, [pathname, routeToPage]);

  const handleLoginClick = useCallback(() => {
    push(`${pathname}?register=0`);
  }, [pathname, routeToPage]);

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
