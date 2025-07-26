/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import {
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import { IoIosRemoveCircle } from "react-icons/io";
import * as S from "./styles";
import Image from "next/image";
import classNames from "classnames";

export const PromptMediaPreview: FC = () => {
  const media = usePromptInputState("media");
  const mediaUploading = usePromptInputState("mediaUploading");
  const set = usePromptInputStoreSet();

  if (!media) return null;

  const handleRemoveMedia = () => {
    set({ media: null, mediaUploading: false });
  };

  return (
    <S.MediaPreviewRoot>
      <img
        className={classNames([
          "media-preview-image",
          {
            uploading: mediaUploading,
          },
        ])}
        src={URL.createObjectURL(media)}
        alt="Media preview"
      />
      <button
        type="button"
        className="remove-media-button"
        onClick={handleRemoveMedia}
      >
        <IoIosRemoveCircle />
      </button>
    </S.MediaPreviewRoot>
  );
};
