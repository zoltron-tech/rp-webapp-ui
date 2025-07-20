"use client";
import { FC } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { GrEdit } from "react-icons/gr";

import * as S from "./styles";
import { FaRegTrashCan } from "react-icons/fa6";
import { ShouldRender } from "../common";
import { INITIAL_STORY_BOARD_EVENT } from "@/utils/constants";
import classNames from "classnames";
import { StoryBoardEvent } from "@/types/story-board";
import { FaArrowRight } from "react-icons/fa";

type Props = React.HTMLProps<HTMLDivElement> & {
  event?: StoryBoardEvent | null;
  storyboardId: string;
  isCurrentUser?: Boolean;
};

export const StoryCardEvent: FC<Props> = ({
  event,
  storyboardId,
  isCurrentUser,
  className,
  ...rest
}) => {
  const { push } = useRouter();

  const onEventClick = (eventId: string) => {
    push(`/rp/story/event/${eventId}`);
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    event: StoryBoardEvent
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !event.name ? onAddClick() : onEventClick(event?.id || "");
  };

  const onAddClick = () => {
    if (!event) return;
    push(`/rp/profile/story/edit/${storyboardId}/event/create`);
  };

  const onEditClick = (eventId: string | null) => {
    if (eventId === null) return;
    push(`/rp/profile/story/edit/${storyboardId}/event/edit/${eventId}`);
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
