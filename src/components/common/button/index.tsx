"use client";

import classNames from "classnames";
import type { ComponentPropsWithoutRef, FC } from "react";
import { ImSpinner } from "react-icons/im";

import { Logger } from "@/utils/services";
import * as S from "./styles";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  children?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "link"
    | "menu-item"
    | "positive"
    | "negative"
    | "action";
  shape?: "rounded" | "square" | "rounded-edge";
  size?: "xs" | "sm" | "md" | "lg";
  onEnter?: () => void;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  shape = "rounded-edge",
  disabled,
  loading,
  size = "md",
  onClick,
}) => {
  const clickHandler = () => {
    if (disabled || loading) return;
    onClick?.();
  };

  Logger.info("Button rendered");

  return (
    <S.Container
      onKeyDownCapture={(e) => {
        Logger.debug("onKeyDown:button", e.key);
      }}
      className={classNames([
        "button",
        {
          loading,
          disabled,
          primary: variant === "primary",
          secondary: variant === "secondary",
          positive: variant === "positive",
          negative: variant === "negative",
          action: variant === "action",
          link: variant === "link",
          square: shape === "square",
          rounded: shape === "rounded",
          sm: size === "sm",
          md: size === "md",
          lg: size === "lg",
          xs: size === "xs",
          "rounded-edge": shape === "rounded-edge",
          "menu-item": variant === "menu-item",
        },
      ])}
      onClick={clickHandler}
    >
      <ImSpinner className={classNames(["loading-icon", { loading }])} />
      <span>{children}</span>
    </S.Container>
  );
};
