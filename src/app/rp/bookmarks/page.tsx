"use client";

import type { BookmarkedStoryBoardEvent } from "@nw/types";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { NoBookmarksArt } from "@/components/book-art";
import { BreadCrumb } from "@/components/breadcrumb";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { getBookmarkedEventsAction } from "../story/actions";
import { BookmarkCard } from "./bookmark-card";
import * as S from "./styles";

export default function BookmarksPage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { baseDataLoader } = usePageRouter();

  const [bookmarks, setBookmarks] = useState<
    BookmarkedStoryBoardEvent[] | null
  >(null);

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    const fetchBookmarks = async () => {
      const result = await baseDataLoader(() => getBookmarkedEventsAction());
      setBookmarks(result ?? []);
    };

    fetchBookmarks();
  }, [authState, baseDataLoader]);

  return (
    <S.Container>
      <BreadCrumb label="Bookmarks" username={user?.username ?? ""} />

      {bookmarks === null && authState === "LOGGED_IN" && (
        <S.Loader>
          <AiOutlineLoading3Quarters />
        </S.Loader>
      )}

      {bookmarks !== null && bookmarks.length === 0 && (
        <S.EmptyState>
          <NoBookmarksArt />
          <S.EmptyTitle>No bookmarks yet</S.EmptyTitle>
          <S.EmptyText>
            While reading a chapter, tap the bookmark icon to save your spot.
            Your saved chapters will appear here so you can pick up right where
            you left off.
          </S.EmptyText>
        </S.EmptyState>
      )}

      {bookmarks !== null && bookmarks.length > 0 && (
        <S.List>
          {bookmarks.map((bookmarked) => (
            <BookmarkCard
              key={bookmarked.event.id ?? bookmarked.bookmark.storyBoardEventId}
              bookmarked={bookmarked}
            />
          ))}
        </S.List>
      )}
    </S.Container>
  );
}
