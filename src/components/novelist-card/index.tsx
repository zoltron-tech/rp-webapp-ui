"use client";
import { ShouldRender } from "@/components/common";
import { useUIContext } from "@/hooks";
import { Novelist } from "@/types/novelist";
import classNames from "classnames";
import { FC, useEffect, useState } from "react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { useSwiper, useSwiperSlide } from "swiper/react";

import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import * as S from "./styles";

type Props = {
  novelist?: Novelist | null;
};
export const NovelistCard: FC<Props> = ({ novelist }) => {
  const [expanded, setExpanded] = useState(false);
  const { setCardExpanded } = useUIContext();
  const { isActive } = useSwiperSlide();
  const { autoplay } = useSwiper();
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!novelist) return;
    push(`/rp/profile/${novelist.username}`);
  };

  const handleMouseEnter = () => {
    if (process.env.DISABLE_AUTOSCROLL === "true") return;

    if (!isActive) return;
    Logger.log("onMouseEnter");

    autoplay.stop();
  };
  const handleMouseLeave = () => {
    if (process.env.DISABLE_AUTOSCROLL === "true") return;

    if (!isActive) return;
    Logger.log("onMouseLeave");

    autoplay.start();
  };

  useEffect(() => {
    if (!expanded) return;
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <S.CardBackground banner={novelist.image} />
      <S.Card className="novelist-card">
        <S.ExpandButton
          onClick={toggleState(setExpanded)}
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
          <S.Avatar
            src={novelist.image || ""}
            alt={""}
            size={200}
            name={"stalk 👀"}
            onClick={onAvatarClick}
            hoverable
          />
          <S.NovelistInfo>
            <S.Title>
              {novelist.firstName} {novelist.lastName}
            </S.Title>
            <S.username username={novelist.username} />
            <S.Quote>{novelist.note}</S.Quote>
          </S.NovelistInfo>
        </S.CardHeader>
        <ShouldRender if={expanded}>
          <S.MuseList>
            {novelist.muses.map((muse) => (
              <S.Muse key={`${muse.firstName}-${muse.lastName}`}>
                <S.Muse.Avatar src={muse.image || ""} alt={""} size={70} />

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
