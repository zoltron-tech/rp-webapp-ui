"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Fandom, Muse } from "@nw/types";
import type { NWImage } from "@nw/types/novelist";
import type { PrivacyLevel } from "@nw/types/prompt";
import { clamp, toCropFilter } from "@nw/utils";
import classNames from "classnames";
import { Tooltip } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaUser } from "react-icons/fa6";
import {
  FiCamera,
  FiCheck,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  addMuseExtraAttributeAction,
  addMuseNicknameAction,
  changeMuseFandomAction,
  editMuseExtraAttributeAction,
  editMuseNicknameAction,
  removeMuseAvatarAction,
  removeMuseExtraAttributeAction,
  removeMuseNicknameAction,
  searchFandomsAction,
  setMuseAvatarAction,
  setMusePrivacyAction,
} from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { PrivacyIcon } from "@/components/common/privacy-icon";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { ScoreBadgeIcon } from "@/utils/badge-icons";
import { API_MESSAGE } from "@/utils/constants";
import * as S from "../styles";
import PennedBy from "./PennedBy";

const PRIVACY_OPTIONS: PrivacyLevel[] = ["PUBLIC", "FRIENDS", "ONLY_ME"];
const PRIVACY_LABELS: Record<string, string> = {
  FRIENDS: "Friends only",
  ONLY_ME: "Only me",
  PUBLIC: "Public",
};
const PRIVACY_TOOLTIP_TEXT: Record<string, string> = {
  FRIENDS: "This character is visible to friends only",
  ONLY_ME: "This character is private",
  PUBLIC: "This character is public",
};

type Props = {
  muse: Muse | null;
  isOwnMuse: boolean;
  onMuseUpdate?: (updates: Partial<Muse>) => void;
};

export function MuseInfoSection({ muse, isOwnMuse, onMuseUpdate }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const theme = useGlobalState("theme");
  const globalAccent = useGlobalState("accent");
  const { successToast, errorToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();
  const [avatarError, setAvatarError] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [confirmRemoveAvatar, setConfirmRemoveAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState("");
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropScale, setCropScale] = useState(1);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );
  const cropViewportRef = useRef<HTMLDivElement>(null);

  const openCropDialog = (src: string) => {
    setPendingCropSrc(src);
    setCropX(50);
    setCropY(50);
    setCropScale(1);
    setCropDialogOpen(true);
  };

  async function handleAvatarFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !muse?.id) return;

    // Show a data URL immediately in the crop dialog while S3 uploads in parallel
    const reader = new FileReader();
    reader.onloadend = () => {
      openCropDialog(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (tempUploadedImage) await deleteMedia(tempUploadedImage);

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentType", file.type);
    formData.append("prefix", muse.id);
    const url = await uploadMedia(formData);
    setImageUploading(false);

    if (!url || url === API_MESSAGE.MediaError) {
      errorToast("Failed to upload image.");
      setCropDialogOpen(false);
      return;
    }

    setTempUploadedImage(url);
    setPendingCropSrc(url);
  }

  // Dragging is handled imperatively inside AvatarCropDialog; it commits the
  // final position here once the gesture settles.
  const handleCropPan = (nx: number, ny: number) => {
    setCropX(clamp(nx, 0, 100));
    setCropY(clamp(ny, 0, 100));
  };

  const handleCropScaleChange = (v: number) => {
    setCropScale(clamp(v, 1, 3));
  };

  const handleCropConfirm = useCallback(() => {
    if (!muse?.id) return;
    const crop = toCropFilter(pendingCropSrc, cropX, cropY, cropScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCropSrc,
    };
    setAvatarSaving(true);
    setMuseAvatarAction(muse.id, nwImage).then((result) => {
      setAvatarSaving(false);
      if (result && typeof result === "object" && "message" in result) {
        errorToast("Failed to update avatar.");
        return;
      }
      setAvatarError(false);
      setTempUploadedImage(null);
      onMuseUpdate?.({ avatar: result as NWImage });
      successToast("Avatar updated.");
    });
  }, [
    muse?.id,
    pendingCropSrc,
    cropX,
    cropY,
    cropScale,
    onMuseUpdate,
    errorToast,
    successToast,
  ]);

  const handleCropCancel = useCallback(async () => {
    if (tempUploadedImage && tempUploadedImage === pendingCropSrc) {
      await deleteMedia(tempUploadedImage);
      setTempUploadedImage(null);
    }
    setCropDialogOpen(false);
  }, [tempUploadedImage, pendingCropSrc]);

  const resetCrop = useCallback(() => {
    setCropX(50);
    setCropY(50);
    setCropScale(1);
  }, []);

  async function handleRemoveAvatar() {
    if (!muse?.id) return;
    const result = await removeMuseAvatarAction(muse.id);
    if (result && typeof result === "object" && "message" in result) {
      errorToast("Failed to remove avatar.");
      return;
    }
    onMuseUpdate?.({ avatar: null });
    successToast("Avatar removed.");
  }

  // ── Extra attributes ───────────────────────────────────────────────────────
  const [addingNew, setAddingNew] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editKeyDraft, setEditKeyDraft] = useState("");
  const [editValueDraft, setEditValueDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // ── Fandom ─────────────────────────────────────────────────────────────────
  const [fandomEditing, setFandomEditing] = useState(false);
  const [fandomQuery, setFandomQuery] = useState("");
  const [fandomResults, setFandomResults] = useState<Fandom[]>([]);
  const [fandomSearching, setFandomSearching] = useState(false);
  const [savingFandom, setSavingFandom] = useState(false);
  const fandomSearchWrapRef = useRef<HTMLDivElement>(null);
  const [fandomDropdownPos, setFandomDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // ── Nicknames ──────────────────────────────────────────────────────────────
  const [nickAddMode, setNickAddMode] = useState(false);
  const [nickAddValue, setNickAddValue] = useState("");
  const [nickSavingAdd, setNickSavingAdd] = useState(false);
  const [nickEditingValue, setNickEditingValue] = useState<string | null>(null);
  const [nickEditDraft, setNickEditDraft] = useState("");
  const [nickSavingEdit, setNickSavingEdit] = useState(false);
  const [nickRemoving, setNickRemoving] = useState<string | null>(null);
  const [confirmRemoveNick, setConfirmRemoveNick] = useState<string | null>(
    null,
  );

  // ── Privacy & Tooltips ────────────────────────────────────────────────────
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [pendingPrivacy, setPendingPrivacy] = useState<PrivacyLevel | null>(
    null,
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [scoreTooltipOpen, setScoreTooltipOpen] = useState(false);
  const [privacyTooltipOpen, setPrivacyTooltipOpen] = useState(false);
  const privacyRef = useRef<HTMLDivElement>(null);
  const scoreCornerRef = useRef<HTMLSpanElement>(null);
  const privacyCornerRef = useRef<HTMLDivElement>(null);

  // Close privacy dropdown and tooltips on outside click
  useEffect(() => {
    if (!privacyOpen && !scoreTooltipOpen && !privacyTooltipOpen) return;
    function handler(e: MouseEvent) {
      if (
        privacyOpen &&
        privacyRef.current &&
        !privacyRef.current.contains(e.target as Node)
      ) {
        setPrivacyOpen(false);
      }
      if (
        scoreTooltipOpen &&
        scoreCornerRef.current &&
        !scoreCornerRef.current.contains(e.target as Node)
      ) {
        setScoreTooltipOpen(false);
      }
      if (
        privacyTooltipOpen &&
        privacyCornerRef.current &&
        !privacyCornerRef.current.contains(e.target as Node)
      ) {
        setPrivacyTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [privacyOpen, scoreTooltipOpen, privacyTooltipOpen]);

  // Fandom search debounce
  useEffect(() => {
    if (!fandomEditing || !fandomQuery.trim()) {
      setFandomResults([]);
      setFandomSearching(false);
      return;
    }
    setFandomSearching(true);
    const t = setTimeout(async () => {
      const res = await searchFandomsAction(fandomQuery.trim());
      setFandomSearching(false);
      setFandomResults(Array.isArray(res) ? res.slice(0, 6) : []);
    }, 300);
    return () => {
      clearTimeout(t);
      setFandomSearching(false);
    };
  }, [fandomQuery, fandomEditing]);

  // Track fandom search wrap position for the portal dropdown
  useEffect(() => {
    if (
      (fandomResults.length > 0 || fandomSearching) &&
      fandomEditing &&
      fandomSearchWrapRef.current
    ) {
      const rect = fandomSearchWrapRef.current.getBoundingClientRect();
      setFandomDropdownPos({
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      });
    } else {
      setFandomDropdownPos(null);
    }
  }, [fandomResults, fandomSearching, fandomEditing]);

  // ── Extra attribute handlers ───────────────────────────────────────────────

  function startEdit(key: string, value: string) {
    setEditingKey(key);
    setEditKeyDraft(key);
    setEditValueDraft(value);
    setAddingNew(false);
  }

  function cancelEdit() {
    setEditingKey(null);
  }

  function startAdd() {
    setAddingNew(true);
    setNewKey("");
    setNewValue("");
    setEditingKey(null);
  }

  function cancelAdd() {
    setAddingNew(false);
  }

  async function handleAdd() {
    if (!muse?.id) return;
    const key = newKey.trim();
    const value = newValue.trim();
    if (!key || !value) return;

    setSavingNew(true);
    const result = await addMuseExtraAttributeAction(muse.id, key, value);
    setSavingNew(false);

    if ("message" in result) {
      errorToast("Failed to add attribute.");
      return;
    }
    onMuseUpdate?.({
      extraAttributes: result,
      totalPoints: (muse.totalPoints ?? 0) + 5,
    });
    setAddingNew(false);
    successToast("Attribute added.");
  }

  async function handleRemove(key: string) {
    if (!muse?.id) return;
    setRemovingKey(key);
    const result = await removeMuseExtraAttributeAction(muse.id, key);
    setRemovingKey(null);
    if ("message" in result) {
      errorToast("Failed to remove attribute.");
      return;
    }
    onMuseUpdate?.({
      extraAttributes: result,
      totalPoints: Math.max(0, (muse.totalPoints ?? 0) - 5),
    });
    successToast("Attribute removed.");
  }

  async function handleSaveEdit() {
    if (!muse?.id || !editingKey) return;
    const key = editKeyDraft.trim();
    const value = editValueDraft.trim();
    if (!key || !value) return;
    setSavingEdit(true);
    const result = await editMuseExtraAttributeAction(
      muse.id,
      editingKey,
      key,
      value,
    );
    setSavingEdit(false);
    if ("message" in result) {
      errorToast("Failed to update attribute.");
      return;
    }
    onMuseUpdate?.({ extraAttributes: result });
    setEditingKey(null);
    successToast("Attribute updated.");
  }

  // ── Fandom handler ─────────────────────────────────────────────────────────

  async function handleFandomChange(fandom: Fandom) {
    if (!muse?.id) return;
    setSavingFandom(true);
    const result = await changeMuseFandomAction(muse.id, fandom.id);
    setSavingFandom(false);
    if ("message" in result) {
      errorToast("Failed to update fandom.");
      return;
    }
    onMuseUpdate?.({ fandom: result as Fandom });
    setFandomEditing(false);
    setFandomQuery("");
    successToast("Fandom updated.");
  }

  function openFandomPicker() {
    setFandomEditing(true);
    setFandomQuery("");
    setFandomResults([]);
  }

  function closeFandomPicker() {
    setFandomEditing(false);
    setFandomQuery("");
    setFandomResults([]);
  }

  // ── Nickname handlers ──────────────────────────────────────────────────────

  async function handleAddNickname() {
    const v = nickAddValue.trim();
    if (!v || !muse?.id) return;
    setNickSavingAdd(true);
    const result = await addMuseNicknameAction(muse.id, v);
    setNickSavingAdd(false);
    if ("message" in result) {
      errorToast("Failed to add nickname.");
      return;
    }
    onMuseUpdate?.({ nicknames: result as string[] });
    setNickAddValue("");
    setNickAddMode(false);
    successToast("Nickname added.");
  }

  async function handleEditNickname() {
    const newVal = nickEditDraft.trim();
    if (!newVal || !nickEditingValue || !muse?.id) return;
    setNickSavingEdit(true);
    const result = await editMuseNicknameAction(
      muse.id,
      nickEditingValue,
      newVal,
    );
    setNickSavingEdit(false);
    if ("message" in result) {
      errorToast("Failed to update nickname.");
      return;
    }
    onMuseUpdate?.({ nicknames: result as string[] });
    setNickEditingValue(null);
    successToast("Nickname updated.");
  }

  async function handleRemoveNickname(nickname: string) {
    if (!muse?.id) return;
    setNickRemoving(nickname);
    const result = await removeMuseNicknameAction(muse.id, nickname);
    setNickRemoving(null);
    if ("message" in result) {
      errorToast("Failed to remove nickname.");
      return;
    }
    onMuseUpdate?.({ nicknames: result as string[] });
    successToast("Nickname removed.");
  }

  // ── Privacy handler ────────────────────────────────────────────────────────

  async function handlePrivacyChange() {
    if (!pendingPrivacy || !muse?.id) return;
    setSavingPrivacy(true);
    const result = await setMusePrivacyAction(muse.id, pendingPrivacy);
    setSavingPrivacy(false);
    if (result && typeof result === "object" && "message" in result) {
      errorToast("Failed to update privacy.");
      setPendingPrivacy(null);
      return;
    }
    onMuseUpdate?.({ privacy: result as PrivacyLevel });
    setPendingPrivacy(null);
    successToast("Privacy updated.");
  }

  const hasAttributes = Boolean(
    muse?.extraAttributes && Object.keys(muse.extraAttributes).length > 0,
  );
  const nicknames = muse?.nicknames ?? [];
  const canAddNickname = nicknames.length < 5;

  if (!muse) {
    return (
      <S.CardExpandedWrapper>
        <S.CardBack className="muse-card">
          <S.InfoCardContent>
            <S.InfoScrollBody>
              <S.InfoHeaderSection>
                <S.ShimmerCircle $size="82px" />
                <S.ShimmerLine
                  $width="140px"
                  $height="18px"
                  style={{ marginTop: "6px" }}
                />
                <S.ShimmerLine $width="90px" $height="12px" />
              </S.InfoHeaderSection>

              <S.InfoDivider />

              <S.InfoAttrLabelRow>Details</S.InfoAttrLabelRow>
              <S.InfoDetailsSection>
                <S.InfoAttributesGrid>
                  <S.ShimmerBlock $height="52px" />
                  <S.ShimmerBlock $height="52px" />
                  <S.ShimmerBlock $height="52px" />
                  <S.ShimmerBlock $height="52px" />
                </S.InfoAttributesGrid>
              </S.InfoDetailsSection>
            </S.InfoScrollBody>
          </S.InfoCardContent>
        </S.CardBack>
      </S.CardExpandedWrapper>
    );
  }

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          {/* Score corner */}
          <ShouldRender if={typeof muse?.totalPoints === "number"}>
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root
                open={scoreTooltipOpen}
                onOpenChange={setScoreTooltipOpen}
              >
                <Tooltip.Trigger asChild>
                  <S.InfoScoreCorner
                    ref={scoreCornerRef}
                    accent={accent ?? null}
                    onClick={() => setScoreTooltipOpen((v) => !v)}
                  >
                    <ScoreBadgeIcon size={12} />
                    {muse?.totalPoints?.toLocaleString()}
                  </S.InfoScoreCorner>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={4}
                    className={classNames([globalAccent, theme])}
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--bg-6)",
                      borderRadius: "6px",
                      color: "var(--text)",
                      fontSize: "12px",
                      maxWidth: "220px",
                      padding: "6px 10px",
                      userSelect: "none",
                      zIndex: 9999,
                    }}
                  >
                    Score reflects how active this character is in the
                    community.
                    <Tooltip.Arrow style={{ fill: "var(--bg-6)" }} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </ShouldRender>

          {/* Privacy corner */}
          <S.InfoPrivacyCorner ref={privacyCornerRef}>
            {isOwnMuse && !muse?.originalVerseId ? (
              <S.InfoPrivacyDropdownWrap ref={privacyRef}>
                <S.InfoPrivacyBtn
                  type="button"
                  title="Change privacy"
                  onClick={() => setPrivacyOpen((o) => !o)}
                >
                  <PrivacyIcon privacy={muse?.privacy ?? "PUBLIC"} />
                </S.InfoPrivacyBtn>
                {privacyOpen && (
                  <S.InfoPrivacyDropdown>
                    {PRIVACY_OPTIONS.map((p) => (
                      <S.InfoPrivacyOption
                        key={p}
                        type="button"
                        $active={muse?.privacy === p}
                        onClick={() => {
                          setPrivacyOpen(false);
                          if (p !== muse?.privacy) setPendingPrivacy(p);
                        }}
                      >
                        <PrivacyIcon privacy={p} />
                        {PRIVACY_LABELS[p]}
                      </S.InfoPrivacyOption>
                    ))}
                  </S.InfoPrivacyDropdown>
                )}
              </S.InfoPrivacyDropdownWrap>
            ) : (
              <Tooltip.Provider delayDuration={200}>
                <Tooltip.Root
                  open={privacyTooltipOpen}
                  onOpenChange={setPrivacyTooltipOpen}
                >
                  <Tooltip.Trigger asChild>
                    <span
                      style={{ cursor: "pointer", display: "inline-flex" }}
                      onClick={() => setPrivacyTooltipOpen((v) => !v)}
                    >
                      <PrivacyIcon privacy={muse?.privacy ?? "PUBLIC"} />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      sideOffset={4}
                      className={classNames([globalAccent, theme])}
                      style={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--bg-6)",
                        borderRadius: "6px",
                        color: "var(--text)",
                        fontSize: "12px",
                        maxWidth: "200px",
                        padding: "6px 10px",
                        userSelect: "none",
                        zIndex: 9999,
                      }}
                    >
                      {muse?.originalVerseId
                        ? "Privacy is inherited from the original character"
                        : PRIVACY_TOOLTIP_TEXT[muse?.privacy ?? "ONLY_ME"]}
                      <Tooltip.Arrow style={{ fill: "var(--bg-6)" }} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </S.InfoPrivacyCorner>

          <S.InfoScrollBody accent={accent}>
            {/* Header: avatar + name + nicknames + fandom */}
            <S.InfoHeaderSection>
              {isOwnMuse ? (
                <S.AvatarWrapper>
                  <S.InfoCardAvatar
                    $src={
                      !avatarError ? muse?.avatar?.src || muse?.image || "" : ""
                    }
                    style={{ height: "100%", width: "100%" }}
                  >
                    {((!muse?.avatar?.src && !muse?.image) || avatarError) &&
                      !avatarSaving && <FaUser size={30} />}
                  </S.InfoCardAvatar>

                  <S.AvatarEditBtn
                    type="button"
                    title={avatarSaving ? "Saving…" : "Change photo"}
                    disabled={avatarSaving}
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    {avatarSaving ? (
                      <span style={{ fontSize: "0.5rem" }}>…</span>
                    ) : (
                      <FiCamera size={11} />
                    )}
                  </S.AvatarEditBtn>

                  {muse?.avatar && !avatarSaving && (
                    <S.AvatarRemoveBtn
                      className="avatar-remove"
                      type="button"
                      title="Remove avatar"
                      onClick={() => setConfirmRemoveAvatar(true)}
                    >
                      ×
                    </S.AvatarRemoveBtn>
                  )}

                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={handleAvatarFileChange}
                  />
                </S.AvatarWrapper>
              ) : (
                <S.InfoCardAvatar
                  $src={
                    !avatarError ? muse?.avatar?.src || muse?.image || "" : ""
                  }
                >
                  {((!muse?.avatar?.src && !muse?.image) || avatarError) && (
                    <FaUser size={30} />
                  )}
                </S.InfoCardAvatar>
              )}

              <S.InfoMuseName>
                {muse?.firstName}
                {muse?.lastName ? ` ${muse.lastName}` : ""}
              </S.InfoMuseName>

              <PennedBy pennedBy={muse?.pennedBy} accent={accent ?? null} />

              {/* Nicknames */}
              {isOwnMuse ? (
                <S.InfoNicknamesRow>
                  {nicknames.map((n) =>
                    nickEditingValue === n ? (
                      // Inline edit input — replaces the pill
                      <S.InfoNicknameEditWrap key={n}>
                        <S.InfoNicknameInput
                          value={nickEditDraft}
                          onChange={(e) => setNickEditDraft(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditNickname();
                            if (e.key === "Escape") setNickEditingValue(null);
                          }}
                        />
                        <S.InfoNicknameIconBtn
                          type="button"
                          title="Save"
                          onClick={handleEditNickname}
                          disabled={nickSavingEdit || !nickEditDraft.trim()}
                        >
                          <FiCheck size={9} />
                        </S.InfoNicknameIconBtn>
                        <S.InfoNicknameIconBtn
                          type="button"
                          title="Cancel"
                          onClick={() => setNickEditingValue(null)}
                        >
                          <FiX size={9} />
                        </S.InfoNicknameIconBtn>
                      </S.InfoNicknameEditWrap>
                    ) : (
                      // Clicking the pill starts edit; delete button appears on hover (desktop) or always (mobile)
                      <S.InfoNicknameOwnerPill
                        key={n}
                        onClick={() => {
                          setNickEditingValue(n);
                          setNickEditDraft(n);
                          setNickAddMode(false);
                        }}
                      >
                        <span>{n}</span>
                        <S.InfoNicknameDeleteBtn
                          type="button"
                          title="Remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmRemoveNick(n);
                          }}
                          disabled={nickRemoving === n}
                        >
                          {nickRemoving === n ? (
                            "…"
                          ) : (
                            <>
                              <S.InfoNicknameDeleteTrash>
                                <FiTrash2 size={9} />
                              </S.InfoNicknameDeleteTrash>
                              <S.InfoNicknameDeleteCross>
                                ×
                              </S.InfoNicknameDeleteCross>
                            </>
                          )}
                        </S.InfoNicknameDeleteBtn>
                      </S.InfoNicknameOwnerPill>
                    ),
                  )}

                  {/* Add nickname */}
                  {nickAddMode ? (
                    <S.InfoNicknameEditWrap>
                      <S.InfoNicknameInput
                        value={nickAddValue}
                        onChange={(e) => setNickAddValue(e.target.value)}
                        autoFocus
                        placeholder="Nickname"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddNickname();
                          if (e.key === "Escape") {
                            setNickAddMode(false);
                            setNickAddValue("");
                          }
                        }}
                      />
                      <S.InfoNicknameIconBtn
                        type="button"
                        title="Save"
                        onClick={handleAddNickname}
                        disabled={nickSavingAdd || !nickAddValue.trim()}
                      >
                        <FiCheck size={9} />
                      </S.InfoNicknameIconBtn>
                      <S.InfoNicknameIconBtn
                        type="button"
                        title="Cancel"
                        onClick={() => {
                          setNickAddMode(false);
                          setNickAddValue("");
                        }}
                      >
                        <FiX size={9} />
                      </S.InfoNicknameIconBtn>
                    </S.InfoNicknameEditWrap>
                  ) : canAddNickname ? (
                    <S.InfoNicknameAddBtn
                      type="button"
                      onClick={() => {
                        setNickAddMode(true);
                        setNickEditingValue(null);
                      }}
                    >
                      <FiPlus size={9} />
                      {nicknames.length === 0 ? "Add nickname" : "Add"}
                    </S.InfoNicknameAddBtn>
                  ) : null}
                </S.InfoNicknamesRow>
              ) : (
                <ShouldRender if={Boolean(nicknames.length)}>
                  <S.InfoNicknamesRow>
                    {nicknames.map((n) => (
                      <S.InfoNicknamePill key={n}>{n}</S.InfoNicknamePill>
                    ))}
                  </S.InfoNicknamesRow>
                </ShouldRender>
              )}

              {/* Fandom */}
              {isOwnMuse ? (
                fandomEditing ? (
                  <S.InfoFandomSearchWrap ref={fandomSearchWrapRef}>
                    <S.InfoFandomSearchIcon>
                      <FiSearch size={14} />
                    </S.InfoFandomSearchIcon>
                    <S.InfoFandomInput
                      value={fandomQuery}
                      onChange={(e) => setFandomQuery(e.target.value)}
                      placeholder="Search fandom…"
                      autoFocus
                      disabled={savingFandom}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") closeFandomPicker();
                      }}
                      onBlur={() => setTimeout(closeFandomPicker, 200)}
                    />
                    <S.InfoFandomCancelBtn
                      type="button"
                      title="Cancel"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={closeFandomPicker}
                    >
                      ×
                    </S.InfoFandomCancelBtn>
                  </S.InfoFandomSearchWrap>
                ) : (
                  <S.FandomValue
                    color={muse?.fandom?.color || "#555"}
                    style={{ cursor: "pointer" }}
                    onClick={openFandomPicker}
                    title="Change fandom"
                  >
                    {muse?.fandom?.name || "No Fandom"}
                    <FiEdit2 size={9} style={{ marginLeft: 4, opacity: 0.7 }} />
                  </S.FandomValue>
                )
              ) : (
                <ShouldRender
                  if={Boolean(muse?.fandom && muse.fandom.id !== "FANDOMLESS")}
                >
                  <S.FandomValue color={muse?.fandom?.color || "#444"}>
                    {muse?.fandom?.name}
                  </S.FandomValue>
                </ShouldRender>
              )}
            </S.InfoHeaderSection>

            <S.InfoDivider $accent={accent ?? null} />

            {/* Details label row */}
            <S.InfoAttrLabelRow>
              Details
              {isOwnMuse && (hasAttributes || addingNew) && (
                <S.InfoAttrAddBtn
                  type="button"
                  onClick={startAdd}
                  disabled={addingNew || savingNew}
                >
                  <FiPlus size={10} />
                  Add
                </S.InfoAttrAddBtn>
              )}
            </S.InfoAttrLabelRow>

            {/* Details */}
            <S.InfoDetailsSection $accent={accent ?? null}>
              <ShouldRender if={!hasAttributes && !addingNew}>
                <S.SectionEmptyWrap>
                  <S.SectionEmpty>No information yet.</S.SectionEmpty>
                  <ShouldRender if={isOwnMuse}>
                    <S.InfoAttrAddBtn
                      type="button"
                      onClick={startAdd}
                      disabled={savingNew}
                    >
                      <FiPlus size={10} />
                      Add
                    </S.InfoAttrAddBtn>
                  </ShouldRender>
                </S.SectionEmptyWrap>
              </ShouldRender>

              <ShouldRender if={hasAttributes || addingNew}>
                <S.InfoAttributesGrid>
                  {addingNew && (
                    <S.InfoAttrForm>
                      <S.InfoAttrInputRow>
                        <S.InfoAttrInput
                          type="text"
                          placeholder="Key (e.g. Age)"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          autoFocus
                          autoCapitalize="words"
                          autoComplete="off"
                        />
                        <S.InfoAttrInput
                          type="text"
                          placeholder="Value"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          autoComplete="off"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd();
                            if (e.key === "Escape") cancelAdd();
                          }}
                        />
                      </S.InfoAttrInputRow>
                      <S.InfoAttrBtnRow>
                        <S.InfoAttrCancelBtn
                          type="button"
                          onClick={cancelAdd}
                          disabled={savingNew}
                        >
                          Cancel
                        </S.InfoAttrCancelBtn>
                        <S.InfoAttrSaveBtn
                          type="button"
                          onClick={handleAdd}
                          disabled={
                            savingNew || !newKey.trim() || !newValue.trim()
                          }
                        >
                          {savingNew ? "Adding…" : "Add"}
                        </S.InfoAttrSaveBtn>
                      </S.InfoAttrBtnRow>
                    </S.InfoAttrForm>
                  )}

                  {muse?.extraAttributes &&
                    Object.entries(muse.extraAttributes).map(([key, value]) =>
                      isOwnMuse && editingKey === key ? (
                        <S.InfoAttrForm key={key}>
                          <S.InfoAttrInputRow>
                            <S.InfoAttrInput
                              type="text"
                              placeholder="Key"
                              value={editKeyDraft}
                              onChange={(e) => setEditKeyDraft(e.target.value)}
                              autoFocus
                              autoCapitalize="words"
                              autoComplete="off"
                            />
                            <S.InfoAttrInput
                              type="text"
                              placeholder="Value"
                              value={editValueDraft}
                              onChange={(e) =>
                                setEditValueDraft(e.target.value)
                              }
                              autoComplete="off"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                          </S.InfoAttrInputRow>
                          <S.InfoAttrBtnRow>
                            <S.InfoAttrCancelBtn
                              type="button"
                              onClick={cancelEdit}
                              disabled={savingEdit}
                            >
                              Cancel
                            </S.InfoAttrCancelBtn>
                            <S.InfoAttrSaveBtn
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={
                                savingEdit ||
                                !editKeyDraft.trim() ||
                                !editValueDraft.trim()
                              }
                            >
                              {savingEdit ? "Saving…" : "Save"}
                            </S.InfoAttrSaveBtn>
                          </S.InfoAttrBtnRow>
                        </S.InfoAttrForm>
                      ) : isOwnMuse ? (
                        <S.InfoAttrCardWrap key={key} accent={accent}>
                          <S.InfoAttributeKey>{key}</S.InfoAttributeKey>
                          <S.InfoAttributeValue>{value}</S.InfoAttributeValue>
                          <S.InfoAttrCardActions className="attr-actions">
                            <S.InfoAttrIconBtn
                              type="button"
                              title="Edit"
                              onClick={() => startEdit(key, value)}
                              disabled={removingKey === key}
                            >
                              <FiEdit2 size={10} />
                            </S.InfoAttrIconBtn>
                            <S.InfoAttrIconBtn
                              type="button"
                              title="Remove"
                              onClick={() => setConfirmDeleteKey(key)}
                              disabled={removingKey === key}
                            >
                              {removingKey === key ? (
                                "…"
                              ) : (
                                <FiTrash2 size={10} />
                              )}
                            </S.InfoAttrIconBtn>
                          </S.InfoAttrCardActions>
                        </S.InfoAttrCardWrap>
                      ) : (
                        <S.InfoAttributeCard key={key} accent={accent}>
                          <S.InfoAttributeKey>{key}</S.InfoAttributeKey>
                          <S.InfoAttributeValue>{value}</S.InfoAttributeValue>
                        </S.InfoAttributeCard>
                      ),
                    )}
                </S.InfoAttributesGrid>
              </ShouldRender>
            </S.InfoDetailsSection>
          </S.InfoScrollBody>
        </S.InfoCardContent>
      </S.CardBack>

      {/* Fandom results dropdown — portalled to body to escape overflow/contain clipping */}
      {fandomDropdownPos &&
        createPortal(
          <S.InfoFandomDropdown
            style={{
              left: fandomDropdownPos.left,
              position: "fixed",
              top: fandomDropdownPos.top,
              width: fandomDropdownPos.width,
              zIndex: 9999,
            }}
          >
            {fandomSearching ? (
              <S.InfoFandomOption
                as="div"
                style={{ color: "rgba(255,255,255,0.4)", cursor: "default" }}
              >
                Searching…
              </S.InfoFandomOption>
            ) : (
              fandomResults.map((f) => (
                <S.InfoFandomOption
                  key={f.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFandomChange(f)}
                >
                  <span
                    style={{
                      background: f.color,
                      borderRadius: "50%",
                      display: "inline-block",
                      flexShrink: 0,
                      height: 8,
                      width: 8,
                    }}
                  />
                  {f.name}
                </S.InfoFandomOption>
              ))
            )}
          </S.InfoFandomDropdown>,
          document.body,
        )}

      {/* Avatar crop dialog */}
      <AppAlertDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
          setCropDialogOpen(open);
        }}
        heading="Adjust avatar"
        text="Drag to reposition. Use the slider or scroll to zoom."
        showConfirm={false}
        isCancelHidden={true}
        body={
          <S.AvatarCropBody>
            <AvatarCropDialog
              open={cropDialogOpen}
              src={pendingCropSrc}
              x={cropX}
              y={cropY}
              scale={cropScale}
              onOpenChange={setCropDialogOpen}
              onPan={handleCropPan}
              onScaleChange={handleCropScaleChange}
              onReset={resetCrop}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
              isUploading={imageUploading}
              viewportRef={cropViewportRef}
            />
          </S.AvatarCropBody>
        }
      />

      {/* Confirm: remove avatar */}
      <AppAlertDialog
        heading="Remove avatar?"
        text="Remove this character's avatar photo? The card image will be used as fallback."
        open={confirmRemoveAvatar}
        onOpenChange={(open) => {
          if (!open) setConfirmRemoveAvatar(false);
        }}
        onCancel={() => setConfirmRemoveAvatar(false)}
        onConfirm={() => {
          setConfirmRemoveAvatar(false);
          handleRemoveAvatar();
        }}
        actionButtonLabel="Remove"
        actionColor="negative"
      />

      {/* Confirm: delete extra attribute */}
      <AppAlertDialog
        heading="Remove attribute?"
        text={`Are you sure you want to remove "${confirmDeleteKey}"? This cannot be undone.`}
        open={confirmDeleteKey !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteKey(null);
        }}
        onCancel={() => setConfirmDeleteKey(null)}
        onConfirm={() => {
          const key = confirmDeleteKey;
          setConfirmDeleteKey(null);
          if (key) handleRemove(key);
        }}
        actionButtonLabel="Remove"
        actionColor="negative"
      />

      {/* Confirm: remove nickname */}
      <AppAlertDialog
        heading="Remove nickname?"
        text={`Remove "${confirmRemoveNick}"?`}
        open={confirmRemoveNick !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmRemoveNick(null);
        }}
        onCancel={() => setConfirmRemoveNick(null)}
        onConfirm={() => {
          const n = confirmRemoveNick;
          setConfirmRemoveNick(null);
          if (n) handleRemoveNickname(n);
        }}
        actionButtonLabel="Remove"
        actionColor="negative"
      />

      {/* Confirm: change privacy */}
      <AppAlertDialog
        heading="Change privacy?"
        text={`Set visibility to "${pendingPrivacy ? PRIVACY_LABELS[pendingPrivacy] : ""}"?`}
        open={pendingPrivacy !== null}
        onOpenChange={(open) => {
          if (!open && !savingPrivacy) setPendingPrivacy(null);
        }}
        onCancel={() => setPendingPrivacy(null)}
        onConfirm={handlePrivacyChange}
        actionButtonLabel={savingPrivacy ? "Saving…" : "Confirm"}
        actionColor="neutral"
        isConfirmDisabled={savingPrivacy}
      />
    </S.CardExpandedWrapper>
  );
}
