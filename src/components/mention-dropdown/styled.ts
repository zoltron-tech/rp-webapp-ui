import { AiOutlineLoading3Quarters } from "react-icons/ai";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const Dropdown = styled.div`
  position: fixed;
  z-index: 2000;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 0.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  max-height: 180px;
  min-width: 16rem;
  max-width: min(20rem, calc(100vw - 2rem));
  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: var(--bg-6, #e5e4e7) var(--bg-3, #f9fafb);
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-3, #f9fafb);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6, #e5e4e7);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary, #6b7280);
  }
`;

interface ItemProps {
  $focused?: boolean;
}

export const Item = styled.button<ItemProps>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: none;
  background: ${({ $focused }) =>
    $focused
      ? "color-mix(in srgb, var(--accent) 20%, var(--bg-4))"
      : "transparent"};
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 20%, var(--bg-4));
  }

  .avatar {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
`;

export const TextCol = styled.span`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const NameRow = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Name = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Type = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  flex-shrink: 0;
`;

export const PennedBy = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  opacity: 0.75;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Empty = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-secondary, #6b7280);
`;

export const LoadingWrapper = styled.div`
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Spinner = styled(AiOutlineLoading3Quarters)`
  animation: ${spin} 0.8s linear infinite;
  font-size: 1.5rem;
  opacity: 0.7;
`;
