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
  gap: 0.5rem;
`;

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  /* justify-content: center; */
  margin-top: 10px;
  gap: 0.3rem;
  max-width: 800px;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const UsernameLink = styled.span`
  font-size: var(--font-size-h5);
  cursor: pointer;
  color: var(--accent);

  &:hover {
    opacity: 0.8;
  }
`;

export const Maintext = styled.span`
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-style: italic;
  text-align: center;

  @media (max-width: 800px) {
      font-size: var(--font-size-h6);
      padding-left: 20px;
      text-align: left;
      font-size: 22px;
  }
`;
