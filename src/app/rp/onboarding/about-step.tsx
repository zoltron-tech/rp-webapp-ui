import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { UpdateNovelistPayload } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { updateUserNovelist } from "../novelists/actions";
import { useOnboardingState, useOnboardingStoreSet } from "./onboarding.store";
import * as S from "./styled";

type BasicInfoStepProps = {
  handleNext: () => void;
};

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

export const AboutStep: FC<BasicInfoStepProps> = ({ handleNext }) => {
  const novelist = useGlobalState("novelist");
  const about = useOnboardingState("about");
  const setOnboardingState = useOnboardingStoreSet();
  const setGlobalState = useGlobalStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  const setAbout = useCallback(
    (value: string) => {
      setOnboardingState({ about: value });
      setError(null);
    },
    [setOnboardingState],
  );

  const handleAboutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAbout(e.target.value);
    },
    [setAbout],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _about = target.about.value.trim();
      setLoading(true);

      if (_about !== novelist?.about) {
        const payload = {
          about: _about,
          avatar: novelist?.avatar ?? undefined,
          firstName: novelist?.firstName || "",
          image: novelist?.image || "",
          lastName: novelist?.lastName || "",
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
        setOnboardingState({
          about: response.about || "",
        });
      }

      handleNext();
    },
    [novelist, handleNext, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setAbout(novelist?.firstName || "");

    setLoading(false);
    setError(null);
  }, [novelist, setAbout, setLoading, setError]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
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
        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            {ERROR_MAP[error!] || <p>Unknown error occurred.</p>}
          </ErrorBox>
        </ShouldRender>
        <S.FormActions>
          <S.ResetButton type="reset" className="reset-button">
            Reset
          </S.ResetButton>
          <Form.Submit className="submit-button" disabled={loading}>
            Next
          </Form.Submit>
        </S.FormActions>
      </Form.Root>
    </S.FormContainer>
  );
};
