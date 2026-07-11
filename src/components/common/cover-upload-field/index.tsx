import type { FC } from "react";
import { HiOutlineCamera } from "react-icons/hi2";
import type { NWImage } from "@/types";
import * as S from "./styles";

type CoverUploadFieldProps = {
  src: string | null;
  nwImage?: NWImage | null;
  onClick: () => void;
};

/** 6:9 portrait cover picker, used for Storyboard and Storyboard Event
 *  avatars — mirrors AvatarUploadField's camera-overlay pattern. */
export const CoverUploadField: FC<CoverUploadFieldProps> = ({
  src,
  nwImage,
  onClick,
}) => {
  return (
    <S.Wrapper>
      <S.CoverButton type="button" aria-label="Change cover" onClick={onClick}>
        <S.Cover src={src} nwImage={nwImage} />
        <S.CameraOverlay>
          <HiOutlineCamera />
        </S.CameraOverlay>
      </S.CoverButton>
    </S.Wrapper>
  );
};

export default CoverUploadField;
