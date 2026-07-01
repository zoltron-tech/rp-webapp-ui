"use client";

import type React from "react";
import type { Muse } from "@/types";
import * as S from "../styles";
import PennedBy from "./PennedBy";

type Props = {
  muse: Muse | null;
  accent?: string | null;
};

export default function SectionMiniHeader({ muse, accent }: Props) {
  // routing for penned-by is handled by the PennedBy component
  const avatarSrc = muse?.avatar?.src || muse?.image || "";

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
        <S.SectionMiniName>
          {muse?.firstName} {muse?.lastName}
        </S.SectionMiniName>

        <PennedBy pennedBy={muse?.pennedBy} accent={accent ?? null} />
      </div>
    </S.SectionMiniHeader>
  );
}
