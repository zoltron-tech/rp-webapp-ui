import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  0% { opacity: 0; }
  27.6% { opacity: 0.99; }
  62% { opacity: 0.999; }
  83.2% { opacity: 1; }
  100% { opacity: 1; }
`;

export const Inner = styled.div<{ $size?: number }>`
  height: ${({ $size }) => ($size ? `${$size}px` : "100%")};
  width: ${({ $size }) => ($size ? `${$size}px` : "100%")};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent);
  border: 1px solid var(--accent-hover);
  flex-shrink: 0;
`;

export const Img = styled.img`
  height: 100%;
  width: 100%;
  opacity: 0;
  animation: ${fadeIn} 0.7s ease-in-out forwards 0.2s;
`;
