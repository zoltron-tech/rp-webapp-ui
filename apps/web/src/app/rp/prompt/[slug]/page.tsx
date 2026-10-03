"use client";

import type { Prompt as PromptType } from "@nw/types";
import { useParams, useSearchParams } from "@/lib/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeletedThreadArt } from "@/components/book-art";
import { MissingPage } from "@/components/deleted-content/missing-page";
import { Prompt } from "@/components/prompt";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
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
  const { routeToPage } = usePageRouter();

  if (notFound) {
    return (
      <MissingPage
        art={<DeletedThreadArt />}
        title="This prompt missed its cue"
        message="It was meant to enter stage left. Instead it left the stage, the building, and quite possibly the genre."
        aside="(Or the link is wrong. Prompts rarely leave a forwarding address.)"
        actionLabel="Find a prompt that showed up"
        onAction={() => routeToPage(ROUTES.explorePrompts)}
      />
    );
  }

  if (!prompt) return null;

  return <Prompt prompt={prompt} threadOpen={threadOpen} />;
}
