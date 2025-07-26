"use client";

import { getNovelists } from "@/app/rp/novelists/actions";
import { useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { FC, useCallback, useEffect } from "react";
import { Autoplay, EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

import { NovelistCard } from "..";
import { ShouldRender } from "../common";
import { PageLoader } from "../layout";
import * as S from "./styles";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";

export const NovelistCarousel: FC = () => {
  const { errorToast: error } = useUIContext();
  const novelists = useGlobalState("novelists");
  const setStore = useGlobalStoreSet();

  const setNovelists = useCallback(async () => {
    Logger.info("setNovelists called:", novelists);
    const _novelists = await getNovelists();
    Logger.debug("setNovelists:", novelists);
    if ("message" in _novelists) {
      return error("Novelists could not be fetched!");
    }
    setStore({ novelists: _novelists });
  }, []);

  useEffect(() => {
    if (novelists.length) return;

    setNovelists();
  }, []);

  Logger.info("NovelistCarousel rendered");

  return (
    <>
      <ShouldRender if={novelists.length === 0}>
        <PageLoader />
      </ShouldRender>
      <ShouldRender if={novelists.length > 0}>
        <S.CarouselContainer>
          <Swiper
            effect={"coverflow"}
            navigation={true}
            loop={true}
            centeredSlides={true}
            slidesPerView={3}
            speed={1000}
            autoplay={
              process.env.DISABLE_AUTOSCROLL === "true"
                ? false
                : {
                    delay: 4000,
                    disableOnInteraction: false,
                  }
            }
            coverflowEffect={{
              rotate: 0,
              depth: 0,
              scale: 0.6,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Navigation, Autoplay]}
          >
            {[...novelists].map((novelist, index) => (
              <SwiperSlide key={`${novelist.username}-${index}`}>
                <NovelistCard novelist={novelist} />
              </SwiperSlide>
            ))}
          </Swiper>
        </S.CarouselContainer>
      </ShouldRender>
    </>
  );
};

export default NovelistCarousel;
