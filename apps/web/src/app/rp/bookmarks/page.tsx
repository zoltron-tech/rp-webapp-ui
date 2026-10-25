"use client";

import type { BookmarkedStoryBoardEvent } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { NoBookmarksArt } from "@/components/book-art";
import { BreadCrumb } from "@/components/breadcrumb";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import {
  deleteStoryboardEventBookmarkAction,
  getBookmarkedEventsAction,
} from "../story/actions";
import { BookmarkCard } from "./bookmark-card";
import * as S from "./styles";

export default function BookmarksPage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { baseDataLoader } = usePageRouter();

  const [bookmarks, setBookmarks] = useState<
    BookmarkedStoryBoardEvent[] | null
  >(null);
  const { successToast, errorToast } = useUIContext();
  const [pendingRemove, setPendingRemove] =
    useState<BookmarkedStoryBoardEvent | null>(null);
  const [removing, setRemoving] = useState(false);

  const confirmRemove = async () => {
    if (!pendingRemove || removing) return;
    const id = pendingRemove.bookmark.storyBoardEventId;
    setRemoving(true);
    const result = await deleteStoryboardEventBookmarkAction(id);
    setRemoving(false);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not remove the bookmark. Please try again.");
      return;
    }
    setBookmarks((prev) =>
      prev ? prev.filter((b) => b.bookmark.storyBoardEventId !== id) : prev,
    );
    setPendingRemove(null);
    successToast("Bookmark removed.");
  };

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
              onRemove={() => setPendingRemove(bookmarked)}
            />
          ))}
        </S.List>
      )}

      <AppAlertDialog
        open={!!pendingRemove}
        onOpenChange={(open) => !open && !removing && setPendingRemove(null)}
        heading="Remove this bookmark?"
        text={`You'll lose your saved spot in "${pendingRemove?.event.name ?? "this chapter"}". The chapter itself isn't affected.`}
        actionButtonLabel={removing ? "Removing..." : "Remove"}
        isConfirmDisabled={removing}
        onConfirm={confirmRemove}
      />
    </S.Container>
  );
}
