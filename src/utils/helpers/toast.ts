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
    background: theme.toastBackground,
    borderRadius: BORDER_RADIUS,
    color,
    fontSize: "20px",
    fontWeight: "600",
    padding: "20px 20px 20px 30px",
  };
};

const DEFAULT_TOAST_OPTIONS: Partial<toast.Options> = {
  className: "nw-toast",
  close: true,
  duration: 5000,
  gravity: "bottom",
  position: "right",
  stopOnFocus: true,
};

export const generateToastError = (
  message: string,
  theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    className: `nw-toast-${theme.name}`,
    style: getToastStyle(theme, ToastType.error),
    text: message,
  }).showToast();
};

export const generateToastSuccess = (
  message: string,
  theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    style: getToastStyle(theme, ToastType.success),
    text: message,
  }).showToast();
};
