import type { FC } from "react";
import logoText from "@/assets/images/Logo text.png";
import * as S from "./styles";

interface Props {
  /** Explicit pixel size. When omitted the inner fills its parent (top-bar behaviour). */
  size?: number;
  className?: string;
}

export const NWLogoInner: FC<Props> = ({ size, className }) => (
  <S.Inner $size={size} className={className}>
    <S.Img src={logoText.src} alt="NW" />
  </S.Inner>
);
