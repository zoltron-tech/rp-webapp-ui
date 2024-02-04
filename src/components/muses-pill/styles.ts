import { AVATAR_IMAGE, Z_INDEX } from "@/theme";
import styled from "styled-components";

export const Avatar = styled.div`
  ${AVATAR_IMAGE}
  width: var(--profile-small-avatar-size);
  height: var(--profile-small-avatar-size);
  z-index: ${Z_INDEX.AVATAR};
  transform: rotate(90deg);
  margin-block: 5px;
  scroll-snap-align: center;
  box-shadow: none;
  cursor: pointer;

  & > img {
    width: var(--profile-small-avatar-size);
    height: var(--profile-small-avatar-size);
    object-fit: cover;
  }
`;
