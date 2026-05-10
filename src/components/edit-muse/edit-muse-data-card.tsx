"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Form, Separator } from "radix-ui";
import {
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { HexColorPicker } from "react-colorful";
import { BsArrowLeft, BsInfoLg, BsPencil } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import { ImProfile } from "react-icons/im";
import { MdDoubleArrow } from "react-icons/md";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { NoteDialogBody } from "@/app/rp/profile/edit/note-dialog-body";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { CreateUpdateMuse, Fandom } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { LoaderAction } from "../common/loader-action";
import { AppAlertDialog } from "../dialog";
import { ErrorBox } from "../error-box";
import { PromptPrivacySelect } from "../prompt-input/privacy-select";
import { FandomSelect } from "./fandom-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";

const ErrorKeys = [
  API_MESSAGE.UncategorizedError,
  API_MESSAGE.FileTooLarge,
  API_MESSAGE.MediaError,
] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.UncategorizedError]: (
    <>
      <p>
        Something went wrong while logging you in, please try reloading the
        page.
      </p>
      <p>
        <strong>Tip:&nbsp;</strong>
        If this keeps happening, try&nbsp;
        <a href={SUPPORT_EMAIL_URL}>contacting support</a>.
      </p>
    </>
  ),
  [API_MESSAGE.FileTooLarge]: (
    <p>
      The selected file is too large. Maximum allowed size is{" "}
      <strong>10 MB</strong>.
    </p>
  ),
  [API_MESSAGE.MediaError]: (
    <p>
      File type is not supported. Allowed file types are{" "}
      <strong>(.png, .jpg, .gif)</strong>.
    </p>
  ),
};

export default function EditMuseDataCard() {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const user = useGlobalState("user");
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const accent = useMuseState("accent");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const [tempUploads, setTempUploads] = useState<{
    image?: string;
    wallpaper?: string;
    cardBackground?: string;
  }>({});

  const note = useMuseState("note");
  const nicknames = useMuseState("nicknames");
  const story = useMuseState("story");
  const fandom = useMuseState("fandom");
  const privacy = useMuseState("privacy");
  const useAccent = useMuseState("useAccent");
  const useExtraImages = useMuseState("useExtraImages");
  const setMuseState = useMuseStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [mediaError, setMediaError] = useState<ErrorKey | null>(null);
  const [mediaTypeError, setMediaTypeError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMediaHelpInfo, setShowMediaHelpInfo] = useState(false);
  const [showBackstoryPrompt, setShowBackstoryPrompt] = useState(false);
  const [savedMuseId, setSavedMuseId] = useState<string | null>(id);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [tempNote, setTempNote] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempAccent, setTempAccent] = useState<string>("#ff0000");
  const setGlobalState = useGlobalStoreSet();
  const { successToast } = useUIContext();
  const { uploadMedia } = useUploadMedia();
  const { routeToPage } = usePageRouter();

  const setFirstname = useCallback(
    (value: string) => {
      setMuseState({ firstName: value });
      setError(null);
    },
    [setMuseState],
  );

  const setLastname = useCallback(
    (value: string) => {
      setMuseState({ lastName: value });
      setError(null);
    },
    [setMuseState],
  );

  const setNote = useCallback(
    (value: string) => {
      setMuseState({ note: value });
      setError(null);
    },
    [setMuseState],
  );

  const setStory = useCallback(
    (value: string) => {
      setMuseState({ story: value });
      setError(null);
    },
    [setMuseState],
  );

  const setFandom = useCallback(
    (value: Fandom) => {
      setMuseState({ fandom: value });
      setError(null);
    },
    [setMuseState],
  );

  const handleFirstnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFirstname(e.target.value);
    },
    [setFirstname],
  );

  const handleLastnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLastname(e.target.value);
    },
    [setLastname],
  );

  const checkFileSize = (file: File | undefined): boolean => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      setMediaError(API_MESSAGE.FileTooLarge);
      return true;
    }
    return false;
  };

  const checkFileType = (file: File | undefined): boolean => {
    if (!file) return false;

    // File type validation
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setMediaTypeError(API_MESSAGE.MediaError);
      return true;
    }

    return false;
  };

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (checkFileSize(file) || checkFileType(file)) {
        e.target.value = "";
        return;
      }

      setMediaTypeError(null);
      setMediaError(null);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setMuseState({ image: reader.result as string });
      };
      reader.readAsDataURL(file);

      // Delete previous temp upload **for avatar only**
      if (tempUploads.image) {
        await deleteMedia(tempUploads.image);
      }

      // Upload to S3
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      // Only append prefix if id exists
      if (id) {
        formData.append("prefix", id);
      }
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setError(API_MESSAGE.UncategorizedError);
        return;
      }

      // Track new temp upload for avatar only
      setTempUploads((prev) => ({ ...prev, image: s3Url }));

      // Update muse state
      setMuseState({ image: s3Url });
    },
    [setMuseState, tempUploads.image],
  );

  const handleWallpaperChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (checkFileSize(file)) {
        e.target.value = "";
        return;
      }
      if (checkFileType(file)) {
        e.target.value = "";
        return;
      }

      setMediaTypeError(null);
      setMediaError(null);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setMuseState({
          wallpaper: {
            crop: {
              height: 500,
              src: reader.result as string,
              width: 500,
              x: 0,
              y: 0,
            },
            filterValues: {
              blur: 0,
              brightness: 100,
              greyscale: 0,
            },
            src: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);

      // Delete previous temp upload
      if (tempUploads.wallpaper) {
        await deleteMedia(tempUploads.wallpaper);
      }

      // Upload directly to S3
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      // Only append prefix if id exists
      if (id) {
        formData.append("prefix", id);
      }
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setError(API_MESSAGE.UncategorizedError);
        return;
      }

      // Track as temp upload
      setTempUploads((prev) => ({
        ...prev,
        wallpaper: s3Url,
      }));

      setMuseState({
        wallpaper: {
          crop: {
            height: 500,
            src: s3Url,
            width: 500,
            x: 0,
            y: 0,
          },
          filterValues: {
            blur: 0,
            brightness: 100,
            greyscale: 0,
          },
          src: s3Url,
        },
      });
    },
    [setMuseState, tempUploads.wallpaper],
  );

  const handleCardBackgroundChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (checkFileSize(file)) {
        e.target.value = "";
        return;
      }
      if (checkFileType(file)) {
        e.target.value = "";
        return;
      }

      setMediaTypeError(null);
      setMediaError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMuseState({
          cardBackground: {
            crop: {
              height: 500,
              src: reader.result as string,
              width: 500,
              x: 0,
              y: 0,
            },
            filterValues: {
              blur: 0,
              brightness: 100,
              greyscale: 0,
            },
            src: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);

      // Delete previous temp upload
      if (tempUploads.cardBackground) {
        await deleteMedia(tempUploads.cardBackground);
      }

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      // Only append prefix if id exists
      if (id) {
        formData.append("prefix", id);
      }
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setError(API_MESSAGE.UncategorizedError);
        return;
      }

      // Track as temp upload
      setTempUploads((prev) => ({
        ...prev,
        cardBackground: s3Url,
      }));

      setMuseState({
        cardBackground: {
          crop: {
            height: 500,
            src: s3Url,
            width: 500,
            x: 0,
            y: 0,
          },
          filterValues: {
            blur: 0,
            brightness: 100,
            greyscale: 0,
          },
          src: s3Url,
        },
      });
    },
    [setMuseState, tempUploads.cardBackground],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _firstName = target.firstName.value.trim();
      const _lastName = target.lastName.value.trim();
      const _story = story;
      const _note = target.note.value.trim();
      const _privacy = target.privacy.value;
      const _fandom = target.fandom.value;

      // Only include accent if checkbox is ON and accent is non-empty
      const _accent = useAccent && accent?.trim() ? accent.trim() : null;

      const payload = {
        accent: _accent,
        cardBackground: cardBackground ?? null,
        connections: [],
        extraAttributes: null,
        fandom: _fandom,
        firstName: _firstName,
        image: image ?? "",
        lastName: _lastName,
        nicknames: nicknames ?? [],
        note: _note ?? "",
        privacy: _privacy,
        song: null,
        story: _story,
        tags: null,
        useAccent: useAccent,
        useExtraImages: useExtraImages,
        video: null,
        wallpaper: wallpaper ?? null,
      } satisfies CreateUpdateMuse;
      setLoading(true);
      console.log("Submitting payload:", payload);
      const response = await updateMuseAction(id, payload);
      setLoading(false);

      if ("message" in response) {
        setError(response.message as ErrorKey);
        return;
      }

      const returnedMuseId = response.id ?? id;
      setMuseState({ id: returnedMuseId });
      setSavedMuseId(returnedMuseId);

      // Success: clear temp uploads because they are now used in the final state
      setTempUploads({});

      successToast("Data updated successfully.");
      setShowBackstoryPrompt(true);
    },
    [
      story,
      nicknames,
      image,
      wallpaper,
      cardBackground,
      accent,
      id,
      useAccent,
      useExtraImages,
      setMuseState,
      showBackstoryPrompt,
    ],
  );

  const handleReset = useCallback(async () => {
    for (const key of Object.values(tempUploads)) {
      if (key) await deleteMedia(key);
    }

    routeToPage(ROUTES.Profile.View(user?.username || "").Muses);
  }, [routeToPage, user, tempUploads]);

  const handleMediaInfoClick = useCallback(() => {
    setShowMediaHelpInfo((prev) => !prev);
  }, []);

  const handleBackstoryCancel = useCallback(() => {
    setShowBackstoryPrompt(false);
    routeToPage(ROUTES.Profile.View(user?.username || "").Muses);
  }, [routeToPage, user]);

  const handleBackstoryConfirm = useCallback(() => {
    setShowBackstoryPrompt(false);
    if (!savedMuseId) {
      routeToPage(ROUTES.Profile.View(user?.username || "").Muses);
      return;
    }
    routeToPage(ROUTES.Profile.Muses.About(savedMuseId));
  }, [routeToPage, savedMuseId, user]);

  return (
    <S.Card>
      <AppAlertDialog
        open={showBackstoryPrompt}
        onOpenChange={setShowBackstoryPrompt}
        onCancel={handleBackstoryCancel}
        onConfirm={handleBackstoryConfirm}
        actionButtonLabel="Yes"
        closeButtonText="No"
        actionColor="neutral"
        heading="Backstory"
        text="Would you like to add or edit backstory for this muse now?"
      />
      <S.FormContainer>
        <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
          <S.TopBar>
            <S.BackButton
              type="button"
              disabled={!user?.username}
              onClick={() => {
                if (!user?.username) return;
                routeToPage(ROUTES.Profile.View(user.username).Muses);
              }}
            >
              <BsArrowLeft size={18} />
            </S.BackButton>
            <S.FormHeading>
              <ImProfile />
              <h1>{id ? "Edit your " : "Create a new"} character</h1>
            </S.FormHeading>
            <PromptPrivacySelect
              className="muse-privacy-select"
              initial={privacy}
              blockedOptions={["CUSTOM"]}
            />
          </S.TopBar>
          <Separator.Root className="separator" orientation="horizontal" />
          <S.BasicInfoFields>
            <S.MediaUploadSectionContainer>
              <Form.Field className="avatar-field" name="avatar">
                <Form.Label className="media-label">
                  <AvatarUploadField
                    src={image}
                    alt={firstName || "Avatar"}
                    note={note}
                    onNoteClick={() => {
                      setTempNote(note ?? "");
                      setNoteDialogOpen(true);
                    }}
                  />
                  <span>Avatar</span>
                </Form.Label>
                <Form.Control
                  aria-label="Avatar"
                  name="avatar"
                  type="file"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  hidden
                  autoFocus
                />
              </Form.Field>
              <input type="hidden" name="note" value={note ?? ""} readOnly />
              <AppAlertDialog
                heading="Share a thought..."
                text=""
                body={
                  <NoteDialogBody value={tempNote} onChange={setTempNote} />
                }
                open={noteDialogOpen}
                onOpenChange={setNoteDialogOpen}
                onConfirm={() => {
                  setNote(tempNote);
                  setNoteDialogOpen(false);
                }}
                onCancel={() => setNoteDialogOpen(false)}
                actionButtonLabel="Save"
                actionColor="neutral"
              />
              <Form.Field className="field checkbox" name="consent">
                <Form.Control
                  aria-label="Consent"
                  type="checkbox"
                  disabled={loading}
                  checked={useExtraImages}
                  onChange={() =>
                    setMuseState({ useExtraImages: !useExtraImages })
                  }
                />
                <Form.Label>Set custom card image and wallpaper</Form.Label>
              </Form.Field>
            </S.MediaUploadSectionContainer>
          </S.BasicInfoFields>
          <ShouldRender if={useExtraImages}>
            <S.BasicInfoFields>
              <S.MediaUploadSectionContainer>
                <Form.Field
                  className="card-background-field"
                  name="cardBackground"
                >
                  <Form.Label className="media-label">
                    <S.CardBackgroundSelect
                      className="selectable"
                      src={cardBackground?.src || image || null}
                      alt={"Card background"}
                    />
                    <span>Card background</span>
                  </Form.Label>
                  <Form.Control
                    aria-label="CardBackground"
                    name="cardBackground"
                    type="file"
                    onChange={handleCardBackgroundChange}
                    accept="image/*"
                    hidden
                  />
                </Form.Field>
                <Form.Field className="wallpaper-field" name="wallpaper">
                  <Form.Label className="media-label">
                    <S.WallpaperSelect
                      className="selectable"
                      src={wallpaper?.src || image || null}
                      alt={"Wallpaper"}
                    />
                    <span>Wallpaper</span>
                  </Form.Label>
                  <Form.Control
                    aria-label="Wallpaper"
                    name="wallpaper"
                    type="file"
                    onChange={handleWallpaperChange}
                    accept="image/*"
                    hidden
                  />
                </Form.Field>
                <S.infoButton type="button" onClick={handleMediaInfoClick}>
                  <BsInfoLg />
                </S.infoButton>
                <AppAlertDialog
                  open={showMediaHelpInfo}
                  onOpenChange={setShowMediaHelpInfo}
                  showConfirm={false}
                  closeButtonText="Close"
                  heading={"About the weird images you see"}
                  text={
                    "The round thingy is your avatar. The Long thingy is the one that you will see on your muse card, and the last one is the muse card background."
                  }
                />
              </S.MediaUploadSectionContainer>
            </S.BasicInfoFields>
            <ShouldRender if={Boolean(mediaError)}>
              <S.MediaErrorWrapper>
                <ErrorBox className="error">
                  {ERROR_MAP[mediaError!] || <p>Unknown error occurred.</p>}
                </ErrorBox>
              </S.MediaErrorWrapper>
            </ShouldRender>
            <ShouldRender if={Boolean(mediaTypeError)}>
              <S.MediaErrorWrapper>
                <ErrorBox className="error">
                  {ERROR_MAP[mediaTypeError!] || <p>Unknown error occurred.</p>}
                </ErrorBox>
              </S.MediaErrorWrapper>
            </ShouldRender>
          </ShouldRender>
          <Separator.Root className="separator" orientation="horizontal" />
          <S.BasicInfoFields>
            <div className="name-fields">
              <Form.Field className="field" name="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  aria-label="First Name"
                  name="firstName"
                  type="text"
                  value={firstName ?? ""}
                  onChange={handleFirstnameChange}
                  required
                />
              </Form.Field>
              <Form.Field className="field" name="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  aria-label="Last Name"
                  name="lastName"
                  type="text"
                  value={lastName ?? ""}
                  onChange={handleLastnameChange}
                />
              </Form.Field>
            </div>
          </S.BasicInfoFields>
          <Separator.Root className="separator" orientation="horizontal" />
          <S.NicknamesSection>
            <S.FieldHeader>
              <span
                style={{
                  color: "var(--text)",
                  fontSize: "var(--font-size-small)",
                  fontWeight: 600,
                }}
              >
                Nicknames
              </span>
              <span className="secondary-text">{nicknames.length}/5</span>
            </S.FieldHeader>
            <S.NicknamesInputRow>
              <input
                type="text"
                placeholder="Add a nickname"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={30}
                disabled={nicknames.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = nicknameInput.trim();
                    if (
                      trimmed &&
                      nicknames.length < 5 &&
                      !nicknames.includes(trimmed)
                    ) {
                      setMuseState({ nicknames: [...nicknames, trimmed] });
                      setNicknameInput("");
                    }
                  }
                }}
              />
              <S.AddNicknameButton
                type="button"
                disabled={
                  nicknames.length >= 5 ||
                  !nicknameInput.trim() ||
                  nicknames.includes(nicknameInput.trim())
                }
                onClick={() => {
                  const trimmed = nicknameInput.trim();
                  if (
                    trimmed &&
                    nicknames.length < 5 &&
                    !nicknames.includes(trimmed)
                  ) {
                    setMuseState({ nicknames: [...nicknames, trimmed] });
                    setNicknameInput("");
                  }
                }}
              >
                Add
              </S.AddNicknameButton>
            </S.NicknamesInputRow>
            {nicknames.length > 0 && (
              <S.NicknameTagsRow>
                {nicknames.map((name) => (
                  <S.NicknameTag key={name}>
                    {name}
                    <S.NicknameRemove
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setMuseState({
                          nicknames: nicknames.filter((n) => n !== name),
                        })
                      }
                    >
                      <FiX />
                    </S.NicknameRemove>
                  </S.NicknameTag>
                ))}
              </S.NicknameTagsRow>
            )}
            <S.NicknamesHint>
              {nicknames.length < 5
                ? "Press Enter or tap Add. Up to 5 nicknames."
                : "Maximum of 5 nicknames reached."}
            </S.NicknamesHint>
          </S.NicknamesSection>
          <Separator.Root className="separator" orientation="horizontal" />
          <S.FandomSelectWrapper>
            <FandomSelect value={fandom} onChange={setFandom} />
          </S.FandomSelectWrapper>
          <Separator.Root className="separator" orientation="horizontal" />
          <S.MediaUploadSectionContainer>
            <Form.Field className="field checkbox" name="accentEnabled">
              <Form.Control
                aria-label="Accent Enabled"
                type="checkbox"
                checked={useAccent}
                onChange={() => setMuseState({ useAccent: !useAccent })}
              />
              <Form.Label>Set custom accent color</Form.Label>
              {useAccent && (
                <S.AccentColorRow>
                  <S.AccentColorSwatch
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
                        if (val && val[0] !== "#") val = "#" + val;
                        setTempAccent(val);
                      }}
                      placeholder="#ff0000"
                    />
                  </div>
                </S.AccentPickerDialogBody>
              }
            />
          </S.MediaUploadSectionContainer>
          <ShouldRender if={Boolean(id)}>
            <Separator.Root className="separator" orientation="horizontal" />
            <S.AboutSectionsLink
              onClick={() => routeToPage(ROUTES.Profile.Muses.About(id || ""))}
            >
              <span>
                Edit Character Story
                <MdDoubleArrow size={20} />
              </span>
            </S.AboutSectionsLink>
          </ShouldRender>
          <ShouldRender if={Boolean(id)}>
            <Separator.Root className="separator" orientation="horizontal" />
            <S.AboutSectionsLink
              onClick={() =>
                routeToPage(ROUTES.Profile.Muses.ExtraAttributes(id || ""))
              }
            >
              <span>
                Edit Extra Attributes
                <MdDoubleArrow size={20} />
              </span>
            </S.AboutSectionsLink>
          </ShouldRender>
          <Separator.Root className="separator" orientation="horizontal" />
          <ShouldRender if={Boolean(error)}>
            <ErrorBox className="error">
              {ERROR_MAP[error!] || <p>Unknown error occurred.</p>}
            </ErrorBox>
          </ShouldRender>
          <S.FormActions>
            <S.ResetButton
              type="reset"
              className="reset-button"
              disabled={loading || imageUploading}
            >
              Cancel
            </S.ResetButton>
            <Form.Submit
              className="submit-button"
              disabled={loading || imageUploading}
            >
              <LoaderAction
                loading={imageUploading}
                text="Save"
                loadingText="Uploading..."
              />
            </Form.Submit>
          </S.FormActions>
        </Form.Root>
      </S.FormContainer>
    </S.Card>
  );
}
