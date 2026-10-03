"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Tag } from "@nw/types/common";
import type { FC } from "react";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  tags?: Tag[];
};

export const TagsContainer: FC<Props> = ({ tags, className, ...rest }) => {
  return (
    <ShouldRender if={tags?.length !== undefined && tags?.length > 0}>
      <S.TagContainer className={className} {...rest}>
        {tags?.map((tag) => (
          <S.TagValue key={tag.id} color={tag.color || "red"}>
            {tag.label}
          </S.TagValue>
        ))}
      </S.TagContainer>
    </ShouldRender>
  );
};
