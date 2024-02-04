import { Novelist } from "@/types";
import Image from "next/image";
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
      scrollableContent={novelist?.muses?.slice(0, 4).map((muse) => (
        <S.Avatar key={muse.firstName} className={classNames(["rotate"])}>
          <Image
            alt={muse.firstName}
            src={muse.image}
            width={100}
            height={100}
          />
        </S.Avatar>
      ))}
      expandedContent={
        <S.ExpandedContentInner>
          {novelist?.muses?.map((muse) => (
            <S.ExpandedContentInnerItem key={muse.firstName}>
              <S.Avatar key={muse.firstName}>
                <Image
                  alt={muse.firstName}
                  src={muse.image}
                  width={100}
                  height={100}
                />
              </S.Avatar>
            </S.ExpandedContentInnerItem>
          ))}
        </S.ExpandedContentInner>
      }
    />
  );
};
