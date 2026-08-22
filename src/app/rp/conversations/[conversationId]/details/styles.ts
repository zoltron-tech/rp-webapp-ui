import styled, { css, keyframes } from "styled-components";
import { shimmerMove } from "@/theme/animations";

const slideInFromRight = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
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

export const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-4);
    border-color: var(--accent);
    color: var(--accent);
  }
`;

export const LeaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--error, #e53e3e) 40%, transparent);
  background: transparent;
  color: var(--error, #e53e3e);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--error, #e53e3e) 12%, transparent);
    border-color: var(--error, #e53e3e);
  }
`;

export const DeleteButton = styled(LeaveButton)`
  margin-left: 0;
  gap: 5px;

  .delete-label {
    @media (max-width: 480px) {
      display: none;
    }
  }
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

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 1px 6px;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
`;

export const AddMembersButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border-color: var(--accent);
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin: 0;
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

export const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 0;
  width: 100%;
  border-bottom: 1px solid var(--bg-6);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }
`;

export const MemberMain = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 10px 12px;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;

  .avatar {
    width: 32px;
    height: 32px;
  }
`;

export const RemoveMemberButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--error, #e53e3e) 35%, transparent);
  background: transparent;
  color: var(--error, #e53e3e);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--error, #e53e3e) 14%, transparent);
    border-color: var(--error, #e53e3e);
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

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 1px 6px;
  }
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
