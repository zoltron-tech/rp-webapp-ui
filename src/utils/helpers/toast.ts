import type { DefaultTheme } from "styled-components";
import toast from "toastify-js";
import { BORDER_RADIUS, type Theme } from "@/theme";

enum ToastType {
  success = "success",
  error = "error",
}

const getToastStyle = (
  theme: DefaultTheme & Theme,
  type: ToastType,
): { [cssRule: string]: string } => {
  const color = ((): string => {
    switch (type) {
      case ToastType.success:
        return theme.success;
      case ToastType.error:
        return theme.error;
    }
  })();

  return {
    color,
    fontSize: "20px",
    fontWeight: "600",
    background: theme.toastBackground,
    padding: "20px 20px 20px 30px",
    borderRadius: BORDER_RADIUS,
  };
};

const DEFAULT_TOAST_OPTIONS: Partial<toast.Options> = {
  position: "right",
  gravity: "bottom",
  className: "nw-toast",
  stopOnFocus: true,
  duration: 5000,
  close: true,
};

export const generateToastError = (
  message: string,
  theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    text: message,
    className: `nw-toast-${theme.name}`,
    style: getToastStyle(theme, ToastType.error),
  }).showToast();
};

export const generateToastSuccess = (
  message: string,
  theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    text: message,
    style: getToastStyle(theme, ToastType.success),
  }).showToast();
};
