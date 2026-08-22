"use client";
import type { Novelist } from "@nw/types/novelist";
import classNames from "classnames";
import { type FC, useEffect, useState } from "react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { ShouldRender } from "@/components/common";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { toggleState } from "@/utils/helpers";
import { mainVerseMuses } from "@/utils/muse";
import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = {
  novelist?: Novelist | null;
};
export const NovelistCard: FC<Props> = ({ novelist }) => {
  const [expanded, setExpanded] = useState(false);
  const { isActive } = useSwiperSlide();
  const { autoplay } = useSwiper();
  const { routeToPage } = usePageRouter();

  const onAvatarClick = () => {
    if (!novelist) return;
    routeToPage(ROUTES.Profile.View(novelist.username).Index);
  };

  const onMuseAvatarClick = (museId: string) => {
    if (museId) routeToPage(ROUTES.Muse.View(museId));
  };

  const handleMouseEnter = () => {
    if (process.env.DISABLE_AUTOSCROLL === "true") return;

    if (!isActive) return;
    Logger.debug("onMouseEnter");

    autoplay.stop();
  };
  const handleMouseLeave = () => {
    if (process.env.DISABLE_AUTOSCROLL === "true") return;

    if (!isActive) return;
    Logger.debug("onMouseLeave");

    autoplay.start();
  };

  Logger.info("NovelistCard rendered");

  useEffect(() => {
    if (!expanded) return;
    if (!isActive) {
      setTimeout(() => {
        setExpanded(false);
      }, 250);
    }
  }, [isActive]);

  if (!novelist) return <></>;

  return (
    <S.Border>
      <S.CardWrapper
        className={classNames({ expanded })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <S.CardBackground
          // Blur baked in server-side by wsrv.nl instead of a CSS filter —
          // live per-slide blur layers trigger the iOS 26 rendering
          // regression (see CardBackground in styles.ts). Non-wsrv URLs stay
          // unblurred rather than reintroducing the filter.
          banner={
            novelist.image?.startsWith("https://wsrv.nl/")
              ? `${novelist.image}&blur=15`
              : novelist.image
          }
        />
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
              className="selectable"
              src={novelist.image ?? null}
              alt={novelist.username ?? "Avatar"}
              name={"stalk 👀"}
              onClick={onAvatarClick}
            />
            <S.NovelistInfo>
              <S.Title>
                {novelist.firstName} {novelist.lastName}
              </S.Title>
              <S.username username={novelist.username} />
              <S.Quote>{novelist.note?.text}</S.Quote>
            </S.NovelistInfo>
          </S.CardHeader>
          <ShouldRender if={expanded}>
            <S.MuseList>
              {mainVerseMuses(novelist.muses).map((muse) => (
                <S.Muse
                  key={`${muse.firstName}-${muse.lastName}`}
                  onClick={() => onMuseAvatarClick(muse.id ? muse.id : "")}
                >
                  <S.Muse.Avatar
                    src={muse.image ?? null}
                    alt={muse.firstName ?? "Muse"}
                  />

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
    </S.Border>
  );
};
