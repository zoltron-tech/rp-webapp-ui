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
          action: variant === "action",
          disabled,
          lg: size === "lg",
          link: variant === "link",
          loading,
          md: size === "md",
          "menu-item": variant === "menu-item",
          negative: variant === "negative",
          positive: variant === "positive",
          primary: variant === "primary",
          rounded: shape === "rounded",
          "rounded-edge": shape === "rounded-edge",
          secondary: variant === "secondary",
          sm: size === "sm",
          square: shape === "square",
          xs: size === "xs",
        },
      ])}
      onClick={clickHandler}
    >
      <ImSpinner className={classNames(["loading-icon", { loading }])} />
      <span>{children}</span>
    </S.Container>
  );
};
