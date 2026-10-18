"use client";

import { useState } from "react";
import { AppAlertDialog } from "@/components/dialog";
import { useUpdateSignal } from "@/lib/app-update";

/**
 * "A new version is ready — refresh?"
 *
 * Shown when `lib/app-update` decides this tab is running an older build than
 * the one deployed. Refresh reloads into the new build; Later keeps the page as
 * it is — a half-written post is worth more than a new badge — and the prompt
 * stays quiet until the next signal, such as the next deploy or a page that
 * fails to load because its files belonged to the old build.
 */
export const AppUpdatePrompt = () => {
  const signal = useUpdateSignal();
  const [dismissedAt, setDismissedAt] = useState(0);
  const open = signal > dismissedAt;

  const later = () => setDismissedAt(signal);

  return (
    <AppAlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) later();
      }}
      heading="A new version is ready"
      text="Novelist World has been updated. Refresh to get the latest version — anything you haven't saved on this page will be lost."
      actionButtonLabel="Refresh"
      actionColor="neutral"
      closeButtonText="Later"
      onCancel={later}
      onConfirm={() => window.location.reload()}
    />
  );
};
