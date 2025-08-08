"use client";
import { FC } from "react";

import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { GrEdit } from "react-icons/gr";

import * as S from "./styles";
import { FaRegTrashCan } from "react-icons/fa6";
import { ShouldRender } from "../common";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import classNames from "classnames";
import { StoryBoard } from "@/types/story-board";
import { useGlobalState } from "@/context/store/stores";

type Props = React.HTMLProps<HTMLDivElement> & {
  storyBoard?: StoryBoard | null;
};

export const StoryCard: FC<Props> = ({ storyBoard, className, ...rest }) => {
  const { push } = useRouter();
  const params = useParams();
  const user = useGlobalState("user");
  const username = params?.slug as string;
  const isCurrentUser = user?.username && user.username === username;

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    storyBoard: StoryBoard
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !storyBoard.name ? onAddClick() : onAvatarClick();
  };

  const onAvatarClick = () => {
    if (!storyBoard) return;
    push(`/rp/story/${storyBoard.id}`);
  };

  const onAddClick = () => {
    if (!storyBoard) return;
    push(`/rp/profile/story/create`);
  };

  const onEditClick = () => {
    push(`/rp/profile/story/edit/${storyBoard?.id}`);
  };

  Logger.info("StoryCard rendered");

  if (!storyBoard) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !storyBoard.name,
        },
      ])}
      {...rest}
    >
      <S.CardBackground banner={storyBoard.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !storyBoard.name,
          },
        ])}
        onClick={(e) => handleCardClick(e, storyBoard)}
      >
        <ShouldRender
          if={storyBoard !== INITIAL_STORY_BOARD && !!isCurrentUser}
        >
          <S.EditButton className="button" onClick={onEditClick}>
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
                  new: !storyBoard.name,
                },
              ])}
              {...rest}
            >
              {storyBoard.name || "Add New"}
            </S.Title>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};

export default StoryCard;
