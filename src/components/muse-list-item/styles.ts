import { styled } from "styled-components";
import { Container, Flex } from "@novelist-world/ui";
import { DEV_MODE_BORDER } from "@/theme";

export const MuseContainer = styled(Container)`
  ${DEV_MODE_BORDER("blue")}
  width: 95%;
  align-items: flex-start;
  padding-block: 5px;
  background-color: var(--bg-3);

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  }
`;

export const MuseName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }: any) => theme.text};

  @container (max-width: 400px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 300px) {
    & {
      font-size: 10px;
      text-align: end;
    }
  }

  @container (max-width: 200px) {
    font-size: 8px;
    text-align: center;
    width: calc(100% - 30px);
    & .muse-last-name {
      display: none;
    }
  }
`;
