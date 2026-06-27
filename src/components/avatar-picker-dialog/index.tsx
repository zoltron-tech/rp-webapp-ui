"use client";

import { useEffect, useState } from "react";
import { BsArrowLeft, BsX } from "react-icons/bs";
import { HiGif } from "react-icons/hi2";
import { RiEmojiStickerLine } from "react-icons/ri";
import { TbCameraUp } from "react-icons/tb";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import { StickerPicker } from "@/components/sticker-picker";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import * as S from "./styled";

type Step = "source" | "type" | "gif" | "sticker";

interface AvatarPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user chooses to upload from device. Dialog closes immediately. */
  onUploadSelect: () => void;
  /** Called when user picks a GIF or Sticker URL from the library. Dialog closes immediately. */
  onMediaSelect: (url: string) => void;
  /**
   * When true the novelist is below Level 2 — GIF/Sticker selection and GIF
   * uploads are locked. The library is still browsable but selecting items
   * shows the lock banner instead of applying the choice.
   */
  isGifLocked?: boolean;
}

const STEP_HEADING: Record<Step, string> = {
  gif: "Pick a GIF",
  source: "Change Avatar",
  sticker: "Pick a Sticker",
  type: "Pick from Library",
};

const STEP_BACK: Partial<Record<Step, Step>> = {
  gif: "type",
  sticker: "type",
  type: "source",
};

export function AvatarPickerDialog({
  open,
  onOpenChange,
  onUploadSelect,
  onMediaSelect,
  isGifLocked = false,
}: AvatarPickerDialogProps) {
  const [step, setStep] = useState<Step>("source");
  // Incrementing this key re-mounts LockedBanner, replaying its pulse animation
  const [lockedPulseKey, setLockedPulseKey] = useState(0);

  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const isPickerStep = step === "gif" || step === "sticker";

  // On mobile, gif/sticker steps render in a tray; dialog takes the other steps
  const dialogOpen = open && !(isMobile && isPickerStep);
  const trayVisible = open && isMobile && isPickerStep;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setStep("source");
    onOpenChange(nextOpen);
  };

  const handleLockedSelect = () => {
    setLockedPulseKey((k) => k + 1);
  };

  const handleTrayBack = () => {
    setStep("type");
  };

  const handleTrayClose = () => {
    handleOpenChange(false);
  };

  // Prevent body scroll when tray is open
  useEffect(() => {
    if (trayVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [trayVisible]);

  const backStep = STEP_BACK[step] ?? null;

  const lockedBanner = isGifLocked ? (
    <S.LockedBanner key={lockedPulseKey}>
      <S.LockedBannerIcon>🔒</S.LockedBannerIcon>
      <S.LockedBannerBody>
        <S.LockedBannerTitle>Animated Avatars — Level 2 Perk</S.LockedBannerTitle>
        <S.LockedBannerDesc>
          Browse freely, but selecting a{" "}
          {step === "gif" ? "GIF" : "Sticker"} unlocks at Level 2. Keep
          writing to level up!
        </S.LockedBannerDesc>
      </S.LockedBannerBody>
    </S.LockedBanner>
  ) : null;

  const body = (
    <>
      {backStep && (
        <S.BackRow>
          <S.BackButton type="button" onClick={() => setStep(backStep)}>
            <BsArrowLeft size={14} />
            Back
          </S.BackButton>
        </S.BackRow>
      )}

      {/* ── Source step: Upload vs From Library ───────────────────────────── */}
      {step === "source" && (
        <S.ChoiceGrid>
          <S.ChoiceCard
            type="button"
            onClick={() => {
              onUploadSelect();
              handleOpenChange(false);
            }}
          >
            <S.ChoiceIconWrap>
              <TbCameraUp size={24} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>Upload</S.ChoiceTitle>
            <S.ChoiceDesc>
              {isGifLocked
                ? "PNG or JPEG from your device"
                : "Image or GIF from your device"}
            </S.ChoiceDesc>
            {isGifLocked && (
              <S.ChoiceGifHint>🔒 GIFs unlock at Level 2</S.ChoiceGifHint>
            )}
          </S.ChoiceCard>

          <S.ChoiceCard type="button" onClick={() => setStep("type")}>
            {isGifLocked && <S.ChoiceLockCorner>Lv. 2</S.ChoiceLockCorner>}
            <S.ChoiceIconWrap>
              <HiGif size={28} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>From Library</S.ChoiceTitle>
            <S.ChoiceDesc>
              {isGifLocked
                ? "Browse — Level 2 to use"
                : "GIF or Sticker from our library"}
            </S.ChoiceDesc>
          </S.ChoiceCard>
        </S.ChoiceGrid>
      )}

      {/* ── Type step: GIF vs Sticker ──────────────────────────────────────── */}
      {step === "type" && (
        <S.ChoiceGrid>
          <S.ChoiceCard type="button" onClick={() => setStep("gif")}>
            {isGifLocked && <S.ChoiceLockCorner>Lv. 2</S.ChoiceLockCorner>}
            <S.ChoiceIconWrap>
              <HiGif size={28} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>GIF</S.ChoiceTitle>
            <S.ChoiceDesc>Search our GIF library</S.ChoiceDesc>
          </S.ChoiceCard>

          <S.ChoiceCard type="button" onClick={() => setStep("sticker")}>
            {isGifLocked && <S.ChoiceLockCorner>Lv. 2</S.ChoiceLockCorner>}
            <S.ChoiceIconWrap>
              <RiEmojiStickerLine size={24} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>Sticker</S.ChoiceTitle>
            <S.ChoiceDesc>Search our Sticker library</S.ChoiceDesc>
          </S.ChoiceCard>
        </S.ChoiceGrid>
      )}

      {/* ── GIF picker (desktop only — mobile uses tray) ───────────────────── */}
      {step === "gif" && !isMobile && (
        <>
          {lockedBanner}
          <GifPicker
            onSelect={
              isGifLocked
                ? handleLockedSelect
                : (url) => {
                    onMediaSelect(url);
                    handleOpenChange(false);
                  }
            }
          />
        </>
      )}

      {/* ── Sticker picker (desktop only — mobile uses tray) ──────────────── */}
      {step === "sticker" && !isMobile && (
        <>
          {lockedBanner}
          <StickerPicker
            onSelect={
              isGifLocked
                ? handleLockedSelect
                : (url) => {
                    onMediaSelect(url);
                    handleOpenChange(false);
                  }
            }
          />
        </>
      )}
    </>
  );

  return (
    <>
      <AppAlertDialog
        heading={STEP_HEADING[step]}
        text=""
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        showConfirm={false}
        closeButtonText="Close"
        body={body}
      />

      {/* ── Mobile bottom-sheet tray for GIF / Sticker pickers ──────────────── */}
      {trayVisible && (
        <>
          <S.PickerTrayOverlay onClick={handleTrayClose} />
          <S.PickerTraySheet>
            <S.PickerTrayHandle />
            <S.PickerTrayHeader>
              <S.PickerTrayBackButton type="button" onClick={handleTrayBack}>
                <BsArrowLeft size={14} />
                Back
              </S.PickerTrayBackButton>
              <S.PickerTrayTitle>{STEP_HEADING[step]}</S.PickerTrayTitle>
              <S.PickerTrayCloseButton
                type="button"
                aria-label="Close"
                onClick={handleTrayClose}
              >
                <BsX size={18} />
              </S.PickerTrayCloseButton>
            </S.PickerTrayHeader>

            {isGifLocked && (
              <S.PickerTrayBannerWrap>
                {lockedBanner}
              </S.PickerTrayBannerWrap>
            )}

            <S.PickerTrayBody>
              {step === "gif" && (
                <GifPicker
                  fill
                  autoFocus={false}
                  onSelect={
                    isGifLocked
                      ? handleLockedSelect
                      : (url) => {
                          onMediaSelect(url);
                          handleOpenChange(false);
                        }
                  }
                />
              )}
              {step === "sticker" && (
                <StickerPicker
                  fill
                  autoFocus={false}
                  onSelect={
                    isGifLocked
                      ? handleLockedSelect
                      : (url) => {
                          onMediaSelect(url);
                          handleOpenChange(false);
                        }
                  }
                />
              )}
            </S.PickerTrayBody>
          </S.PickerTraySheet>
        </>
      )}
    </>
  );
}
