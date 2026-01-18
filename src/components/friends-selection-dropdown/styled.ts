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

export const InputWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-inline: 0.8rem;
  padding-block: 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background-color: var(--bg-3);
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 6rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.85rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.45rem;
  background-color: var(--accent);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-primary);
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--accent);
  }
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

export const Username = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
`;

export const EmptyState = styled.div`
  padding: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
`;
