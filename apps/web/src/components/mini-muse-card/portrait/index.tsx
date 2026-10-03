"use client";

import classNames from "classnames";
import { forwardRef } from "react";
import QRCode from "react-qr-code";
import { NWLogoInner } from "@/components/common";
import type { CardDesignProps } from "../types";
import * as S from "./styles";

export const PortraitCardDesign = forwardRef<HTMLDivElement, CardDesignProps>(
  (
    {
      muse,
      accent,
      novelistAccent,
      theme,
      coverSrc,
      coverPosition,
      isPortrait,
      entries,
      profileUrl,
    },
    ref,
  ) => (
    <S.CardFrame
      ref={ref}
      className={classNames([novelistAccent, theme])}
      $accent={accent}
    >
      <S.Card>
        <S.CoverImage
          $src={coverSrc}
          $position={coverPosition}
          $isPortrait={isPortrait}
        >
          <S.CardTypeLabel>Character</S.CardTypeLabel>
          <S.CoverNameBlock>
            {muse.fandom && muse.fandom.id !== "FANDOMLESS" && (
              <S.FandomTag $color={muse.fandom.color}>
                {muse.fandom.name}
              </S.FandomTag>
            )}
            <S.CharacterName>
              {muse.firstName}
              {muse.lastName ? ` ${muse.lastName}` : ""}
            </S.CharacterName>
            {muse.nicknames && muse.nicknames.length > 0 && (
              <>
                <S.NicknamesList>{muse.nicknames.join(" · ")}</S.NicknamesList>
                <S.NicknamesDivider />
              </>
            )}
          </S.CoverNameBlock>
        </S.CoverImage>

        <S.Body>
          {entries.length > 0 ? (
            <S.AttributesGrid>
              {entries.map(([key, value]) => (
                <S.AttributeCard key={key} $accent={accent}>
                  <S.AttributeKey>{key}</S.AttributeKey>
                  <S.AttributeValue>{value}</S.AttributeValue>
                </S.AttributeCard>
              ))}
            </S.AttributesGrid>
          ) : (
            <S.EmptyAttributes>
              <S.EmptyAttributesIcon>✶</S.EmptyAttributesIcon>
              <S.EmptyAttributesText>No details added</S.EmptyAttributesText>
            </S.EmptyAttributes>
          )}
        </S.Body>

        <S.Divider />

        <S.PennedByRow>
          <S.PennedByLabel>Penned by</S.PennedByLabel>
          <S.PennedByUsername $accent={accent}>
            {muse.pennedBy?.image && (
              <S.PennedByAvatar
                src={muse.pennedBy.image}
                alt={muse.pennedBy.username}
              />
            )}
            {muse.pennedBy?.username}
          </S.PennedByUsername>
        </S.PennedByRow>

        <S.BrandBar>
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
              <NWLogoInner size={16} />
            </div>
            <S.BrandText>
              <S.BrandName>Novelist</S.BrandName>
              <S.BrandNameSuffix $accent={accent}> World</S.BrandNameSuffix>
            </S.BrandText>
          </S.BrandLeft>
          <S.QrWrapper>
            <QRCode value={profileUrl} size={36} level="M" />
          </S.QrWrapper>
        </S.BrandBar>
      </S.Card>
    </S.CardFrame>
  ),
);
PortraitCardDesign.displayName = "PortraitCardDesign";

export default PortraitCardDesign;
