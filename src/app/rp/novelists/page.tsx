"use client";

import { NovelistCard } from "@/components";
import { ShouldRender } from "@/components/common";
import { useUIContext } from "@/hooks";
import { Novelist } from "@/types";
import { useEffect, useState } from "react";
import { Autoplay, EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getNovelists } from "./actions";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

import * as S from "./styles";

export default function NovelistsPage() {
  const [novelists, setNovelistsState] = useState<Novelist[]>([]);
  const { errorToast: error } = useUIContext();

  const setNovelists = async () => {
    const novelists = await getNovelists();
    if ("message" in novelists) {
      return error("Novelists could not be fetched!");
    }

    setNovelistsState(novelists);
  };

  useEffect(() => {
    if (novelists?.length) return;
    setNovelists();
  }, []);

  return (
    <ShouldRender if={!!novelists}>
      <S.CarouselContainer>
        <Swiper
          effect={"coverflow"}
          navigation={true}
          loop={true}
          centeredSlides={true}
          slidesPerView={3}
          speed={1000}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 0,
            depth: 0,
            scale: 0.6,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Navigation, Autoplay]}
        >
          {[...novelists, ...novelists].map((novelist, index) => (
            <SwiperSlide key={`${novelist.username}-${index}`}>
              <NovelistCard novelist={novelist} />
            </SwiperSlide>
          ))}
        </Swiper>
      </S.CarouselContainer>
    </ShouldRender>
  );
}
