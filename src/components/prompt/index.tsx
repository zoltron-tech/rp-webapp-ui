"use client";

import { Prompt as PromptType } from "@/types";
import { FC, HTMLProps } from "react";
import { PromptContent } from "./prompt-content";
import { Separator } from "radix-ui";
import { StoreProvider } from "@/context/store/context";
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
