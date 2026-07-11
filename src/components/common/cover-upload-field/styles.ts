import styled from "styled-components";
import { STORY_COVER_ASPECT_RATIO } from "@/utils/constants/common";
import { CoverImage } from "../cover-image";

/** 6:9 portrait cover, matching the ratio used for Storyboard/Event avatars. */
export const Cover = styled(CoverImage)`
  width: 100%;
  height: 100%;
`;

/** Width is fixed; height derives from STORY_COVER_ASPECT_RATIO via CSS
 *  `aspect-ratio` so this can never drift from the crop dialog's ratio. */
export const Wrapper = styled.div`
  position: relative;
  width: 140px;
  aspect-ratio: ${STORY_COVER_ASPECT_RATIO};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid var(--bg-6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);

  @media (max-width: 600px) {
    width: 110px;
  }

  @media (max-width: 480px) {
    width: 92px;
  }
`;

export const CameraOverlay = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 2;
  pointer-events: none;

  svg {
    width: 15px;
    height: 15px;
  }

  @media (max-width: 480px) {
    width: 26px;
    height: 26px;
    bottom: 6px;
    right: 6px;
    border-width: 2px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export const CoverButton = styled.button`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;
