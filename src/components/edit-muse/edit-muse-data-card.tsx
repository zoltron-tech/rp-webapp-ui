"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useRouter } from "next/navigation";
import { resolve } from "path";
import { Form, Separator } from "radix-ui";
import {
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { BsInfoLg } from "react-icons/bs";
import { ImProfile } from "react-icons/im";
import {
  IoIosInformation,
  IoIosInformationCircleOutline,
} from "react-icons/io";
import { IoInformationSharp } from "react-icons/io5";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { uploadMedia } from "@/app/rp/profile/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { CreateUpdateMuse, Fandom } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import { AppAlertDialog } from "../dialog";
import { ErrorBox } from "../error-box";
import { PromptPrivacySelect } from "../prompt-input/privacy-select";
import { FandomSelect } from "./fandom-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";

const ErrorKeys = [API_MESSAGE.UncategorizedError] as const;
type ErrorKey = (typeof ErrorKeys)[number];

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
};

export default function EditMuseDataCard() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const note = useMuseState("note");
  const story = useMuseState("story");
  const fandom = useMuseState("fandom");
  const privacy = useMuseState("privacy");
  const setMuseState = useMuseStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMediaHelpInfo, setShowMediaHelpInfo] = useState(false);
  const [showMediaFields, setShowMediaFields] = useState(
    Boolean(wallpaper || cardBackground),
  );
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const { successToast, errorToast } = useUIContext();
  const { push } = useRouter();

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

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNote(e.target.value);
    },
    [setNote],
  );

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        setMuseState({ image: reader.result as string });
        const formData = new FormData();
        formData.append("file", file);
        setImageUploading(true);
        const response = await uploadMedia(formData);
        setImageUploading(false);
        if (response === API_MESSAGE.MediaError) {
          setError(API_MESSAGE.UncategorizedError);
          return;
        }
        setMuseState({ image: response });
      };
      reader.readAsDataURL(file);
    },
    [setMuseState],
  );

  const handleWallpaperChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onloadend = async () => {
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

        const formData = new FormData();
        formData.append("file", file);

        setImageUploading(true);
        const response = await uploadMedia(formData);
        setImageUploading(false);

        console.log("API for wallpaper upload: ");
        console.log(response);

        if (response === API_MESSAGE.MediaError) {
          setError(API_MESSAGE.UncategorizedError);
          return;
        }

        setMuseState({
          wallpaper: {
            crop: {
              height: 500,
              src: response,
              width: 500,
              x: 0,
              y: 0,
            },
            filterValues: {
              blur: 0,
              brightness: 100,
              greyscale: 0,
            },
            src: response,
          },
        });
      };

      reader.readAsDataURL(file);
    },
    [setMuseState],
  );

  const handleCardBackgroundChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onloadend = async () => {
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

        const formData = new FormData();
        formData.append("file", file);

        setImageUploading(true);
        const response = await uploadMedia(formData);
        setImageUploading(false);

        console.log("API for cardBackground upload: ");
        console.log(response);

        if (response === API_MESSAGE.MediaError) {
          setError(API_MESSAGE.UncategorizedError);
          return;
        }

        setMuseState({
          cardBackground: {
            crop: {
              height: 500,
              src: response,
              width: 500,
              x: 0,
              y: 0,
            },
            filterValues: {
              blur: 0,
              brightness: 100,
              greyscale: 0,
            },
            src: response,
          },
        });
      };

      reader.readAsDataURL(file);
    },
    [setMuseState],
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

      const payload = {
        cardBackground: cardBackground ?? null,
        connections: [],
        extraAttributes: null,
        fandom: _fandom,
        firstName: _firstName,
        image: image ?? "",
        lastName: _lastName,
        nicknames: [],
        note: _note ?? "",
        privacy: _privacy,
        song: null,
        story: _story,
        tags: [],
        video: null,
        wallpaper: wallpaper ?? null,
      } satisfies CreateUpdateMuse;

      console.log(payload);
      setLoading(true);
      const response = await updateMuseAction(id, payload);

      console.log(response);
      setLoading(false);

      if ("message" in response) {
        setError(response.message as ErrorKey);
        return;
      }
      successToast("Data updated successfully.");
    },
    [novelist, story, image, wallpaper, cardBackground, setGlobalState],
  );

  const handleReset = useCallback(() => {
    push(ROUTES.Profile.View(user?.username || "").Muses);
  }, [push, user]);

  const handleMediaInfoClick = useCallback(() => {
    setShowMediaHelpInfo((prev) => !prev);
  }, []);

  return (
    <S.Card>
      <S.FormContainer>
        <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
          <S.TopBar>
            <S.FormHeading>
              <ImProfile />
              <h1>{id ? "Edit your " : "Create a new"} character</h1>
            </S.FormHeading>
            <PromptPrivacySelect
              className="muse-privacy-select"
              initial={privacy}
            />
          </S.TopBar>
          <Separator.Root className="separator" orientation="horizontal" />

          <S.BasicInfoFields>
            <S.MediaUploadSectionContainer>
              <Form.Field className="avatar-field" name="avatar">
                <Form.Label className="media-label">
                  <AvatarNew
                    className="selectable"
                    src={image}
                    alt={firstName || "Avatar"}
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
                />
              </Form.Field>
              <Form.Field className="field checkbox" name="consent">
                <Form.Control
                  aria-label="Consent"
                  type="checkbox"
                  disabled={loading}
                  checked={showMediaFields}
                  onChange={() => setShowMediaFields((prev) => !prev)}
                />
                <Form.Label>Set custom card image and wallpaper</Form.Label>
              </Form.Field>
            </S.MediaUploadSectionContainer>
          </S.BasicInfoFields>

          <ShouldRender if={showMediaFields}>
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
                  autoFocus
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

          <S.FandomSelectWrapper>
            <FandomSelect value={fandom} onChange={setFandom} />
          </S.FandomSelectWrapper>

          <Separator.Root className="separator" orientation="horizontal" />

          <S.BasicInfoFields>
            <div className="note">
              <Form.Field className="field" name="note">
                <S.FieldHeader>
                  <Form.Label>Note</Form.Label>
                  <span className="secondary-text ">(Optional)</span>
                </S.FieldHeader>
                <Form.Control
                  aria-label="Note"
                  name="note"
                  value={note ?? ""}
                  onChange={handleNoteChange}
                  asChild
                >
                  <textarea
                    placeholder="What is your muse thinking?"
                    spellCheck
                  />
                </Form.Control>
              </Form.Field>
            </div>
          </S.BasicInfoFields>

          <Separator.Root className="separator" orientation="horizontal" />

          <Form.Field className="field" name="story">
            <S.FieldHeader>
              <Form.Label>Backstory</Form.Label>
              <span className="secondary-text ">(Optional)</span>
            </S.FieldHeader>
            <Form.Control
              aria-label="Backstory"
              name="story"
              value={story ?? ""}
              asChild
            >
              <S.RichText
                height={200}
                content={story ? JSON.parse(story) : ""}
                onChange={(content) => {
                  setStory(JSON.stringify(content));
                }}
                editable
              ></S.RichText>
            </Form.Control>
          </Form.Field>

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
              Save
            </Form.Submit>
          </S.FormActions>
        </Form.Root>
      </S.FormContainer>
    </S.Card>
  );
}
