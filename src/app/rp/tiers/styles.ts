import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import { Button, Container } from "@novelist-world/ui";
import { styled } from "styled-components";

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 60px;
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
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  width: 30px;
  height: 30px;
  background-color: transparent;
  background-color: ${({ tier }) => {
    switch (tier.toLowerCase()) {
      case "silver":
        return "#8c94a1"; // silver color for Silver
      case "gold":
        return "#8c6900"; // gold color for Gold
      case "premium":
        return "#dea702"; // indigo for Premium
      default:
        return "transparent"; // default black
    }
  }};
  border-radius: 60%;
  cursor: pointer;
  z-index: ${Z_INDEX.MODAL};

  &:hover {
    & svg {
      transform: scale(1.2); /* Scale SVG on hover */
    }
  }

  & svg {
    width: 30px;
    height: 30px;
    transition: transform 0.2s ease; /* Smooth scaling transition on both hover and unhover */

    color: ${({ tier }) => {
      switch (tier.toLowerCase()) {
        case "standard":
          return "#5a7bad"; // light gray for Standard
        case "silver":
          return "#d8e2f2"; // silver color for Silver
        case "gold":
          return "#dea702"; // gold color for Gold
        case "premium":
          return "#000"; // indigo for Premium
        default:
          return "#000"; // default black
      }
    }};
  }
`;

export const InfoCard = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }) => setOpacity(theme.navbar, 0.3)} !important;
  padding: 30px;
  cursor: default !important;
  border: 1px solid dimgray;

  @-moz-document url-prefix() {
    backdrop-filter: none !important;
  }

  width: 400px;
  height: 500px;

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 400px;
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

export const FormButton = styled(Button)`
  margin-top: 40px;
  border-radius: 10px;
`;
