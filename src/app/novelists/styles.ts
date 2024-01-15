import { BORDER_RADIUS } from "@/theme";
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
		/* Center slide text vertically */
		display: flex;
		justify-content: center;
		align-items: center;
		width: 600px;
		border-radius: ${BORDER_RADIUS};
	}
`;
