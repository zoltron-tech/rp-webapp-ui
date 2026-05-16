"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Form, Separator } from "radix-ui";
import { type FormEventHandler, useCallback, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BsArrowLeft, BsPencil, BsUpload } from "react-icons/bs";
import { MdOutlineBrush, MdTune } from "react-icons/md";
import { getMuseMediaAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { NWImage } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { LoaderAction } from "../common/loader-action";
import { AppAlertDialog } from "../dialog";
import { ErrorBox } from "../error-box";
import { PromptPrivacySelect } from "../prompt-input/privacy-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"];
const isImageUrl = (url: string) => {
  const lower = url.toLowerCase().split("?")[0];
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

type TempUploads = {
  image?: string;
  wallpaper?: string;
  cardBackground?: string;
};

type Props = {
  isWizard?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  onBack?: () => void;
  onDone: (savedId?: string) => void;
  onSkip?: () => void;
};

export function AppearanceSection({
  isWizard,
  stepIndex = 0,
  totalSteps = 3,
  onBack,
  onDone,
  onSkip,
}: Props) {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const fandom = useMuseState("fandom");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const privacy = useMuseState("privacy");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const useExtraImages = useMuseState("useExtraImages");
  const setMuseState = useMuseStoreSet();
  const { save, loading } = useMuseSave();
  const { uploadMedia } = useUploadMedia();

  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempAccent, setTempAccent] = useState("#ff0000");
  const [tempUploads, setTempUploads] = useState<TempUploads>({});

  // Combined extra-images dialog
  const [extraDialogOpen, setExtraDialogOpen] = useState(false);
  const [openedFromCheckbox, setOpenedFromCheckbox] = useState(false);
  const [tempWallpaper, setTempWallpaper] = useState<NWImage | null>(null);
  const [tempCardBg, setTempCardBg] = useState<NWImage | null>(null);
  const [tempFilterValues, setTempFilterValues] = useState({
    blur: 0,
    brightness: 100,
    greyscale: 0,
  });

  // Media picker (within the dialog)
  const [pickerTarget, setPickerTarget] = useState<
    "wallpaper" | "cardBackground" | null
  >(null);
  const [museMedia, setMuseMedia] = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  const validateAndUpload = useCallback(
    async (file: File, slot: keyof TempUploads): Promise<string | null> => {
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setMediaError("File type not supported. Allowed: .png, .jpg, .gif");
        return null;
      }
      if (file.size > MAX_FILE_SIZE) {
        setMediaError("File too large (max 50 MB).");
        return null;
      }
      setMediaError(null);

      if (tempUploads[slot]) {
        await deleteMedia(tempUploads[slot] as string);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      if (id) formData.append("prefix", id);

      const url = await uploadMedia(formData);
      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload media. Please try again.");
        return null;
      }

      setTempUploads((prev) => ({ ...prev, [slot]: url }));
      return url;
    },
    [id, uploadMedia, tempUploads],
  );

  const buildNWImage = (
    src: string,
    filterValues = { blur: 0, brightness: 100, greyscale: 0 },
  ): NWImage => ({
    crop: { height: 500, src, width: 500, x: 0, y: 0 },
    filterValues,
    src,
  });

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      const reader = new FileReader();
      reader.onloadend = () => setMuseState({ image: reader.result as string });
      reader.readAsDataURL(file);

      setImageUploading(true);
      const url = await validateAndUpload(file, "image");
      setImageUploading(false);
      if (url) setMuseState({ image: url });
    },
    [setMuseState, validateAndUpload],
  );

  const openExtraDialog = useCallback(
    (fromCheckbox: boolean) => {
      setTempWallpaper(wallpaper);
      setTempCardBg(cardBackground);
      setTempFilterValues(
        wallpaper?.filterValues ?? { blur: 0, brightness: 100, greyscale: 0 },
      );
      setOpenedFromCheckbox(fromCheckbox);
      setPickerTarget(null);
      setExtraDialogOpen(true);
      if (id && museMedia.length === 0) {
        setMediaLoading(true);
        getMuseMediaAction(id).then((result) => {
          setMediaLoading(false);
          if (Array.isArray(result)) setMuseMedia(result);
        });
      }
    },
    [wallpaper, cardBackground, id, museMedia.length],
  );

  const handleExtraDialogSave = useCallback(() => {
    const src = tempWallpaper?.src || image || "";
    setMuseState({
      cardBackground: tempCardBg,
      useExtraImages: true,
      wallpaper: {
        crop: { height: 500, src, width: 500, x: 0, y: 0 },
        filterValues: tempFilterValues,
        src,
      },
    });
    setTempUploads((prev) => ({
      ...prev,
      cardBackground: undefined,
      wallpaper: undefined,
    }));
    setExtraDialogOpen(false);
  }, [tempWallpaper, tempCardBg, tempFilterValues, image, setMuseState]);

  const handleExtraDialogCancel = useCallback(() => {
    if (tempUploads.wallpaper) deleteMedia(tempUploads.wallpaper);
    if (tempUploads.cardBackground) deleteMedia(tempUploads.cardBackground);
    setTempUploads((prev) => ({
      ...prev,
      cardBackground: undefined,
      wallpaper: undefined,
    }));
    if (openedFromCheckbox) setMuseState({ useExtraImages: false });
    setExtraDialogOpen(false);
  }, [openedFromCheckbox, setMuseState, tempUploads]);

  const handlePickerUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      const target = pickerTarget;
      if (!target) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setMediaError("File type not supported. Allowed: .png, .jpg, .gif");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setMediaError("File too large (max 50 MB).");
        return;
      }
      setMediaError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (target === "wallpaper") {
          setTempWallpaper(buildNWImage(dataUrl, tempFilterValues));
        } else {
          setTempCardBg(buildNWImage(dataUrl));
        }
      };
      reader.readAsDataURL(file);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      if (id) formData.append("prefix", id);
      const url = await uploadMedia(formData);
      setImageUploading(false);

      if (url === API_MESSAGE.MediaError) {
        setMediaError("Failed to upload media. Please try again.");
        return;
      }

      const nwImg =
        target === "wallpaper"
          ? buildNWImage(url, tempFilterValues)
          : buildNWImage(url);
      if (target === "wallpaper") {
        setTempWallpaper(nwImg);
        setTempUploads((prev) => ({ ...prev, wallpaper: url }));
      } else {
        setTempCardBg(nwImg);
        setTempUploads((prev) => ({ ...prev, cardBackground: url }));
      }
      setMuseMedia((prev) => (prev.includes(url) ? prev : [url, ...prev]));
      setPickerTarget(null);
    },
    [pickerTarget, tempFilterValues, id, uploadMedia],
  );

  const handleMediaSelect = useCallback(
    (url: string) => {
      if (pickerTarget === "wallpaper") {
        setTempWallpaper(buildNWImage(url, tempFilterValues));
      } else if (pickerTarget === "cardBackground") {
        setTempCardBg(buildNWImage(url));
      }
      setPickerTarget(null);
    },
    [pickerTarget, tempFilterValues],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const privacyValue = (e.target as HTMLFormElement).privacy?.value;
      const result = await save(privacyValue);
      if (!result.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setTempUploads({});
      onDone(result.id);
    },
    [save, onDone],
  );

  const handleCancel = useCallback(async () => {
    for (const url of Object.values(tempUploads)) {
      if (url) await deleteMedia(url);
    }
    onBack?.();
  }, [tempUploads, onBack]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit}>
        <S.TopBar>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            {!isWizard && onBack && (
              <S.BackButton type="button" onClick={handleCancel}>
                <BsArrowLeft size={18} />
              </S.BackButton>
            )}
            <S.FormHeading>
              <MdOutlineBrush />
              <h1>Appearance</h1>
            </S.FormHeading>
          </div>
          <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
            {isWizard && (
              <S.StepBadge>
                Step {stepIndex + 2} of {totalSteps + 1}
              </S.StepBadge>
            )}
            <PromptPrivacySelect
              className="muse-privacy-select"
              initial={privacy}
              blockedOptions={["CUSTOM"]}
            />
          </div>
        </S.TopBar>

        {isWizard && (
          <S.StepDots>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <S.StepDot
                key={i}
                $active={i === stepIndex}
                $done={i < stepIndex}
              />
            ))}
          </S.StepDots>
        )}

        <Separator.Root className="separator" orientation="horizontal" />

        {/* Avatar */}
        <S.BasicInfoFields>
          <S.MediaUploadSectionContainer>
            <Form.Field className="avatar-field" name="avatar">
              <Form.Label className="media-label">
                <AvatarUploadField src={image} alt={firstName || "Avatar"} />
                <span>Avatar</span>
              </Form.Label>
              <Form.Control
                aria-label="Avatar"
                name="avatar"
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                hidden
              />
            </Form.Field>
            <Form.Field className="field checkbox" name="consent">
              <Form.Control
                aria-label="Custom card and wallpaper"
                type="checkbox"
                disabled={loading}
                checked={useExtraImages}
                onChange={() => {
                  if (!useExtraImages) {
                    openExtraDialog(true);
                  } else {
                    setMuseState({ useExtraImages: false });
                  }
                }}
              />
              <Form.Label>Set custom card image and wallpaper</Form.Label>
              {useExtraImages && (
                <S.PaletteButton
                  type="button"
                  onClick={() => openExtraDialog(false)}
                >
                  <MdTune size={15} />
                  Edit
                </S.PaletteButton>
              )}
            </Form.Field>
          </S.MediaUploadSectionContainer>
        </S.BasicInfoFields>

        {/* Combined extra-images / visual settings dialog */}
        <AppAlertDialog
          open={extraDialogOpen}
          onOpenChange={setExtraDialogOpen}
          heading="Visual Settings"
          text=""
          actionButtonLabel="Save"
          closeButtonText="Cancel"
          actionColor="neutral"
          showConfirm={pickerTarget === null}
          isConfirmDisabled={imageUploading}
          onConfirm={handleExtraDialogSave}
          onCancel={handleExtraDialogCancel}
          body={
            pickerTarget ? (
              <S.FilterDialogBody>
                <S.MediaPickerHeader>
                  <S.MediaPickerBackBtn
                    type="button"
                    onClick={() => setPickerTarget(null)}
                  >
                    <BsArrowLeft size={14} />
                    Back
                  </S.MediaPickerBackBtn>
                  <span>
                    Select{" "}
                    {pickerTarget === "wallpaper"
                      ? "Wallpaper"
                      : "Card Background"}
                  </span>
                </S.MediaPickerHeader>
                <ShouldRender if={Boolean(mediaError)}>
                  <ErrorBox className="error">
                    <p>{mediaError}</p>
                  </ErrorBox>
                </ShouldRender>
                <ShouldRender if={mediaLoading}>
                  <S.MediaPickerEmpty>Loading media…</S.MediaPickerEmpty>
                </ShouldRender>
                <ShouldRender if={!mediaLoading}>
                  <S.MediaPickerGrid>
                    {museMedia.filter(isImageUrl).map((url) => (
                      <S.MediaPickerThumb
                        key={url}
                        type="button"
                        $selected={
                          pickerTarget === "wallpaper"
                            ? tempWallpaper?.src === url
                            : tempCardBg?.src === url
                        }
                        onClick={() => handleMediaSelect(url)}
                      >
                        <img src={url} alt="" />
                      </S.MediaPickerThumb>
                    ))}
                    <S.MediaPickerUploadLabel>
                      <BsUpload size={18} />
                      <span>Upload new</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePickerUpload}
                        disabled={imageUploading}
                        hidden
                      />
                    </S.MediaPickerUploadLabel>
                  </S.MediaPickerGrid>
                  <ShouldRender if={museMedia.filter(isImageUrl).length === 0}>
                    <S.MediaPickerEmpty>
                      No gallery images yet. Upload a new image.
                    </S.MediaPickerEmpty>
                  </ShouldRender>
                </ShouldRender>
              </S.FilterDialogBody>
            ) : (
              <S.FilterDialogBody>
                <S.FilterPreviewWrap>
                  <S.FilterPreviewBanner
                    $src={tempWallpaper?.src || image || ""}
                    $greyscale={tempFilterValues.greyscale}
                    $brightness={tempFilterValues.brightness}
                    $blur={tempFilterValues.blur}
                  />
                  {/* Card + expanded info panel */}
                  <S.FilterPreviewLayout>
                    <S.FilterPreviewCardFace
                      $src={tempCardBg?.src || image || ""}
                    />
                    <S.FilterPreviewPanel>
                      <S.FilterPreviewAvatar $src={image || ""} />
                      <S.FilterPreviewMuseName>
                        {[firstName, lastName].filter(Boolean).join(" ") ||
                          "Character Name"}
                      </S.FilterPreviewMuseName>
                      <S.FilterPreviewFandom>
                        {fandom?.name || ""}
                      </S.FilterPreviewFandom>
                      <S.FilterPreviewAttrGrid>
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                        <S.FilterPreviewAttr />
                      </S.FilterPreviewAttrGrid>
                    </S.FilterPreviewPanel>
                  </S.FilterPreviewLayout>
                </S.FilterPreviewWrap>
                <S.PreviewChangeRow>
                  <S.PaletteButton
                    type="button"
                    onClick={() => setPickerTarget("wallpaper")}
                  >
                    Change Wallpaper
                  </S.PaletteButton>
                  <S.PaletteButton
                    type="button"
                    onClick={() => setPickerTarget("cardBackground")}
                  >
                    Change Card
                  </S.PaletteButton>
                </S.PreviewChangeRow>
                <S.FilterSliderGroup>
                  <S.FilterSliderRow>
                    <label htmlFor="filter-greyscale">
                      <span>Greyscale</span>
                      <span className="value">
                        {tempFilterValues.greyscale}%
                      </span>
                    </label>
                    <input
                      id="filter-greyscale"
                      type="range"
                      min={0}
                      max={100}
                      value={tempFilterValues.greyscale}
                      onChange={(e) =>
                        setTempFilterValues((prev) => ({
                          ...prev,
                          greyscale: Number(e.target.value),
                        }))
                      }
                    />
                  </S.FilterSliderRow>
                  <S.FilterSliderRow>
                    <label htmlFor="filter-brightness">
                      <span>Brightness</span>
                      <span className="value">
                        {tempFilterValues.brightness}%
                      </span>
                    </label>
                    <input
                      id="filter-brightness"
                      type="range"
                      min={0}
                      max={200}
                      value={tempFilterValues.brightness}
                      onChange={(e) =>
                        setTempFilterValues((prev) => ({
                          ...prev,
                          brightness: Number(e.target.value),
                        }))
                      }
                    />
                  </S.FilterSliderRow>
                  <S.FilterSliderRow>
                    <label htmlFor="filter-blur">
                      <span>Blur</span>
                      <span className="value">{tempFilterValues.blur}px</span>
                    </label>
                    <input
                      id="filter-blur"
                      type="range"
                      min={0}
                      max={20}
                      value={tempFilterValues.blur}
                      onChange={(e) =>
                        setTempFilterValues((prev) => ({
                          ...prev,
                          blur: Number(e.target.value),
                        }))
                      }
                    />
                  </S.FilterSliderRow>
                </S.FilterSliderGroup>
                <ShouldRender if={imageUploading}>
                  <S.MediaPickerEmpty style={{ padding: "8px 0" }}>
                    Uploading image…
                  </S.MediaPickerEmpty>
                </ShouldRender>
              </S.FilterDialogBody>
            )
          }
        />

        {/* Accent color */}
        <Separator.Root className="separator" orientation="horizontal" />
        <S.MediaUploadSectionContainer>
          <Form.Field className="field checkbox" name="accentEnabled">
            <Form.Control
              aria-label="Accent Enabled"
              type="checkbox"
              checked={useAccent}
              onChange={() => setMuseState({ useAccent: !useAccent })}
            />
            <Form.Label>Set custom profile color</Form.Label>
            {useAccent && (
              <S.AccentColorRow>
                <S.AccentColorSwatch
                  type="button"
                  aria-label="Edit accent color"
                  style={{ backgroundColor: accent ?? "var(--accent)" }}
                  onClick={() => {
                    setTempAccent(accent ?? "#ff0000");
                    setColorPickerOpen(true);
                  }}
                />
                <S.AccentEditButton
                  type="button"
                  aria-label="Edit accent color"
                  onClick={() => {
                    setTempAccent(accent ?? "#ff0000");
                    setColorPickerOpen(true);
                  }}
                >
                  <BsPencil size={14} />
                </S.AccentEditButton>
              </S.AccentColorRow>
            )}
          </Form.Field>
          <AppAlertDialog
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            heading="Pick an accent color"
            text=""
            actionButtonLabel="Select"
            closeButtonText="Cancel"
            actionColor="neutral"
            onConfirm={() => {
              setMuseState({ accent: tempAccent });
              setColorPickerOpen(false);
            }}
            onCancel={() => setColorPickerOpen(false)}
            body={
              <S.AccentPickerDialogBody>
                <HexColorPicker color={tempAccent} onChange={setTempAccent} />
                <div className="hex-input-row">
                  <span>Hex:</span>
                  <input
                    type="text"
                    value={tempAccent}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && val[0] !== "#") val = `#${val}`;
                      setTempAccent(val);
                    }}
                    placeholder="#ff0000"
                  />
                </div>
              </S.AccentPickerDialogBody>
            }
          />
        </S.MediaUploadSectionContainer>

        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            <p>{error}</p>
          </ErrorBox>
        </ShouldRender>

        <Separator.Root className="separator" orientation="horizontal" />
        <S.WizardActions>
          {isWizard ? (
            <>
              <S.SkipButton type="button" onClick={onSkip}>
                Skip
              </S.SkipButton>
              <Form.Submit
                className="submit-button"
                disabled={loading || imageUploading}
              >
                <LoaderAction
                  loading={imageUploading}
                  text="Save & Continue"
                  loadingText="Uploading..."
                />
              </Form.Submit>
            </>
          ) : (
            <>
              <S.ResetButton
                type="button"
                onClick={handleCancel}
                disabled={loading || imageUploading}
              >
                Cancel
              </S.ResetButton>
              <Form.Submit
                className="submit-button"
                disabled={loading || imageUploading}
              >
                <LoaderAction
                  loading={loading || imageUploading}
                  text="Save"
                  loadingText={imageUploading ? "Uploading..." : "Saving..."}
                />
              </Form.Submit>
            </>
          )}
        </S.WizardActions>
      </Form.Root>
    </S.FormContainer>
  );
}
