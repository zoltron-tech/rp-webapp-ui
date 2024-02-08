import { ComponentPropsWithoutRef, FC } from "react";
import { Hideable } from "../visibility-provider";

import classNames from "classnames";
import * as S from "./styles";

export interface DropdownProps
  extends Partial<Hideable>,
    ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export const Dropdown: FC<DropdownProps> = ({ children, isVisible }) => {
  return (
    <S.DropdownContainer className={classNames({ isVisible })}>
      {children}
    </S.DropdownContainer>
  );
};
