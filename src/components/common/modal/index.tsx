"use client";

import { FC, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useTheme } from "styled-components";

import * as S from "./styles";

type Props = S.ContentProps & {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};
export const Modal: FC<Props> = ({
  children,
  open,
  onClose,
  ...containerProps
}) => {
  const [closeHover, setCloseHover] = useState(false);
  const theme = useTheme();

  const onCloseClick = () => {
    onClose();
  };

  return (
    <S.Container open={open}>
      <S.Content {...containerProps}>
        <S.CloseButton
          onMouseEnter={() => setCloseHover(true)}
          onMouseLeave={() => setCloseHover(false)}
          onClick={onCloseClick}
        >
          <IoIosCloseCircle color={closeHover ? theme.error : theme.primary} />
        </S.CloseButton>
        {children}
      </S.Content>
    </S.Container>
  );
};
