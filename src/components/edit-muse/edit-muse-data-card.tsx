"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useRouter } from "next/navigation";
import { Form, Separator } from "radix-ui";
import {
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { ImProfile } from "react-icons/im";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { uploadMedia } from "@/app/rp/profile/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { CreateUpdateMuse, Fandom } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import { ErrorBox } from "../error-box";
import { Muse } from "../novelist-card/styles";
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
  const note = useMuseState("note");
  const story = useMuseState("story");
  const fandom = useMuseState("fandom");
  const privacy = useMuseState("privacy");
  const setMuseState = useMuseStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
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
      } satisfies CreateUpdateMuse;

      console.log(payload);
      setLoading(true);
      const response = await updateMuseAction(id, payload);

      setLoading(false);

      if ("message" in response) {
        setError(response.message as ErrorKey);
        return;
      }
      successToast("Data updated successfully.");
    },
    [novelist, story, image, setGlobalState],
  );

  const handleReset = useCallback(() => {
    push(ROUTES.Profile.View(user?.username || "").Muses);
  }, [push, user]);

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
            <S.ResetButton type="reset" className="reset-button">
              Cancel
            </S.ResetButton>
            <Form.Submit className="submit-button" disabled={loading}>
              Save
            </Form.Submit>
          </S.FormActions>
        </Form.Root>
      </S.FormContainer>
    </S.Card>
  );
}
