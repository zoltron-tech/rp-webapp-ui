import { styled } from "styled-components";

export const CarouselContainer = styled.div`
  padding-top: 80px;
  max-width: 2000px;
  margin-inline: auto;
  contain: paint;

  & .swiper-button-prev,
  & .swiper-button-next {
    color: rgba(255, 255, 255, 0.214);
    top: 150px;

    @container (max-width: 900px) {
      & {
        top: 100px;
      }
    }

    &::after {
      font-size: 2.5cqw;
    }

    @container (max-width: 500px) {
      & {
        display: none;
      }
    }
  }
`;
