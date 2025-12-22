import { Button, Container } from "@novelist-world/ui";
import styled from "styled-components";
import { setOpacity } from "@/utils/helpers";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 50px;
  margin-top: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid dimgray;
  background-image: url(https://cli.github.com/assets/images/light-glow.svg);
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
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }: any) =>
    setOpacity(theme.navbar, 0.3)} !important;
  cursor: default !important;

  @-moz-document url-prefix() {
    backdrop-filter: none !important;
  }

  width: 400px;
  height: 400px;

  @container (max-width: 1000px) {
    & {
      padding: 15px;
      width: 300px;
      height: 300px;
    }
  }

  @container (max-width: 600px) {
    & {
      padding: 10px;
      width: 250px;
      height: 250px;
    }
  }
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 60px;
  margin-bottom: 100px;
  gap: 20px;

  @container (max-width: 800px) {
    & {
      flex-direction: column;
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
  margin-block: 30px;
  gap: 2rem;
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
  margin-left: 5px;
  text-transform: uppercase;
  font-size: var(--font-size-h4);
  font-weight: 600;
  font-style: italic;
  margin-bottom: 30px;
  text-align: center;

  @media screen and (max-width: 640px) {
    font-size: var(--font-size-h5);
  }

    @media screen and (max-width: 520px) {
    font-size: var(--font-size-h6);
  }
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
  margin-left: 5px;
  text-transform: uppercase;
  font-size: var(--font-size-h6);
  font-weight: 300;
  font-style: italic;
  margin-block: 30px;

  @media screen and (max-width: 640px) {
    font-size: var(--font-size);
  }

    @media screen and (max-width: 520px) {
    font-size: var(--font-size-small);
  }
`;
