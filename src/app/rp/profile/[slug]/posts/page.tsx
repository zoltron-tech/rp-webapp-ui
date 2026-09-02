"use client";

import type { Prompt } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { useCallback, useEffect, useState } from "react";
import { getNovelistAction } from "@/app/rp/novelists/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { novelistToSource } from "@/components/event-thread-input/helpers";
import { LoadMore } from "@/components/load-more/page";
import { Prompt as PromptComponent } from "@/components/prompt";
import { PromptComposeTrigger } from "@/components/prompt-compose-trigger";
import PromptInput from "@/components/prompt-input";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { getPostsByNovelistAction } from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 20;

export default function NovelistPostsPage() {
  const params = useParams();
  const username = params?.slug as string;
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const isCurrentUser = user?.username === username;
  const { baseDataLoader } = usePageRouter();
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const [composeOpen, setComposeOpen] = useState(false);

  const [novelistId, setNovelistId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Prompt[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (id: string, pageNumber: number, append = false) => {
      const data = await baseDataLoader(() =>
        getPostsByNovelistAction(id, pageNumber, PAGE_SIZE),
      );

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      setHasMore(data.length >= PAGE_SIZE);
      setPosts((prev) => (append ? [...(prev ?? []), ...data] : data));
    },
    [baseDataLoader],
  );

  useEffect(() => {
    if (authState === "LOADING" || novelistId) return;

    const init = async () => {
      const novelist = await baseDataLoader(() => getNovelistAction(username));
      if (!novelist || "message" in novelist) return;
      setNovelistId(novelist.id);
      await fetchPosts(novelist.id, 1);
    };

    init();
  }, [authState]);

  const loadMore = async () => {
    if (loadingMore || !novelistId) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPosts(novelistId, nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const refreshPosts = () => {
    if (!novelistId) return;
    setPosts(null);
    setPage(1);
    setHasMore(false);
    fetchPosts(novelistId, 1);
  };

  return (
    <S.Container>
      <BreadCrumb label="Posts" username={username} />

      {isCurrentUser &&
        authState === "LOGGED_IN" &&
        novelist &&
        (isMobile ? (
          <S.PromptInputWrapper>
            <PromptComposeTrigger
              avatarSrc={novelist.image}
              avatarAlt={novelist.username}
              avatarNwImage={novelist.avatar}
              onClick={() => setComposeOpen(true)}
            />
          </S.PromptInputWrapper>
        ) : (
          <S.PromptInputWrapper>
            <PromptInput
              type="prompt"
              noShell
              dropdownSelection="ALL"
              initialSelection={novelistToSource(novelist)}
              onSend={refreshPosts}
            />
          </S.PromptInputWrapper>
        ))}

      <S.PostList>
        {posts?.map((post) => (
          <PromptComponent key={post.id} prompt={post} />
        ))}
      </S.PostList>
      <LoadMore
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        endMarker={!!posts?.length}
      />

      {isCurrentUser && (
        <S.ComposeSheet $open={composeOpen}>
          <FullPagePromptInput
            type="prompt"
            dropdownSelection="ALL"
            initialSelection={novelist ? novelistToSource(novelist) : undefined}
            className="compose-fp-inner"
            onBack={() => setComposeOpen(false)}
            onSend={() => {
              refreshPosts();
              setComposeOpen(false);
            }}
          />
        </S.ComposeSheet>
      )}
    </S.Container>
  );
}
