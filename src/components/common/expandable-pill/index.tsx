import { toggleState } from "@/utils/helpers";
import classNames from "classnames";
import { FC, ReactNode, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FcSearch } from "react-icons/fc";

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
            <FcSearch />
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
