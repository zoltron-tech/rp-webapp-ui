import styled from "styled-components";

export const Root = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 20px 12px 20px;
  cursor: pointer;
  background-color: var(--bg-2);
  transition: background-color 0.15s;

  .trigger-avatar {
    width: 38px !important;
    height: 38px !important;
    flex-shrink: 0;
  }
`;

export const FakeInput = styled.div`
  flex: 1;
  height: 38px;
  display: flex;
  align-items: center;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 19px;
  padding: 0 16px;
  overflow: hidden;
`;

export const Placeholder = styled.span<{ $visible: boolean }>`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  user-select: none;
`;
