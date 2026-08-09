import { styled } from "styled-components";
import { Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

export const CardWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.CARD};

  /* media, not container query: page-container is no longer a container
     (see rp/styles.ts) and it was viewport-wide anyway. */
  @media (max-width: 600px) {
    & {
      width: 44px;
      height: 44px;
    }
  }
`;

export const Avatar = styled(AvatarNew)`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;
