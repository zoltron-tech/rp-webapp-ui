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
}: {
  pennedBy: PennedByType;
  accent?: string | null;
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
    <S.PennedByRow>
      <span>Penned by</span>
      <S.PennedByChip accent={accent ?? null} onClick={handleClick}>
        <S.PennedByMiniAvatar $src={pennedBy.image ?? undefined} />
        <S.PennedByName title={pennedBy.username}>
          {pennedBy.username}
        </S.PennedByName>
      </S.PennedByChip>
    </S.PennedByRow>
  );
}
