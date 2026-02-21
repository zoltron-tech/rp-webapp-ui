import styled from "styled-components";

export const PositionContainer = styled.div`
display: flex;
flex-direction: column;
gap: 1rem;
  width: 100%;
`;

export const List = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  background-color: var(--bg-3);
  max-height: 14rem;
  overflow-y: auto;
  border-radius: 5px;
`;

export const Row = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }

  .checkbox-root {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background-color: var(--bg-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox-indicator {
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const Name = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-primary);
`;
