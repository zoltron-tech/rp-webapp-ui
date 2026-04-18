"use client";

import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";

export default function PostPromptPage() {
  return (
    <FullPagePromptInput
      type="prompt"
      dropdownSelection="ALL"
      initialSelection={undefined}
    />
  );
}
