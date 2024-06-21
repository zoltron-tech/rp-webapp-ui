import { DEV_MODE_BORDER, PILL } from "@/theme";
import styled from "styled-components";
import { Avatar as AvatarCommon } from "../common";

export const Avatar = styled(AvatarCommon)`
  &.rotate {
    transform: rotate(90deg);
  }
  &.paddington {
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const ExpandedContentInner = styled.div`
  ${PILL}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;

  ${DEV_MODE_BORDER("red")}
`;
