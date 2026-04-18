"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";
import type { SubmitPromptType } from "@/types";

function ComposePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = (searchParams?.get("type") ?? "prompt") as SubmitPromptType;
  const parentId = searchParams?.get("parentId") ?? undefined;
  const dropdownSelection = (searchParams?.get("dropdownSelection") ?? "ALL") as
    | "NOVELIST"
    | "MUSE"
    | "ALL";

  return (
    <FullPagePromptInput
      type={type}
      parentId={parentId}
      dropdownSelection={dropdownSelection}
      onBack={() => router.back()}
      onSend={() => router.back()}
    />
  );
}

export default function ComposePage() {
  return (
    <Suspense>
      <ComposePageInner />
    </Suspense>
  );
}
