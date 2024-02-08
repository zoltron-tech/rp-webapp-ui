import { getNovelists } from "@/app/rp/novelists/actions";
import { useStore, useUIContext } from "@/hooks";
import { Novelist } from "@/types";
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

type NovelistsState = { novelists: Novelist[] };

export const NovelistCarousel: FC = () => {
  const { errorToast: error } = useUIContext();
  const [novelists, setStore] = useStore<NovelistsState, "novelists">(
    (store) => store.novelists
  );

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
