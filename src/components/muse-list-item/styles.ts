import { styled } from "styled-components";

export const MuseContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid var(--bg-4);
  background-color: var(--bg-2);
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-3);
    }
  }

  &:active {
    background-color: var(--bg-4);
  }

  .avatar {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
`;

export const MuseInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const MuseName = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MuseSubname = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
