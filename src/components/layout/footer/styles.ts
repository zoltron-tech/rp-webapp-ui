import { setOpacity } from "@/utils/helpers";
import { styled } from "styled-components";

export const FooterContainer = styled.footer`
  --footer-height: 2rem;

  font-size: 14px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  height: var(--footer-height);

  background-color: ${({ theme }) =>
    setOpacity(theme.pillExpandedContentBackground, 0.5)};

  container-name: footer;
  container-type: size;

  @container (max-width: 800px) {
    & {
      font-size: 6px;
      --footer-height: 1.5rem;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 5px;
      --footer-height: 1rem;
    }
  }

  @container (max-width: 380px) {
    & {
      font-size: 4px;
      --footer-height: 0.5rem;
    }
  }
`;
