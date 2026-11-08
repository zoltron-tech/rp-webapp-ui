"use client";

import type { MuseConnectionGroup } from "@nw/types";
import { fileTooLargeMessage } from "@nw/utils";
import classNames from "classnames";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiUser, FiUsers } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { IoCloseOutline } from "react-icons/io5";
import { MdGif } from "react-icons/md";
import { searchMentionMusesAction } from "@/app/rp/muse/actions";
import {
  createMuseConnectionAction,
  updateMuseConnectionAction,
} from "@/app/rp/muse/connection-actions";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import * as S from "./styled";
import { MuseConnectionTrayHeader } from "./tray-header";

export type PickedMuse = {
  museId: string;
  displayName: string;
  image: string | null;
  pennedBy?: { username: string; image: string | null } | null;
};

export type MuseConnectionFormState = {
  loading: boolean;
  isEditMode: boolean;
  /** True when a friend's muse is involved (needs approval → "request"). */
  involvesFriendMuse: boolean;
};

export type MuseConnectionFormHandle = {
  submit: () => void;
};

export type MuseConnectionFormProps = {
  /** Provide an existing connection for edit mode; omit for create mode. */
  connection?: MuseConnectionGroup;
  /** Muse pre-selected in create mode (the muse whose profile we came from). */
  initialMuse?: PickedMuse;
  onSave: (connection: MuseConnectionGroup) => void;
  onCancel: () => void;
  /** Hide the built-in Cancel/Submit row — used when a tray header supplies them. */
  hideActions?: boolean;
  /** Reports submit-readiness so an external tray header can drive the same submit. */
  onStateChange?: (state: MuseConnectionFormState) => void;
};

const MAX_TITLE_LENGTH = 25;
const MAX_MUSES = 10;
const MIN_MUSES = 2;

export const MuseConnectionForm = forwardRef<
  MuseConnectionFormHandle,
  MuseConnectionFormProps
>(function MuseConnectionForm(
  { connection, initialMuse, onSave, onCancel, hideActions, onStateChange },
  ref,
) {
  const { successToast, errorToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();
  // The service's cap for the file's family (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();
  const novelist = useGlobalState("novelist");
  const theme = useGlobalState("theme");
  const accent = useGlobalState("accent");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(connection?.id);

  const [title, setTitle] = useState(connection?.title ?? "");
  const [text, setText] = useState(connection?.description ?? "");
  const [selectedMuses, setSelectedMuses] = useState<PickedMuse[]>(() => {
    // Edit mode: seed the chips from the connection's existing muses so their
    // avatars show. Create mode: just the pre-selected muse (if any).
    if (isEditMode && connection?.muses.length) {
      return connection.muses.map((m) => ({
        displayName: [m.firstName, m.lastName].filter(Boolean).join(" "),
        image: m.image,
        museId: m.museId,
      }));
    }
    return initialMuse ? [initialMuse] : [];
  });
  const [museTab, setMuseTab] = useState<"own" | "friends">("own");
  const [ownListExpanded, setOwnListExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<PickedMuse[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  // ── Mobile GIF-picker tray open/close animation ───────────────────────────
  // On mobile the form itself already renders inside a bottom sheet (see
  // connections-section.tsx), and `AppAlertDialog`'s z-index sits well below
  // that sheet's — opening the GIF picker as a centered dialog put it behind
  // the tray instead of in front of it. Render it as a second, stacked bottom
  // sheet instead, same slide-up pattern as the outer one.
  const [gifSheetVisible, setGifSheetVisible] = useState(false);
  const [gifSheetOpen, setGifSheetOpen] = useState(false);
  const [gifStartY, setGifStartY] = useState(0);
  const gifCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMobile) return;
    if (showGifPicker) {
      if (gifCloseTimerRef.current) {
        clearTimeout(gifCloseTimerRef.current);
        gifCloseTimerRef.current = null;
      }
      setGifSheetVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setGifSheetOpen(true)),
      );
    } else {
      setGifSheetOpen(false);
      gifCloseTimerRef.current = setTimeout(
        () => setGifSheetVisible(false),
        300,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGifPicker, isMobile]);

  useEffect(
    () => () => {
      if (gifCloseTimerRef.current) clearTimeout(gifCloseTimerRef.current);
    },
    [],
  );
  // ── /Mobile GIF-picker tray open/close animation ──────────────────────────

  // The signed-in novelist's own muses, straight from the global store — no
  // backend round-trip needed to tell "mine" apart from "a friend's".
  const ownMuseIds = useMemo(
    () =>
      new Set(
        (novelist?.muses ?? [])
          .map((m) => m.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [novelist?.muses],
  );
  const isOwnMuse = useCallback(
    (museId: string) => ownMuseIds.has(museId),
    [ownMuseIds],
  );

  // "My Muses" tab: the full list out of the store (no API call), narrowed
  // by the search box as the user types rather than requiring a query.
  const ownMuseList = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (novelist?.muses ?? [])
      .filter((m) => m.id && !selectedMuses.some((s) => s.museId === m.id))
      .filter(
        (m) =>
          !term ||
          [m.firstName, m.lastName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term),
      )
      .map((m) => ({
        // Alternative verses carry the same name as their main muse, so tag
        // them with the verse number to keep the picker unambiguous.
        displayName:
          [m.firstName, m.lastName].filter(Boolean).join(" ") +
          (m.originalVerseId ? ` (Verse ${m.verseNumber ?? 2})` : ""),
        image: m.image || null,
        museId: m.id as string,
      }));
  }, [novelist?.muses, search, selectedMuses]);

  // Typing a search term always reveals the list, even if collapsed.
  useEffect(() => {
    if (museTab === "own" && search.trim()) setOwnListExpanded(true);
  }, [search, museTab]);

  // "Friends' Muses" tab: debounced backend search (unchanged), own muses
  // filtered out since those already live under the "My Muses" tab.
  useEffect(() => {
    if (isEditMode || museTab !== "friends") return;
    const handle = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        setSearchOpen(false);
        return;
      }
      const results = await searchMentionMusesAction(search.trim());
      setSearchResults(
        results
          .filter((r) => r.type === "MUSE" && !isOwnMuse(r.id))
          .map((r) => ({
            displayName: r.displayName,
            image: r.image || null,
            museId: r.id,
            pennedBy: r.pennedBy ?? null,
          })),
      );
      setSearchOpen(true);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, isEditMode, museTab, isOwnMuse]);

  const addMuse = useCallback((muse: PickedMuse) => {
    setSelectedMuses((prev) => {
      if (prev.some((m) => m.museId === muse.museId)) return prev;
      if (prev.length >= MAX_MUSES) {
        setError(`Maximum ${MAX_MUSES} characters per connection`);
        return prev;
      }
      setError(null);
      return [...prev, muse];
    });
    setSearch("");
    setSearchResults([]);
    setSearchOpen(false);
  }, []);

  const removeMuse = useCallback((museId: string) => {
    setSelectedMuses((prev) => prev.filter((m) => m.museId !== museId));
  }, []);

  const handleGifSelect = useCallback((gifUrl: string) => {
    setShowGifPicker(false);
    editorRef.current?.insertGif(gifUrl);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      input.value = "";
      if (!file) return;
      if (file.size > capFor(file.type)) {
        setError(fileTooLargeMessage(capFor(file.type)));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Only images can be embedded");
        return;
      }
      setError(null);

      // Insert inline into the editor (same as story sections)
      const objectUrl = URL.createObjectURL(file);
      editorRef.current?.insertUploadingImage(objectUrl);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      formData.append("prefix", "muse-connection");
      const url = await uploadMedia(formData);
      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload image");
        editorRef.current?.removeImageBySrc(objectUrl);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      editorRef.current?.replaceImageSrc(objectUrl, url);
      URL.revokeObjectURL(objectUrl);
    },
    [capFor, uploadMedia],
  );

  // A friend's muse needs approval → "request"; an all-own-muses connection is
  // created outright → "create".
  const involvesFriendMuse = selectedMuses.some((m) => !isOwnMuse(m.museId));

  const handleSubmit = useCallback(async () => {
    const missingTitle = !title.trim();
    const missingMuses = !isEditMode && selectedMuses.length < MIN_MUSES;
    if (missingTitle || missingMuses) {
      setTitleTouched(missingTitle);
      const parts: string[] = [];
      if (missingTitle) parts.push("a title");
      if (missingMuses) parts.push(`at least ${MIN_MUSES} characters`);
      setError(
        `${parts.join(" and ")} ${parts.length > 1 ? "are" : "is"} required`,
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = isEditMode
        ? await updateMuseConnectionAction(connection!.id, title.trim(), text)
        : await createMuseConnectionAction(
            title.trim(),
            text,
            selectedMuses.map((m) => m.museId),
          );

      if ("message" in response) {
        setError("Failed to save connection");
        errorToast("Failed to save connection");
        return;
      }

      successToast(isEditMode ? "Connection updated" : "Connection requested");
      onSave(response);
    } catch {
      setError("An error occurred while saving");
      errorToast("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  }, [
    connection,
    isEditMode,
    title,
    text,
    selectedMuses,
    successToast,
    errorToast,
    onSave,
  ]);

  useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);

  useEffect(() => {
    onStateChange?.({ involvesFriendMuse, isEditMode, loading });
  }, [onStateChange, involvesFriendMuse, isEditMode, loading]);

  return (
    <S.FormRoot>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <S.Label htmlFor="mc-title">
          Title
          <S.RequiredMark>*</S.RequiredMark> ({title.length}/{MAX_TITLE_LENGTH})
        </S.Label>
        <S.TitleInput
          id="mc-title"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          disabled={loading}
          placeholder="Name this connection…"
          $invalid={titleTouched && !title.trim()}
          aria-required="true"
          aria-invalid={titleTouched && !title.trim()}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError(null);
          }}
          onBlur={() => setTitleTouched(true)}
        />
      </div>

      <S.MusePickerWrap>
        <S.Label>
          Characters
          {!isEditMode && ` (${selectedMuses.length}/${MAX_MUSES})`}
          {!isEditMode && selectedMuses.length >= MAX_MUSES && (
            <S.MaxReachedNote>Maximum limit reached</S.MaxReachedNote>
          )}
        </S.Label>
        <S.MuseChipRow>
          {selectedMuses.map((muse) => {
            // Edit mode: membership is fixed — show just the avatars, no name,
            // owner tag, or remove button.
            if (isEditMode) {
              return (
                <S.MuseAvatarOnly
                  key={muse.museId}
                  $src={muse.image}
                  title={muse.displayName}
                />
              );
            }

            const own = isOwnMuse(muse.museId);
            return (
              <S.MuseChip key={muse.museId} $own={own}>
                <S.MuseChipAvatar $src={muse.image} />
                {muse.displayName.split(" ")[0]}
                <S.MuseOwnerTag $own={own}>
                  {own ? (
                    <>
                      <FiUser size={9} /> Your
                    </>
                  ) : (
                    <>
                      <FiUsers size={9} /> Friend
                    </>
                  )}
                </S.MuseOwnerTag>
                {muse.museId !== initialMuse?.museId && (
                  <S.MuseChipRemove
                    type="button"
                    aria-label={`Remove ${muse.displayName}`}
                    onClick={() => removeMuse(muse.museId)}
                  >
                    <IoCloseOutline size={14} />
                  </S.MuseChipRemove>
                )}
              </S.MuseChip>
            );
          })}
        </S.MuseChipRow>
        {!isEditMode && selectedMuses.length < MAX_MUSES && (
          <>
            <S.MuseTabRow>
              <S.MuseTabButton
                type="button"
                $active={museTab === "own"}
                onClick={() => {
                  setMuseTab("own");
                  setSearch("");
                }}
              >
                <FiUser size={12} /> My Characters
              </S.MuseTabButton>
              <S.MuseTabButton
                type="button"
                $active={museTab === "friends"}
                onClick={() => {
                  setMuseTab("friends");
                  setSearch("");
                }}
              >
                <FiUsers size={12} /> Friends' Characters
              </S.MuseTabButton>
            </S.MuseTabRow>

            <S.MuseSearchInput
              value={search}
              disabled={loading}
              placeholder={
                museTab === "own"
                  ? "Search your characters…"
                  : "Search your friends' characters…"
              }
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            />

            {museTab === "own" && (
              <>
                <S.MuseListToggle
                  type="button"
                  onClick={() => setOwnListExpanded((prev) => !prev)}
                  aria-expanded={ownListExpanded}
                >
                  Your characters ({ownMuseList.length})
                  <S.MuseListToggleIcon $expanded={ownListExpanded}>
                    <FiChevronDown size={14} />
                  </S.MuseListToggleIcon>
                </S.MuseListToggle>

                {ownListExpanded && (
                  <S.MuseListPanel>
                    {ownMuseList.length > 0 ? (
                      ownMuseList.map((result) => (
                        <S.MuseSearchOption
                          key={result.museId}
                          type="button"
                          onClick={() => addMuse(result)}
                        >
                          <S.MuseChipAvatar $src={result.image} />
                          {result.displayName}
                        </S.MuseSearchOption>
                      ))
                    ) : (
                      <S.MuseSearchEmpty>
                        {search.trim()
                          ? "No matching characters of yours"
                          : "You have no other characters to add"}
                      </S.MuseSearchEmpty>
                    )}
                  </S.MuseListPanel>
                )}
              </>
            )}

            {museTab === "friends" && searchOpen && search.trim() && (
              <S.MuseSearchDropdown>
                {searchResults.filter(
                  (r) => !selectedMuses.some((m) => m.museId === r.museId),
                ).length > 0 ? (
                  searchResults
                    .filter(
                      (r) => !selectedMuses.some((m) => m.museId === r.museId),
                    )
                    .map((result) => (
                      <S.MuseSearchOption
                        key={result.museId}
                        type="button"
                        onClick={() => addMuse(result)}
                      >
                        <S.MuseChipAvatar $src={result.image} />
                        <S.MuseSearchOptionText>
                          <S.MuseSearchOptionName>
                            {result.displayName}
                          </S.MuseSearchOptionName>
                          {result.pennedBy && (
                            <S.MuseSearchOptionPennedBy>
                              Penned by {result.pennedBy.username}
                            </S.MuseSearchOptionPennedBy>
                          )}
                        </S.MuseSearchOptionText>
                      </S.MuseSearchOption>
                    ))
                ) : (
                  <S.MuseSearchEmpty>
                    No matching characters among your friends
                  </S.MuseSearchEmpty>
                )}
              </S.MuseSearchDropdown>
            )}
          </>
        )}
      </S.MusePickerWrap>

      {!isEditMode && (
        <S.DescriptionHint>
          You can skip the description for now — once everyone accepts, you
          and the other novelists involved can add and edit it together.
        </S.DescriptionHint>
      )}

      {isEditMode && (
        <div>
          <S.Label>Description (optional)</S.Label>
          <S.DescriptionHint>
            You and any novelist whose character is bonded here can edit the
            title and description at any time.
          </S.DescriptionHint>
          <S.ToolRow>
            <S.ToolButton htmlFor="mc-attach-input" aria-label="Attach image">
              <GrAttachment />
            </S.ToolButton>
            <input
              id="mc-attach-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <S.ToolButton
              as="button"
              type="button"
              aria-label="Insert GIF"
              onClick={() => setShowGifPicker(true)}
            >
              <MdGif />
            </S.ToolButton>
          </S.ToolRow>
          <S.EditorArea>
            <RichTextEditor
              ref={editorRef}
              placeholder="Describe the connection…"
              value={text}
              onChange={setText}
            />
          </S.EditorArea>
        </div>
      )}

      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

      {!hideActions && (
        <S.ButtonGroup>
          <S.CancelButton type="button" disabled={loading} onClick={onCancel}>
            Cancel
          </S.CancelButton>
          <S.SubmitButton
            type="button"
            disabled={loading}
            onClick={handleSubmit}
          >
            {isEditMode
              ? loading
                ? "Saving…"
                : "Save"
              : loading
                ? involvesFriendMuse
                  ? "Requesting…"
                  : "Creating…"
                : involvesFriendMuse
                  ? "Request connection"
                  : "Create connection"}
          </S.SubmitButton>
        </S.ButtonGroup>
      )}

      {isMobile ? (
        gifSheetVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <SheetS.MobilePortalRoot className={classNames([accent, theme])}>
            <SheetS.MobileBackdrop
              $open={gifSheetOpen}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowGifPicker(false);
              }}
            />
            <SheetS.MobileSheet
              $open={gifSheetOpen}
              onTouchStart={(e) => {
                // Stop the swipe from also bubbling to the outer connection
                // tray's own touch handlers — React portals bubble through
                // the React tree, not the DOM tree, so without this a single
                // swipe-down closed both stacked sheets at once instead of
                // just the top one.
                e.stopPropagation();
                setGifStartY(e.touches[0].clientY);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                if (e.changedTouches[0].clientY - gifStartY > 50)
                  setShowGifPicker(false);
              }}
            >
              <SheetS.DragHandle />
              <MuseConnectionTrayHeader title="Insert GIF">
                <S.TrayActionButton
                  type="button"
                  $variant="cancel"
                  aria-label="Close"
                  onClick={() => setShowGifPicker(false)}
                >
                  <IoCloseOutline size={18} />
                </S.TrayActionButton>
              </MuseConnectionTrayHeader>
              <SheetS.MobileContent>
                {showGifPicker && (
                  <GifPicker fill autoFocus={false} onSelect={handleGifSelect} />
                )}
              </SheetS.MobileContent>
            </SheetS.MobileSheet>
          </SheetS.MobilePortalRoot>,
          document.body,
        )
      ) : (
        <AppAlertDialog
          heading="Insert GIF"
          text=""
          body={<GifPicker onSelect={handleGifSelect} />}
          open={showGifPicker}
          onOpenChange={setShowGifPicker}
          showConfirm={false}
          closeButtonText="Close"
        />
      )}
    </S.FormRoot>
  );
});
