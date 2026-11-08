"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { User } from "@nw/types";
import classNames from "classnames";
import { AlertDialog } from "radix-ui";
import {
  type ChangeEvent,
  type FC,
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsPencil } from "react-icons/bs";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { checkUsernameAvailability, updateUsernameAction } from "@/app/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { checkUsernameInvalidity } from "@/utils/helpers";
import * as S from "./styled";

type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

type ChangeUsernameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ChangeUsernameDialog: FC<ChangeUsernameDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const user = useGlobalState("user");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const setGlobalState = useGlobalStoreSet();
  const { errorToast } = useUIContext();

  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameValue, setUsernameValue] = useState("");
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the field on open, reset everything on close.
  useEffect(() => {
    setUsernameError(null);
    setUsernameValue(open ? (user?.username ?? "") : "");
    setAvailability("idle");
    setLoading(false);
  }, [open, user?.username]);

  const checkAvailability = useCallback(
    async (value: string) => {
      if (!value || value === user?.username) {
        setAvailability("idle");
        return;
      }

      if (checkUsernameInvalidity(value)) {
        setAvailability("invalid");
        return;
      }

      setAvailability("checking");

      try {
        const available = await checkUsernameAvailability(value);
        setAvailability(available === true ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    },
    [user?.username],
  );

  const handleUsernameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUsernameValue(value);
      setUsernameError(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value) {
        setAvailability("idle");
        return;
      }

      if (value === user?.username) {
        setAvailability("idle");
        return;
      }

      debounceRef.current = setTimeout(() => {
        checkAvailability(value);
      }, 500);
    },
    [checkAvailability, user?.username],
  );

  const handleUsernameSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) return;

      const trimmed = usernameValue.trim();

      if (trimmed === user.username) {
        onOpenChange(false);
        return;
      }

      if (checkUsernameInvalidity(trimmed)) {
        setUsernameError(
          "Username must be 3–50 characters and only contain letters, numbers, underscores, dots, or dashes.",
        );
        return;
      }

      if (availability !== "available") {
        setUsernameError("Please choose an available username.");
        return;
      }

      if (loading) return;
      setLoading(true);
      let response: Awaited<ReturnType<typeof updateUsernameAction>> | null;
      try {
        response = await updateUsernameAction(trimmed);
      } catch {
        response = null;
      } finally {
        setLoading(false);
      }

      // Failure keeps the dialog open with the typed username intact.
      if (response?.message !== API_MESSAGE.Success) {
        if (response?.message === API_MESSAGE.Conflict) {
          setUsernameError("This username is already taken.");
        } else {
          setUsernameError("Something went wrong. Please try again.");
          errorToast("Couldn't change your username. Please try again.");
        }
        return;
      }

      const updatedUser: User = {
        authApp: user.authApp,
        email: user.email,
        emailVerified: user.emailVerified,
        palette: user.palette,
        theme: user.theme,
        username: trimmed,
      };

      setGlobalState({ user: updatedUser });
      onOpenChange(false);
    },
    [
      user,
      usernameValue,
      availability,
      loading,
      setGlobalState,
      onOpenChange,
      errorToast,
    ],
  );

  const availabilityLabel: Record<AvailabilityStatus, string> = {
    available: "Username is available",
    checking: "Checking availability…",
    idle: "",
    invalid: "Invalid username. Use 3–50 characters: letters, numbers, _ . -",
    taken: "Username is already taken",
  };

  const isSubmitDisabled =
    loading ||
    (usernameValue.trim() !== user?.username && availability !== "available");

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <S.Overlay />
        <S.Content className={classNames([accent, theme])}>
          <S.Title>Change username</S.Title>

          <S.DialogForm onSubmit={handleUsernameSubmit}>
            <S.UsernameFieldWrapper>
              <label htmlFor="new-username">New username</label>
              <input
                id="new-username"
                name="username"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={usernameValue}
                onChange={handleUsernameChange}
                disabled={loading}
                minLength={3}
                maxLength={50}
                pattern="^[a-zA-Z0-9_.\\-]+$"
                required
              />
              <ShouldRender if={availability !== "idle"}>
                <S.AvailabilityIndicator className={availability}>
                  {availabilityLabel[availability]}
                  {availability === "available" && <FaCircleCheck />}
                  {(availability === "taken" || availability === "invalid") && (
                    <FaCircleXmark />
                  )}
                </S.AvailabilityIndicator>
              </ShouldRender>
              <ShouldRender if={Boolean(usernameError)}>
                <S.DialogErrorText>{usernameError}</S.DialogErrorText>
              </ShouldRender>
            </S.UsernameFieldWrapper>
            <S.DialogActions>
              <AlertDialog.Cancel asChild>
                <S.DialogCancelButton type="button">
                  Cancel
                </S.DialogCancelButton>
              </AlertDialog.Cancel>
              <S.DialogSubmitButton type="submit" disabled={isSubmitDisabled}>
                {loading ? "Saving…" : "Save"}
              </S.DialogSubmitButton>
            </S.DialogActions>
          </S.DialogForm>
        </S.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

type UsernameRowProps = {
  username: string;
  onEditClick: () => void;
};

export const UsernameRow: FC<UsernameRowProps> = ({
  username,
  onEditClick,
}) => {
  return (
    <S.UsernameRow>
      <span className="username-label">@{username}</span>
      <S.EditUsernameButton
        type="button"
        title="Edit username"
        onClick={onEditClick}
      >
        <BsPencil />
      </S.EditUsernameButton>
    </S.UsernameRow>
  );
};
