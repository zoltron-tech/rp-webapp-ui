// components/styled.ts
import styled from "styled-components";

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 12px 0px 20px 0px;
`;

export const LoadMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 140px;

  padding: 2px 12px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);

  font-size: var(--font-size-h6);
  font-weight: 700;
  font-style: italic;
  color: var(--accent);
  white-space: nowrap;

  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    cursor: pointer;
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px
      color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  &:disabled {
    cursor: default;
    opacity: 0.8;
  }

  @container (max-width: 600px) {
    font-size: var(--font-size-input);
  }
`;
