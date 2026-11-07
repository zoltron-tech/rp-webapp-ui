import type { LoginOAuthProvider } from "@nw/types";
import { type FC, useCallback } from "react";
import { loginViaProviderAction } from "@/app/actions";
import { DiscordLogo, GoogleLogo } from "@/assets/logos";
import appleLogo from "@/assets/logos/apple-logo-white.png";
import * as S from "./styled";

export const Socials: FC = () => {
  const handleSocialClick = useCallback(
    (provider: LoginOAuthProvider) => () => {
      loginViaProviderAction(provider);
    },
    [],
  );

  return (
    <S.SocialsList>
      {/* Apple button — Sign in with Apple HIG. Black style, Apple's own logo
          image, "Continue with Apple". Lets an account made in the iOS app with
          Apple also sign in here. */}
      <li>
        <S.SocialButton
          className="social-button apple"
          aria-label="Continue with Apple"
          onClick={handleSocialClick("apple")}
          type="button"
        >
          <img src={appleLogo} alt="" aria-hidden="true" />
          <span>Continue with Apple</span>
        </S.SocialButton>
      </li>
      {/* Google button — brand guidelines: https://developers.google.com/identity/branding-guidelines
          White background, official Google G logo, "Sign in with Google" label, #3C4043 text.
          data-client-id references NEXT_PUBLIC_GOOGLE_CLIENT_ID for GSI integration. */}
      <li>
        <S.SocialButton
          className="social-button google"
          aria-label="Sign in with Google"
          onClick={handleSocialClick("google")}
          type="button"
        >
          <GoogleLogo aria-hidden="true" />
          <span>Sign in with Google</span>
        </S.SocialButton>
      </li>
      {/* Discord button — brand guidelines: https://discord.com/branding
          Blurple (#5865F2) background, unmodified white Discord mark, white text. */}
      <li>
        <S.SocialButton
          className="social-button discord"
          aria-label="Continue with Discord"
          onClick={handleSocialClick("discord")}
          type="button"
        >
          <DiscordLogo aria-hidden="true" />
          <span>Continue with Discord</span>
        </S.SocialButton>
      </li>
    </S.SocialsList>
  );
};
