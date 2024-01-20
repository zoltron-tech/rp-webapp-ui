"use client";

import { ButtonHTMLAttributes, FC } from "react";
import classNames from "classnames";
import { ImSpinner } from "react-icons/im";

import * as S from "./styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant?: S.ContainerProps["variant"];
  shape?: S.ContainerProps["shape"];
  onClick?: () => void;
  loading?: boolean;
};
export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  shape = "rounded-edge",
  disabled,
  loading,
  onClick,
}) => {
  return (
    <S.Container
      className={classNames([
        "button",
        {
          loading,
          disabled,
          primary: variant === "primary",
          secondary: variant === "secondary",
          square: shape === "square",
          rounded: shape === "rounded",
          ["rounded-edge"]: shape === "rounded-edge",
        },
      ])}
      onClick={onClick}
      variant={variant}
      shape={shape}
    >
      <ImSpinner className={classNames(["loading-icon", { loading }])} />
      <span>{children}</span>
    </S.Container>
  );
};
