import classNames from "classnames";
import type { FC, HTMLProps } from "react";
import { HiOutlineBookOpen } from "react-icons/hi2";
import type { NWImage } from "@/types";
import { STORY_COVER_ZOOM_MAX } from "@/utils/constants/common";
import * as S from "./styled";

type CoverImageProps = Omit<HTMLProps<HTMLDivElement>, "src"> & {
  src: string | null;
  /** When provided (with valid crop data), renders using the same
   *  background-position/size model as the avatar crop dialog, so the cover
   *  reproduces the exact adjustment made in the editor at any frame size. */
  nwImage?: NWImage | null;
};

/**
 * Rectangular cover renderer for Storyboards and Storyboard Events — sized
 * and positioned entirely by the consumer's className/wrapper (typically at
 * a 6:9 ratio). Falls back to a plain cover-fit background when no crop data
 * is present, and to an empty-state icon when there's no image at all.
 */
export const CoverImage: FC<CoverImageProps> = ({
  src,
  nwImage,
  className,
  ...rest
}) => {
  const crop = nwImage?.crop;
  const hasCrop =
    crop && crop.width > 0 && crop.width <= STORY_COVER_ZOOM_MAX * 100;
  const effectiveSrc = nwImage?.src || src || "";

  return (
    <S.Frame className={classNames("cover-image", className)} {...rest}>
      {effectiveSrc ? (
        hasCrop ? (
          <S.CroppedCover
            $src={effectiveSrc}
            $x={crop.x}
            $y={crop.y}
            $scale={crop.width / 100}
          />
        ) : (
          <S.PlainCover $src={effectiveSrc} />
        )
      ) : (
        <S.EmptyState>
          <HiOutlineBookOpen />
        </S.EmptyState>
      )}
    </S.Frame>
  );
};

export default CoverImage;
