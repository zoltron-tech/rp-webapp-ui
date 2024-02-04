import { Novelist } from "@/types";
import Image from "next/image";
import { FC } from "react";
import { ExpandablePill } from "../common";

import * as S from "./styles";

interface Props {
  novelist: Novelist | null;
}

export const MusesPill: FC<Props> = ({ novelist }) => {
  return (
    <ExpandablePill
      tag="Muses"
      scrollableContent={novelist?.muses.map((muse) => (
        <S.Avatar key={muse.firstName}>
          <Image
            alt={muse.firstName}
            src={muse.image}
            width={100}
            height={100}
          />
        </S.Avatar>
      ))}
    />
  );
};
