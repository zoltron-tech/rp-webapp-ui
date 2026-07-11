"use client";

import classNames from "classnames";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import { saveStoryBoardEventThreadAction } from "@/app/rp/story/actions";
import { StoreProvider } from "@/context/store/context";
import { useUIContext } from "@/hooks";
import type {
  StoryBoardEventThread,
  StoryBoardEventThreadInput,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { InfoModal } from "../info-modal";
import type { RichTextEditorHandle } from "../rich-text-editor-input";
import {
  DEFAULT_DIALOG_DESIGN,
  isDialogDesign,
} from "../rich-text-editor-input/dialog-designs";
import { DialogDesignSelect } from "../rich-text-editor-input/dialog-designs/dialog-design-select";
import {
  type DialogEmbedData,
  serializeDialogEmbeds,
} from "../rich-text-editor-input/dialog-embed";
import { EventThreadDialogInsert } from "./event-thread-dialog-insert";
import {
  type EventThreadInputState,
  INITIAL_STATE,
  useEventThreadInputState,
  useEventThreadInputStoreSet,
} from "./event-thread-input.store";
import { EventThreadMediaInput } from "./event-thread-media-input";
import {
  apiMessageToInfoMessage,
  EventThreadEvent,
  useEventThreadInputEvents,
} from "./helpers";
import { EventThreadTextField } from "./prompt-text-field";
import { SendButton } from "./sent-button";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  storyBoardEventId?: string;
  /** When set, the composer edits this thread instead of creating a new one. */
  initialThread?: StoryBoardEventThread | null;
  onSend?: () => void;
};

export const EventThreadForm: FC<Props> = ({
  storyBoardEventId = "",
  initialThread,
  onSend,
}) => {
  const [sending, setSending] = useState(false);
  const promptText = useEventThreadInputState("promptText");
  const threadId = useEventThreadInputState("threadId");
  const dialogDesign = useEventThreadInputState("dialogDesign");
  const setState = useEventThreadInputStoreSet();
  const { successToast, errorToast } = useUIContext();
  const editorRef = useRef<RichTextEditorHandle | null>(null);

  const [error, setError] = useState<API_MESSAGE | null>(null);

  const { emit } = useEventThreadInputEvents();

  const handleInsertDialog = useCallback((dialog: DialogEmbedData) => {
    editorRef.current?.insertDialog(dialog);
  }, []);

  const handleSend: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        promptText === undefined ||
        promptText === null ||
        promptText === ""
      ) {
        errorToast("Thread body cannot be empty.");
        return;
      }

      const payload: StoryBoardEventThreadInput = {
        id: threadId,
        // Persist dialogs as their style-agnostic data model (chrome stripped).
        message: serializeDialogEmbeds(promptText),
        storyBoardEventId: storyBoardEventId,
        dialogDesign,
      };

      setSending(true);
      const response = await saveStoryBoardEventThreadAction(payload);

      if (response.message !== API_MESSAGE.Success) {
        setError(response.message);
        setSending(false);
        emit(EventThreadEvent.Error, response.message);
        return;
      }

      successToast(threadId ? "Updated successfully" : "Sent successfully");

      emit(EventThreadEvent.Sent, { payload });

      editorRef.current?.clear();
      setSending(false);
      setError(null);
      onSend?.();
    },
    [
      promptText,
      threadId,
      storyBoardEventId,
      dialogDesign,
      emit,
      onSend,
      successToast,
      errorToast,
    ],
  );

  return (
    <>
      <InfoModal
        open={Boolean(error)}
        type="error"
        description={apiMessageToInfoMessage(error)}
        onClose={() => setError(null)}
      />
      <Form.Root className="form-content" onSubmit={handleSend}>
        <S.DialogInsertSlot>
          <EventThreadMediaInput />
          <EventThreadDialogInsert onInsert={handleInsertDialog} />
        </S.DialogInsertSlot>
        <DialogDesignSelect
          value={dialogDesign}
          onChange={(next) => setState({ dialogDesign: next })}
        />
        <EventThreadTextField
          editorRef={editorRef}
          initialValue={initialThread?.message ?? ""}
        />
        <SendButton loading={sending} />
      </Form.Root>
    </>
  );
};

export const EventThreadInput: FC<Props> = forwardRef(
  (
    { storyBoardEventId = "", initialThread, onSend, className, ...rest },
    forwardedRef,
  ) => {
    const initialDesign = initialThread?.dialogDesign ?? null;
    return (
      <StoreProvider<EventThreadInputState>
        storeId="event-thread-input"
        initial={{
          ...INITIAL_STATE,
          dialogDesign: isDialogDesign(initialDesign)
            ? initialDesign
            : DEFAULT_DIALOG_DESIGN,
          promptText: initialThread?.message ?? "",
          storyBoardEventId,
          threadId: initialThread?.id ?? null,
        }}
      >
        <S.EventThreadInputRoot
          {...rest}
          className={classNames([className])}
          ref={forwardedRef as React.Ref<HTMLDivElement>}
        >
          <EventThreadForm
            storyBoardEventId={storyBoardEventId}
            initialThread={initialThread}
            onSend={onSend}
            className={className}
          />
        </S.EventThreadInputRoot>
      </StoreProvider>
    );
  },
);

export default EventThreadInput;
