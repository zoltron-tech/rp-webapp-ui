import styled from "styled-components";
import { setOpacity } from "@/utils/helpers";
import { CARD_BORDER } from "@/theme";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 100px;
  margin-top: 30px;
`;

export const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }) => setOpacity(theme.navbar, 0.3)};
  border-radius: 10px;
  padding: 20px;
  width: 400px;
  height: 400px;

  ${CARD_BORDER};

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
  margin-top: 30px;
  border-top: 1px solid dimgray;
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
