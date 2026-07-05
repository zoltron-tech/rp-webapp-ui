import Link from "next/link";
import { styled } from "styled-components";

/* ────────────────────────────────────────────────────────────────────────────
   Footer — currently only rendered at the bottom of the Novelists marketing
   page (see app/rp/novelists/page.tsx), which is a hardcoded dark cinematic
   layout regardless of the user's chosen app theme. Colors here intentionally
   mirror that page's palette (rgba(255,255,255,x) on #08090c, var(--accent)
   for interactive states) rather than the light/dark theme tokens, so the
   footer doesn't look mismatched against the section directly above it.
   ──────────────────────────────────────────────────────────────────────────── */

export const FooterContainer = styled.footer`
  width: 100%;
  background-color: #08090c;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

export const FooterInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(40px, 6vw, 64px) clamp(20px, 5vw, 48px) clamp(24px, 4vw, 32px);
`;

export const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: clamp(28px, 4vw, 48px);

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 32px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

export const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 480px) {
    align-items: center;
  }
`;

export const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BrandName = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #ffffff;
`;

export const BrandTagline = styled.p`
  margin: 0;
  max-width: 320px;
  font-size: 0.88rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.56);

  @media (max-width: 480px) {
    max-width: none;
  }
`;

export const SocialRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;

  @media (max-width: 480px) {
    justify-content: center;
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    transition: transform 0.16s ease, border-color 0.16s ease,
      background-color 0.16s ease, color 0.16s ease;

    svg {
      font-size: 1.05rem;
    }

    &:hover {
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }

  /* Facebook — brand guidelines: https://en.facebookbrand.com
     Unmodified "f" logo mark, official Facebook blue. */
  a.facebook:hover {
    color: #1877f2;
    border-color: #1877f2;
  }

  /* Instagram — brand guidelines: https://about.meta.com/brand/resources/instagrambrand
     Unmodified glyph, official Instagram magenta. */
  a.instagram:hover {
    color: #c13584;
    border-color: #c13584;
  }

  /* Discord — brand guidelines: https://discord.com/branding
     Unmodified mark, official Blurple. */
  a.discord:hover {
    color: #5865f2;
    border-color: #5865f2;
  }
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 480px) {
    align-items: center;
  }
`;

export const ColumnHeading = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 2px;
`;

const footerLinkStyles = `
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.68);
  text-decoration: none;
  width: fit-content;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export const FooterLink = styled(Link)`
  ${footerLinkStyles}
`;

export const FooterAnchor = styled.a`
  ${footerLinkStyles}
`;

export const ContactText = styled.p`
  margin: 0 0 2px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.56);
`;

export const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: clamp(32px, 5vw, 48px);
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.42);

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`;
