"use client";

import type { Prompt as PromptType } from "@nw/types";
import { useParams, useSearchParams } from "@/lib/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeletedContent } from "@/components/deleted-content";
import { Prompt } from "@/components/prompt";
import { usePageRouter } from "@/hooks/use-page-router";
import { getPromptAction } from "../actions";

/* The action returns null for a prompt that is gone and a `message` payload
 * for anything else that went wrong, so the fetch is run directly rather than
 * through `baseDataLoader`, which collapses both to null — the deleted case has
 * to stay distinguishable to show the torn-page scene. */
const useGetPrompt = (promptId: string) => {
  const [prompt, setPrompt] = useState<PromptType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { stopPageLoading } = usePageRouter();

  const fetchPrompt = useCallback(async () => {
    setNotFound(false);
    const _prompt = await getPromptAction(promptId);
    stopPageLoading();

    if (_prompt === null) {
      setNotFound(true);
      return;
    }

    if ("message" in _prompt) return;

    setPrompt(_prompt);
  }, [promptId, stopPageLoading]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return { notFound, prompt, refetch: fetchPrompt };
};

export default function PromptPage({}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const promptId = params?.slug as string;
  const threadOpen = searchParams?.get("threadOpen") === "true";
  const { notFound, prompt } = useGetPrompt(promptId);

  if (notFound) return <DeletedContent label="Prompt" />;

  if (!prompt) return null;

  return <Prompt prompt={prompt} threadOpen={threadOpen} />;
}
