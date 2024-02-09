import { Logger } from "@/utils/services";
import { FC } from "react";

type Props = {
  children: React.ReactNode;
  if: boolean;
};

export const ShouldRender: FC<Props> = ({ children, if: condition }) => {
  Logger.info("ShouldRender rendered");

  return condition ? <>{children}</> : null;
};
