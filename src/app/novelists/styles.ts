import { BORDER_RADIUS } from "@/theme";
import { styled } from "styled-components";

export const CarouselContainer = styled.div`
	overflow: hidden;
	margin-top: 40px;
	-webkit-backface-visibility: hidden;

	& .swiper {
		overflow: hidden;
		width: 100%;
		height: 100%;
		-webkit-backface-visibility: hidden;
	}

	& .swiper-slide {
		width: 600px;
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		overflow: hidden;
		border-radius: ${BORDER_RADIUS};
		-webkit-backface-visibility: hidden;
		-webkit-transform: translate3d(0, 0, 0);
	}

	& .swiper-button-prev,
	& .swiper-button-next {
		color: rgba(255, 255, 255, 0.214);
		top: 150px;
	}
`;
