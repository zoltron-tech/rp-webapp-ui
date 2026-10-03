import type { FC, ReactNode } from "react";
import * as S from "./styles";

type AddNewButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

export const AddNewButton: FC<AddNewButtonProps> = ({
  label,
  icon,
  onClick,
}) => {
  return (
    <S.Wrapper>
      <S.Button type="button" onClick={onClick}>
        {label}
        {icon}
      </S.Button>
    </S.Wrapper>
  );
};
