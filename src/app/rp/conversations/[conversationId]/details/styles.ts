import styled, { css, keyframes } from "styled-components";

const slideInFromRight = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  padding: 8px;
  gap: 24px;
  animation: ${slideInFromRight} 0.28s ease both;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 0;
  flex-shrink: 0;
`;

export const AvatarWrap = styled.div`
  flex-shrink: 0;

  .avatar {
    width: 48px;
    height: 48px;
  }
`;

export const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const ConvName = styled.h1`
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ConvTypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 9999px;
  padding: 2px 8px;
  width: fit-content;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin: 0;
  padding: 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 4px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  overflow: hidden;
`;

export const MemberRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid var(--bg-6);
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition: background 0.15s;

  .avatar {
    width: 32px;
    height: 32px;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }
`;

export const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
`;

export const MemberNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const MemberName = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MemberUsername = styled.span`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MemberRole = styled.span`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 9999px;
  padding: 2px 8px;
  flex-shrink: 0;
  text-transform: capitalize;
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

export const MemberRowSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  width: 100%;
  border-bottom: 1px solid var(--bg-6);

  &:last-child {
    border-bottom: none;
  }
`;

export const SkeletonAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  ${shimmer}
`;

export const SkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 6px;
  ${shimmer}
`;
