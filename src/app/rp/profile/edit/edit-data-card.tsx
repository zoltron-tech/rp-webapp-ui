"use client";

import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { Form, RadioGroup, Separator } from "radix-ui";
import {
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { ImProfile } from "react-icons/im";
import { IoIosInformationCircleOutline, IoIosWarning } from "react-icons/io";
import {
  getJWTIfExists,
  sendVerificationEmailAction,
  updateUserTheme,
} from "@/app/actions";
import { AvatarNew } from "@/components/common/avatar-new";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { UpdateNovelistPayload } from "@/types/novelist";
import { ACCENT_MAP, type Accent } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { updateUserNovelist } from "../../novelists/actions";
import { uploadMedia } from "../actions";
import { useProfileState, useProfileStoreSet } from "./profile.store";
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

type OperationState = "INITIAL" | "SUCCESS" | "ERROR";

type InfoBoxContentType = {
  icon: React.ReactNode;
  headingText: string;
  descriptionText: string;
  extra: React.ReactNode | null;
} | null;

const InfoBoxContent: Record<OperationState, InfoBoxContentType> = {
  ERROR: {
    descriptionText: "There was an issue while processing your request.",
    extra: (
      <p>
        <strong>Tip: </strong>
        If the issue persists, please contact support at&nbsp;
        <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a>. We apologize for the
        inconvenience.
      </p>
    ),
    headingText: "Something went wrong",
    icon: <IoIosInformationCircleOutline />,
  },
  INITIAL: null,
  SUCCESS: {
    descriptionText:
      "Please check your inbox and follow the instructions to verify your email address.",
    extra: (
      <p>
        <strong>Tip: </strong>
        If you do not receive the email, please check your spam folder or try
        again later.
      </p>
    ),
    headingText: "Next steps",
    icon: <IoIosInformationCircleOutline />,
  },
};

export default function EditDataCard() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const firstName = useProfileState("firstName");
  const lastName = useProfileState("lastName");
  const image = useProfileState("image");
  const about = useProfileState("about");
  const note = useProfileState("note");
  const palette = useProfileState("palette");
  const setProfileState = useProfileStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [mediaError, setMediaError] = useState<ErrorKey | null>(null);
  const [mediaTypeError, setMediaTypeError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [operationState, setOperationState] =
    useState<OperationState>("INITIAL");
  const setGlobalState = useGlobalStoreSet();
  const { successToast } = useUIContext();

  const infoBoxContent = useMemo(() => {
    return InfoBoxContent[operationState];
  }, [operationState]);

  const setFirstname = useCallback(
    (value: string) => {
      setProfileState({ firstName: value });
      setError(null);
    },
    [setProfileState],
  );

  const setLastname = useCallback(
    (value: string) => {
      setProfileState({ lastName: value });
      setError(null);
    },
    [setProfileState],
  );

  const setAbout = useCallback(
    (value: string) => {
      setProfileState({ about: value });
      setError(null);
    },
    [setProfileState],
  );

  const setNote = useCallback(
    (value: string) => {
      setProfileState({ note: value });
      setError(null);
    },
    [setProfileState],
  );

  const setPalette = useCallback(
    (value: string | number) => {
      setProfileState({ palette: Number(value) as Accent });
      setError(null);
    },
    [setProfileState],
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

  const handleAboutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAbout(e.target.value);
    },
    [setAbout],
  );

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNote(e.target.value);
    },
    [setNote],
  );

  const checkFileSize = (file: File | undefined): boolean => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      console.log("filesize too big.");
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (checkFileSize(file) || checkFileType(file)) {
        e.target.value = "";
        return;
      }

      setMediaTypeError(null);
      setMediaError(null);

      const reader = new FileReader();
      reader.onloadend = async () => {
        setProfileState({ image: reader.result as string });
        const formData = new FormData();
        formData.append("file", file);
        setImageUploading(true);
        const response = await uploadMedia(formData);
        setImageUploading(false);
        if (response === API_MESSAGE.MediaError) {
          setError(API_MESSAGE.UncategorizedError);
          return;
        }
        setProfileState({ image: response });
      };
      reader.readAsDataURL(file);
    },
    [setProfileState],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _firstName = target.firstName.value.trim();
      const _lastName = target.lastName.value.trim();
      const _about = target.about.value.trim();
      const _note = target.note.value.trim();
      const _palatte = target.palette.value.trim();
      if (
        _firstName !== novelist?.firstName ||
        _lastName !== novelist?.lastName ||
        _about !== novelist?.about ||
        _note !== novelist?.note ||
        image !== novelist?.image
      ) {
        const payload = {
          about: _about,
          firstName: _firstName,
          image: image ?? undefined,
          lastName: _lastName,
          note: _note ?? "",
        } satisfies UpdateNovelistPayload;

        setLoading(true);
        const response = await updateUserNovelist(payload, !novelist?.id);
        setLoading(false);

        if ("message" in response) {
          setError(response.message as ErrorKey);
          return;
        }
        setGlobalState({
          novelist: response,
        });
        setProfileState({
          about: response.about || "",
          firstName: response.firstName || "",
          image: response.image || "",
          lastName: response.lastName || "",
          note: response.note || "",
        });
      }

      if (_palatte !== user?.palette) {
        setLoading(true);
        const response = await updateUserTheme({
          palette: Number(_palatte) as Accent,
          theme: 0,
        });
        setLoading(false);

        if (!("user" in response)) {
          setError(response.message as ErrorKey);
          return;
        }

        setGlobalState({
          user: response.user,
        });
        setProfileState({ palette: Number(_palatte) as Accent });
        successToast("Data updated successfully.");
      }
    },
    [novelist, image, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setFirstname(novelist?.firstName || "");
    setLastname(novelist?.lastName || "");
    setAbout(novelist?.about || "");
    setNote(novelist?.note || "");
    setPalette(user?.palette ?? 0);
    setLoading(false);
    setError(null);
  }, [
    novelist,
    setFirstname,
    setLastname,
    setAbout,
    setNote,
    setPalette,
    user,
    setLoading,
    setError,
  ]);

  const handleverifyAccount = async () => {
    const jwt = await getJWTIfExists();
    setLoading(true);
    const response = await sendVerificationEmailAction(jwt || "");
    if (response.message === API_MESSAGE.Success) {
      setOperationState("SUCCESS");
    } else {
      setOperationState("ERROR");
    }
    setLoading(false);
    return response;
  };

  return (
    <S.Card>
      <S.FormHeading>
        <ImProfile />
        <h1>Edit your profile</h1>
      </S.FormHeading>
      <Separator.Root className="separator" orientation="horizontal" />

      <S.FormContainer>
        <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
          <S.BasicInfoFields>
            <Form.Field className="avatar-field" name="avatar">
              <Form.Label>
                <AvatarNew
                  className="selectable"
                  src={image}
                  alt={firstName || ""}
                />
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
                  <textarea placeholder="What's on your mind?" spellCheck />
                </Form.Control>
              </Form.Field>
            </div>

            <Form.Field className="field" name="about">
              <S.FieldHeader>
                <Form.Label>About</Form.Label>
                <span className="secondary-text ">(Optional)</span>
              </S.FieldHeader>
              <Form.Control
                aria-label="About you"
                name="about"
                value={about ?? ""}
                onChange={handleAboutChange}
                asChild
              >
                <textarea
                  placeholder="Tell us a bit about yourself..."
                  spellCheck
                />
              </Form.Control>
            </Form.Field>

            <Form.FormField className="field" name="palette" asChild>
              <RadioGroup.Root
                defaultValue={palette.toString()}
                onValueChange={setPalette}
                name="palette"
              >
                <S.PaletteGroup
                  defaultValue={palette.toString()}
                  onValueChange={setPalette}
                  name="palette"
                >
                  {Object.entries(ACCENT_MAP).map(([key, value]) => (
                    <S.RadioItemContainer
                      key={value}
                      className={classNames(
                        "radio-item-container",
                        ACCENT_MAP[Number(key) as Accent],
                      )}
                    >
                      <RadioGroup.Item
                        id={`pallete-${key}`}
                        value={key}
                        className="radio-item"
                      >
                        <RadioGroup.Indicator className="radio-indicator" />
                      </RadioGroup.Item>
                    </S.RadioItemContainer>
                  ))}
                </S.PaletteGroup>
              </RadioGroup.Root>
            </Form.FormField>
          </S.BasicInfoFields>
          {infoBoxContent ? (
            <S.InfoBox
              className={classNames("info-box", operationState.toLowerCase())}
            >
              <div>
                {infoBoxContent.icon}
                {infoBoxContent.headingText}
              </div>

              <p>{infoBoxContent.descriptionText}</p>

              {infoBoxContent.extra}
            </S.InfoBox>
          ) : null}

          <ShouldRender
            if={!novelist?.isVerified && operationState === "INITIAL"}
          >
            <ErrorBox className="email_button not_found">
              {<p>Your email is not verified yet.</p>}
              <S.VerficationEmailButton
                type="button"
                onClick={handleverifyAccount}
                className="not_found"
                disabled={loading || imageUploading}
              >
                Resend email
              </S.VerficationEmailButton>
            </ErrorBox>
          </ShouldRender>
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
              Reset
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
