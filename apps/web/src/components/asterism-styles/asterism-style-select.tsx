"use client";

import classNames from "classnames";
import { Select } from "radix-ui";
import type { FC } from "react";
import { IoChevronDown } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";
import { AsterismPreview } from "./asterism-preview";
import * as S from "./asterism-style-select.styles";
import {
  ASTERISM_STYLES,
  type AsterismStyle,
  resolveAsterismStyle,
} from "./index";

type Props = {
  id: string;
  label: string;
  value: AsterismStyle;
  onChange: (style: AsterismStyle) => void;
};

/**
 * Picks which decorative divider is used in the reader. Every option renders
 * a live preview of its actual glyph and rule — the same markup the reader
 * uses — so the style can be judged by eye while choosing, not just by name.
 */
export const AsterismStyleSelect: FC<Props> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const selected = resolveAsterismStyle(value);
  const theme = useGlobalState("theme");
  const accent = useGlobalState("accent");

  return (
    <S.Wrap>
      <S.Label htmlFor={id}>{label}</S.Label>
      <Select.Root
        value={value}
        onValueChange={(next) => onChange(next as AsterismStyle)}
      >
        <S.Trigger id={id} aria-label={label}>
          <AsterismPreview style={selected} />
          <S.TriggerLabel>{selected.label}</S.TriggerLabel>
          <Select.Icon asChild>
            <IoChevronDown size={12} />
          </Select.Icon>
        </S.Trigger>
        <Select.Portal>
          <S.Content
            position="popper"
            sideOffset={6}
            align="start"
            className={classNames(theme, accent)}
          >
            <S.Viewport>
              {ASTERISM_STYLES.map((style) => (
                <S.Item key={style.value} value={style.value}>
                  <S.ItemPreview>
                    <AsterismPreview style={style} />
                  </S.ItemPreview>
                  <S.ItemBody>
                    <S.ItemLabel>{style.label}</S.ItemLabel>
                    <S.ItemDescription>{style.description}</S.ItemDescription>
                  </S.ItemBody>
                </S.Item>
              ))}
            </S.Viewport>
          </S.Content>
        </Select.Portal>
      </Select.Root>
    </S.Wrap>
  );
};
