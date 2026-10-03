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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

// ── Page header ───────────────────────────────────────────────────────────────

export const PageHeader = styled.header`
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--bg-6);
  margin-bottom: 6px;

  @media screen and (max-width: 430px) {
    padding: 10px 8px;
    gap: 10px;
  }
`;

export const PageHeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--accent);

  svg {
    width: 20px;
    height: 20px;
  }

  @media screen and (max-width: 430px) {
    width: 34px;
    height: 34px;
    min-width: 34px;

    svg {
      width: 17px;
      height: 17px;
    }
  }
`;

export const PageHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
`;

export const PageHeaderTitle = styled.h1`
  all: unset;
  font-family: var(--font);
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 430px) {
    font-size: var(--font-size-h5);
  }
`;

export const PageHeaderSubtitle = styled.span`
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 430px) {
    font-size: var(--font-size-xsmall);
  }
`;

// ── /Page header ──────────────────────────────────────────────────────────────

/* Empty state — art over a title, a short line of copy, then one call to
   action. Same shape and spacing as the profile and muse empty states. */

export const EmptyStateWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  padding-block: 24px;
`;

export const EmptyStateTitle = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
`;

export const EmptyStateSubtitle = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  max-width: 290px;
  line-height: 1.55;
`;

export const EmptyStateCta = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 8px 18px;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--accent-11);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
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
