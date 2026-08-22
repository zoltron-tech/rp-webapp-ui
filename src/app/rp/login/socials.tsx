import type { LoginOAuthProvider } from "@nw/types";
import { type FC, useCallback } from "react";
import { FaDiscord } from "react-icons/fa6";
import { loginViaProviderAction } from "@/app/actions";
import { GoogleLogo } from "@/assets/logos";
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
          <FaDiscord aria-hidden="true" />
          <span>Continue with Discord</span>
        </S.SocialButton>
      </li>
    </S.SocialsList>
  );
};
