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
import type { Muse, SubmitPromptInput, SubmitPromptType } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { InfoModal } from "../info-modal";
import {
  apiMessageToInfoMessage,
  getParentIdKeyFromPromptType,
  museToSource,
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
  muses: Muse[];
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
    const muses = useMemo(() => {
      return novelist?.muses ?? [];
    }, [novelist]);
    const [open, setOpen] = useState(false);
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
          text: String(formData.get("promptText")),
          museId: String(formData.get("muse")),
          media: String(formData.get("mediaUrl")),
          privacy: formData.get("privacy") as "PUBLIC" | "FRIENDS" | "ONLY_ME",
        };
        const selectedMuse = muses.find((m) => m.id === formFields.museId);
        if (!selectedMuse) return;

        const payload: SubmitPromptInput = {
          text: formFields.text,
          source: museToSource(selectedMuse),
          media: formFields.media,
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
          type,
          payload,
          muse: selectedMuse,
        });

        setSending(false);
        setError(null);
        setOpen(false);
        onSend?.();
      },
      [muses, parentId, type, emit, onSend],
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
                  <PromptMuseSelect muses={muses} />
                  {type === "prompt" && <PromptPrivacySelect />}
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
