"use client";

import type { Prompt as PromptType } from "@nw/types";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Prompt } from "@/components/prompt";
import { usePageRouter } from "@/hooks/use-page-router";
import { getPromptAction } from "../actions";

const useGetPrompt = (promptId: string) => {
  const [prompt, setPrompt] = useState<PromptType | null>(null);
  const { baseDataLoader } = usePageRouter();

  const fetchPrompt = useCallback(async () => {
    const _prompt = await baseDataLoader(() => getPromptAction(promptId));
    setPrompt(_prompt);
  }, [promptId]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return { prompt, refetch: fetchPrompt };
};

export default function PromptPage({}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const promptId = params?.slug as string;
  const threadOpen = searchParams?.get("threadOpen") === "true";
  const { prompt } = useGetPrompt(promptId);

  if (!prompt) return <></>;

  return <Prompt prompt={prompt} threadOpen={threadOpen} />;
}
