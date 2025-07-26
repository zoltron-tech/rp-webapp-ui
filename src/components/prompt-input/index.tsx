"use client";

import {
  FC,
  FormEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Muse, SubmitPromptInput, SubmitPromptType } from "@/types";
import { useAuthContext } from "@/hooks";
import { StoreProvider } from "@/context/store/context";

import { Collapsible, Form } from "radix-ui";
import * as S from "./styles";
import { PromptTextField } from "./prompt-text-field";
import { SendButton } from "./sent-button";
import { PromptMuseSelect } from "./prompt-muse-select";
import { PromptMediaInput } from "./prompt-media-input";
import {
  apiMessageToInfoMessage,
  getParentIdKeyFromPromptType,
  museToSource,
  typeToTriggerButtonText,
} from "./helpers";
import { submitPrompt } from "@/app/rp/profile/actions";
import { PromptPrivacySelect } from "./privacy-select";
import { API_MESSAGE } from "@/utils/constants";
import { InfoBox } from "../info-box";
import classNames from "classnames";
import { BsArrowBarDown, BsArrowsCollapse } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowDropdown } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { INITIAL_STATE, PromptInputState } from "./prompt-input.store";
import { PromptMediaPreview } from "./prompt-media-preview";

type Props = React.HTMLProps<HTMLDivElement> & {
  muses: Muse[];
  type: SubmitPromptType;
  parentId?: string;
};

export const PromptInput: FC<Props> = forwardRef(
  ({ type = "prompt", parentId = "", ...rest }, forwardedRef) => {
    const { novelist } = useAuthContext();
    const muses = useMemo(() => {
      return novelist?.muses ?? [];
    }, [novelist]);
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<API_MESSAGE | null>(null);

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

        console.log(payload);
        setSending(true);
        const response = await submitPrompt(payload, type);
        console.log(response);
        if (response.message !== API_MESSAGE.Success) {
          setError(response.message);
          setSending(false);
          return;
        }

        setSending(false);
        setError(null);
      },
      [muses, parentId, type]
    );

    return (
      <>
        <InfoBox
          open={Boolean(error)}
          type="error"
          description={apiMessageToInfoMessage(error)}
          onClose={handleInfoBoxClose}
        />
        <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
          <S.PromptInputRoot
            {...rest}
            ref={forwardedRef as React.Ref<HTMLDivElement>}
          >
            <StoreProvider<PromptInputState>
              storeId="prompt-input"
              initial={{ ...INITIAL_STATE, parentId, type }}
            >
              <S.PromptInputContainer className={classNames([{ open }])}>
                <Collapsible.Trigger asChild>
                  <S.PromptTrigger className={classNames([{ open }])}>
                    {open ? (
                      <BsArrowsCollapse />
                    ) : (
                      typeToTriggerButtonText(type)
                    )}
                  </S.PromptTrigger>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Form.Root className="form-content" onSubmit={handleSend}>
                    <PromptMuseSelect muses={muses} />
                    {type === "prompt" && <PromptPrivacySelect />}
                    <PromptTextField />
                    <PromptMediaInput />
                    <PromptMediaPreview />
                    <SendButton />
                  </Form.Root>
                  {sending ? "Sending..." : null}
                </Collapsible.Content>
              </S.PromptInputContainer>
            </StoreProvider>
          </S.PromptInputRoot>
        </Collapsible.Root>
      </>
    );
  }
);

export default PromptInput;
