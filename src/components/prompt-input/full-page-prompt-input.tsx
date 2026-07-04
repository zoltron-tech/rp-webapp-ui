"use client";

import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { Form } from "radix-ui";
import {
  type Dispatch,
  type FC,
  type FormEventHandler,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoIosShareAlt } from "react-icons/io";
import { IoArrowBack, IoCloseOutline } from "react-icons/io5";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { submitPrompt } from "@/app/rp/profile/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import type {
  Friend,
  Muse,
  Prompt,
  PromptSource,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { AppAlertDialog } from "../dialog";
import { FriendSelectionDropdown } from "../friends-selection-dropdown";
import { InfoModal } from "../info-modal";
import {
  apiMessageToInfoMessage,
  buildOptimisticPrompt,
  getParentIdKeyFromPromptType,
  museToSource,
  novelistToSource,
  PromptEvent,
  usePromptInputEvents,
} from "./helpers";
import { NovelistConfirm } from "./novelist-confirm";
import { PromptPrivacySelect } from "./privacy-select";
import {
  INITIAL_STATE,
  type PromptInputState,
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import { PromptMediaInput } from "./prompt-media-input";
import { PromptMediaPreview } from "./prompt-media-preview";
import { type MuseSelectHandle, PromptMuseSelect } from "./prompt-muse-select";
import { PromptTextField } from "./prompt-text-field";
import * as S from "./styles";

type FullPagePromptInputProps = {
  type?: SubmitPromptType;
  parentId?: string;
  dropdownSelection: "NOVELIST" | "MUSE" | "ALL";
  initialSelection?: PromptSource;
  onSend?: (prompt: Prompt) => void;
  onBack?: () => void;
  className?: string;
};

type InnerFormProps = FullPagePromptInputProps & {
  privacySelectedFriends: Friend[];
  setPrivacySelectedFriends: Dispatch<SetStateAction<Friend[]>>;
  setShowCustomPrivacyListSelection: Dispatch<SetStateAction<boolean>>;
};

const promptTypeToButtonText = (type: SubmitPromptType): string => {
  switch (type) {
    case "prompt":
      return "Post";
    case "reply":
      return "Reply";
    case "comment":
      return "Comment";
    default:
      return "Send";
  }
};

const FullPageForm: FC<InnerFormProps> = ({
  type = "prompt",
  parentId = "",
  dropdownSelection,
  initialSelection,
  onSend,
  onBack,
  privacySelectedFriends,
  setPrivacySelectedFriends,
  setShowCustomPrivacyListSelection,
}) => {
  const [sending, setSending] = useState(false);
  const novelist = useGlobalState("novelist");
  const promptText = usePromptInputState("promptText");
  const mediaUploading = usePromptInputState("mediaUploading");
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const { successToast, errorToast } = useUIContext();
  const setPromptInputState = usePromptInputStoreSet();
  const [error, setError] = useState<API_MESSAGE | null>(null);
  const [novelistConfirmOpen, setNovelistConfirmOpen] = useState(false);
  const pendingSubmitRef = useRef<(() => Promise<void>) | null>(null);
  const museSelectRef = useRef<MuseSelectHandle | null>(null);
  // Muses created on the fly from the "who is posting?" dialog — session-local
  // — merged with the novelist's real muses so a freshly created character is
  // immediately selectable without requiring a refetch of the novelist.
  const [addedMuses, setAddedMuses] = useState<Muse[]>([]);
  const { emit } = usePromptInputEvents();
  const { on, off } = useCustomEvents(EVENTS.PRIVACY.CUSTOM.base);

  useEffect(() => {
    const handleCustomPrivacySelected = () =>
      setShowCustomPrivacyListSelection(true);
    const handleCustomPrivacyRemoved = () => setPrivacySelectedFriends([]);
    on(EVENTS.PRIVACY.CUSTOM.APPLIED, handleCustomPrivacySelected);
    on(EVENTS.PRIVACY.CUSTOM.REMOVED, handleCustomPrivacyRemoved);
    return () => {
      off(EVENTS.PRIVACY.CUSTOM.APPLIED, handleCustomPrivacySelected);
      off(EVENTS.PRIVACY.CUSTOM.REMOVED, handleCustomPrivacyRemoved);
    };
  }, [on, off]);

  const sources = useMemo(() => {
    if (!novelist) return [];
    const novelistSource = novelistToSource(novelist);
    const museSources = [...(novelist.muses ?? []), ...addedMuses].map(
      museToSource,
    );
    switch (dropdownSelection) {
      case "NOVELIST":
        return [novelistSource];
      case "MUSE":
        return museSources;
      default:
        return [novelistSource, ...museSources];
    }
  }, [novelist, dropdownSelection, addedMuses]);

  const novelistConfirmSource = useMemo(
    () => sources.find((s) => s.sourceType === "NOVELIST"),
    [sources],
  );

  const hasMuseOptions = useMemo(
    () => sources.some((s) => s.sourceType === "MUSE"),
    [sources],
  );

  const submitDisabled = useMemo(
    () => mediaUploading || Boolean(mediaUploadError) || sending,
    [mediaUploading, mediaUploadError, sending],
  );

  const submitText = useMemo(() => {
    if (sending) return "Sending...";
    if (mediaUploading) return "Uploading...";
    return promptTypeToButtonText(type);
  }, [type, sending, mediaUploading]);

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
      const museId = String(formData.get("muse"));
      const privacy = formData.get("privacy") as
        | "PUBLIC"
        | "FRIENDS"
        | "ONLY_ME"
        | "CUSTOM";

      const selectedSource = sources.find((s) => s.sourceId === museId);
      if (!selectedSource) return;

      const payload: SubmitPromptInput = {
        media: String(formData.get("mediaUrl")),
        source: selectedSource,
        text: promptText || "",
      };

      if (type === "prompt") {
        payload.privacy = privacy;
        payload.sharedWith = privacySelectedFriends;
      } else {
        payload[getParentIdKeyFromPromptType(type)] = parentId;
      }

      if (
        dropdownSelection === "ALL" &&
        selectedSource.sourceType === "NOVELIST"
      ) {
        pendingSubmitRef.current = async () => {
          setSending(true);
          const response = await submitPrompt(payload, type);

          if (response.message !== API_MESSAGE.Success) {
            setError(response.message);
            setSending(false);
            emit(PromptEvent.Error, response.message);
            return;
          }

          successToast("Sent successfully");
          emit(PromptEvent.Sent, { muse: selectedSource, payload, type });
          setSending(false);
          setError(null);
          setPromptInputState({ media: null, promptText: "" });
          onSend?.(
            response.prompt ?? buildOptimisticPrompt(selectedSource, payload),
          );
        };
        setNovelistConfirmOpen(true);
        return;
      }

      setSending(true);
      const response = await submitPrompt(payload, type);

      if (response.message !== API_MESSAGE.Success) {
        setError(response.message);
        setSending(false);
        emit(PromptEvent.Error, response.message);
        return;
      }

      successToast("Sent successfully");
      emit(PromptEvent.Sent, { muse: selectedSource, payload, type });
      setSending(false);
      setError(null);
      setPromptInputState({ media: null, promptText: "" });
      onSend?.(
        response.prompt ?? buildOptimisticPrompt(selectedSource, payload),
      );
    },
    [
      sources,
      promptText,
      parentId,
      type,
      dropdownSelection,
      privacySelectedFriends,
      emit,
      onSend,
    ],
  );

  const handleConfirmNovelist = useCallback(async () => {
    setNovelistConfirmOpen(false);
    await pendingSubmitRef.current?.();
    pendingSubmitRef.current = null;
  }, []);

  const handleSelectCharacter = useCallback(() => {
    setNovelistConfirmOpen(false);
    museSelectRef.current?.openDialog();
  }, []);

  const handleCharacterCreated = useCallback((muse: Muse) => {
    setAddedMuses((prev) => [...prev, muse]);
    museSelectRef.current?.selectSource(museToSource(muse));
  }, []);

  return (
    <>
      <NovelistConfirm
        open={novelistConfirmOpen}
        onOpenChange={setNovelistConfirmOpen}
        novelistSource={novelistConfirmSource}
        hasMuseOptions={hasMuseOptions}
        onPostAsNovelist={handleConfirmNovelist}
        onSelectCharacter={handleSelectCharacter}
        onCharacterCreated={handleCharacterCreated}
      />
      <Form.Root
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
        }}
        onSubmit={handleSend}
      >
        {/* Top bar */}
        <S.FPTopBar>
          <S.FPBackButton type="button" aria-label="Go back" onClick={onBack}>
            <IoCloseOutline />
          </S.FPBackButton>
          <S.FPTopBarRight>
            {type === "prompt" && <PromptPrivacySelect />}
            <Form.Submit asChild>
              <S.FPSubmitButton disabled={submitDisabled}>
                {submitText}
              </S.FPSubmitButton>
            </Form.Submit>
          </S.FPTopBarRight>
        </S.FPTopBar>

        {/* Meta row: muse select + shared-with + media buttons */}
        <S.FPMetaRow>
          <PromptMuseSelect
            ref={museSelectRef}
            sources={sources}
            dropdownSelection={dropdownSelection}
            initialSelection={initialSelection}
          />
          <ShouldRender if={privacySelectedFriends.length > 0}>
            <S.FPSharedWith>
              <IoIosShareAlt />
              {privacySelectedFriends.slice(0, 2).map((friend) => (
                <S.PrivacySelectedFriendAvatar
                  key={friend.id}
                  src={friend.image}
                  alt={friend.username}
                  onClick={() => setShowCustomPrivacyListSelection(true)}
                />
              ))}
              <S.privacyAvatarMoreIcon
                onClick={() => setShowCustomPrivacyListSelection(true)}
              >
                <PiDotsThreeOutlineFill />
              </S.privacyAvatarMoreIcon>
            </S.FPSharedWith>
          </ShouldRender>
          <S.FPMetaRight>
            <PromptMediaInput />
          </S.FPMetaRight>
        </S.FPMetaRow>

        {/* Full-height editor area (toolbar + expanding editor) */}
        <S.FPEditorArea>
          <PromptTextField fullPage />
        </S.FPEditorArea>

        <PromptMediaPreview />

        <InfoModal
          open={Boolean(error)}
          type="error"
          description={apiMessageToInfoMessage(error)}
          onClose={() => setError(null)}
        />
      </Form.Root>
    </>
  );
};

export const FullPagePromptInput: FC<FullPagePromptInputProps> = ({
  type = "prompt",
  parentId = "",
  dropdownSelection,
  initialSelection,
  onSend,
  onBack,
  className,
}) => {
  const [privacySelectedFriends, setPrivacySelectedFriends] = useState<
    Friend[]
  >([]);
  const [showCustomPrivacyListSelection, setShowCustomPrivacyListSelection] =
    useState(false);
  const { emit: emitPrivacyEvent } = useCustomEvents(
    EVENTS.PRIVACY.CUSTOM.base,
  );

  return (
    <StoreProvider<PromptInputState>
      storeId="prompt-input"
      initial={{ ...INITIAL_STATE, parentId, type }}
    >
      <S.FPRoot className={classNames(className)}>
        <AppAlertDialog
          heading="Share with"
          text="Share with friends"
          body={
            <FriendSelectionDropdown
              selectedFriends={privacySelectedFriends}
              setSelectedFriends={setPrivacySelectedFriends}
            />
          }
          open={showCustomPrivacyListSelection}
          onOpenChange={setShowCustomPrivacyListSelection}
          onCancel={() => {
            setPrivacySelectedFriends([]);
            emitPrivacyEvent(EVENTS.PRIVACY.CUSTOM.SELECTION_CLEARED);
          }}
          onConfirm={() => setShowCustomPrivacyListSelection(false)}
          isConfirmDisabled={privacySelectedFriends.length === 0}
          closeButtonText="Clear"
          actionButtonLabel="Select"
          actionColor="neutral"
        />
        <FullPageForm
          type={type}
          parentId={parentId}
          dropdownSelection={dropdownSelection}
          initialSelection={initialSelection}
          onSend={onSend}
          onBack={onBack}
          privacySelectedFriends={privacySelectedFriends}
          setPrivacySelectedFriends={setPrivacySelectedFriends}
          setShowCustomPrivacyListSelection={setShowCustomPrivacyListSelection}
        />
      </S.FPRoot>
    </StoreProvider>
  );
};
