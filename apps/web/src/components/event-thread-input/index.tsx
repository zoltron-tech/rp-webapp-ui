"use client";

import type {
  StoryBoardEventThread,
  StoryBoardEventThreadInput,
  StoryCharacter,
} from "@nw/types";
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
import { EventThreadGuideButton } from "./event-thread-guide";
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
  /**
   * "inline" drops the boxed chrome so the composer sits directly on a
   * manuscript page — transparent surface, page typography around it, and a
   * textual Save/Cancel row instead of the floating send button.
   */
  variant?: "default" | "inline";
  /** Shown for the inline variant; abandons the edit without saving. */
  onCancel?: () => void;
  /** Editor placeholder override (e.g. "Continue the story…"). */
  editorPlaceholder?: string;
  /** The storyboard's own shared characters, when composing inside a story.
   *  Offered as dialog speakers beside the novelist's own muses. */
  storyCharacters?: StoryCharacter[];
};

/** Save/Cancel row for the inline (on-page) composer. */
const InlineActions: FC<{ loading: boolean; onCancel?: () => void }> = ({
  loading,
  onCancel,
}) => {
  const threadId = useEventThreadInputState("threadId");
  const promptText = useEventThreadInputState("promptText");
  const trimmed = (promptText ?? "").trim();
  const hasContent = trimmed !== "" && trimmed !== "<br>";

  return (
    <S.InlineActions>
      {onCancel && (
        <button type="button" className="cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
      <Form.Submit asChild>
        <button
          type="submit"
          className="save"
          disabled={loading || !hasContent}
        >
          {loading ? "Saving…" : threadId ? "Save changes" : "Add to the page"}
        </button>
      </Form.Submit>
    </S.InlineActions>
  );
};

export const EventThreadForm: FC<Props> = ({
  storyBoardEventId = "",
  initialThread,
  onSend,
  variant = "default",
  onCancel,
  editorPlaceholder,
  storyCharacters,
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
        dialogDesign,
        id: threadId,
        // Persist dialogs as their style-agnostic data model (chrome stripped).
        message: serializeDialogEmbeds(promptText),
        storyBoardEventId: storyBoardEventId,
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
        {/* One header row inside the composer card: how dialogs will look on
            the left, the insert tools on the right. The tools used to float
            absolutely over a padded gap, which read as detached from the box
            they belong to. */}
        <S.ComposerHeader>
          <S.DialogDesignSlot>
            <DialogDesignSelect
              value={dialogDesign}
              onChange={(next) => setState({ dialogDesign: next })}
            />
          </S.DialogDesignSlot>
          <S.DialogInsertSlot>
            {/* First in the row, so the explanation sits ahead of the tools it
                explains rather than after them. Only the new-passage composer
                opens it by itself; editing an existing passage is not
                somebody's first time here. */}
            <EventThreadGuideButton autoOpen={!initialThread} />
            <EventThreadMediaInput />
            <EventThreadDialogInsert onInsert={handleInsertDialog} />
          </S.DialogInsertSlot>
        </S.ComposerHeader>
        <EventThreadTextField
          editorRef={editorRef}
          initialValue={initialThread?.message ?? ""}
          placeholder={editorPlaceholder}
          storyCharacters={storyCharacters}
        />
        {variant === "inline" ? (
          <InlineActions loading={sending} onCancel={onCancel} />
        ) : (
          <SendButton loading={sending} />
        )}
      </Form.Root>
    </>
  );
};

export const EventThreadInput: FC<Props> = forwardRef(
  (
    {
      storyBoardEventId = "",
      initialThread,
      onSend,
      variant = "default",
      onCancel,
      editorPlaceholder,
      storyCharacters,
      className,
      ...rest
    },
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
          className={classNames([className, { inline: variant === "inline" }])}
          ref={forwardedRef as React.Ref<HTMLDivElement>}
        >
          <EventThreadForm
            storyBoardEventId={storyBoardEventId}
            initialThread={initialThread}
            onSend={onSend}
            variant={variant}
            onCancel={onCancel}
            editorPlaceholder={editorPlaceholder}
            storyCharacters={storyCharacters}
            className={className}
          />
        </S.EventThreadInputRoot>
      </StoreProvider>
    );
  },
);

export default EventThreadInput;
