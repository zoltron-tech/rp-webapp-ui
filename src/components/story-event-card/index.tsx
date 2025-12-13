"use client";
import classNames from "classnames";
import type { FC } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoardEvent } from "@/types/story-board";
import { INITIAL_STORY_BOARD_EVENT } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  event?: StoryBoardEvent | null;
  storyboardId: string;
  isCurrentUser?: boolean;
};

export const StoryCardEvent: FC<Props> = ({
  event,
  storyboardId,
  isCurrentUser,
  className,
  ...rest
}) => {
  const { routeToPage } = usePageRouter();

  const onEventClick = (eventId: string) => {
    routeToPage(ROUTES.Story.Event.View(eventId));
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    event: StoryBoardEvent,
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !event.name ? onAddClick() : onEventClick(event?.id || "");
  };

  const onAddClick = () => {
    if (!event) return;
    routeToPage(ROUTES.Profile.Story.Edit(storyboardId).Event.Create);
  };

  const onEditClick = (eventId: string | null) => {
    if (eventId === null) return;
    routeToPage(ROUTES.Profile.Story.Edit(storyboardId).Event.Edit(eventId));
  };

  Logger.info("StoryCard rendered");

  if (!event) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !event.name,
        },
      ])}
      {...rest}
    >
      <S.CardBackground banner={event.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !event.name,
          },
        ])}
        onClick={(e) => handleCardClick(e, event)}
      >
        <ShouldRender
          if={event !== INITIAL_STORY_BOARD_EVENT && !!isCurrentUser}
        >
          <S.EditButton
            className="button"
            onClick={() => onEditClick(event?.id)}
          >
            <GrEdit />
          </S.EditButton>
          <S.DeleteButton className="button">
            <FaRegTrashCan />
          </S.DeleteButton>
        </ShouldRender>
        <S.CardHeader>
          <S.MuseInfo>
            <S.Title
              className={classNames([
                className,
                {
                  new: !event.name,
                },
              ])}
              {...rest}
            >
              {event.name || "Add New"}
            </S.Title>
            <S.Description>
              {event.description.length > 100
                ? `${event.description.slice(0, 100)}...`
                : event.description}
            </S.Description>
          </S.MuseInfo>
        </S.CardHeader>
        <ShouldRender if={event !== INITIAL_STORY_BOARD_EVENT}>
          <S.CardFooter>
            Read more...
            <FaArrowRight />
          </S.CardFooter>
        </ShouldRender>
      </S.Card>
    </S.CardWrapper>
  );
};

export default StoryCardEvent;
