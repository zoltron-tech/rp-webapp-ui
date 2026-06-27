import styled, { css, keyframes } from "styled-components";

const shimmerSweep = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

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

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
 
`;

export const MessageContainer = styled.div`
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  text-align: center;
`;

export const MessageText = styled.div`
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
`;

export const HyperLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--accent);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent-hover);
  }
`;

export const InteractionsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
  max-width: 800px;
  padding-inline: 10px;
`;

// ── Shimmer skeletons ─────────────────────────────────────────────────────────

export const ShimmerCard = styled.div`
  background-color: var(--bg-2);
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  padding: 10px;
  margin-block: 10px;
  border: 0.85px solid var(--bg-6);
  border-radius: 8px;
`;

export const ShimmerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-inline: 8px;
`;

export const ShimmerAvatar = styled.div`
  ${shimmerPulse}
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const ShimmerArrow = styled.div`
  ${shimmerPulse}
  width: 18px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
`;

export const ShimmerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 6px;
  flex: 1;
`;

export const ShimmerSeparator = styled.div`
  ${shimmerPulse}
  height: 1px;
  width: 100%;
  margin-block: 10px;
  border-radius: 2px;
`;

export const ShimmerContentBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  margin-left: 48px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
`;

export const ShimmerLine = styled.div<{ $width: string; $height?: number }>`
  ${shimmerPulse}
  height: ${({ $height }) => $height ?? 13}px;
  width: ${({ $width }) => $width};
  border-radius: 4px;
`;

export const ShimmerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
`;

export const ShimmerPill = styled.div<{ $width: string }>`
  ${shimmerPulse}
  height: 31px;
  width: ${({ $width }) => $width};
  border-radius: 50px;
`;

// ── /Shimmer skeletons ────────────────────────────────────────────────────────
