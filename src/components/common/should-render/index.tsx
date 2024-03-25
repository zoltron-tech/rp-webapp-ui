import { Logger } from "@/utils/services";
import { FC } from "react";
import * as S from "./styles";

type Props = {
  children: React.ReactNode;
  if: boolean;
  preserveSpace?: boolean;
};

export const ShouldRender: FC<Props> = ({
  children,
  if: condition,
  preserveSpace,
}) => {
  Logger.info("ShouldRender rendered");

  return condition ? (
    <>{children}</>
  ) : preserveSpace ? (
    <S.Hidden>{children}</S.Hidden>
  ) : null;
};
