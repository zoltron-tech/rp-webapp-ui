"use client";

import { Separator } from "radix-ui";
import type { FC, HTMLProps } from "react";
import { StoreProvider } from "@/context/store/context";
import type { Prompt as PromptType } from "@/types";
import { PromptContent } from "./prompt-content";
import { PromptHeader } from "./prompt-header";
import { PromptThreads } from "./prompt-threads";

import * as S from "./styled";

type PromptProps = HTMLProps<HTMLElement> & {
  prompt: PromptType;
  threadOpen?: boolean;
};

export const Prompt: FC<PromptProps> = ({
  prompt,
  threadOpen = false,
  ...props
}) => {
  return (
    <StoreProvider storeId="prompt" initial={{ ...prompt, threadOpen }}>
      <S.PromptRoot {...props}>
        <PromptHeader />
        <Separator.Root className="separator" orientation="horizontal" />
        <PromptContent />
        <PromptThreads />
      </S.PromptRoot>
    </StoreProvider>
  );
};
