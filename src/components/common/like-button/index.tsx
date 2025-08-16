import classNames from "classnames";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { pluralize } from "@/utils/helpers";
import { HeartIcon } from "../heart-icon";
import * as S from "./styled";

type LikeButtonProps = {
  parentId: string;
  onLike?: (liked: boolean) => void;
  liked?: boolean;
  likes?: number;
  subject?: string;
};

type LikeButtonAuthernticatedProps = Omit<LikeButtonProps, "subject"> & {
  subjectText: string;
  likeText: string;
};

type LikeButtonUnauthenticatedProps = Omit<
  LikeButtonAuthernticatedProps,
  "onLike" | "parentId"
>;

const LikeButtonAuthenticated: FC<LikeButtonAuthernticatedProps> = ({
  parentId,
  liked = false,
  likes = 0,
  subjectText,
  likeText,
  onLike,
}) => {
  const inputId = useMemo(() => `like-${parentId}`, [parentId]);
  const [initialRender, setInitialRender] = useState(true);
  const [unliked, setUnliked] = useState(false);

  const handleChange = useCallback(() => {
    if (onLike) {
      onLike(liked);
    }
  }, [onLike, liked]);

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }
    if (!liked) {
      setUnliked(true);
      setTimeout(() => {
        setUnliked(false);
      }, 500);
    }
  }, [liked]);

  return (
    <S.LikeButton.Root>
      <S.LikeButton.Label
        title="Like this comment"
        htmlFor={inputId}
        className={classNames("like-button", {
          liked: liked,
          unliked: unliked,
        })}
        onClick={handleChange}
      >
        <HeartIcon filled={liked} />
      </S.LikeButton.Label>
      <input
        readOnly
        id={inputId}
        name="like"
        type="checkbox"
        checked={liked}
        hidden
      />
      <S.LikeButton.Text className="like-text">{`${likes} ${subjectText} ${likeText} this`}</S.LikeButton.Text>
    </S.LikeButton.Root>
  );
};

const LikeButtonUnauthenticated: FC<LikeButtonUnauthenticatedProps> = ({
  liked,
  likes = 0,
  subjectText,
  likeText,
}) => {
  return (
    <S.LikeButton.Root className="like-button">
      <HeartIcon filled={liked} />
      <S.LikeButton.Text className="like-text">{`${likes} ${subjectText} ${likeText} this`}</S.LikeButton.Text>
    </S.LikeButton.Root>
  );
};

export const LikeButton: FC<LikeButtonProps> = ({
  onLike,
  likes = 0,
  liked = false,
  subject = "novelist",
  ...rest
}) => {
  const [subjectText, likeText] = useMemo(() => {
    return [pluralize(subject, likes), pluralize("like", likes === 1 ? 2 : 1)];
  }, [subject, likes]);

  if (!onLike) {
    return (
      <LikeButtonUnauthenticated
        liked={liked}
        likes={likes}
        subjectText={subjectText}
        likeText={likeText}
        {...rest}
      />
    );
  }

  return (
    <LikeButtonAuthenticated
      liked={liked}
      likes={likes}
      onLike={onLike}
      subjectText={subjectText}
      likeText={likeText}
      {...rest}
    />
  );
};
