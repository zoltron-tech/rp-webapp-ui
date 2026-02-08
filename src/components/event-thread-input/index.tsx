"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { Collapsible, Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import { submitEventThreadReply, submitPrompt } from "@/app/rp/profile/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { StoryBoardEventThreadInput, SubmitPromptInput } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { InfoModal } from "../info-modal";
import {
  type EventThreadInputState,
  INITIAL_STATE,
  useEventThreadInputState,
} from "./event-thread-input.store";
import { EventThreadInputTrigger } from "./event-thread-input-trigger";
import { EventThreadMediaInput } from "./event-thread-media-input";
import { EventThreadMediaPreview } from "./event-thread-media-preview";
import { EventThreadMuseSelect } from "./event-thread-muse-select";
import {
  apiMessageToInfoMessage,
  EventThreadEvent,
  museToSource,
  novelistToSource,
  useEventThreadInputEvents,
} from "./helpers";
import { EventThreadTextField } from "./prompt-text-field";
import { SendButton } from "./sent-button";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  storyBoardEventId?: string;
  onSend?: () => void;
};

export const EventThreadForm: FC<Props> = ({
  storyBoardEventId = "",
  onSend,
}) => {
  const [sending, setSending] = useState(false);
  const novelist = useGlobalState("novelist");
  const promptText = useEventThreadInputState("promptText");
  const { successToast, errorToast } = useUIContext();

  const [open, setOpen] = useState(true);

  const [error, setError] = useState<API_MESSAGE | null>(null);

  const { emit } = useEventThreadInputEvents();

  const sources = useMemo(() => {
    if (!novelist) return [];

    return [
      novelistToSource(novelist),
      ...(novelist.muses ?? []).map(museToSource),
    ];
  }, [novelist]);

  const handleSend: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        promptText === undefined ||
        promptText === null ||
        promptText === ""
      ) {
        errorToast("Prompt body cannot be empty.");
        return;
      }
      const formData = new FormData(e.currentTarget);
      const formFields = {
        media: String(formData.get("mediaUrl")),
        museId: String(formData.get("muse")),
        text: String(formData.get("promptText")),
      };
      const selectedSource = sources.find(
        (s) => s.sourceId === formFields.museId,
      );
      if (!selectedSource) return;

      const payload: StoryBoardEventThreadInput = {
        attachments: [{ createdAt: null, id: null, url: formFields.media }],
        message: promptText || "",
        sender: selectedSource,
        storyBoardEventId: storyBoardEventId,
        type:
          selectedSource.sourceType === "NOVELIST" ? "NARRATION" : "DIALOGUE",
      };

      setSending(true);
      const response = await submitEventThreadReply(payload);

      if (response.message !== API_MESSAGE.Success) {
        setError(response.message);
        setSending(false);
        emit(EventThreadEvent.Error, response.message);
        return;
      }

      successToast("Sent successfully");

      emit(EventThreadEvent.Sent, {
        muse: selectedSource,
        payload,
      });

      setSending(false);
      setError(null);
      setOpen(false);
      onSend?.();
    },
    [sources, promptText, storyBoardEventId, emit, onSend],
  );

  return (
    <Form.Root className="form-content" onSubmit={handleSend}>
      <Flex
        style={{
          alignItems: "center",
          gap: "4px",
          justifyContent: "flex-start",
          marginTop: "8px",
        }}
      >
        <EventThreadMuseSelect sources={sources} />
      </Flex>
      <EventThreadTextField />
      <EventThreadMediaInput />
      <EventThreadMediaPreview />
      <SendButton loading={sending} />
    </Form.Root>
  );
};

export const EventThreadInput: FC<Props> = forwardRef(
  ({ storyBoardEventId = "", onSend, className, ...rest }, forwardedRef) => {
    const handleInfoBoxClose = useCallback(() => {
      setError(null);
    }, []);

    const [open, setOpen] = useState(true);

    const [error, setError] = useState<API_MESSAGE | null>(null);

    return (
      <>
        <InfoModal
          open={Boolean(error)}
          type="error"
          description={apiMessageToInfoMessage(error)}
          onClose={handleInfoBoxClose}
        />
        <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
          <StoreProvider<EventThreadInputState>
            storeId="event-thread-input"
            initial={{ ...INITIAL_STATE, storyBoardEventId }}
          >
            <S.EventThreadInputRoot
              {...rest}
              className={classNames([className, { open }])}
              ref={forwardedRef as React.Ref<HTMLDivElement>}
            >
              <EventThreadInputTrigger open={open} />
              <Collapsible.Content>
                <EventThreadForm
                  storyBoardEventId={storyBoardEventId}
                  onSend={onSend}
                  className={className}
                />
              </Collapsible.Content>
            </S.EventThreadInputRoot>
          </StoreProvider>
        </Collapsible.Root>
      </>
    );
  },
);

export default EventThreadInput;
