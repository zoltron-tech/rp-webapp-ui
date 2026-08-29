"use client";

import type { Muse } from "@nw/types";
import type React from "react";
import { getMuseAppearance } from "../appearance";
import * as S from "../styles";
import PennedBy from "./PennedBy";

type Props = {
  muse: Muse | null;
  accent?: string | null;
};

export default function SectionMiniHeader({ muse, accent }: Props) {
  // routing for penned-by is handled by the PennedBy component
  const avatarSrc = muse?.avatar?.src || muse?.image || "";
  const { nameColor, pennedByColor } = getMuseAppearance(muse);

  if (!muse) {
    return (
      <S.SectionMiniHeader>
        <S.ShimmerCircle $size="82px" />
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          <S.ShimmerLine $width="120px" $height="14px" />
          <S.ShimmerLine $width="80px" $height="10px" />
        </div>
      </S.SectionMiniHeader>
    );
  }

  return (
    <S.SectionMiniHeader>
      <S.InfoCardAvatar $src={avatarSrc}>
        {avatarSrc && (
          // biome-ignore lint/a11y/useAltText: hidden probe only
          <img src={avatarSrc} style={{ display: "none" }} />
        )}
      </S.InfoCardAvatar>

      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <S.SectionMiniName $textColor={nameColor}>
          {muse?.firstName} {muse?.lastName}
        </S.SectionMiniName>

        <PennedBy
          pennedBy={muse?.pennedBy}
          accent={accent ?? null}
          textColor={pennedByColor}
        />
      </div>
    </S.SectionMiniHeader>
  );
}
