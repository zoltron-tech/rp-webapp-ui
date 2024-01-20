"use client";

import { FC, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useTheme } from "styled-components";

import * as S from "./styles";

type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  width?: string;
  height?: string;
};
export const Modal: FC<Props> = ({
  children,
  open,
  width,
  height,
  onClose,
}) => {
  const [closeHover, setCloseHover] = useState(false);
  const theme = useTheme();

  const onCloseClick = () => {
    onClose();
  };

  return (
    <S.Container open={open}>
      <S.Content width={width} height={height}>
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
