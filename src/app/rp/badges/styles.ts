import { styled } from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 860px;
  margin-inline: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ─── Header ──────────────────────────────────────────────────────────────────

export const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 16%, var(--bg-2)) 0%,
    var(--bg-2) 68%
  );
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--bg-5));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  @media screen and (max-width: 600px) {
    padding: 14px;
    gap: 10px;
  }
`;

export const HeroIcon = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 20%, var(--bg-3));
  color: var(--accent);
  font-size: 19px;

  @media screen and (max-width: 600px) {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }
`;

export const HeroText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: 1.05rem;
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const HeroSubtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const SectionHeading = styled.h2`
  margin: 6px 0 0;
  font-size: var(--font-size-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

// ─── Grid ────────────────────────────────────────────────────────────────────

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;

  /* One per row on the 375px baseline: these cards carry a full sentence of
     "how to earn it", and two columns of that is unreadable. */
  @media screen and (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-2);
  border: 1px solid var(--bg-4);

  @media screen and (max-width: 600px) {
    padding: 13px;
    gap: 12px;
  }
`;

export const CardArt = styled.div`
  flex-shrink: 0;
  display: flex;
  padding-top: 2px;
`;

export const CardText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const CardTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow-wrap: anywhere;
`;

export const CardDescription = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const HowTo = styled.span`
  margin-top: 4px;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  line-height: 1.5;
  overflow-wrap: anywhere;

  b {
    color: var(--text);
    font-weight: 700;
  }
`;

const chip = `
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const RarityChip = styled.span<{ $rare: boolean }>`
  ${chip}
  background: ${(p) =>
    p.$rare
      ? "color-mix(in srgb, var(--accent) 18%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$rare ? "transparent" : "var(--bg-5)")};
  color: ${(p) => (p.$rare ? "var(--accent)" : "var(--text-secondary)")};
`;
