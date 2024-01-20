"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import classNames from "classnames";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { Novelist } from "@/types/novelist";
import { ShouldRender } from "@/components/common";
import { useUIContext } from "@/hooks";

import * as S from "./styles";

type Props = {
  novelist?: Novelist | null;
};
export const NovelistCard: FC<Props> = ({ novelist }) => {
  const [expanded, setExpanded] = useState(false);
  const { setCardExpanded } = useUIContext();
  const { isActive } = useSwiperSlide();
  const { autoplay } = useSwiper();

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        setExpanded(false);
      }, 250);
    }
  }, [isActive]);

  useEffect(() => {
    setCardExpanded(expanded);
  }, [expanded]);

  if (!novelist) return <></>;

  return (
    <S.CardWrapper
      className={classNames({ expanded })}
      onMouseEnter={() => {
        autoplay.stop();
      }}
      onMouseLeave={() => {
        autoplay.start();
      }}
    >
      <S.CardBackground banner={novelist.image} />
      <S.Card className="novelist-card">
        <S.ExpandButton
          onClick={() => setExpanded((current) => !current)}
          className={classNames({ expanded })}
        >
          <ShouldRender if={!expanded}>
            <MdOutlineExpandMore />
          </ShouldRender>
          <ShouldRender if={expanded}>
            <MdOutlineExpandLess />
          </ShouldRender>
        </S.ExpandButton>
        <S.CardHeader>
          <S.Avatar>
            <Image
              src={novelist.image || ""}
              alt={""}
              width={200}
              height={200}
            />
          </S.Avatar>
          <S.NovelistInfo>
            <S.Title>
              {novelist.firstName} {novelist.lastName}
            </S.Title>
            <S.username>{novelist.username}</S.username>
            <S.Quote>{novelist.note}</S.Quote>
          </S.NovelistInfo>
        </S.CardHeader>
        <ShouldRender if={expanded}>
          <S.MuseList>
            {novelist.muses.map((muse) => (
              <S.Muse key={`${muse.firstName}-${muse.lastName}`}>
                <S.Muse.Avatar>
                  <Image
                    src={muse.image || ""}
                    alt={""}
                    width={70}
                    height={70}
                  />
                </S.Muse.Avatar>

                <S.Muse.Name>
                  {muse.firstName}{" "}
                  <span className={classNames(["muse-last-name"])}>
                    {muse.lastName}
                  </span>
                </S.Muse.Name>
              </S.Muse>
            ))}
          </S.MuseList>
        </ShouldRender>
      </S.Card>
    </S.CardWrapper>
  );
};
