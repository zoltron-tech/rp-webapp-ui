"use client";

import type { ReactNode } from "react";
import * as S from "./styles";

type IceBreakerTrayHeaderProps = {
  title: string;
  /** The circular action buttons (typically `S.IceBreakerTrayActionButton`s). */
  children: ReactNode;
};

/** Shared mobile-tray header — title on the left, circular cancel/confirm
 *  (or just close) actions on the right — used by both the create-ice-breaker
 *  tray and the view/reply-ice-breaker tray. */
export function IceBreakerTrayHeader({
  title,
  children,
}: IceBreakerTrayHeaderProps) {
  return (
    <S.IceBreakerTrayHeaderBar>
      <S.IceBreakerTrayTitle>{title}</S.IceBreakerTrayTitle>
      <S.IceBreakerTrayActions>{children}</S.IceBreakerTrayActions>
    </S.IceBreakerTrayHeaderBar>
  );
}
