import styled, { css, keyframes } from "styled-components";

const shimmerSweep = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOutToRight = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

export const Container = styled.div<{ $slideIn?: boolean }>`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${({ $slideIn }) =>
    $slideIn &&
    css`
      animation: ${slideInFromLeft} 0.28s ease both;
    `}
`;
export const BreadcrumbRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding-right: 20px;
  padding-block: 5px;
`;

export const BreadcrumbActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SupportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-4);
    border-color: var(--primary);
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
export const ConversationListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
  max-width: 800px;
`;

export const ConversationListRoot = styled.div`
  background: var(--bg-2);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 600px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

export const ConversationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  display: grid;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
`;

export const EmptyStateRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 44px;
  gap: 14px;
`;

export const IllustrationWrap = styled.div`
  animation: ${float} 3.6s ease-in-out infinite;
`;

export const EmptyStateHeading = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg, 17px);
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
`;

export const EmptyStateBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 270px;
  line-height: 1.55;
`;

export const EmptyStateActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
`;

export const EmptyStateButton = styled.button<{ $primary?: boolean }>`
  padding: 9px 22px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid
    ${({ $primary }) => ($primary ? "var(--accent)" : "var(--bg-6)")};
  background: ${({ $primary }) => ($primary ? "var(--accent)" : "transparent")};
  color: ${({ $primary }) => ($primary ? "var(--bg-1)" : "var(--text)")};
  transition: opacity 0.15s ease, transform 0.15s ease;

  &:hover {
    opacity: 0.82;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    opacity: 1;
  }
`;

// ── Shimmer skeletons ─────────────────────────────────────────────────────────

const shimmerPulse = css`
  background: linear-gradient(
    90deg,
    var(--bg-4) 0%,
    var(--bg-5) 50%,
    var(--bg-4) 100%
  );
  background-size: 800px 100%;
  animation: ${shimmerSweep} 1.5s ease-in-out infinite;
`;

export const ShimmerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--bg-4);

  &:last-child {
    border-bottom: none;
  }
`;

export const ShimmerAvatar = styled.div`
  ${shimmerPulse}
  width: 46px;
  height: 46px;
  min-width: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  margin-top: 1px;
`;

export const ShimmerContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const ShimmerContentMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding-top: 3px;
`;

export const ShimmerLine = styled.div<{ $width: string; $height?: number }>`
  ${shimmerPulse}
  height: ${({ $height }) => $height ?? 13}px;
  width: ${({ $width }) => $width};
  border-radius: 4px;
`;

export const ShimmerExtras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 3px;
  flex-shrink: 0;
`;

// ── /Shimmer skeletons ────────────────────────────────────────────────────────

/** Full-viewport panel that slides in from the right on mobile. */
export const ConversationSheet = styled.div<{
  $open: boolean;
  $closing: boolean;
}>`
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: var(--bg-1);
  overflow: hidden;
  /* Default: off-screen */
  transform: translateX(100%);

  ${({ $open, $closing }) =>
    $open &&
    !$closing &&
    css`
      animation: ${slideInFromRight} 0.28s ease both;
    `}

  ${({ $closing }) =>
    $closing &&
    css`
      animation: ${slideOutToRight} 0.26s ease both;
    `}

  @media (min-width: 681px) {
    display: none;
  }
`;
