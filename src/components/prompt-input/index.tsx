"use client";

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
import { submitPrompt } from "@/app/rp/profile/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import type {
  PromptSource,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { InfoModal } from "../info-modal";
import {
  apiMessageToInfoMessage,
  getParentIdKeyFromPromptType,
  museToSource,
  novelistToSource,
  PromptEvent,
  usePromptInputEvents,
} from "./helpers";
import { PromptPrivacySelect } from "./privacy-select";
import { INITIAL_STATE, type PromptInputState } from "./prompt-input.store";
import { PromptInputTrigger } from "./prompt-input-trigger";
import { PromptMediaInput } from "./prompt-media-input";
import { PromptMediaPreview } from "./prompt-media-preview";
import { PromptMuseSelect } from "./prompt-muse-select";
import { PromptTextField } from "./prompt-text-field";
import { SendButton } from "./sent-button";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  type: SubmitPromptType;
  parentId?: string;
  onSend?: () => void;
};

export const PromptInput: FC<Props> = forwardRef(
  (
    { type = "prompt", parentId = "", onSend, className, ...rest },
    forwardedRef,
  ) => {
    const novelist = useGlobalState("novelist");

    const sources = useMemo(() => {
      if (!novelist) return [];

      return [
        novelistToSource(novelist),
        ...(novelist.muses ?? []).map(museToSource),
      ];
    }, [novelist]);

    const [open, setOpen] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<API_MESSAGE | null>(null);
    const { emit } = usePromptInputEvents();
    const handleInfoBoxClose = useCallback(() => {
      setError(null);
    }, []);

    const handleSend: FormEventHandler<HTMLFormElement> = useCallback(
      async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formFields = {
          media: String(formData.get("mediaUrl")),
          museId: String(formData.get("muse")),
          privacy: formData.get("privacy") as "PUBLIC" | "FRIENDS" | "ONLY_ME",
          text: String(formData.get("promptText")),
        };
        const selectedSource = sources.find(
          (s) => s.sourceId === formFields.museId,
        );
        if (!selectedSource) return;

        const payload: SubmitPromptInput = {
          media: formFields.media,
          source: selectedSource,
          text: formFields.text,
        };

        if (type === "prompt") {
          payload.privacy = formFields.privacy;
        } else {
          payload[getParentIdKeyFromPromptType(type)] = parentId;
        }

        setSending(true);
        const response = await submitPrompt(payload, type);

        if (response.message !== API_MESSAGE.Success) {
          setError(response.message);
          setSending(false);
          emit(PromptEvent.Error, response.message);
          return;
        }

        emit(PromptEvent.Sent, {
          muse: selectedSource,
          payload,
          type,
        });

        setSending(false);
        setError(null);
        setOpen(false);
        onSend?.();
      },
      [sources, parentId, type, emit, onSend],
    );

    return (
      <>
        <InfoModal
          open={Boolean(error)}
          type="error"
          description={apiMessageToInfoMessage(error)}
          onClose={handleInfoBoxClose}
        />
        <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
          <StoreProvider<PromptInputState>
            storeId="prompt-input"
            initial={{ ...INITIAL_STATE, parentId, type }}
          >
            <S.PromptInputRoot
              {...rest}
              className={classNames([className, { open }])}
              ref={forwardedRef as React.Ref<HTMLDivElement>}
            >
              <PromptInputTrigger open={open} />
              <Collapsible.Content>
                <Form.Root className="form-content" onSubmit={handleSend}>
                  <PromptMuseSelect sources={sources} />
                  {type === "prompt" && (
                    <PromptPrivacySelect className="prompt-input-privacy-select" />
                  )}
                  <PromptTextField />
                  <PromptMediaInput />
                  <PromptMediaPreview />
                  <SendButton loading={sending} />
                </Form.Root>
              </Collapsible.Content>
            </S.PromptInputRoot>
          </StoreProvider>
        </Collapsible.Root>
      </>
    );
  },
);

export default PromptInput;
