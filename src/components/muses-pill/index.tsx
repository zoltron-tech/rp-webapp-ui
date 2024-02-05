import { Novelist } from "@/types";
import { FC } from "react";
import { ExpandablePill } from "../common";

import classNames from "classnames";
import * as S from "./styles";

interface Props {
  novelist: Novelist | null;
}

export const MusesPill: FC<Props> = ({ novelist }) => {
  return (
    <ExpandablePill
      tag="Muses"
      scrollableContent={novelist?.muses?.slice(0, 8).map((muse) => (
        <S.Avatar
          src={muse.image}
          alt={muse.firstName}
          width={100}
          height={100}
          key={muse.firstName}
          className={classNames(["rotate"])}
          name={muse.firstName}
          hoverable
        />
      ))}
      expandedContent={
        <S.ExpandedContentInner>
          {novelist?.muses?.map((muse) => (
            <S.ExpandedContentInnerItem key={muse.firstName}>
              <S.Avatar
                src={muse.image}
                alt={muse.firstName}
                width={100}
                height={100}
                key={muse.firstName}
                name={muse.firstName}
                hoverable
              />
            </S.ExpandedContentInnerItem>
          ))}
        </S.ExpandedContentInner>
      }
    />
  );
};
