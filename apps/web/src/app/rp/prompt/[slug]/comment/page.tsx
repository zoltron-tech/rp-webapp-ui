"use client";

import type { PromptSource, Prompt as PromptType } from "@nw/types";
import { useNavigate } from "@/lib/navigation";
import { useParams, useSearchParams } from "@/lib/navigation";
import { Separator } from "radix-ui";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { getPromptAction } from "@/app/rp/prompt/actions";
import {
  museToSource,
  novelistToSource,
} from "@/components/event-thread-input/helpers";
import { MobileReplyComposer } from "@/components/mobile-reply-composer";
import type { PromptStoreType } from "@/components/prompt/prompt.store";
import { PromptContent } from "@/components/prompt/prompt-content";
import { PromptHeader } from "@/components/prompt/prompt-header";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import * as S from "./styles";

// ── Data hook ─────────────────────────────────────────────────────────────────

const useGetPrompt = (promptId: string) => {
  const [fetchedPrompt, setFetchedPrompt] = useState<PromptType | null>(null);

  const fetchPrompt = useCallback(async () => {
    const _prompt = await getPromptAction(promptId);
    setFetchedPrompt((_prompt as PromptType) ?? null);
  }, [promptId]);

  return { fetchedPrompt, fetchPrompt };
};

// ── Inner page ────────────────────────────────────────────────────────────────

function CommentPageInner() {
  const params = useParams();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const promptId = params?.slug as string;
  const dropdownSelection = (searchParams?.get("dropdownSelection") ?? "ALL") as
    | "NOVELIST"
    | "MUSE"
    | "ALL";

  const activePrompt = useGlobalState("activePrompt");
  const setGlobalState = useGlobalStoreSet();
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const { width } = useWindowDimensions();
  const { stopPageLoading } = usePageRouter();
  const isMobile = (width ?? 0) <= 800;

  const { fetchedPrompt, fetchPrompt } = useGetPrompt(promptId);

  // Use the cached activePrompt if it matches; otherwise fall back to a fetch.
  const needsFetch = !activePrompt || activePrompt.id !== promptId;

  useEffect(() => {
    stopPageLoading();
    if (needsFetch) fetchPrompt();
  }, [needsFetch, fetchPrompt, stopPageLoading]);

  // Clear the cached prompt when leaving this page.
  useEffect(() => {
    return () => {
      setGlobalState({ activePrompt: null });
    };
  }, [setGlobalState]);

  // Lock outer page scroll on mobile. The document scrolls, not
  // .page-container (see rp/styles.ts).
  useEffect(() => {
    if (!isMobile) return;
    const el = document.scrollingElement as HTMLElement | null;
    if (!el) return;
    el.style.overflow = "hidden";
    el.scrollTop = 0;
    return () => {
      el.style.overflow = "";
    };
  }, [isMobile]);

  const prompt: PromptType | null = needsFetch ? fetchedPrompt : activePrompt;

  const isOOCPost = prompt?.source.sourceType === "NOVELIST";

  const initialSelection: PromptSource | undefined = useMemo(() => {
    if (!novelist) return undefined;
    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);
    if (isOOCPost) return novelistSource;
    if (museSources.length > 0) return museSources[0];
    return novelistSource;
  }, [novelist, isOOCPost]);

  if (!prompt) return null;

  const storeInitial: PromptStoreType = {
    ...prompt,
    promptAlert: null,
    threadOpen: false,
  };

  return (
    <StoreProvider<PromptStoreType> storeId="prompt" initial={storeInitial}>
      <S.PageContainer>
        {/* ── Sticky header — shows the prompt source/meta ─────────── */}
        <S.HeaderContainer>
          <S.BackButton onClick={() => navigate(-1)} aria-label="Go back">
            <IoArrowBackOutline size={22} />
          </S.BackButton>
          <S.HeaderPromptWrap>
            <PromptHeader />
          </S.HeaderPromptWrap>
        </S.HeaderContainer>

        {/* ── Scrollable prompt body — always fully expanded ───────── */}
        <S.ScrollArea>
          <Separator.Root
            className="separator"
            orientation="horizontal"
            style={{ background: "var(--bg-6)", height: 1, marginBlock: 0 }}
          />
          <PromptContent disableCollapse />
        </S.ScrollArea>

        {/* ── Fixed composer ───────────────────────────────────────── */}
        {authState === "LOGGED_IN" && prompt.canInteract && (
          <MobileReplyComposer
            parentId={promptId}
            type="comment"
            dropdownSelection={isOOCPost ? "NOVELIST" : dropdownSelection}
            initialSelection={initialSelection}
            onSend={() => navigate(-1)}
          />
        )}
      </S.PageContainer>
    </StoreProvider>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function PromptCommentPage() {
  return (
    <Suspense>
      <CommentPageInner />
    </Suspense>
  );
}
