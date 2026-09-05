import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px 60px;
  text-align: center;
`;

export const Animation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.h2`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--accent-8);
  letter-spacing: 0.02em;
  gap: 12px;
`;

export const Message = styled.p`
  all: unset;
  display: block;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  max-width: 320px;
  line-height: 1.6;
`;
