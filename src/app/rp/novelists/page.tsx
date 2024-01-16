"use client";

import { NovelistCard, ShouldRender } from "@/components";
import { useEffect, useState } from "react";
import { Novelist } from "@/types";
import { getNovelists } from "./actions";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useUIContext } from "@/hooks";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

import * as S from "./styles";

export default function NovelistsPage() {
	const [novelists, setNovelistsState] = useState<Novelist[]>([]);
	const { cardExpanded } = useUIContext();

	const setNovelists = async () => {
		const novelists = await getNovelists();
		setNovelistsState(novelists);
	};

	useEffect(() => {
		if (novelists?.length) return;
		setNovelists();
	}, []);

	useEffect(() => {
		console.log("cardExpanded", cardExpanded);
	}, [cardExpanded]);

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
					// autoplay={{
					// 	delay: 4000,
					// 	disableOnInteraction: false,
					// }}
					coverflowEffect={{
						rotate: 0,
						depth: 0,
						scale: 0.6,
					}}
					modules={[EffectCoverflow, Navigation, Autoplay]}
				>
					{novelists?.map((novelist, index) => (
						<SwiperSlide key={`${novelist.userName}-${index}`}>
							<NovelistCard novelist={novelist} />
						</SwiperSlide>
					))}
				</Swiper>
			</S.CarouselContainer>
		</ShouldRender>
	);
}
