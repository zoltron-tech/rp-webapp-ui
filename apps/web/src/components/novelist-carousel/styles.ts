import { styled } from "styled-components";

export const CarouselContainer = styled.div`
  padding-block: 30px;
  max-width: 2000px;
  margin-inline: auto;
  margin-bottom: 20px;
  /* Kept as paint containment on purpose — this is a fixed-height horizontal
     carousel, not a tall scrolling list, and overflow clipping on an ancestor
     of the Swiper 3D coverflow wrapper stalls its transitionend autoplay
     (see PageShell in app/rp/novelists/styles.ts). */
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
