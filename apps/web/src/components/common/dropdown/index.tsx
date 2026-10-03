"use client";

import classNames from "classnames";
import type { ComponentPropsWithoutRef, FC } from "react";

import { Logger } from "@/utils/services";
import type { Hideable } from "../visibility-provider";
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
