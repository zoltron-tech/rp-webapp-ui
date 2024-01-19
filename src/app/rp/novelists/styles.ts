import { BORDER_RADIUS } from "@/theme";
import { styled } from "styled-components";

export const FallbackContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #868686;
`;

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
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: ${BORDER_RADIUS};
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
  }

  & .swiper-button-prev,
  & .swiper-button-next {
    color: rgba(255, 255, 255, 0.214);
    top: 150px;

    @container (max-width: 900px) {
      & {
        top: 100px;
      }
    }

    @container (max-width: 800px) {
      & {
        display: none;
      }
    }
  }
`;
