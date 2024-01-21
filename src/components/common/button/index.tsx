"use client";

import classNames from "classnames";
import { ButtonHTMLAttributes, FC } from "react";
import { ImSpinner } from "react-icons/im";

import { Logger } from "@/utils/services";
import * as S from "./styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "link";
  shape?: "rounded" | "square" | "rounded-edge";
  size?: "xs" | "sm" | "md" | "lg";
  onEnter?: () => void;
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
      onKeyDownCapture={(e) => {
        Logger.log("onKeyDown:button", e.key);
      }}
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
