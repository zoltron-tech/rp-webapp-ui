import { FC } from "react";

import * as S from "./styles";
import classNames from "classnames";

export type CardProps = {
  children?: React.ReactNode;
  centered?: boolean;
  className?: string;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className">;

export const Card: FC<CardProps> = ({
  children,
  centered,
  className,
  ...styles
}) => {
  return (
    <S.Container
      className={classNames([className || "", [{ centered }]])}
      {...styles}
    >
      {children}
    </S.Container>
  );
};
