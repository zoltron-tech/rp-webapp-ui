import { Flex } from "@novelist-world/ui";
import styled from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";

export const VideoContainer = styled.div`
  padding: 0px;
  border-radius: 0px;
`;

export const RowFlex = styled(Flex)`
  padding-inline: 20px;
`;

export const Video = styled.video`
  width: 100%;
  height: 300px;
  object-fit: contain;
  background-color: black;
  cursor: pointer;

  @container content-container (max-width: 800px) {
    & {
      height: 215px;
    }
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 200px;
  min-width: 200px;
  min-height: 350px;
  height: 350px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};
  background-color: ${({ theme }: any) => theme.background};
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container content-container (max-width: 800px) {
    & {
      width: 134px;
      height: 250px;
      min-width: 134px;
      min-height: 250px;
    }
  }
`;

export const Avatar = styled(Common.Avatar)`
  margin-block: 10px;
  --size: 30px;
  @container (max-width: 180px) {
    & {
      margin-block: 5px;
      --size: 25px;
    }
  }
`;

export const VideoAutherName = styled.div`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 300;
  margin-left: 20px;
  font-style: italic;
  text-align: center;

  @container (max-width: 180px) {
    & {
      font-size: 10px;
    }
  }
`;
