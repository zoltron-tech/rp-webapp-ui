// components/styled.ts
import styled from "styled-components";

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

export const LoadMoreButton = styled.button`
  background: none;
  border: none;
  color: var(--accent);
  font-size: var(--font-size-h6);
  margin-inline-start: 10px;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    color: var(--accent-hover);
    text-decoration: underline;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  @container (max-width: 600px) {
    font-size: var(--font-size-input);
  }
`;
