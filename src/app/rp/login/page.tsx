"use client";

import { useGlobalState } from "@/context/store/stores";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as S from "./styled";
import { Separator, Tabs } from "radix-ui";
import { FaFacebook, FaGoogle, FaInstagram } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa";

export default function LoginPage() {
  const authState = useGlobalState("authState");
  const { push } = useRouter();

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      push("/rp/home");
    }
  }, [authState]);

  return (
    <S.LoginPageRoot>
      <Tabs.Root defaultValue="login" className="tabs" asChild>
        <S.FormContainer>
          <Tabs.List
            className="tabs-list"
            aria-label="Login and Registration"
            tabIndex={0}
          >
            <Tabs.Trigger className="tab" value="login">
              Login
            </Tabs.Trigger>
            <Tabs.Trigger className="tab" value="register">
              Register
            </Tabs.Trigger>
          </Tabs.List>

          <Separator.Root className="separator" orientation="horizontal" />

          <Tabs.Content className="tab-content" value="login" tabIndex={-1}>
            <form>
              {/* Login form component goes here */}
              <input
                aria-label="Username or email"
                name="username"
                type="text"
                placeholder="Username or email"
                required
              />
              <input
                aria-label="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit">Login</button>
              <S.FrogotPasswordLink href="#" tabIndex={0}>
                Forgot Password?
              </S.FrogotPasswordLink>
            </form>
          </Tabs.Content>

          <Tabs.Content className="tab-content" value="register" tabIndex={-1}>
            <form>
              {/* Registration form component goes here */}
              <input
                aria-label="Username"
                name="username"
                type="text"
                placeholder="Username"
                required
              />
              <input
                aria-label="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
              <input
                aria-label="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit">Register</button>
            </form>
          </Tabs.Content>
          <S.OrHelper />
          <S.SocialsList>
            <S.SocialButton
              className="social-button"
              aria-label="continue with Google"
            >
              <FaGoogle />
            </S.SocialButton>
            <S.SocialButton
              className="social-button"
              aria-label="continue with Facebook"
            >
              <FaFacebook />
            </S.SocialButton>
            <S.SocialButton
              className="social-button"
              aria-label="continue with Instagram"
            >
              <FaInstagram />
            </S.SocialButton>
            <S.SocialButton
              className="social-button"
              aria-label="continue with Discord"
            >
              <FaDiscord />
            </S.SocialButton>
          </S.SocialsList>
        </S.FormContainer>
      </Tabs.Root>
    </S.LoginPageRoot>
  );
}
