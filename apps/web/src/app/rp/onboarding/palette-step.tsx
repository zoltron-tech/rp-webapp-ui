import { ShouldRender } from "@novelist-world/ui";
import { ACCENT_MAP, type Accent, BASIC_ACCENTS } from "@nw/types/theme";
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
import { API_MESSAGE } from "@/utils/constants";
import { UNCATEGORIZED_ERROR_MESSAGE } from "@/utils/form-errors";
import { useOnboardingState, useOnboardingStoreSet } from "./onboarding.store";
import * as S from "./styled";

type BasicInfoStepProps = {
  handleNext: () => void;
};

const ErrorKeys = [API_MESSAGE.UncategorizedError] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.UncategorizedError]: UNCATEGORIZED_ERROR_MESSAGE,
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
      // Only the basic four are offered here; an account already on another
      // palette has nothing checked, and keeps that palette.
      if (!_palatte) {
        handleNext();
        return;
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
              {BASIC_ACCENTS.map((key) => {
                const value = ACCENT_MAP[key];
                return (
                  <S.PaletteOption
                    key={value}
                    htmlFor={`palette-${key}`}
                    className={classNames(value)}
                  >
                    <RadioGroup.Item
                      id={`palette-${key}`}
                      value={String(key)}
                      className="palette-swatch"
                      aria-label={value}
                    />
                    <span className="palette-name">{value}</span>
                  </S.PaletteOption>
                );
              })}
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
