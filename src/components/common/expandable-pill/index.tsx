import { toggleState } from "@/utils/helpers";
import classNames from "classnames";
import { FC, ReactNode, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { BsSearch } from "react-icons/bs";

import { Logger } from "@/utils/services";
import * as S from "./styles";

export interface ExpandablePillProps {
  tag: string;
  scrollableContent: ReactNode;
  expandedContent: ReactNode;
}

export const ExpandablePill: FC<ExpandablePillProps> = ({
  tag,
  scrollableContent,
  expandedContent,
}) => {
  const [expanded, setExpanded] = useState(false);

  Logger.info("ExpandablePill rendered");

  return (
    <>
      <S.TagTop>{tag}</S.TagTop>
      <S.PillContinaer className={classNames({ expanded })}>
        <S.TagInline className={classNames({ expanded })}>{tag}</S.TagInline>
        <S.ScrollableContentContainer className={classNames({ expanded })}>
          {scrollableContent}
        </S.ScrollableContentContainer>
        <S.Searchbar className={classNames({ expanded })}>
          <S.MagnifyingGlass className={classNames({ expanded })}>
            <BsSearch />
          </S.MagnifyingGlass>
        </S.Searchbar>
        <S.ExpandIcon
          className={classNames({ expanded })}
          onClick={toggleState(setExpanded)}
        >
          <CiCirclePlus />
        </S.ExpandIcon>
        <S.ExpandedContent className={classNames({ expanded })}>
          {expandedContent}
        </S.ExpandedContent>
      </S.PillContinaer>
    </>
  );
};
