"use client";

import type { FC } from "react";
import { Logger } from "@/utils/services";
import { Button, type ButtonProps } from "../common";
import * as S from "./styles";

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
