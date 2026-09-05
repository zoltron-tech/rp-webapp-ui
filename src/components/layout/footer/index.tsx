import { type FC, memo } from "react";
import { FaDiscord, FaFacebook, FaInstagram } from "react-icons/fa6";
import { NWLogoInner } from "@/components/common";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import * as S from "./styles";
import { env } from "@/lib/env";

type Props = {};

const DISCORD_INVITE_URL = env.DISCORD_INVITE_URL ?? "";

export const Footer: FC<Props> = memo(({}) => {
  Logger.info("Footer rendered");
  const year = new Date().getFullYear();

  return (
    <S.FooterContainer>
      <S.FooterInner>
        <S.FooterTop>
          <S.FooterBrand>
            <S.BrandRow>
              <NWLogoInner size={30} />
              <S.BrandName>Novelist World</S.BrandName>
            </S.BrandRow>
            <S.BrandTagline>
              Build realms, breathe life into characters, and write living
              stories together. One collaborative world at a time.
            </S.BrandTagline>
            <S.SocialRow>
              <a
                className="facebook"
                href="https://www.facebook.com/novelistworld"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Novelist World on Facebook"
              >
                <FaFacebook aria-hidden="true" />
              </a>
              <a
                className="instagram"
                href="https://www.instagram.com/novelistworldapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Novelist World on Instagram"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              {DISCORD_INVITE_URL && (
                <a
                  className="discord"
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join the Novelist World Discord"
                >
                  <FaDiscord aria-hidden="true" />
                </a>
              )}
            </S.SocialRow>
          </S.FooterBrand>

          <S.FooterColumn>
            <S.ColumnHeading>Explore</S.ColumnHeading>
            <S.FooterLink href={ROUTES.Novelists}>Home</S.FooterLink>
            <S.FooterLink href={ROUTES.FAQs}>FAQs</S.FooterLink>
            <S.FooterLink href={ROUTES.Login}>Log In</S.FooterLink>
          </S.FooterColumn>

          <S.FooterColumn>
            <S.ColumnHeading>Legal</S.ColumnHeading>
            <S.FooterLink href={ROUTES.PrivacyPolicy}>
              Privacy Policy
            </S.FooterLink>
            <S.FooterLink href={ROUTES.Terms}>
              Terms &amp; Conditions
            </S.FooterLink>
          </S.FooterColumn>

          <S.FooterColumn>
            <S.ColumnHeading>Get In Touch</S.ColumnHeading>
            <S.ContactText>
              Questions, feedback, or need a hand? We&apos;re here to help.
            </S.ContactText>
            <S.FooterAnchor href={SUPPORT_EMAIL_URL}>
              {SUPPORT_EMAIL}
            </S.FooterAnchor>
          </S.FooterColumn>
        </S.FooterTop>

        <S.FooterBottom>
          <span>© {year} Zoltron Tech. All rights reserved.</span>
          <span>Made for storytellers, everywhere.</span>
        </S.FooterBottom>
      </S.FooterInner>
    </S.FooterContainer>
  );
});
