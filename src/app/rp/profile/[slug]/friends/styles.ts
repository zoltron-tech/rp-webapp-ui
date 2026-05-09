import styled from "styled-components";

export const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;
