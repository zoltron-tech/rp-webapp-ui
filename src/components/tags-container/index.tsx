"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { FC } from "react";
import type { Tag } from "@/types/common";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  tags?: Tag[];
};

export const TagsContainer: FC<Props> = ({ tags, className, ...rest }) => {
  return (
    <ShouldRender if={tags?.length !== undefined && tags?.length > 0}>
      <S.TagContainer>
        {tags?.map((tag) => (
          <S.TagValue key={tag.id} color={tag.color || "red"}>
            {tag.label}
          </S.TagValue>
        ))}
      </S.TagContainer>
    </ShouldRender>
  );
};
