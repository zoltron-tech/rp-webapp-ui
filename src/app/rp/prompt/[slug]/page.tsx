"use client";

import { PageLoader } from "@/components/layout";
import { Prompt as PromptType } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getPromptAction } from "../actions";

import { Prompt } from "@/components/prompt";

const useGetPrompt = (promptId: string) => {
  const [prompt, setPrompt] = useState<PromptType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    const _prompt = await getPromptAction(promptId);

    if (!_prompt || "message" in _prompt) {
      setLoading(false);
      return;
    }
    setPrompt(_prompt);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  return { prompt, loading, refetch: fetchPrompt };
};

export default function PromptPage({}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const promptId = params?.slug as string;
  const threadOpen = searchParams?.get("threadOpen") === "true";

  const { prompt, loading } = useGetPrompt(promptId);

  if (!prompt || loading) return <PageLoader />;

  return (
    <>
      <Prompt prompt={prompt} threadOpen={threadOpen} />
    </>
  );
}
