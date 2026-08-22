"use client";

import { ShouldRender } from "@novelist-world/ui";
import type {
  Friend,
  Muse,
  Prompt,
  PromptSource,
  SubmitPromptInput,
  SubmitPromptType,
} from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import classNames from "classnames";
import { Collapsible, Form } from "radix-ui";
import {
  type Dispatch,
  type FC,
  type FormEventHandler,
  forwardRef,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { IoIosShareAlt } from "react-icons/io";
import { MdDeleteOutline, MdMusicNote } from "react-icons/md";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { submitPrompt } from "@/app/rp/profile/actions";
import { SongPickerDialog } from "@/app/rp/profile/edit/song-picker-dialog";
import { ProfileSongPlayer } from "@/components/profile-song";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
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
import { IcMuseRequiredForm } from "./ic-muse-required-form";
import { NovelistConfirm } from "./novelist-confirm";
import { PromptPrivacySelect } from "./privacy-select";
import {
  INITIAL_STATE,
  type PromptInputState,
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import { PromptInputTrigger } from "./prompt-input-trigger";
import { PromptMediaInput } from "./prompt-media-input";
import { PromptMediaPreview } from "./prompt-media-preview";
import { type MuseSelectHandle, PromptMuseSelect } from "./prompt-muse-select";
import { PromptTextField } from "./prompt-text-field";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  type: SubmitPromptType;
  parentId?: string;
  dropdownSelection: "NOVELIST" | "MUSE" | "ALL";
  initialSelection: PromptSource | undefined;
  onSend?: (prompt: Prompt) => void;
  defaultOpen?: boolean;
  /** Drop the card border/radius/shadow so the input blends into an embedding
   *  container (thread list, profile feed). */
  noShell?: boolean;
};

type PromptInputFormProps = Props & {
  privacySelectedFriends: Friend[];
  setPrivacySelectedFriends: Dispatch<SetStateAction<Friend[]>>;
  setShowCustomPrivacyListSelection: Dispatch<SetStateAction<boolean>>;
};

export const PromptForm: FC<PromptInputFormProps> = ({
  type = "prompt",
  parentId = "",
  dropdownSelection,
  initialSelection,
  onSend,
  setPrivacySelectedFriends,
  setShowCustomPrivacyListSelection,
  privacySelectedFriends,
}) => {
  const [sending, setSending] = useState(false);
  const novelist = useGlobalState("novelist");
  const promptText = usePromptInputState("promptText");
  const featuredSong = usePromptInputState("featuredSong");
  const { successToast, errorToast } = useUIContext();
  const setPromptInputState = usePromptInputStoreSet();

  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<API_MESSAGE | null>(null);
  const [novelistConfirmOpen, setNovelistConfirmOpen] = useState(false);
  const pendingSubmitRef = useRef<(() => Promise<void>) | null>(null);
  const museSelectRef = useRef<MuseSelectHandle | null>(null);

  const { emit } = usePromptInputEvents();

  const { on, off } = useCustomEvents(EVENTS.PRIVACY.CUSTOM.base);

  useEffect(() => {
    const handleCustomPrivacySelected = () => {
      setShowCustomPrivacyListSelection(true);
    };

    const handleCustomPrivacyRemoved = () => {
      setPrivacySelectedFriends([]);
    };

    on(EVENTS.PRIVACY.CUSTOM.APPLIED, handleCustomPrivacySelected);
    on(EVENTS.PRIVACY.CUSTOM.REMOVED, handleCustomPrivacyRemoved);

    return () => {
      off(EVENTS.PRIVACY.CUSTOM.APPLIED, handleCustomPrivacySelected);
      off(EVENTS.PRIVACY.CUSTOM.REMOVED, handleCustomPrivacyRemoved);
    };
  }, [on]);

  const sources = useMemo(() => {
    if (!novelist) return [];

    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);

    switch (dropdownSelection) {
      case "NOVELIST":
        return [novelistSource];

      case "MUSE":
        return museSources;
      default:
        return [novelistSource, ...museSources];
    }
  }, [novelist, dropdownSelection]);

  const novelistConfirmSource = useMemo(
    () => sources.find((s) => s.sourceType === "NOVELIST"),
    [sources],
  );

  const hasMuseOptions = useMemo(
    () => sources.some((s) => s.sourceType === "MUSE"),
    [sources],
  );

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
        privacy: formData.get("privacy") as
          | "PUBLIC"
          | "FRIENDS"
          | "ONLY_ME"
          | "CUSTOM",
        text: String(formData.get("promptText")),
      };
      const selectedSource = sources.find(
        (s) => s.sourceId === formFields.museId,
      );
      if (!selectedSource) return;

      const payload: SubmitPromptInput = {
        media: formFields.media,
        source: selectedSource,
        text: promptText || "",
      };

      if (type === "prompt") {
        payload.privacy = formFields.privacy;
        payload.sharedWith = privacySelectedFriends;
        // Songs attach to prompts only — never comments or replies.
        payload.featuredSong = featuredSong;
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
          setOpen(false);
          setPromptInputState({
            featuredSong: null,
            media: null,
            promptText: "",
          });
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

      emit(PromptEvent.Sent, {
        muse: selectedSource,
        payload,
        type,
      });

      setSending(false);
      setError(null);
      setOpen(false);
      setPromptInputState({ featuredSong: null, media: null, promptText: "" });
      onSend?.(
        response.prompt ?? buildOptimisticPrompt(selectedSource, payload),
      );
    },
    [
      sources,
      promptText,
      featuredSong,
      parentId,
      type,
      dropdownSelection,
      privacySelectedFriends,
      emit,
      onSend,
      setPromptInputState,
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
    museSelectRef.current?.selectSource(museToSource(muse));
  }, []);

  const showIcMuseRequired = dropdownSelection === "MUSE" && !hasMuseOptions;

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
      {showIcMuseRequired ? (
        <IcMuseRequiredForm />
      ) : (
        <Form.Root className="form-content" onSubmit={handleSend}>
          {/* ── Meta row: sender + privacy avatars on left, media buttons on right ─ */}
          <S.DesktopMetaRow>
            <PromptMuseSelect
              ref={museSelectRef}
              sources={sources}
              dropdownSelection={dropdownSelection}
              initialSelection={initialSelection}
            />
            <ShouldRender if={privacySelectedFriends.length > 0}>
              <IoIosShareAlt
                style={{ marginLeft: "8px", marginRight: "8px" }}
              />
              {privacySelectedFriends.slice(0, 2).map((friend) => (
                <>
                  <S.PrivacySelectedFriendAvatar
                    key={friend.id}
                    src={friend.image}
                    alt={friend.username}
                    onClick={() => setShowCustomPrivacyListSelection(true)}
                  />
                </>
              ))}
              <S.privacyAvatarMoreIcon
                onClick={() => setShowCustomPrivacyListSelection(true)}
              >
                <PiDotsThreeOutlineFill />
              </S.privacyAvatarMoreIcon>
            </ShouldRender>
            <S.DesktopMediaWrap>
              {type === "prompt" && (
                <S.ToolButton
                  type="button"
                  style={{ marginTop: 20 }}
                  aria-label={featuredSong ? "Change song" : "Add a song"}
                  title={featuredSong ? "Change song" : "Add a song"}
                  onClick={() => setSongDialogOpen(true)}
                >
                  <MdMusicNote />
                </S.ToolButton>
              )}
              <PromptMediaInput />
            </S.DesktopMediaWrap>
          </S.DesktopMetaRow>

          {type === "prompt" && (
            <PromptPrivacySelect className="prompt-input-privacy-select" />
          )}

          {/* ── Editor with inline send button ─────────────────────────── */}
          <S.DesktopEditorWrap>
            <PromptTextField />
            {promptText?.trim() && (
              <Form.Submit asChild>
                <S.DesktopSendIconBtn
                  disabled={sending}
                  title={sending ? "Sending..." : undefined}
                >
                  <HiPaperAirplane size={16} />
                </S.DesktopSendIconBtn>
              </Form.Submit>
            )}
          </S.DesktopEditorWrap>

          <PromptMediaPreview />

          {type === "prompt" && featuredSong && (
            <S.PromptSongPreview>
              <ProfileSongPlayer
                key={
                  featuredSong.spotifyTrackId ??
                  featuredSong.songId ??
                  featuredSong.title
                }
                song={featuredSong}
                slim
                block
              />
              <S.PromptSongRemove
                type="button"
                aria-label="Remove song"
                title="Remove song"
                onClick={() => setPromptInputState({ featuredSong: null })}
              >
                <MdDeleteOutline />
              </S.PromptSongRemove>
            </S.PromptSongPreview>
          )}

          {type === "prompt" && (
            <SongPickerDialog
              open={songDialogOpen}
              onOpenChange={setSongDialogOpen}
              commit={false}
              title="Add a song to your prompt"
              onSelected={(picked: ProfileSong) =>
                setPromptInputState({ featuredSong: picked })
              }
            />
          )}
        </Form.Root>
      )}
    </>
  );
};

export const PromptInput: FC<Props> = forwardRef(
  (
    {
      type = "prompt",
      parentId = "",
      dropdownSelection,
      initialSelection,
      onSend,
      className,
      defaultOpen = true,
      noShell,
      ...rest
    },
    forwardedRef,
  ) => {
    const [privacySelectedFriends, setPrivacySelectedFriends] = useState<
      Friend[]
    >([]);
    const [showCustomPrivacyListSelection, setShowCustomPrivacyListSelection] =
      useState(false);

    const { emit: emitPrivacyEvent } = useCustomEvents(
      EVENTS.PRIVACY.CUSTOM.base,
    );

    const handleInfoBoxClose = useCallback(() => {
      setError(null);
    }, []);

    const [open, setOpen] = useState(defaultOpen);

    const [error, setError] = useState<API_MESSAGE | null>(null);

    return (
      <>
        <AppAlertDialog
          heading={`Share with`}
          text={`Share with friends`}
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
          onConfirm={() => {
            setShowCustomPrivacyListSelection(false);
          }}
          isConfirmDisabled={privacySelectedFriends.length === 0}
          closeButtonText="Clear"
          actionButtonLabel="Select"
          actionColor="neutral"
        />
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
              $noShell={noShell}
              className={classNames([className, { open }])}
              ref={forwardedRef as React.Ref<HTMLDivElement>}
            >
              <PromptInputTrigger open={open} />
              <Collapsible.Content>
                <PromptForm
                  type={type}
                  parentId={parentId}
                  dropdownSelection={dropdownSelection}
                  initialSelection={initialSelection}
                  onSend={onSend}
                  className={className}
                  privacySelectedFriends={privacySelectedFriends}
                  setPrivacySelectedFriends={setPrivacySelectedFriends}
                  setShowCustomPrivacyListSelection={
                    setShowCustomPrivacyListSelection
                  }
                />
              </Collapsible.Content>
            </S.PromptInputRoot>
          </StoreProvider>
        </Collapsible.Root>
      </>
    );
  },
);

export default PromptInput;
