import { MaybePromise } from "@/types/common";
import { Logger } from "@/utils/services";
import { useRef, useState } from "react";

export type ErrorType<T> = Partial<{
  [TKey in keyof T]: string;
}> | null;

const ERROR_TRIGGERS = ["update", "submit"] as const;
type errorTrigger = (typeof ERROR_TRIGGERS)[number];
type WithAbortSignal<T> = { abort?: boolean } & T;

export interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => MaybePromise<void>;
  beforeSubmit?: (
    values: T,
    errors: ErrorType<T>
  ) => MaybePromise<WithAbortSignal<T>>;
  beforeUpdate?: <K extends keyof T>(values: T, name: K, prev: T) => T[K];
  checkError?: (values: T, prevErrors: ErrorType<T>) => ErrorType<T>;
  onClearErrors?: (prevErros: ErrorType<T>) => void;
  checkErrorTriggers?: errorTrigger[];
}

type ValidInputElement = HTMLInputElement & HTMLTextAreaElement;

export interface FormReturn<T> {
  values: T;
  errors: ErrorType<T>;
  loading: boolean;
  update: (event: React.ChangeEvent<ValidInputElement>) => void;
  submit: (overrideValues?: T) => MaybePromise<void>;
  clearErrors: () => void;
  clearValues: () => void;
  updateValues: React.Dispatch<React.SetStateAction<T>>;
}

export const useForm = <T>({
  checkErrorTriggers = ["submit"],
  initialValues,
  onSubmit,
  beforeSubmit,
  beforeUpdate,
  checkError,
  onClearErrors,
}: FormProps<T>): FormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ErrorType<T>>(null);
  const [loading, setLoading] = useState(false);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const update = (event: React.ChangeEvent<ValidInputElement>) => {
    Logger.debug("update", event.target.name, event.target.value);
    const { name, value } = event.target;
    const newValues = {
      ...values,
      [name]: beforeUpdate
        ? beforeUpdate(
            { ...values, [name]: value } as T,
            name as keyof T,
            values
          )
        : value,
    };
    setValues(newValues);

    if (checkError) {
      if (checkErrorTriggers.includes("update")) {
        const _errors = checkError(newValues, errors);
        setErrors(_errors);
      } else {
        if (clearTimeoutRef.current) {
          clearTimeout(clearTimeoutRef.current);
        }
        clearTimeoutRef.current = setTimeout(() => setErrors(null), 1000);
      }
    }
  };

  const submit = async (overridenValues = values) => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    setLoading(true);

    try {
      let _values: WithAbortSignal<T> = { ...overridenValues, abort: false };
      if (beforeSubmit) {
        _values = await beforeSubmit(overridenValues, errors);
      }
      if (_values.abort) {
        setLoading(false);
        return;
      }

      const _errors =
        checkError && checkErrorTriggers.includes("submit")
          ? checkError(_values, errors)
          : errors;

      Logger.debug("submit", _values, _errors);
      if (_errors && Object.values(_errors).some((error) => error !== "")) {
        setErrors({ ...errors, ..._errors });
      } else {
        Logger.debug("submitting...", _values);
        await onSubmit(_values);
      }
    } catch (error) {
      Logger.debug("submit error", error);
    }
    setLoading(false);
  };

  const clearErrors = () => {
    setErrors((prev) => {
      if (onClearErrors) {
        onClearErrors(prev);
      }
      return {};
    });
  };

  const clearValues = () => {
    setValues(initialValues);
  };

  return {
    values,
    errors,
    loading,
    update,
    submit,
    clearErrors,
    clearValues,
    updateValues: setValues,
  };
};
