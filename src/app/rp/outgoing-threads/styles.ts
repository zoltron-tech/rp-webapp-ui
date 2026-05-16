import styled from "styled-components";

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
 
`;

export const MessageContainer = styled.div`
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  text-align: center;
`;

export const MessageText = styled.div`
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
`;

export const HyperLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--accent);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent-hover);
  }
`;

export const InteractionsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
  max-width: 800px;
  padding-inline: 10px;
`;
