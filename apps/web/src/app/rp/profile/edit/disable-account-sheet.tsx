"use client";

import {
  DISABLE_ACCOUNT_COPY as COPY,
  DISABLE_REASON_TEXT_MAX,
  DISABLE_REASONS,
  type DisableReason,
} from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { logoutAction } from "@/app/actions";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { API_MESSAGE } from "@/utils/constants";
import { disableAccountAction } from "../actions";
import * as S from "./disable-account.styled";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** How long the farewell stays on screen before this browser signs out. */
const FAREWELL_MS = 2200;

/**
 * "Disable my account" (ACCOUNT_DISABLE_PLAN.md §6.1): a centred dialog on
 * desktop and a bottom tray on mobile, one size whatever its content, with
 * the verbs pinned below the scrolling body. The reason is optional.
 *
 * On success the sheet says goodbye for a moment, then signs this browser
 * out the normal way; the server has already ended every other session.
 */
export const DisableAccountSheet: FC<Props> = ({ open, onClose }) => {
  const [reason, setReason] = useState<DisableReason | null>(null);
  const [otherText, setOtherText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [farewell, setFarewell] = useState(false);

  useEffect(() => {
    if (open) return;
    setReason(null);
    setOtherText("");
    setError(null);
  }, [open]);

  const handleClose = () => {
    if (busy || farewell) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await disableAccountAction({
      reason,
      reasonText: reason === "OTHER" ? otherText.trim() || null : null,
    });
    if (result.message !== API_MESSAGE.Success) {
      setBusy(false);
      setError("We couldn't disable your account just now. Please try again.");
      return;
    }
    setFarewell(true);
    window.setTimeout(() => void logoutAction(), FAREWELL_MS);
  };

  return (
    <ResponsiveSheet
      open={open}
      fixed
      title={farewell ? "Until next time" : COPY.dialogTitle}
      onClose={handleClose}
      footer={
        farewell ? null : (
          <>
            {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
            <S.FooterActions>
              <S.KeepButton type="button" onClick={handleClose} disabled={busy}>
                {COPY.cancel}
              </S.KeepButton>
              <S.ConfirmButton
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? "Disabling…" : COPY.confirm}
              </S.ConfirmButton>
            </S.FooterActions>
          </>
        )
      }
    >
      {farewell ? (
        <S.Farewell aria-live="polite">
          <p>{COPY.toastAfterDisable}</p>
          <F.Hint>Signing you out…</F.Hint>
        </S.Farewell>
      ) : (
        <>
          <S.Lead>{COPY.dialogLead}</S.Lead>
          <S.Bullets>
            {COPY.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </S.Bullets>

          <S.ReasonGroup>
            <S.ReasonPrompt>{COPY.reasonPrompt}</S.ReasonPrompt>
            {DISABLE_REASONS.map((option) => (
              <F.ToggleRow
                key={option.value}
                type="button"
                aria-pressed={reason === option.value}
                $active={reason === option.value}
                onClick={() =>
                  setReason((current) =>
                    current === option.value ? null : option.value,
                  )
                }
              >
                <S.RadioDot $active={reason === option.value} aria-hidden />
                {option.label}
              </F.ToggleRow>
            ))}
            {reason === "OTHER" && (
              <F.Field>
                <F.TextInput
                  autoFocus
                  value={otherText}
                  maxLength={DISABLE_REASON_TEXT_MAX}
                  placeholder={COPY.reasonOtherPlaceholder}
                  aria-label={COPY.reasonOtherPlaceholder}
                  onChange={(e) => setOtherText(e.target.value)}
                />
                {otherText.length >= DISABLE_REASON_TEXT_MAX - 40 && (
                  <F.Hint>
                    {otherText.length}/{DISABLE_REASON_TEXT_MAX}
                  </F.Hint>
                )}
              </F.Field>
            )}
          </S.ReasonGroup>
        </>
      )}
    </ResponsiveSheet>
  );
};
