"use client";

import { FiCamera } from "react-icons/fi";
import type { Muse } from "@/types";
import * as S from "../styles";

type Props = {
  muse: Muse | null;
  cardBgSrc: string;
  isOwnMuse?: boolean;
  cardBgSaving?: boolean;
  onEditCardBg?: () => void;
  onRemoveCardBg?: () => void;
};

export function CardImageSection({ muse, cardBgSrc, isOwnMuse, cardBgSaving, onEditCardBg, onRemoveCardBg }: Props) {
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
        {isOwnMuse && (
          <>
            <S.CardBgEditBtn
              type="button"
              title={cardBgSaving ? "Saving…" : muse?.cardBackground ? "Adjust card image" : "Add card image"}
              disabled={cardBgSaving}
              onClick={onEditCardBg}
            >
              {cardBgSaving ? <span style={{ fontSize: "0.45rem" }}>…</span> : <FiCamera size={12} />}
            </S.CardBgEditBtn>
            {muse?.cardBackground && (
              <S.CardBgRemoveBtn
                className="card-bg-remove"
                type="button"
                title="Remove card image"
                onClick={onRemoveCardBg}
              >
                ×
              </S.CardBgRemoveBtn>
            )}
          </>
        )}
      </S.CardMainBack>
    </S.CardExpandedWrapper>
  );
}
