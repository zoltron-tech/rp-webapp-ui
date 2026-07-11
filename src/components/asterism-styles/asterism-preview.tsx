import type { FC } from "react";
import styled from "styled-components";
import { ASTERISM_LINE_CSS } from "./line-css";
import type { AsterismStyleOption } from "./types";

const DISPLAY_SERIF = `"PlayfairDisplaySC", "BodoniModaSC", Georgia, serif`;

const Rule = styled.div<{ $variant: AsterismStyleOption["lineVariant"] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-secondary);
  user-select: none;

  &::before,
  &::after {
    content: "";
    height: 1px;
    width: 26px;
    ${(p) => ASTERISM_LINE_CSS[p.$variant]}
  }
  &::before {
    --dir: right;
  }
  &::after {
    --dir: left;
  }

  .glyph {
    font-family: ${DISPLAY_SERIF};
    font-size: 13px;
    opacity: 0.85;
  }
`;

const NoneRule = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  color: var(--text-secondary);
  opacity: 0.6;
  font-size: 13px;
`;

/**
 * Live rendering of a divider style — the exact glyph and rule treatment the
 * reader will show — so a style can be judged by eye rather than by name.
 */
export const AsterismPreview: FC<{ style: AsterismStyleOption }> = ({
  style,
}) =>
  style.glyph ? (
    <Rule $variant={style.lineVariant}>
      <span className="glyph">{style.glyph}</span>
    </Rule>
  ) : (
    <NoneRule>—</NoneRule>
  );
