import { css, styled } from "styled-components";
import { shimmerMove } from "@/theme/animations";

const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

export const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ─── Header ──────────────────────────────────────────────────────────────────

export const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, var(--bg-2)) 0%,
    var(--bg-2) 65%
  );
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--bg-5));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
`;

export const InfoIcon = styled.span`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 20%, var(--bg-3));
  color: var(--accent);
  font-size: 18px;

  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
    font-size: 15px;
  }
`;

export const InfoText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InfoTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const InfoDescription = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const InfoCount = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 34%, var(--bg-5));
`;

export const InfoCountValue = styled.span`
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;
`;

export const InfoCountLabel = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const ToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const SectionHeading = styled.h2`
  margin: 0;
  font-size: var(--font-size-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-5);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover:not(:disabled) {
    background: var(--bg-4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

// ─── Grid ────────────────────────────────────────────────────────────────────

export const Grid = styled.div`
  display: grid;
  /* Two across on the 375px baseline, more as the viewport allows. */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;

  @media screen and (max-width: 400px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`;

export const Card = styled.div<{ $earned: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 16px 12px 14px;
  border-radius: 14px;
  text-align: center;
  background: ${(p) =>
    p.$earned
      ? "linear-gradient(160deg, color-mix(in srgb, var(--accent) 10%, var(--bg-2)) 0%, var(--bg-2) 70%)"
      : "var(--bg-2)"};
  border: 1px solid
    ${(p) =>
      p.$earned
        ? "color-mix(in srgb, var(--accent) 34%, var(--bg-5))"
        : "var(--bg-4)"};
  opacity: ${(p) => (p.$earned ? 1 : 0.82)};
`;

export const CardTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  /* The grid cell is ~150px wide; a long badge name wraps rather than
     stretching the column. */
  overflow-wrap: anywhere;
`;

export const CardText = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const CardStatus = styled.span<{ $earned: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${(p) =>
    p.$earned
      ? "color-mix(in srgb, var(--accent) 18%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$earned ? "transparent" : "var(--bg-5)")};
  color: ${(p) => (p.$earned ? "var(--accent)" : "var(--text-secondary)")};

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;

// ─── Loading ─────────────────────────────────────────────────────────────────

export const ShimmerCard = styled.div`
  ${shimmer}
  height: 190px;
  border-radius: 14px;
`;
