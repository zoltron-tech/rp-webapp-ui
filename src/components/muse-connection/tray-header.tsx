"use client";

import type { ReactNode } from "react";
import * as S from "./styled";

type MuseConnectionTrayHeaderProps = {
  title: string;
  /** The circular action buttons (typically `S.TrayActionButton`s). */
  children: ReactNode;
};

/** Shared mobile-tray header — title on the left, circular cancel/confirm
 *  actions on the right — used by the muse-connection create/edit tray. */
export function MuseConnectionTrayHeader({
  title,
  children,
}: MuseConnectionTrayHeaderProps) {
  return (
    <S.TrayHeaderBar>
      <S.TrayTitle>{title}</S.TrayTitle>
      <S.TrayActions>{children}</S.TrayActions>
    </S.TrayHeaderBar>
  );
}
