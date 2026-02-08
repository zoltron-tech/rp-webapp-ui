/* eslint-disable @next/next/no-img-element */

import classNames from "classnames";
import { type FC, useCallback } from "react";
import { IoIosRemoveCircle } from "react-icons/io";
import { useEventThreadInputState } from "./event-thread-input.store";
import { EventThreadEvent, useEventThreadInputEvents } from "./helpers";
import * as S from "./styles";

export const EventThreadMediaPreview: FC = () => {
  const media = useEventThreadInputState("media");
  const uploading = useEventThreadInputState("mediaUploading");
  const { emit } = useEventThreadInputEvents();

  const handleRemoveMedia = useCallback(() => {
    emit(EventThreadEvent.MediaDeleted);
  }, [emit]);

  if (!media) return null;

  return (
    <S.MediaPreviewRoot>
      <button
        type="button"
        className="remove-media-button"
        onClick={handleRemoveMedia}
      >
        <IoIosRemoveCircle />
      </button>
      <img
        className={classNames(["media-preview-image", { uploading }])}
        src={URL.createObjectURL(media)}
        alt="Media preview"
      />
    </S.MediaPreviewRoot>
  );
};
