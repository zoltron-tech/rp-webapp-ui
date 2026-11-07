import { DISABLE_ACCOUNT_COPY, type Novelist } from "@nw/types";
import { useEffect } from "react";
import { Alert } from "react-native";

/**
 * Signing in is what switches a disabled account back on, and the one
 * own-profile response that did it carries `reactivated` (ACCOUNT_DISABLE_PLAN.md
 * D4). Two loads race for it after sign-in — the session query and the local
 * store's "self" refresh — so whichever sees it notes it here, and the tab
 * root greets once. This app has no toast; an alert with one button is the
 * nearest thing that cannot be missed.
 */
let pending = false;
let greetedFor: string | null = null;

/** Called by any load that saw `reactivated: true`. */
export const noteReactivated = () => {
  pending = true;
};

/** Greets a returning novelist once per sign-in. */
export const useWelcomeBack = (novelist: Novelist | null) => {
  useEffect(() => {
    if (!novelist) return;
    if (!novelist.reactivated && !pending) return;
    if (greetedFor === novelist.id) return;
    greetedFor = novelist.id;
    pending = false;
    Alert.alert("Welcome back", DISABLE_ACCOUNT_COPY.toastOnReturn);
  }, [novelist]);
};
