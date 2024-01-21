"use client";

import { ButtonHTMLAttributes, FC } from "react";
import classNames from "classnames";
import { ImSpinner } from "react-icons/im";

import * as S from "./styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "link";
  shape?: "rounded" | "square" | "rounded-edge";
  size?: "xs" | "sm" | "md" | "lg";
};

export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  shape = "rounded-edge",
  disabled,
  loading,
  size = "md",
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
          link: variant === "link",
          square: shape === "square",
          rounded: shape === "rounded",
          sm: size === "sm",
          md: size === "md",
          lg: size === "lg",
          xs: size === "xs",
          ["rounded-edge"]: shape === "rounded-edge",
        },
      ])}
      onClick={() => {
        if (disabled || loading) return;
        onClick?.();
      }}
    >
      <ImSpinner className={classNames(["loading-icon", { loading }])} />
      <span>{children}</span>
    </S.Container>
  );
};
