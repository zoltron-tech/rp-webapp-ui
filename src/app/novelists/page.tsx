"use client";

import { NovelistCard, ShouldRender } from "@/components";
import { useEffect, useState } from "react";
import { Novelist } from "@/types";
import { getNovelists } from "./actions";

import * as S from "./styles";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "./swiper.css";

import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function NovelistsPage() {
	const [novelists, setNovelistsState] = useState<Novelist[]>([]);
	const setNovelists = async () => {
		const novelists = await getNovelists();
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
					grabCursor={true}
					navigation={true}
					loop={true}
					centeredSlides={true}
					slidesPerView={"auto"}
					autoplay={{
						delay: 2500,
						disableOnInteraction: false,
					}}
					coverflowEffect={{
						rotate: 60,
						stretch: 1.2,
						depth: 120,
						modifier: 1,
						scale: 0.4,
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
