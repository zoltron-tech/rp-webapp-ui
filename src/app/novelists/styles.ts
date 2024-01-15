import { BORDER_RADIUS, PALETTE } from "@/theme";
import { styled } from "styled-components";

export const CarouselContainer = styled.div`
	overflow: visible;
	margin-top: 40px;
	& .swiper {
		overflow: visible;
		width: 100%;
		height: 100%;
	}

	& .swiper-slide {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 600px;
		border-radius: ${BORDER_RADIUS};
	}

	& .swiper-button-prev,
	& .swiper-button-next {
		color: rgba(255, 255, 255, 0.214);
	}
`;
