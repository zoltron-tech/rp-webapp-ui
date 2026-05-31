"use client";

import type { Muse } from "@/types";
import * as S from "../styles";

type Props = {
  muse: Muse | null;
  cardBgSrc: string;
};

export function CardImageSection({ muse, cardBgSrc }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;

  const cardCrop = muse?.useExtraImages ? muse?.cardBackground?.crop : null;
  const bgSize = cardCrop ? `${cardCrop.width}%` : undefined;
  const bgPosition = cardCrop ? `${cardCrop.x}% ${cardCrop.y}%` : undefined;

  return (
    <S.CardExpandedWrapper>
      <S.CardMainBack className="muse-card" accent={accent}>
        <S.ImageWrapper>
          <S.CardBackground
            banner={cardBgSrc}
            $bgSize={bgSize}
            $bgPosition={bgPosition}
          />
        </S.ImageWrapper>
      </S.CardMainBack>
    </S.CardExpandedWrapper>
  );
}
