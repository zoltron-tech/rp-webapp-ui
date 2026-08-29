"use client";

import type React from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";

type PennedByType =
  | { username?: string; profileUrl?: string; image?: string }
  | null
  | undefined;

export default function PennedBy({
  pennedBy,
  accent,
  textColor,
}: {
  pennedBy: PennedByType;
  accent?: string | null;
  /** Advanced appearance override; falls back to the default text colours. */
  textColor?: string | null;
}) {
  const { routeToPage } = usePageRouter();

  if (!pennedBy?.username) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (pennedBy.profileUrl) {
      window.location.href = pennedBy.profileUrl;
      return;
    }
    routeToPage(ROUTES.Profile.View(pennedBy.username || "").Index);
  };

  return (
    <S.PennedByRow $textColor={textColor ?? null}>
      <span>Penned by</span>
      <S.PennedByChip
        accent={accent ?? null}
        $textColor={textColor ?? null}
        onClick={handleClick}
      >
        <S.PennedByMiniAvatar $src={pennedBy.image ?? undefined} />
        <S.PennedByName
          title={pennedBy.username}
          $textColor={textColor ?? null}
        >
          {pennedBy.username}
        </S.PennedByName>
      </S.PennedByChip>
    </S.PennedByRow>
  );
}
