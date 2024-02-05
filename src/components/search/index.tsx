import { FC, useState } from "react";

import { toggleState } from "@/utils/helpers";
import classNames from "classnames";
import { BsSearch } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import { ShouldRender } from "../common";
import * as S from "./styles";

export interface SearchProps {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
}

export const Search: FC<SearchProps> = ({
  placeholder,
  onChange,
  value,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <S.Container tabIndex={0} className={classNames({ expanded })}>
      <S.Input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
      <S.Dropdown />
      <S.Button onClick={toggleState(setExpanded)}>
        <ShouldRender if={expanded}>
          <IoCloseOutline />
        </ShouldRender>
        <ShouldRender if={!expanded}>
          <BsSearch />
        </ShouldRender>
      </S.Button>
    </S.Container>
  );
};
