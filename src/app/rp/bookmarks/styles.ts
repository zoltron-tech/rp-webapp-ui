import styled, { keyframes } from "styled-components";
import { CARD_BORDER } from "@/theme";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0 8px;

  svg {
    font-size: 1.75rem;
    color: var(--accent);
    animation: ${spin} 0.8s linear infinite;
  }
`;

/** Vertical list of bookmark cards, centered with a comfortable reading width. */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 620px;
  margin: 18px auto 0;
  padding-inline: 12px;

  @media (max-width: 600px) {
    padding-inline: 8px;
    gap: 12px;
  }
`;

export const Card = styled.div`
  display: flex;
  gap: 14px;
  padding: 12px;
  border-radius: var(--border-radius);
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );
  ${CARD_BORDER};
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: scale(0.995);
  }
`;

/* Portrait cover (2:3), matching Storyboard Event cover avatars. */
export const CardCover = styled.div`
  position: relative;
  width: 86px;
  min-width: 86px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  ${CARD_BORDER};

  .cover-image {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 600px) {
    width: 72px;
    min-width: 72px;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  gap: 6px;
`;

export const CardEyebrow = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .passage {
    color: var(--accent-hover);
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const ContinueButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  margin-top: auto;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;

  svg {
    transition: transform 0.15s ease;
  }

  &:hover {
    opacity: 0.94;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

/* ── Empty state ────────────────────────────────────────────────────────── */

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 420px;
  margin: 48px auto 0;
  padding: 32px 24px;
  text-align: center;
  color: var(--text-secondary);

  svg {
    font-size: 2.4rem;
    color: var(--accent);
    opacity: 0.85;
  }
`;

export const EmptyTitle = styled.div`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: var(--font-size);
  line-height: 1.55;
`;
