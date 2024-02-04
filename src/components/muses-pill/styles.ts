import { AVATAR_IMAGE, DEV_MODE_BORDER, PILL, Z_INDEX } from "@/theme";
import styled from "styled-components";

export const Avatar = styled.div`
  ${AVATAR_IMAGE}
  width: var(--profile-small-avatar-size);
  height: var(--profile-small-avatar-size);
  z-index: ${Z_INDEX.AVATAR};
  margin-block: 5px;
  scroll-snap-align: center;
  box-shadow: none;
  cursor: pointer;

  &.rotate {
    transform: rotate(90deg);
  }

  & > img {
    width: var(--profile-small-avatar-size);
    height: var(--profile-small-avatar-size);
    object-fit: cover;
  }
`;

export const ExpandedContentInner = styled.div`
  ${PILL}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  width: calc(100cqw - 30px - mod(100cqw - 40px, 120px));

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
