import type { FC } from "react";
import { RiChatQuoteLine } from "react-icons/ri";
import {
  createEmptyDialogData,
  type DialogEmbedData,
} from "@/components/rich-text-editor-input/dialog-embed";
import * as S from "./styles";

type Props = {
  onInsert: (dialog: DialogEmbedData) => void;
};

/**
 * Inserts a blank dialog into the composer and selects it. All authoring —
 * sender muse, font, bold/italic/underline, and the spoken line — happens
 * inline on the embedded dialog via its floating control bar.
 */
export const EventThreadDialogInsert: FC<Props> = ({ onInsert }) => {
  return (
    <S.DialogInsertButton
      type="button"
      title="Insert a muse dialog"
      onClick={() => onInsert(createEmptyDialogData())}
    >
      <RiChatQuoteLine />
      <span className="label">Insert dialog</span>
    </S.DialogInsertButton>
  );
};
