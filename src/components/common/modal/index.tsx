"use client";
import { FC } from "react";
import { IoIosCloseCircle } from "react-icons/io";

import {
  VisibilityContent,
  VisibilityProvider,
  VisibilityTrigger,
} from "../visibility-provider";
import * as S from "./styles";

type Props = S.ContentProps & {
  children: React.ReactNode;
  name: string;
};
export const Modal: FC<Props> = ({ children, name, ...containerProps }) => {
  return (
    <VisibilityProvider name={name}>
      <VisibilityContent>
        <S.Container>
          <S.Content {...containerProps}>
            <VisibilityTrigger>
              <S.CloseButton>
                <IoIosCloseCircle />
              </S.CloseButton>
            </VisibilityTrigger>
            {children}
          </S.Content>
        </S.Container>
      </VisibilityContent>
    </VisibilityProvider>
  );
};
