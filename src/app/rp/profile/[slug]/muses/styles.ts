import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

// Background container
export const BackgroundContainer = styled.div`
--navbar-width: 80px;
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
    overflow: hidden;
    min-height: calc(100dvh - var(--navbar-width));

    @media screen and (min-width: 480px) {
       --navbar-width: 60px;
    }
`;

// Each blurred background tile
export const BackgroundTile = styled.div<{
  image: string;
  top: number;
  left: number;
  rotation: number;
  scale: number;
}>`
  position: absolute;
  width: 100px;
  height: 100px;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  background-image: url(${(props) => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  transform: rotate(${(props) => props.rotation}deg) scale(${(props) => props.scale});
  filter: blur(25px) brightness(1);
  opacity: 0.5;
`;

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-top: 10px;
  padding-inline: 60px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  gap: 0.3rem;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const Maintext = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 22px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 18px;
    }
  }
`;

export const Subtext = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 22px;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }
`;
