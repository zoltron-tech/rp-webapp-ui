"use client";

import { type FC, useCallback, useEffect, useRef } from "react";
import { Autoplay, EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper/types";
import { useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { NovelistCard } from "..";
import { ShouldRender } from "../common";
import * as S from "./styles";

export const NovelistCarousel: FC = () => {
  const { errorToast: error } = useUIContext();
  const novelists = useGlobalState("novelists");
  const setStore = useGlobalStoreSet();

  const setNovelists = useCallback(async () => {
    Logger.info("setNovelists called:", novelists);
    // Route handler, not a server action — server actions are serialized per
    // client, and this fetch was blocking authenticateAction (and with it the
    // top-bar login button) on first load.
    try {
      const response = await fetch("/api/landing/novelists");
      if (!response.ok) {
        return error("Novelists could not be fetched!");
      }
      const _novelists = await response.json();
      setStore({ novelists: _novelists });
    } catch {
      return error("Novelists could not be fetched!");
    }
  }, []);

  useEffect(() => {
    if (novelists.length) return;

    setNovelists();
  }, []);

  // Autoplay only while the carousel is on screen. Like the muse marquee's
  // in-view gate, this keeps the 3D coverflow from continuously compositing
  // large transformed layers while scrolled out of view — a trigger for the
  // iOS 26 rendering regression (off-screen content blanking on scroll).
  const containerRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const inViewRef = useRef(true);

  const applyAutoplayState = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed || !swiper.autoplay) return;
    if (inViewRef.current) {
      if (!swiper.autoplay.running) swiper.autoplay.start();
    } else if (swiper.autoplay.running) {
      swiper.autoplay.stop();
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        applyAutoplayState();
      },
      { rootMargin: "100px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Re-run once the carousel actually renders (it mounts only after
    // novelists arrive), so the observer attaches to the real container.
  }, [applyAutoplayState, novelists.length]);

  Logger.info("NovelistCarousel rendered");

  return (
    <ShouldRender if={novelists.length > 0}>
      <S.CarouselContainer ref={containerRef}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            applyAutoplayState();
          }}
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
            depth: 0,
            rotate: 0,
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
  );
};

export default NovelistCarousel;
