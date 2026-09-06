"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { AuthSession } from "@nw/types";
import { useCallback, useEffect, useState } from "react";
import { BsLaptop, BsPhone, BsTablet } from "react-icons/bs";
import { TbLogout, TbShieldLock } from "react-icons/tb";
import {
  getSessionsAction,
  logoutEverywhereAction,
  logoutOtherDevicesAction,
  revokeSessionAction,
} from "@/app/actions";
import { InlineMessage } from "@/components/common/inline-message";
import { AppAlertDialog } from "@/components/dialog";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import * as S from "./styled";

/**
 * "Where you are signed in", inside the account settings.
 *
 * This screen is the reason sessions exist as rows in a table rather than as an
 * expiry baked into a token. Every device that logs in gets an `auth_session`
 * row, so the account holder can see the list and end any of them — which is
 * also the only honest answer to "I left myself logged in on a shared machine".
 *
 * Three actions, deliberately distinct, because they answer different fears:
 *
 *  * revoking one row — "that tablet is my old one";
 *  * signing out other devices — "I left myself logged in somewhere", the
 *    common case, which should not cost the user their current session;
 *  * signing out everywhere — "someone else is in my account", where ending
 *    this session too is the point.
 *
 * Laid out to fit an iPhone SE (375×667) without horizontal scrolling: the row
 * collapses to a stack under 480px, and the device label is the only element
 * allowed to grow.
 */

type AsyncState = "idle" | "loading" | "error";

/** Picks an icon from the server-rendered label. Cosmetic; an unknown shape gets the laptop. */
const deviceIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("iphone") || lower.includes("android")) return <BsPhone />;
  if (lower.includes("ipad") || lower.includes("tablet")) return <BsTablet />;
  return <BsLaptop />;
};

/**
 * Milliseconds, from whichever shape the API sends.
 *
 * user-service serialises `OffsetDateTime` as epoch *seconds* — a decimal
 * number, not the ISO string the type once claimed — so handing the value
 * straight to `new Date` reads seconds as milliseconds and lands every row in
 * January 1970. Anything under 1e12 is therefore seconds; larger numbers are
 * already milliseconds, and a non-numeric value is left to `Date` to parse so
 * an ISO string keeps working if the serialisation ever changes.
 */
const toMillis = (value: string | number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (
    typeof value === "number" ||
    (value.trim() !== "" && !Number.isNaN(numeric))
  ) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  return new Date(value).getTime();
};

/**
 * "3 minutes ago", and so on.
 *
 * Hand-rolled rather than pulled from `moment`, which is already a dependency,
 * because this needs five buckets and no locale handling — and the point of the
 * line is recognition ("that was me, just now") rather than precision.
 */
const relativeTime = (value: string | number): string => {
  const then = toMillis(value);
  if (Number.isNaN(then)) return "unknown";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 90) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "yesterday" : `${days} days ago`;

  return new Date(then).toLocaleDateString();
};

export function DevicesSection() {
  const { successToast, errorToast } = useUIContext();

  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmOthers, setConfirmOthers] = useState(false);
  const [confirmEverywhere, setConfirmEverywhere] = useState(false);

  const load = useCallback(async () => {
    const result = await getSessionsAction();
    if ("message" in result) {
      setState("error");
      return;
    }
    setSessions(result);
    setState("idle");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevoke = async (session: AuthSession) => {
    setRevokingId(session.id);
    const result = await revokeSessionAction(session.id);
    setRevokingId(null);

    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not sign that device out. Please try again.");
      return;
    }

    // Drop it locally rather than refetching: the row is gone either way, and
    // this keeps the list from flickering on a slow connection.
    setSessions((current) => current.filter((it) => it.id !== session.id));
    successToast(`${session.deviceLabel} has been signed out.`);
  };

  const handleLogoutOthers = async () => {
    const result = await logoutOtherDevicesAction();
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not sign your other devices out. Please try again.");
      return;
    }
    setSessions((current) => current.filter((it) => it.isCurrent));
    successToast("Your other devices have been signed out.");
  };

  /** Ends this session too, so the action navigates away rather than returning. */
  const handleLogoutEverywhere = async () => {
    const result = await logoutEverywhereAction();
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not sign all devices out. Please try again.");
    }
  };

  const otherDeviceCount = sessions.filter((it) => !it.isCurrent).length;

  return (
    <>
      <S.BlockedSectionHeading>
        <TbShieldLock
          style={{ display: "inline", marginRight: 6, verticalAlign: -2 }}
        />
        Where you are signed in
      </S.BlockedSectionHeading>

      <ShouldRender if={state === "loading"}>
        <S.AccountRowValue>Loading your devices…</S.AccountRowValue>
      </ShouldRender>

      <ShouldRender if={state === "error"}>
        <InlineMessage variant="error">
          <p>Could not load your devices. Please try again in a moment.</p>
        </InlineMessage>
      </ShouldRender>

      <ShouldRender if={state === "idle"}>
        {sessions.map((session) => (
          <S.AccountRow key={session.id}>
            <S.AccountRowMain>
              <S.AccountRowLabel>
                {deviceIcon(session.deviceLabel)} {session.deviceLabel}
                {session.isCurrent ? " · This device" : ""}
              </S.AccountRowLabel>
              <S.AccountRowValue>
                Last active {relativeTime(session.lastUsedAt)} · Signed in{" "}
                {relativeTime(session.createdAt)}
              </S.AccountRowValue>
            </S.AccountRowMain>

            {/* No revoke button on the current row. Ending your own session from
                a list of devices reads as a mistake; "Sign out everywhere"
                below is the deliberate way to do it. */}
            <ShouldRender if={!session.isCurrent}>
              <S.AccountRowActions>
                <S.AccountActionButton
                  type="button"
                  onClick={() => handleRevoke(session)}
                  disabled={revokingId === session.id}
                >
                  <TbLogout />
                  {revokingId === session.id ? "Signing out…" : "Sign out"}
                </S.AccountActionButton>
              </S.AccountRowActions>
            </ShouldRender>
          </S.AccountRow>
        ))}

        <ShouldRender if={otherDeviceCount === 0}>
          <InlineMessage variant="info">
            <p>This is the only device signed in to your account right now.</p>
          </InlineMessage>
        </ShouldRender>

        <S.AccountRow>
          <S.AccountRowMain>
            <S.AccountRowLabel>Sign out everywhere else</S.AccountRowLabel>
            <S.AccountRowValue>
              Ends every session except this one.
            </S.AccountRowValue>
          </S.AccountRowMain>
          <S.AccountRowActions>
            <S.AccountActionButton
              type="button"
              onClick={() => setConfirmOthers(true)}
              disabled={otherDeviceCount === 0}
            >
              <TbLogout />
              Sign out others
            </S.AccountActionButton>
          </S.AccountRowActions>
        </S.AccountRow>

        <S.AccountRow>
          <S.AccountRowMain>
            <S.AccountRowLabel>Sign out of everything</S.AccountRowLabel>
            <S.AccountRowValue>
              Ends every session, including this one. Use this if you think
              someone else has access to your account.
            </S.AccountRowValue>
          </S.AccountRowMain>
          <S.AccountRowActions>
            <S.AccountActionButton
              type="button"
              onClick={() => setConfirmEverywhere(true)}
            >
              <TbShieldLock />
              Sign out everywhere
            </S.AccountActionButton>
          </S.AccountRowActions>
        </S.AccountRow>
      </ShouldRender>

      <AppAlertDialog
        heading="Sign out your other devices?"
        text={`This ends ${otherDeviceCount === 1 ? "1 other session" : `${otherDeviceCount} other sessions`}. You will stay signed in here.`}
        open={confirmOthers}
        onOpenChange={setConfirmOthers}
        onConfirm={handleLogoutOthers}
        actionButtonLabel="Sign out others"
      />

      <AppAlertDialog
        heading="Sign out everywhere?"
        text="This ends every session on your account, including this one. You will need to sign in again."
        open={confirmEverywhere}
        onOpenChange={setConfirmEverywhere}
        onConfirm={handleLogoutEverywhere}
        actionButtonLabel="Sign out everywhere"
      />
    </>
  );
}
