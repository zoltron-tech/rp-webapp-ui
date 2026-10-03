"use client";

import type { Prompt as PromptType } from "@nw/types";
import type { FC, HTMLProps } from "react";
import { StoreProvider } from "@/context/store/context";
import { PromptContent } from "./prompt-content";
import { PromptHeader } from "./prompt-header";
import { PromptThreads } from "./prompt-threads";

import * as S from "./styled";

type PromptProps = HTMLProps<HTMLElement> & {
  prompt: PromptType;
  threadOpen?: boolean;
  $noBorder?: boolean;
};

export const Prompt: FC<PromptProps> = ({
  prompt,
  threadOpen = false,
  $noBorder,
  ...props
}) => {
  return (
    <StoreProvider storeId="prompt" initial={{ ...prompt, threadOpen }}>
      <S.PromptRoot $noBorder={$noBorder} {...props}>
        <PromptHeader />
        <PromptContent />
        <PromptThreads />
      </S.PromptRoot>
    </StoreProvider>
  );
};
