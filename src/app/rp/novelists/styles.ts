import { Container } from "@novelist-world/ui";
import styled from "styled-components";
import { setOpacity } from "@/utils/helpers";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 0px 80px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  container-type: inline-size;
  background-image: 
  linear-gradient(
      rgba(0, 0, 0, 0.09),
      rgba(0, 0, 0, 0.32)
    ),
    url(https://rp-webapp-ui.s3.eu-central-1.amazonaws.com/deployments/NW-Wallpaper.png); //url(https://cli.github.com/assets/images/light-glow.svg);
  background-size: cover;
`;

export const MainButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  background-color: transparent;
  color: #0f1923;
  cursor: pointer;
  position: relative;
  padding: 8px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.15s ease;

  /* Outer frame */
  &::before,
  &::after {
    content: "";
    position: absolute;
    right: 0;
    left: 0;
    height: calc(50% - 5px);
    border: 1px solid #7d8082;
    transition: all 0.15s ease;
    pointer-events: none;
  }

  &::before {
    top: 0;
    border-bottom-width: 0;
  }

  &::after {
    bottom: 0;
    border-top-width: 0;
  }

  &:focus,
  &:active {
    outline: none;
  }

  &:active::before,
  &:active::after {
    right: 3px;
    left: 3px;
  }

  &:active::before {
    top: 3px;
  }

  &:active::after {
    bottom: 3px;
  }

  /* Inner button */
  .buttonLg {
    position: relative;
    display: block;
    padding: 10px 20px;
    color: #fff;
    background-color: #0f1923;
    overflow: hidden;
  }

  .buttonLg::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 2px;
    background-color: #0f1923;
  }

  .buttonLg::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 4px;
    height: 4px;
    background-color: #0f1923;
    transition: all 0.2s ease;
  }

  /* Sliding accent */
  .buttonSl {
    position: absolute;
    top: 0;
    bottom: -1px;
    left: -8px;
    width: 0;
    background-color: var(--accent);
    transform: skew(-15deg);
    transition: all 0.2s ease;
  }

  .buttonText {
    position: relative;
    z-index: 1;
    letter-spacing: 1.5px;
  }

  &:hover {
    color: #0f1923;
  }

  &:hover .buttonSl {
    width: calc(100% + 15px);
  }
`;

export const InfoCard = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  background-color: ${({ theme }: any) =>
    setOpacity(theme.navbar, 0.2)} !important;
  padding: 36px 28px !important;
  cursor: default !important;
  text-align: center;

  @-moz-document url-prefix() {
    backdrop-filter: none !important;
  }
`;

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 60px;
  margin-bottom: 80px;
  width: 100%;
  max-width: 1100px;

  @container (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
      margin-top: 32px;
      margin-bottom: 40px;
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
`;

export const ButtonsGroupContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-block: 30px;
  gap: 1.5rem;
`;

export const ButtonContainer = styled.div`
  align-items: center;
  flex-direction: column;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }: any) => setOpacity(theme.navbar, 0.6)};
  width: 250px;

  @container (max-width: 800px) {
    & {
      width: 100px;
    }
  }
`;

export const MainHeading = styled.div`
  margin-top: 30px;
  text-transform: uppercase;
  font-size: var(--font-size-h1);
  font-weight: 700;
  font-style: italic;

  @media screen and (max-width: 640px) {
    font-size: var(--font-size-h2);
  }

    @media screen and (max-width: 520px) {
    font-size: var(--font-size-h3);
  }
`;

export const MainSubtext = styled.div`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 30px rgba(0, 0, 0, 0.5);
  letter-spacing: -1px;
  line-height: 1.15;
`;

export const Cardheading = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 12px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.2px;
`;

export const MuseCarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  overflow: hidden;
  margin-bottom: 50px;
`;

export const Story = styled.div`
  font-size: clamp(0.92rem, 1.4vw, 1.05rem);
  color: rgba(255, 255, 255, 0.78);
  font-weight: 400;
  margin-block: 20px;
  max-width: 580px;
  text-align: center;
  line-height: 1.8;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
`;

export const HeroEyebrow = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;

  @media screen and (max-width: 640px) {
    font-size: 0.72rem;
    text-align: center;
  }
`;

export const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;
