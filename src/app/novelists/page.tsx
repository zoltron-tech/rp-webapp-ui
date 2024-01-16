"use client";

import { NovelistCard, ShouldRender } from "@/components";
import { useEffect, useState } from "react";
import { Novelist } from "@/types";
import { getNovelists } from "./actions";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import * as S from "./styles";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

export default function NovelistsPage() {
	const [novelists, setNovelistsState] = useState<Novelist[]>([]);
	const setNovelists = async () => {
		const novelists = await getNovelists();
		setNovelistsState(novelists);
	};
	const [isMobile, setIsMobile] = useState(false);

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
					speed={600}
					// autoplay={{
					// 	delay: 3500,
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
