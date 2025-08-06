import { Form } from "radix-ui";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { HeartIcon } from "../heart-icon";
import * as S from "./styled";
import classNames from "classnames";
import { pluralize } from "@/utils/helpers";

type LikeButtonProps = {
  parentId: string;
  onLike?: (liked: boolean) => void;
  liked?: boolean;
  likes?: number;
  subject?: string;
};

export const LikeButton: FC<LikeButtonProps> = ({
  parentId,
  liked: likedProp = false,
  likes = 0,
  subject = "novelist",
  onLike,
}) => {
  const inputId = useMemo(() => `like-${parentId}`, [parentId]);
  const [initialRender, setInitialRender] = useState(true);
  const [liked, setLiked] = useState(likedProp);
  const [unliked, setUnliked] = useState(false);
  const [subjectText, likeText] = useMemo(() => {
    return [pluralize(subject, likes), pluralize("like", likes === 1 ? 2 : 1)];
  }, [subject, likes]);

  const handleChange = useCallback(() => {
    setLiked((prev) => {
      if (onLike) {
        onLike(!prev);
      }
      return !prev;
    });
  }, [onLike]);

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
      >
        <HeartIcon filled={liked} />
      </S.LikeButton.Label>
      <input
        id={inputId}
        name="like"
        type="checkbox"
        checked={liked}
        onChange={handleChange}
        hidden
      />
      <S.LikeButton.Text className="like-text">{`${likes} ${subjectText} ${likeText} this`}</S.LikeButton.Text>
    </S.LikeButton.Root>
  );
};
