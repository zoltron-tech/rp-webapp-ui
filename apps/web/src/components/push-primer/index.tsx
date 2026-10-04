"use client";

import { isCompactViewport } from "@nw/utils/platform";
import classNames from "classnames";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BsCheck, BsX } from "react-icons/bs";
import { IceBreakerTrayHeader } from "@/app/rp/conversations/ice-breaker-tray-header";
import * as TrayS from "@/app/rp/conversations/styles";
import { AppAlertDialog } from "@/components/dialog";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { initialisePushNotifications, PUSH_PRIMER_EVENT } from "@/lib/push";
import * as S from "./styles";

/**
 * Asks, in the app's own words, before the browser asks.
 *
 * The browser's permission prompt can be shown once: a "Block" there is final,
 * and only the person can undo it, deep in site settings. It also has to come
 * from a click — Safari refuses one that does not, and the others penalise a
 * site for it. So the app asks first. "Not now" costs nothing and the question
 * comes back later; "Turn on" is the click the real prompt needs.
 *
 * It asks when it is worth something: straight after a message is sent
 * (`suggestPushPrimer`), when the person has a reason to want the answer. For
 * someone who never sends one it asks once anyway, well after the app has
 * loaded.
 *
 * On an iPhone or iPad in Safari there is nothing to turn on: web push exists
 * there only for an app added to the Home Screen. Those people are told that
 * instead, and offered the steps.
 *
 * A dialog on desktop and a slide-up tray on a phone, like every other
 * question the app asks (AGENTS.md).
 */

const SNOOZE_KEY = "nw:push-primer:snoozed-until";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
/** The fallback for someone who never sends a message. */
const APPEAR_AFTER_MS = 45_000;

type Mode = "ask" | "install";

const COPY: Record<Mode, { heading: string; body: string; confirm: string }> =
  {
    ask: {
      body: "Hear about messages, replies, mentions and friend requests when Novelist World is not open. You can turn them off again in your browser's settings.",
      confirm: "Turn on",
      heading: "Turn on notifications?",
    },
    install: {
      body: "On iPhone and iPad, notifications work once Novelist World is on your Home Screen. Add it, open it from there, and you can turn them on.",
      confirm: "Show me how",
      heading: "Get notifications",
    },
  };

const isSnoozed = (): boolean => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    // Storage blocked: do not ask on every page load because of it.
    return true;
  }
};

const snooze = () => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    // Nothing to remember it in; the question will come back.
  }
};

const isIos = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPadOS reports itself as a Mac; a Mac has no touch points.
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isInstalled = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * What can usefully be said right now, or null when nothing can: permission is
 * already granted or blocked, or the browser has no push at all.
 */
const modeFor = (): Mode | null => {
  if (typeof window === "undefined") return null;

  const supported =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  if (supported) return Notification.permission === "default" ? "ask" : null;

  return isIos() && !isInstalled() ? "install" : null;
};

export const PushPrimer: FC = () => {
  const authState = useGlobalState("authState");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const setGlobalState = useGlobalStoreSet();
  const isMobile = useMemo(() => isCompactViewport(), []);
  const [mode, setMode] = useState<Mode | null>(null);
  /** The tray is mounted first and opened a frame later, so it slides. */
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    const offer = () => {
      if (!isSnoozed()) setMode((current) => current ?? modeFor());
    };
    const timer = setTimeout(offer, APPEAR_AFTER_MS);
    window.addEventListener(PUSH_PRIMER_EVENT, offer);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(PUSH_PRIMER_EVENT, offer);
    };
  }, [authState]);

  useEffect(() => {
    if (!mode) {
      setSheetOpen(false);
      return;
    }
    const frame = requestAnimationFrame(() => setSheetOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  const dismiss = useCallback(() => {
    snooze();
    setMode(null);
  }, []);

  const accept = useCallback(() => {
    // Snoozed either way: whatever is answered next, this has been asked.
    snooze();
    setMode(null);
    if (mode === "install") {
      // The app's own install steps, which already cover iOS.
      setGlobalState({ showInstallAppPrompt: true });
      return;
    }
    // Straight from the click, so the browser sees a user gesture.
    void initialisePushNotifications({ prompt: true });
  }, [mode, setGlobalState]);

  if (!mode) return null;
  const copy = COPY[mode];

  if (!isMobile) {
    return (
      <AppAlertDialog
        heading={copy.heading}
        text={copy.body}
        open
        onOpenChange={(next) => {
          if (!next) dismiss();
        }}
        onConfirm={accept}
        actionButtonLabel={copy.confirm}
        closeButtonText="Not now"
        actionColor="neutral"
      />
    );
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <SheetS.MobilePortalRoot className={classNames([accent, theme])}>
      <SheetS.MobileBackdrop
        $open={sheetOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) dismiss();
        }}
      />
      <SheetS.MobileSheet
        $open={sheetOpen}
        role="dialog"
        aria-modal="true"
        aria-label={copy.heading}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <IceBreakerTrayHeader title={copy.heading}>
            <TrayS.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Not now"
              onClick={dismiss}
            >
              <BsX size={18} />
            </TrayS.IceBreakerTrayActionButton>
            <TrayS.IceBreakerTrayActionButton
              type="button"
              $variant="confirm"
              aria-label={copy.confirm}
              onClick={accept}
            >
              <BsCheck size={18} />
            </TrayS.IceBreakerTrayActionButton>
          </IceBreakerTrayHeader>
          <S.Body>{copy.body}</S.Body>
        </SheetS.MobileContent>
      </SheetS.MobileSheet>
    </SheetS.MobilePortalRoot>,
    document.body,
  );
};
