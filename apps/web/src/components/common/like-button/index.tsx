import classNames from "classnames";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { pluralize } from "@/utils/helpers";
import { ReactionLikersDialog } from "../../reaction-likers-dialog";
import { HeartIcon } from "../heart-icon";
import * as S from "./styled";

type LikeButtonProps = {
  parentId: string;
  onLike?: (liked: boolean) => void;
  liked?: boolean;
  likes?: number;
  subject?: string;
};

type LikeButtonVariantProps = {
  liked?: boolean;
  likes?: number;
  subjectText: string;
  likeText: string;
  onOpenLikers: (e: React.MouseEvent) => void;
};

const LikeButtonAuthenticated: FC<
  LikeButtonVariantProps & { onLike: (liked: boolean) => void }
> = ({ liked = false, likes = 0, subjectText, likeText, onLike, onOpenLikers }) => {
  const [initialRender, setInitialRender] = useState(true);
  const [unliked, setUnliked] = useState(false);

  const handleChange = useCallback(() => {
    onLike(liked);
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
      <S.LikeButton.HeartButton
        type="button"
        title="Like this comment"
        aria-label={liked ? "Unlike this comment" : "Like this comment"}
        aria-pressed={liked}
        className={classNames("like-button", {
          liked: liked,
          unliked: unliked,
        })}
        onClick={handleChange}
      >
        <HeartIcon filled={liked} />
      </S.LikeButton.HeartButton>
      <S.LikeButton.CountButton type="button" onClick={onOpenLikers}>
        {`${likes} ${subjectText} ${likeText} this`}
      </S.LikeButton.CountButton>
    </S.LikeButton.Root>
  );
};

const LikeButtonUnauthenticated: FC<LikeButtonVariantProps> = ({
  liked,
  likes = 0,
  subjectText,
  likeText,
  onOpenLikers,
}) => {
  return (
    <S.LikeButton.Root className="like-button">
      <HeartIcon filled={liked} />
      <S.LikeButton.CountButton type="button" onClick={onOpenLikers}>
        {`${likes} ${subjectText} ${likeText} this`}
      </S.LikeButton.CountButton>
    </S.LikeButton.Root>
  );
};

export const LikeButton: FC<LikeButtonProps> = ({
  onLike,
  parentId,
  likes = 0,
  liked = false,
  subject = "novelist",
}) => {
  const [likersOpen, setLikersOpen] = useState(false);

  const [subjectText, likeText] = useMemo(() => {
    return [pluralize(subject, likes), pluralize("like", likes === 1 ? 2 : 1)];
  }, [subject, likes]);

  const handleOpenLikers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!likes) return;
    setLikersOpen(true);
  };

  return (
    <>
      {onLike ? (
        <LikeButtonAuthenticated
          liked={liked}
          likes={likes}
          onLike={onLike}
          subjectText={subjectText}
          likeText={likeText}
          onOpenLikers={handleOpenLikers}
        />
      ) : (
        <LikeButtonUnauthenticated
          liked={liked}
          likes={likes}
          subjectText={subjectText}
          likeText={likeText}
          onOpenLikers={handleOpenLikers}
        />
      )}
      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={parentId}
        initialCount={likes}
      />
    </>
  );
};
