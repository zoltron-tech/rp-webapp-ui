import { styled } from "styled-components";

type ContainerProps = {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
};

export const Container = styled.div<ContainerProps>`
  width: ${(props: ContainerProps) => props.width || "100%"};
  height: ${(props: ContainerProps) => props.height || "100%"};
  padding: ${(props: ContainerProps) => props.padding || "10cqw"};
  margin: ${(props: ContainerProps) => props.margin || "0px"};
  background-color: ${({ theme }) => theme.cardBackgroundColor};
  color: ${({ theme }) => theme.text};
  border-radius: 16px;
  box-shadow: 0px 5px 20px 10px ${({ theme }) => theme.cardBoxShadowColor};

  overflow: auto;
  resize: both;

  position: sticky;
  top: 0px;

  container-name: card;
  container-type: size;
`;
