import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.5em;
  gap: 0.5em;
`;

export const IOSInstructions = styled.div`
  background-color: #f0f0f0;
  padding: 1em;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  p {
    margin: 0;
    font-size: 1em;
    color: #333;
  }
`;
