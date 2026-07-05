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
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ─── Info box ─────────────────────────────────────────────────────────────────

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

export const InfoLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 6px;
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`;

export const InfoCount = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
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

export const InviteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: var(--bg-1);
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;

  &:hover {
    filter: brightness(1.08);
  }

  &:active {
    transform: scale(0.99);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;

// ─── List ─────────────────────────────────────────────────────────────────────

export const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid var(--bg-4);
  overflow: hidden;
  background: var(--bg-2);

  @media screen and (max-width: 800px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--bg-4);
  transition: background 0.12s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-3);
  }

  .avatar {
    width: 48px;
    height: 48px;
  }

  @media (max-width: 600px) {
    gap: 8px;
    padding: 9px 10px;

    .avatar {
      width: 40px;
      height: 40px;
    }
  }
`;

export const RankSlot = styled.span`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const Name = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Username = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
`;

export const LevelChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--bg-5));
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const ScoreChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
`;

// ─── Shimmer row ────────────────────────────────────────────────────────────────

export const ShimmerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--bg-4);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    gap: 8px;
    padding: 9px 10px;
  }
`;

export const ShimmerCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  ${shimmer}

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`;

export const ShimmerBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ShimmerLine = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 6px;
  ${shimmer}
`;
