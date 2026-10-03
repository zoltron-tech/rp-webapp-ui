import type { DefaultTheme } from "styled-components";
import toast from "toastify-js";
import type { Theme } from "@/theme";

enum ToastType {
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
}

const ICONS: Record<ToastType, string> = {
  [ToastType.success]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
  [ToastType.error]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  [ToastType.warning]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  [ToastType.info]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function makeToastHtml(message: string, type: ToastType): string {
  return `<span class="nw-toast-icon">${ICONS[type]}</span><span class="nw-toast-text">${message}</span>`;
}

const DEFAULT_TOAST_OPTIONS: Partial<toast.Options> = {
  close: true,
  duration: 5000,
  escapeMarkup: false,
  gravity: "top",
  offset: { x: 0, y: 20 },
  position: "center",
  stopOnFocus: true,
};

export const generateToastError = (
  message: string,
  _theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    className: "nw-toast nw-toast-error",
    text: makeToastHtml(message, ToastType.error),
  }).showToast();
};

export const generateToastWarning = (
  message: string,
  _theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    className: "nw-toast nw-toast-warning",
    text: makeToastHtml(message, ToastType.warning),
  }).showToast();
};

export const generateToastInfo = (
  message: string,
  _theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    className: "nw-toast nw-toast-info",
    text: makeToastHtml(message, ToastType.info),
  }).showToast();
};

export const generateToastSuccess = (
  message: string,
  _theme: DefaultTheme & Theme,
  _id = "",
) => {
  toast({
    ...DEFAULT_TOAST_OPTIONS,
    className: "nw-toast nw-toast-success",
    text: makeToastHtml(message, ToastType.success),
  }).showToast();
};
