import { toggleState } from "@/utils/helpers";
import { ShouldRender } from "@/components/common";
import classNames from "classnames";
import { FC, ReactNode, useState } from "react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { BsSearch } from "react-icons/bs";

import { Logger } from "@/utils/services";
import * as S from "./styles";

export interface ExpandablePillProps {
  tag: string;
  scrollableContent: ReactNode;
  expandedContent: ReactNode;
  expandable: Boolean;
}

export const ExpandablePill: FC<ExpandablePillProps> = ({
  tag,
  scrollableContent,
  expandedContent,
  expandable,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [nonExpandable, setNonexpandable] = useState(!expandable);

  Logger.info("ExpandablePill rendered");

  return (
    <>
      <S.TagTop>{tag}</S.TagTop>
      <S.PillContinaer className={classNames({ expanded })}>
        <S.TagInline className={classNames({ expanded })}>{tag}</S.TagInline>
        <S.ScrollableContentContainer
          className={classNames({ expanded, nonExpandable })}
        >
          {scrollableContent}
        </S.ScrollableContentContainer>
        <ShouldRender if={expandable === true}>
          <S.Searchbar className={classNames({ expanded })}>
            <S.MagnifyingGlass className={classNames({ expanded })}>
              <BsSearch />
            </S.MagnifyingGlass>
          </S.Searchbar>
          <S.ExpandIcon
            onClick={toggleState(setExpanded)}
            className={classNames({ expanded })}
          >
            <ShouldRender if={!expanded}>
              <MdOutlineExpandMore />
            </ShouldRender>
            <ShouldRender if={expanded}>
              <MdOutlineExpandLess />
            </ShouldRender>
          </S.ExpandIcon>
          <S.ExpandedContent className={classNames({ expanded })}>
            {expandedContent}
          </S.ExpandedContent>
        </ShouldRender>
      </S.PillContinaer>
    </>
  );
};
