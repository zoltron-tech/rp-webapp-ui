/* eslint-disable @next/next/no-img-element */

import classNames from "classnames";
import { type FC, useCallback } from "react";
import { IoIosRemoveCircle } from "react-icons/io";
import { PromptEvent, usePromptInputEvents } from "./helpers";
import { usePromptInputState } from "./prompt-input.store";
import * as S from "./styles";

export const PromptMediaPreview: FC = () => {
  const media = usePromptInputState("media");
  const uploading = usePromptInputState("mediaUploading");
  const { emit } = usePromptInputEvents();

  const handleRemoveMedia = useCallback(() => {
    emit(PromptEvent.MediaDeleted);
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
