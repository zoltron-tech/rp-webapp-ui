import { styled } from "styled-components";

export type ContainerProps = {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  padding?: string;
  margin?: string;
};

export const Container = styled.div<ContainerProps>`
  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ minWidth }) => minWidth && `min-width: ${minWidth};`}
  ${({ minHeight }) => minHeight && `min-height: ${minHeight};`}
  ${({ maxWidth }) => maxWidth && `max-width: ${maxWidth};`}
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
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
