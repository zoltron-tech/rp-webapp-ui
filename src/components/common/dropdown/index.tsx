"use client";

import { ComponentPropsWithoutRef, FC } from "react";
import { Hideable } from "../visibility-provider";

import { Logger } from "@/utils/services";
import classNames from "classnames";
import * as S from "./styles";

export interface DropdownProps
  extends Partial<Hideable>,
    ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export const Dropdown: FC<DropdownProps> = ({ children, isVisible }) => {
  Logger.info("Dropdown rendered");

  return (
    <S.DropdownContainer className={classNames({ show: isVisible })}>
      {children}
    </S.DropdownContainer>
  );
};
