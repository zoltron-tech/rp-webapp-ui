import styled from "styled-components";

export const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 8px 4px 4px;
`;

export const ChoiceCard = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 14px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition:
    background 0.15s,
    border-color 0.15s;
  width: 100%;

  &:hover {
    background: var(--bg-4);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-4));
  }
`;

export const ChoiceIconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-4));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
`;

export const ChoiceTitle = styled.span`
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const ChoiceDesc = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const BackRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const BackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  transition: background 0.15s;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;
