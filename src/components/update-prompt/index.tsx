import { type FC, useCallback, useEffect, useState } from "react";
import { updatePromptCommentAction } from "@/app/rp/prompt/actions";
import { useCustomEvents, useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { AppAlertDialog } from "../dialog";
import * as S from "./styled";

type PayloadType = {
  id: string;
  text: string;
};

export type UpdatePromptProps = {
  payload: PayloadType | null;
  type: "prompt" | "comment" | "reply";
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const UpdatePromptForm: FC<UpdatePromptProps> = ({
  payload,
  open = false,
  type,
  setOpen,
}) => {
  const [text, setText] = useState(payload?.text);
  const { successToast, errorToast } = useUIContext();

  const emitters = {
    comment: {
      emit: useCustomEvents(EVENTS.COMMENT.base).emit,
      event: EVENTS.COMMENT.UPDATED,
    },
    prompt: {
      emit: useCustomEvents(EVENTS.PROMPT.base).emit,
      event: EVENTS.PROMPT.UPDATED,
    },
    reply: {
      emit: useCustomEvents(EVENTS.REPLY.base).emit,
      event: EVENTS.REPLY.UPDATED,
    },
  } as const;

  const handleClose = useCallback((_newValue: boolean) => {
    setText("");
    setOpen(false);
  }, []);

  const handleUpdatePrompt = async () => {
    if (!payload?.id || !text) return;

    const response = await updatePromptCommentAction(payload?.id, text, type);
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Updated successfully`);
      const eventInvoker = emitters[type];
      eventInvoker.emit(eventInvoker.event, {
        id: payload.id,
        text,
      });
    } else {
      errorToast("There was an issue while updating this comment.");
    }
    setOpen(false);
  };

  useEffect(() => {
    setText(payload?.text);
  }, [payload]);

  return (
    <AppAlertDialog
      heading={`Edit ${type}`}
      text={`Edit your ${type}`}
      body={
        <S.FormRoot
          onSubmit={(event) => {
            event.preventDefault(); // prevent default form submission
          }}
        >
          <S.FormField name="supportMessage">
            <S.FormControl asChild>
              <S.FormTextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
              />
            </S.FormControl>
          </S.FormField>
        </S.FormRoot>
      }
      open={open}
      onOpenChange={handleClose}
      onConfirm={handleUpdatePrompt}
      actionButtonLabel="Update"
      actionColor="neutral"
      isConfirmDisabled={Boolean(text === payload?.text)}
    />
  );
};
