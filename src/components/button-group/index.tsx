"use client";

import { FC } from "react";
import { Logger } from "@/utils/services";
import { Button, ButtonProps } from "../common";
import * as S from "./styles";
import classNames from "classnames";

export interface ButtonInfo {
  onClick: () => void;
  label: string;
  variant: ButtonProps["variant"];
}

interface ButtonGroupProps {
  buttons: ButtonInfo[];
}

export const ButtonGroup: FC<ButtonGroupProps> = ({ buttons }) => {
  Logger.info("ButtonGroupProps rendered");

  return (
    <S.ContentContainer>
      {buttons.map((button, index) => (
        <Button
          shape="square"
          key={index}
          onClick={button.onClick}
          variant={button.variant}
        >
          {button.label}
        </Button>
      ))}
    </S.ContentContainer>
  );
};
