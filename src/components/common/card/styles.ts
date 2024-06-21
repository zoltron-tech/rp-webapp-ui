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
  border: 1px solid slategray;
  color: ${({ theme }) => theme.text};
  border-radius: 16px;

  overflow: auto;

  position: sticky;
  top: 0px;

  container-name: card;
  container-type: size;
`;
