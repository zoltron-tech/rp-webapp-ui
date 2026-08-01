"use client";

import type { FC } from "react";
import {
  PAGE_FORMATS,
  type PageFormat,
  resolvePageSpec,
} from "@/lib/paginator";
import * as S from "./page-format-picker.styles";

type Props = {
  value: PageFormat;
  onChange: (format: PageFormat) => void;
};

/**
 * Picks the page geometry the book layout paginates against. The format lives
 * on the story rather than on the reader, so every co-author sees their words
 * fall on the same pages. Each option draws a proportional page thumbnail —
 * the shape is the whole point, so it is judged by eye.
 */
export const PageFormatPicker: FC<Props> = ({ value, onChange }) => {
  const selected = resolvePageSpec(value).value;

  return (
    <S.Grid aria-label="Page format">
      {PAGE_FORMATS.map((spec) => (
        <S.Option
          key={spec.value}
          type="button"
          aria-pressed={selected === spec.value}
          $active={selected === spec.value}
          onClick={() => onChange(spec.value)}
        >
          <S.Thumb $ratio={spec.width / spec.height} aria-hidden>
            {/* Ruled lines standing in for the text block. */}
            <S.ThumbLines
              style={{
                inset: `${(spec.padY / spec.height) * 100}% ${
                  (spec.padX / spec.width) * 100
                }%`,
              }}
            />
          </S.Thumb>
          <S.OptionBody>
            <S.OptionLabel>{spec.label}</S.OptionLabel>
            <S.OptionDescription>{spec.description}</S.OptionDescription>
          </S.OptionBody>
        </S.Option>
      ))}
    </S.Grid>
  );
};
