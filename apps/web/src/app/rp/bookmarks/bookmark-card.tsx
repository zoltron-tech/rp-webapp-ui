"use client";
import type { BookmarkedStoryBoardEvent } from "@nw/types";
import type { FC } from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { FaArrowRight, FaBookmark, FaRegTrashCan } from "react-icons/fa6";
import { CoverImage } from "@/components/common";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import * as S from "./styles";

type Props = {
  bookmarked: BookmarkedStoryBoardEvent;
  /** Asks the page to confirm and delete this bookmark. */
  onRemove?: () => void;
};

/** A single bookmarked chapter: tapping it reopens the reader at the exact
 *  passage the reader stopped on (via the `?t=` deep-link param). */
export const BookmarkCard: FC<Props> = ({ bookmarked, onRemove }) => {
  const { routeToPage } = usePageRouter();
  const { event, storyBoardName, bookmark } = bookmarked;

  const onContinue = () => {
    if (!event.id) return;
    routeToPage(
      `${ROUTES.Story.Event.View(event.id)}?t=${bookmark.threadIndex}`,
    );
  };

  return (
    <S.Card onClick={onContinue} role="button" tabIndex={0}>
      <S.CardCover>
        <CoverImage src={event.image} nwImage={event.avatar} />
      </S.CardCover>
      <S.CardBody>
        <S.CardEyebrow>{storyBoardName}</S.CardEyebrow>
        <S.CardTitle>{event.name}</S.CardTitle>
        <S.CardMeta>
          <span className="passage">
            <FaBookmark size={11} />
            Passage {bookmark.threadIndex + 1}
          </span>
          {bookmark.modifiedAt && (
            <span className="date">
              <BsCalendar2Date size={11} />
              {toFormattedDate(bookmark.modifiedAt)}
            </span>
          )}
        </S.CardMeta>
        <S.CardActions>
          <S.ContinueButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
          >
            Continue reading
            <FaArrowRight />
          </S.ContinueButton>
          {onRemove && (
            <S.RemoveButton
              type="button"
              aria-label={`Remove bookmark for ${event.name}`}
              onClick={(e) => {
                // The card itself opens the reader; this must not.
                e.stopPropagation();
                onRemove();
              }}
            >
              <FaRegTrashCan size={12} />
              Remove
            </S.RemoveButton>
          )}
        </S.CardActions>
      </S.CardBody>
    </S.Card>
  );
};

export default BookmarkCard;
