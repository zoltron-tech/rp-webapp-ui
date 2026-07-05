"use client";

import classNames from "classnames";
import { forwardRef } from "react";
import { FaUser } from "react-icons/fa6";
import QRCode from "react-qr-code";
import { NWLogoInner } from "@/components/common";
import type { CardDesignProps } from "../types";
import * as S from "./styles";

export const SquareCardDesign = forwardRef<HTMLDivElement, CardDesignProps>(
  (
    { muse, accent, novelistAccent, theme, coverSrc, entries, profileUrl },
    ref,
  ) => {
    // Same fallback chain as the profile page's card-background section:
    // custom card image (with its own crop) when set, else the muse image.
    const cardBgSrc =
      (muse.useExtraImages && muse.cardBackground?.src) || coverSrc;
    const cardCrop = muse.useExtraImages ? muse.cardBackground?.crop : null;
    const bgSize = cardCrop ? `${cardCrop.width}%` : undefined;
    const bgPosition = cardCrop ? `${cardCrop.x}% ${cardCrop.y}%` : undefined;
    const hasQuote = Boolean(muse.note?.trim());
    const avatarSrc = muse.avatar?.src || muse.image || "";

    return (
      <S.CardFrame
        ref={ref}
        className={classNames([novelistAccent, theme])}
        $accent={accent}
      >
        <S.Card>
          <S.TypeLabel>Character</S.TypeLabel>
          {muse.fandom && muse.fandom.id !== "FANDOMLESS" && (
            <S.FandomTag $color={muse.fandom.color}>
              {muse.fandom.name}
            </S.FandomTag>
          )}

          {/* Left — card background image, name/nicknames underneath */}
          <S.LeftColumn>
            <S.ImageBox
              $src={cardBgSrc}
              $bgSize={bgSize}
              $bgPosition={bgPosition}
            />

            <S.CaptionBlock $accent={accent}>
              <S.CharacterName>
                <S.CharacterNameLine>{muse.firstName}</S.CharacterNameLine>
                {muse.lastName && (
                  <S.CharacterNameLine>{muse.lastName}</S.CharacterNameLine>
                )}
              </S.CharacterName>
              <S.NicknamesList>
                {muse.nicknames && muse.nicknames.length > 0
                  ? muse.nicknames.join(" · ")
                  : "No other aliases"}
              </S.NicknamesList>
            </S.CaptionBlock>
          </S.LeftColumn>

          {/* Right — quote (or placeholder), penned-by, attribute chips, brand + QR */}
          <S.InfoColumn $accent={accent}>
            <S.QuoteBlock>
              {avatarSrc ? (
                <S.QuoteAvatar src={avatarSrc} alt={muse.firstName} />
              ) : (
                <S.QuoteAvatarFallback>
                  <FaUser size={18} />
                </S.QuoteAvatarFallback>
              )}
              <S.QuoteContainer>
                <S.QuoteText>
                  {hasQuote ? (
                    <>&ldquo;{muse.note}&rdquo;</>
                  ) : (
                    "Find me on Novelist World!"
                  )}
                </S.QuoteText>
              </S.QuoteContainer>
            </S.QuoteBlock>
            <S.Divider />

            <S.PennedByRow>
              <S.PennedByLabel>by</S.PennedByLabel>
              <S.PennedByUsername $accent={accent}>
                {muse.pennedBy?.image ? (
                  <S.PennedByAvatar
                    src={muse.pennedBy.image}
                    alt={muse.pennedBy.username}
                  />
                ) : (
                  <S.PennedByAvatarFallback>
                    <FaUser size={9} />
                  </S.PennedByAvatarFallback>
                )}
                {muse.pennedBy?.username}
              </S.PennedByUsername>
            </S.PennedByRow>

            <S.AttributesArea>
              {entries.length > 0 ? (
                <S.AttributesList>
                  {entries.map(([key, value]) => (
                    <S.AttributeChip key={key} $accent={accent}>
                      <S.AttributeKeyRow>
                        <S.AttributeDot $accent={accent} />
                        <S.AttributeKey>{key}</S.AttributeKey>
                      </S.AttributeKeyRow>
                      <S.AttributeValue>{value}</S.AttributeValue>
                    </S.AttributeChip>
                  ))}
                </S.AttributesList>
              ) : (
                <S.EmptyAttributes>
                  <S.EmptyAttributesText>
                    No details added
                  </S.EmptyAttributesText>
                </S.EmptyAttributes>
              )}
            </S.AttributesArea>

            <S.Divider />

            <S.BrandRow>
              <S.BrandLeft>
                <div
                  style={
                    accent
                      ? ({
                          "--accent": accent,
                          "--accent-hover": `color-mix(in srgb, ${accent} 80%, black)`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <NWLogoInner size={12} />
                </div>
                <S.BrandText>
                  <S.BrandName>Novelist</S.BrandName>
                  <S.BrandNameSuffix $accent={accent}> World</S.BrandNameSuffix>
                </S.BrandText>
              </S.BrandLeft>
              <S.QrWrapper>
                <QRCode value={profileUrl} size={26} level="M" />
              </S.QrWrapper>
            </S.BrandRow>
          </S.InfoColumn>
        </S.Card>
      </S.CardFrame>
    );
  },
);
SquareCardDesign.displayName = "SquareCardDesign";

export default SquareCardDesign;
