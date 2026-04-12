import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  width: 100%;
  max-width: 600px;
  margin-inline: auto;
`;

export const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover,
  &:active {
    background: var(--bg-4, var(--bg-6));
  }

  .avatar {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const UserName = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const UserHandle = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const EditButton = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  overflow: hidden;
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--bg-6);
  color: rgba(209, 216, 226, 1);
  font-size: var(--font-size);
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &:active {
    background: var(--accent);
    color: #ffffff;
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
`;

export const DestructiveMenuItem = styled(MenuItem)`
  color: #b23636;

  &:hover,
  &:active {
    background: #8e2a2a;
    color: #ffffff;
  }
`;
