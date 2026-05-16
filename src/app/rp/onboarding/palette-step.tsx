import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { Form, RadioGroup } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { updateUserTheme } from "@/app/actions";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { ACCENT_MAP, type Accent } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
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

export const PaletteStep: FC<BasicInfoStepProps> = ({ handleNext }) => {
  const user = useGlobalState("user");
  const palette = useOnboardingState("palette");
  const setOnboardingState = useOnboardingStoreSet();
  const setGlobalState = useGlobalStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  const setPalette = useCallback(
    (value: string | number) => {
      setOnboardingState({ palette: Number(value) as Accent });
      setError(null);
    },
    [setOnboardingState],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _palatte = target.palette.value.trim();

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
        setOnboardingState({ palette: Number(_palatte) as Accent });
      }

      handleNext();
    },
    [user, handleNext, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setPalette(user?.palette ?? 0);
    setLoading(false);
    setError(null);
  }, [user, setPalette, setLoading, setError]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
        <Form.FormField name="palette">
          <RadioGroup.Root
            defaultValue={palette.toString()}
            onValueChange={setPalette}
            name="palette"
            asChild
          >
            <S.PaletteGroup>
              {Object.entries(ACCENT_MAP).map(([key, value]) => (
                <S.PaletteOption
                  key={value}
                  htmlFor={`palette-${key}`}
                  className={classNames(value)}
                >
                  <RadioGroup.Item
                    id={`palette-${key}`}
                    value={key}
                    className="palette-swatch"
                    aria-label={value}
                  />
                  <span className="palette-name">{value}</span>
                </S.PaletteOption>
              ))}
            </S.PaletteGroup>
          </RadioGroup.Root>
        </Form.FormField>
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
            Finish
          </Form.Submit>
        </S.FormActions>
      </Form.Root>
    </S.FormContainer>
  );
};
