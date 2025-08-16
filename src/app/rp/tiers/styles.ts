import { Button, Container } from "@novelist-world/ui";
import { styled } from "styled-components";
import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";

export const MainContainer = styled.div`
  max-width: 100vw;
  overflow-x: auto;
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 100px;
  padding-inline: 100px;
  gap: 1em;

  @container (max-width: 1400px) {
    & {
      flex-direction: column;
    }
  }
`;

export const Badge = styled.div<{ tier: string }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  width: 40px;
  height: 40px;
  background-image: ${({ tier }) => {
    switch (tier.toLowerCase()) {
      case "silver":
        return "linear-gradient(135deg, #3a3f47, #d0d5df)"; // darker start, lighter end for Silver
      case "gold":
        return "linear-gradient(135deg, #3a2000, #ffd700)"; // darker brown to bright gold for Gold
      case "premium":
        return "linear-gradient(135deg, #002d1a, #7fffd4)"; // darker green to bright aqua for Premium
      default:
        return "none"; // default to transparent or no gradient
    }
  }};

  border-radius: 60%;
  z-index: ${Z_INDEX.MODAL};

  & svg {
    &.letter {
      color: ${({ tier }) => {
        switch (tier.toLowerCase()) {
          case "silver":
            return "#3a3f37"; // silver color for Silver
          case "gold":
            return "#4a3500"; // gold color for Gold
          case "premium":
            return "#002d1a"; // indigo for Premium
          default:
            return "#000"; // default black
        }
      }};
    }
    position: absolute;
    width: 40px;
    height: 40px;
    transition: transform 0.2s ease;
    color: ${({ tier }) => {
      switch (tier.toLowerCase()) {
        case "standard":
          return "#5a7bad"; // light gray for Standard
        case "silver":
          return "#d8e2f2"; // silver color for Silver
        case "gold":
          return "#dea702"; // gold color for Gold
        case "premium":
          return "#7fffd4"; // indigo for Premium
        default:
          return "#000"; // default black
      }
    }};
  }
`;

export const StandardInfoCardBorder = styled(Container)`
  background-color: transparent;
  padding: 1px !important;
  border-radius: 15px !important;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  border: none;
`;

export const SilverInfoCardBorder = styled(Container)`
  background: linear-gradient(135deg, #3a3f47, #d0d5df);
  padding: 2px !important;
  border-radius: 15px !important;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const GoldInfoCardBorder = styled(Container)`
  background: linear-gradient(135deg, #3a2000, #ffd700);
  padding: 2px !important;
  border-radius: 15px !important;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const PremiumInfoCardBorder = styled(Container)`
  background: linear-gradient(135deg, #002d1a, #7fffd4);
  padding: 2px !important;
  border-radius: 15px !important;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
`;

export const InfoCard = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }: any) =>
    setOpacity(theme.navbar, 0.95)} !important;
  padding: 30px;
  cursor: default !important;
  border: none;

  @-moz-document url-prefix() {
    backdrop-filter: none !important;
  }

  width: 400px;
  height: 500px;

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 450px;
    }
  }
`;

export const MainSubtext = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  text-align: center;
`;

export const InfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  word-break: break-word;
  margin-top: 50px;
  gap: 0.5rem;
`;

export const Divider = styled.div`
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  width: inherit;
  padding-block: 20px;
  border-bottom: 1px solid dimgray;
`;

export const InfoItem = styled.div`
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  width: inherit;
  font-size: 16px;
  padding-inline: 20px;

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }
`;

export const InfoLabel = styled.span`
  width: 70%;
  text-align: start;
  vertical-align: middle;
`;

export const InfoValue = styled.span`
  width: 30%;
  text-align: end;
  vertical-align: middle;
`;

export const PositiveInfoValue = styled(InfoValue)`
  width: 30%;
  font-weight: 800;
  color: green;
`;

export const NegtiveInfoValue = styled(InfoValue)`
  width: 30%;
  font-weight: 800;
  color: ${({ theme }: any) => theme.error};
`;

export const FormButton = styled(Button)`
  margin-top: 40px;
  border-radius: 5px;
  height: 50px;
  margin-bottom: 0px;
`;
