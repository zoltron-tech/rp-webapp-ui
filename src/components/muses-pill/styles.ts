import { DEV_MODE_BORDER, PILL } from "@/theme";
import styled from "styled-components";
import { Avatar as AvatarCommon } from "../common";

export const Avatar = styled(AvatarCommon)`
  &.rotate {
    transform: rotate(90deg);
  }
`;

export const ExpandedContentInner = styled.div`
  ${PILL}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  width: 90cqw;

  ${DEV_MODE_BORDER("red")}
`;

export const ExpandedContentInnerItem = styled.div`
  width: 100px;
  height: 100px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${DEV_MODE_BORDER("blue")}
`;
