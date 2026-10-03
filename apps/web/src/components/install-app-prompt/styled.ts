import styled from "styled-components";

export const SkipButton = styled.button`
  margin-top: 4px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: var(--bg-5);
    border-color: var(--bg-7, var(--bg-6));
  }

  &:active {
    transform: translateY(1px);
  }
`;
