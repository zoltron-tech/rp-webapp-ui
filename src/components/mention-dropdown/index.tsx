"use client";

import type React from "react";
import type { MentionDataItem } from "@/types";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styled";

export interface MentionDropdownProps {
  items: MentionDataItem[];
  focusedIndex: number;
  isLoading?: boolean;
  onSelect: (item: MentionDataItem) => void;
  onHover?: (index: number) => void;
  showType?: boolean;
  emptyMessage?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  items,
  focusedIndex,
  isLoading,
  onSelect,
  onHover,
  showType,
  emptyMessage = "No results found",
  style,
  className,
}) => {
  return (
    <S.Dropdown style={style} className={className}>
      {isLoading ? (
        <S.LoadingWrapper>
          <S.Spinner />
        </S.LoadingWrapper>
      ) : items.length > 0 ? (
        items.map((item, index) => (
          <S.Item
            key={item.id}
            type="button"
            $focused={index === focusedIndex}
            onMouseEnter={() => onHover?.(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
          >
            <AvatarNew src={item.image} alt={item.displayName} />
            <S.Name>{item.displayName}</S.Name>
            {showType && (
              <S.Type>{item.type === "NOVELIST" ? "Novelist" : "Muse"}</S.Type>
            )}
          </S.Item>
        ))
      ) : (
        <S.Empty>{emptyMessage}</S.Empty>
      )}
    </S.Dropdown>
  );
};
