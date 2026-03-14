import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const TourWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.1em;
  background-color: var(--bg-3);
`;

export const BodyInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.2em;

  & > h3 {
    width: 100%;
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-bold);
    color: var(--accent);
  }

  & > p {
    font-size: var(--font-size);
    font-weight: var(--font-weight-medium);
    color: var(--text);
  }
`;

export const FooterInfo = styled.div`
  display: flex;
  width: 100%;
  margin-top: 10px;
  color: var(--text-secondary);
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 0.3em;
  border-top: 1px solid var(--bg-6);
  padding-top: 10px;
`;
