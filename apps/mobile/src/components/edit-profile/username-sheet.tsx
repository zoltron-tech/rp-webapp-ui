import {
  checkUsernameAvailability,
  updateUsername,
} from "@nw/api/endpoints/account";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import { checkUsernameInvalidity } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { TextField } from "@/components/text-field";

/**
 * Web's `ChangeUsernameDialog`: a new handle, checked as you type.
 *
 * The availability check is register's — debounced, with late answers
 * dropped — and, as there, a check that cannot run does not block the save:
 * the update answers 409 on a real collision, which is the only authoritative
 * answer either client has.
 */

const MAX_USERNAME = 50;

type Availability = "idle" | "checking" | "available" | "taken" | "unknown";

export const UsernameSheet = ({
  current,
  onClose,
  visible,
}: {
  current: string;
  onClose: () => void;
  visible: boolean;
}) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(current);
  const [state, setState] = useState<Availability>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!visible) return;
    setValue(current);
    setState("idle");
    setError(null);
  }, [current, visible]);

  const trimmed = value.trim();
  const wellFormed =
    trimmed.length >= 3 &&
    trimmed.length <= MAX_USERNAME &&
    !checkUsernameInvalidity(trimmed);

  useEffect(() => {
    if (!wellFormed || trimmed === current) {
      setState("idle");
      return;
    }
    const mine = ++seq.current;
    setState("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(api, trimmed);
        if (mine !== seq.current) return;
        setState(
          result === true
            ? "available"
            : result === false
              ? "taken"
              : "unknown",
        );
      } catch {
        if (mine === seq.current) setState("unknown");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [api, current, trimmed, wellFormed]);

  const hint = (() => {
    if (!trimmed) return undefined;
    if (trimmed.length < 3) return "must be at least 3 characters";
    if (checkUsernameInvalidity(trimmed))
      return "only letters, numbers, . _ - allowed";
    if (trimmed === current) return "this is your current username";
    if (state === "checking") return "Checking availability...";
    if (state === "taken") return "username is taken";
    if (state === "available") return "username is available";
    return undefined;
  })();

  const canSave =
    wellFormed && trimmed !== current && state !== "taken" && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    const result = await updateUsername(api, trimmed).catch(() => null);
    setBusy(false);
    if (result?.message === API_MESSAGE.Conflict) {
      setState("taken");
      setError("That username is already taken.");
      return;
    }
    if (result?.message !== API_MESSAGE.Success) {
      setError("Could not change your username. Try again.");
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.session() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.authUser() }),
    ]);
    onClose();
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={canSave}
      error={error}
      onClose={onClose}
      onConfirm={() => void save()}
      subtitle="Other writers find and mention you by it."
      title="Change username"
      visible={visible}
    >
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        counterMax={MAX_USERNAME}
        hint={hint}
        invalid={trimmed.length > 0 && (state === "taken" || !wellFormed)}
        label="Username"
        maxLength={MAX_USERNAME}
        onChangeText={setValue}
        onSubmitEditing={() => void save()}
        returnKeyType="done"
        value={value}
      />
    </FormSheet>
  );
};
