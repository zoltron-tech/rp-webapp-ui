import { css, keyframes, styled } from "styled-components";

const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;

// ─── Shimmer card ─────────────────────────────────────────────────────────────

export const ShimmerCard = styled.div`
  width: 220px;
  min-width: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--bg-4);
  background-color: var(--bg-2);

  @media (max-width: 600px) {
    width: 155px;
    min-width: 155px;
  }
`;

export const ShimmerStrip = styled.div`
  width: 100%;
  height: 56px;
  ${shimmer}

  @media (max-width: 600px) {
    height: 40px;
  }
`;

export const ShimmerBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 14px 14px;
  gap: 8px;
  min-height: 190px;
  justify-content: center;

  @media (max-width: 600px) {
    padding: 0 10px 10px;
    gap: 6px;
    min-height: 148px;
  }
`;

export const ShimmerCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-top: -30px;
  flex-shrink: 0;
  ${shimmer}

  @media (max-width: 600px) {
    width: 48px;
    height: 48px;
    margin-top: -22px;
  }
`;

export const ShimmerLine = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 6px;
  ${shimmer}
`;
