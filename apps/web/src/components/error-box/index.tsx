import classNames from "classnames";
import type { FC, HTMLProps } from "react";
import * as S from "./styled";

type ErrorBoxProps = HTMLProps<HTMLDivElement>;
export const ErrorBox: FC<ErrorBoxProps> = ({ className, children }) => {
  return (
    <S.ErrorBoxRoot className={classNames("info-box", className)}>
      {children}
    </S.ErrorBoxRoot>
  );
};
