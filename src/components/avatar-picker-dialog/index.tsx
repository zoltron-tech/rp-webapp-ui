"use client";

import { useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { HiGif } from "react-icons/hi2";
import { RiEmojiStickerLine } from "react-icons/ri";
import { TbCameraUp } from "react-icons/tb";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import { StickerPicker } from "@/components/sticker-picker";
import * as S from "./styled";

type Step = "source" | "type" | "gif" | "sticker";

interface AvatarPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user chooses to upload from device. Dialog closes immediately. */
  onUploadSelect: () => void;
  /** Called when user picks a GIF or Sticker URL from the library. Dialog closes immediately. */
  onMediaSelect: (url: string) => void;
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
}: AvatarPickerDialogProps) {
  const [step, setStep] = useState<Step>("source");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setStep("source");
    onOpenChange(nextOpen);
  };

  const backStep = STEP_BACK[step] ?? null;

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
            <S.ChoiceDesc>Image or GIF from your device</S.ChoiceDesc>
          </S.ChoiceCard>

          <S.ChoiceCard type="button" onClick={() => setStep("type")}>
            <S.ChoiceIconWrap>
              <HiGif size={28} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>From Library</S.ChoiceTitle>
            <S.ChoiceDesc>GIF or Sticker from our library</S.ChoiceDesc>
          </S.ChoiceCard>
        </S.ChoiceGrid>
      )}

      {step === "type" && (
        <S.ChoiceGrid>
          <S.ChoiceCard type="button" onClick={() => setStep("gif")}>
            <S.ChoiceIconWrap>
              <HiGif size={28} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>GIF</S.ChoiceTitle>
            <S.ChoiceDesc>Search our GIF library</S.ChoiceDesc>
          </S.ChoiceCard>

          <S.ChoiceCard type="button" onClick={() => setStep("sticker")}>
            <S.ChoiceIconWrap>
              <RiEmojiStickerLine size={24} />
            </S.ChoiceIconWrap>
            <S.ChoiceTitle>Sticker</S.ChoiceTitle>
            <S.ChoiceDesc>Search our Sticker library</S.ChoiceDesc>
          </S.ChoiceCard>
        </S.ChoiceGrid>
      )}

      {step === "gif" && (
        <GifPicker
          onSelect={(url) => {
            onMediaSelect(url);
            handleOpenChange(false);
          }}
        />
      )}

      {step === "sticker" && (
        <StickerPicker
          onSelect={(url) => {
            onMediaSelect(url);
            handleOpenChange(false);
          }}
        />
      )}
    </>
  );

  return (
    <AppAlertDialog
      heading={STEP_HEADING[step]}
      text=""
      open={open}
      onOpenChange={handleOpenChange}
      showConfirm={false}
      closeButtonText="Close"
      body={body}
    />
  );
}
