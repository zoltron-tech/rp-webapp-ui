"use client";

import type { SubmitPromptType } from "@nw/types";
import { useNavigate } from "@/lib/navigation";
import { useSearchParams } from "@/lib/navigation";
import { Suspense } from "react";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";

function ComposePageInner() {
  const navigate = useNavigate();
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
      onBack={() => navigate(-1)}
      onSend={() => navigate(-1)}
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
