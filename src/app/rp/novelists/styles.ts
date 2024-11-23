import styled from "styled-components";
import { setOpacity } from "@/utils/helpers";
import { Button, Container } from "@novelist-world/ui";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 100px;
  margin-top: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid dimgray;
  background-image: url(https://cli.github.com/assets/images/light-glow.svg);
`;

export const MainButton = styled(Button)`
  height: 50px;
  width: 15cqw;
  min-width: 150px;
  border-radius: 5px;
`;

export const InfoCard = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }) => setOpacity(theme.navbar, 0.3)} !important;
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
  background-color: ${({ theme }) => setOpacity(theme.navbar, 0.6)};
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
  font-size: 100px;
  font-weight: 700;
  font-style: italic;

  @container (max-width: 1000px) {
    & {
      font-size: 70px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 50px;
    }
  }
`;

export const MainSubtext = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  margin-bottom: 30px;
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
  font-size: 18px;
  font-weight: 300;
  font-style: italic;
  margin-block: 30px;

  @container (max-width: 1000px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }
`;
