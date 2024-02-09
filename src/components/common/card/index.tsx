import classNames from "classnames";
import { FC } from "react";

import { Logger } from "@/utils/services";
import * as S from "./styles";

export type CardProps = {
  children?: React.ReactNode;
  centered?: boolean;
  className?: string;
} & S.ContainerProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className">;

export const Card: FC<CardProps> = ({
  children,
  centered,
  className,
  ...styles
}) => {
  Logger.info("Card rendered");

  return (
    <S.Container
      className={classNames([className || "", [{ centered }]])}
      {...styles}
    >
      {children}
    </S.Container>
  );
};
