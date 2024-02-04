// import MagnifyGlassIcon from "@/assets/images/magnifying-glass.png";
import { Novelist } from "@/types";
import Image from "next/image";
import { FC, useState } from "react";

import classNames from "classnames";
import { CiCirclePlus } from "react-icons/ci";
import { FcSearch } from "react-icons/fc";
import * as S from "./styles";
interface Props {
  novelist: Novelist | null;
}

export const MusesPill: FC<Props> = ({ novelist }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <S.MusesTagTop>Muses</S.MusesTagTop>
      <S.MusesContainer className={classNames({ expanded })}>
        <S.MusesTagInline className={classNames({ expanded })}>
          Muses
        </S.MusesTagInline>
        <S.ScrollableAvatarContainer className={classNames({ expanded })}>
          {novelist?.muses.map((muse) => (
            <S.Avatar key={muse.firstName}>
              <Image
                alt={muse.firstName}
                src={muse.image}
                width={100}
                height={100}
              />
            </S.Avatar>
          ))}
        </S.ScrollableAvatarContainer>
        <S.Searchbar className={classNames({ expanded })}>
          <S.MagnifyingGlass className={classNames({ expanded })}>
            <FcSearch />
          </S.MagnifyingGlass>
        </S.Searchbar>
        <S.ExpandMuses
          className={classNames({ expanded })}
          onClick={() => setExpanded((current) => !current)}
        >
          <CiCirclePlus />
        </S.ExpandMuses>
      </S.MusesContainer>
    </>
  );
};
