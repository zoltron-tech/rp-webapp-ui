"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator } from "radix-ui";
import { useEffect, useState } from "react";
import {
  BsArrowLeft,
  BsKeyFill,
  BsPencil,
  BsPeople,
  BsPersonCircle,
  BsShieldLock,
} from "react-icons/bs";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { MdMailOutline } from "react-icons/md";
import { RiUserForbidLine } from "react-icons/ri";
import { TbUserOff } from "react-icons/tb";
import {
  forgotPasswordAction,
  getJWTIfExists,
  sendVerificationEmailAction,
} from "@/app/actions";
import { AvatarNew } from "@/components/common/avatar-new";
import { InlineMessage } from "@/components/common/inline-message";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Friend } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { syncE2EKeyBackup } from "@/utils/e2e-crypto";
import { getBlockedNovelistsAction, unblockNovelistAction } from "../actions";
import { ChangeUsernameDialog } from "./change-username-dialog";
import * as S from "./styled";

type Props = {
  onBack: () => void;
};

type AsyncState = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 5;

export function AccountSection({ onBack }: Props) {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [verifyState, setVerifyState] = useState<AsyncState>("idle");
  const [resetState, setResetState] = useState<AsyncState>("idle");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncPassphrase, setSyncPassphrase] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [blocked, setBlocked] = useState<Friend[]>([]);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [blockedPage, setBlockedPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isVerified = novelist?.isVerified ?? user?.emailVerified ?? false;

  useEffect(() => {
    getBlockedNovelistsAction(1, PAGE_SIZE).then((page) => {
      setBlocked(page);
      setHasMore(page.length === PAGE_SIZE);
    });
  }, []);

  const handleLoadMore = async () => {
    const nextPage = blockedPage + 1;
    setLoadingMore(true);
    const page = await getBlockedNovelistsAction(nextPage, PAGE_SIZE);
    setBlocked((prev) => [...prev, ...page]);
    setBlockedPage(nextPage);
    setHasMore(page.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleResendVerification = async () => {
    setVerifyState("loading");
    const jwt = await getJWTIfExists();
    if (!jwt) {
      setVerifyState("error");
      return;
    }
    const response = await sendVerificationEmailAction(jwt);
    if (response.message === API_MESSAGE.Success) {
      setVerifyState("success");
    } else {
      setVerifyState("error");
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetState("loading");
    const response = await forgotPasswordAction(user.email);
    if (response.message === API_MESSAGE.Success) {
      setResetState("success");
    } else {
      setResetState("error");
    }
  };

  const handleUnblock = async (novelist: Friend) => {
    setUnblockingId(novelist.id);
    const response = await unblockNovelistAction(novelist.id);
    if (response?.message === API_MESSAGE.Success) {
      setBlocked((prev) => prev.filter((n) => n.id !== novelist.id));
      successToast(`${novelist.firstName} unblocked.`);
    } else {
      errorToast("Could not unblock. Please try again.");
    }
    setUnblockingId(null);
  };

  const isOauth = user?.authApp && user.authApp !== "NOVELIST_WORLD";

  const handleSyncPassphrase = async () => {
    const passphrase = syncPassphrase.trim();
    if (passphrase.length < 8 || syncLoading) return;
    setSyncLoading(true);
    // No replaceOnMismatch: a typo must not overwrite an existing backup.
    const result = await syncE2EKeyBackup(passphrase);
    setSyncLoading(false);
    if (result === "mismatch") {
      errorToast(
        "That passphrase doesn't match your existing chat backup. Enter the one you set before.",
      );
      return;
    }
    if (result === "unavailable") {
      errorToast("Could not sync your chat key. Please try again.");
      return;
    }
    setSyncDialogOpen(false);
    setSyncPassphrase("");
    successToast(
      result === "installed"
        ? "Encrypted chats unlocked on this device."
        : "Chat sync passphrase saved.",
    );
  };

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={onBack}>
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <BsPersonCircle />
            <h1>Account</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.AccountSectionBody>
        {/* Email row */}
        <S.AccountRow>
          <S.AccountRowMain>
            <S.AccountRowLabel>Email</S.AccountRowLabel>
            <S.AccountRowValue>
              {user?.email || "—"}
              <S.VerifiedBadge $verified={isVerified} style={{ marginLeft: 8 }}>
                {isVerified ? (
                  <>
                    <FaCircleCheck /> Verified
                  </>
                ) : (
                  <>
                    <FaCircleXmark /> Unverified
                  </>
                )}
              </S.VerifiedBadge>
            </S.AccountRowValue>
          </S.AccountRowMain>
          <ShouldRender if={!isVerified}>
            <S.AccountRowActions>
              <S.AccountActionButton
                type="button"
                onClick={handleResendVerification}
                disabled={verifyState === "loading"}
              >
                <MdMailOutline />
                {verifyState === "loading" ? "Sending..." : "Resend email"}
              </S.AccountActionButton>
            </S.AccountRowActions>
          </ShouldRender>
        </S.AccountRow>

        <ShouldRender if={verifyState === "success"}>
          <InlineMessage variant="success">
            <p>
              Verification email sent. Check your inbox and follow the link to
              verify your address.
            </p>
          </InlineMessage>
        </ShouldRender>
        <ShouldRender if={verifyState === "error"}>
          <InlineMessage variant="error">
            <p>
              Could not send verification email. Please try again in a moment.
            </p>
          </InlineMessage>
        </ShouldRender>

        {/* Username row */}
        <S.AccountRow>
          <S.AccountRowMain>
            <S.AccountRowLabel>Username</S.AccountRowLabel>
            <S.AccountRowValue>
              {user?.username ? `@${user.username}` : "—"}
            </S.AccountRowValue>
          </S.AccountRowMain>
          <S.AccountRowActions>
            <S.AccountActionButton
              type="button"
              onClick={() => setUsernameDialogOpen(true)}
            >
              <BsPencil />
              Change
            </S.AccountActionButton>
          </S.AccountRowActions>
        </S.AccountRow>

        {/* Referrals row */}
        <S.AccountRow>
          <S.AccountRowMain>
            <S.AccountRowLabel>Your Circle</S.AccountRowLabel>
            <S.AccountRowValue>
              Novelists who joined using your referral link
            </S.AccountRowValue>
          </S.AccountRowMain>
          <S.AccountRowActions>
            <S.AccountActionButton
              type="button"
              onClick={() => routeToPage(ROUTES.Profile.Referrals)}
            >
              <BsPeople />
              View list
            </S.AccountActionButton>
          </S.AccountRowActions>
        </S.AccountRow>

        {/* Password row */}
        <ShouldRender if={!isOauth}>
          <S.AccountRow>
            <S.AccountRowMain>
              <S.AccountRowLabel>Password</S.AccountRowLabel>
              <S.AccountRowValue>••••••••</S.AccountRowValue>
            </S.AccountRowMain>
            <S.AccountRowActions>
              <S.AccountActionButton
                type="button"
                onClick={handleResetPassword}
                disabled={resetState === "loading" || !user?.email}
              >
                <BsKeyFill />
                {resetState === "loading" ? "Sending..." : "Reset password"}
              </S.AccountActionButton>
            </S.AccountRowActions>
          </S.AccountRow>
        </ShouldRender>

        <ShouldRender if={resetState === "success"}>
          <InlineMessage variant="success">
            <p>
              An email with further instructions has been sent to{" "}
              <strong>{user?.email}</strong>. Check your inbox to reset your
              password.
            </p>
          </InlineMessage>
        </ShouldRender>
        <ShouldRender if={resetState === "error"}>
          <InlineMessage variant="error">
            <p>Could not send password reset email. Please try again.</p>
          </InlineMessage>
        </ShouldRender>

        <ShouldRender if={Boolean(isOauth)}>
          <InlineMessage variant="info">
            <p>
              Your account is linked to <strong>{user?.authApp}</strong>. Manage
              your password through that provider.
            </p>
          </InlineMessage>
        </ShouldRender>

        {/* Chat sync passphrase — OAuth accounts have no password, so they
            need an explicit passphrase to read encrypted chats on any device.
            Password accounts sync automatically at login. */}
        <ShouldRender if={Boolean(isOauth)}>
          <S.AccountRow>
            <S.AccountRowMain>
              <S.AccountRowLabel>Secure chat sync</S.AccountRowLabel>
              <S.AccountRowValue>
                Use one passphrase to read your encrypted chats on any device
              </S.AccountRowValue>
            </S.AccountRowMain>
            <S.AccountRowActions>
              <S.AccountActionButton
                type="button"
                onClick={() => setSyncDialogOpen(true)}
              >
                <BsShieldLock />
                Passphrase
              </S.AccountActionButton>
            </S.AccountRowActions>
          </S.AccountRow>
        </ShouldRender>

        {/* Blocked novelists */}
        <S.BlockedSectionHeading>
          <RiUserForbidLine
            style={{
              display: "inline",
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          Blocked accounts
        </S.BlockedSectionHeading>

        <ShouldRender if={blocked.length === 0}>
          <InlineMessage variant="info">
            <p>You have not blocked anyone.</p>
          </InlineMessage>
        </ShouldRender>

        <ShouldRender if={blocked.length > 0}>
          <S.BlockedList>
            {blocked.map((person) => (
              <S.BlockedItem key={person.id}>
                <AvatarNew src={person.image} alt={person.username} />
                <S.BlockedItemInfo>
                  <S.BlockedItemName>
                    {person.firstName}
                    {person.lastName ? ` ${person.lastName}` : ""}
                  </S.BlockedItemName>
                  <S.BlockedItemUsername>
                    @{person.username}
                  </S.BlockedItemUsername>
                </S.BlockedItemInfo>
                <S.UnblockButton
                  type="button"
                  disabled={unblockingId === person.id}
                  onClick={() => handleUnblock(person)}
                >
                  <TbUserOff />
                  {unblockingId === person.id ? "Unblocking…" : "Unblock"}
                </S.UnblockButton>
              </S.BlockedItem>
            ))}
          </S.BlockedList>
          <ShouldRender if={hasMore}>
            <S.AccountActionButton
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{ alignSelf: "center" }}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </S.AccountActionButton>
          </ShouldRender>
        </ShouldRender>
      </S.AccountSectionBody>

      <ChangeUsernameDialog
        open={usernameDialogOpen}
        onOpenChange={setUsernameDialogOpen}
      />

      <AppAlertDialog
        heading="Secure chat sync"
        text=""
        open={syncDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSyncDialogOpen(false);
            setSyncPassphrase("");
          }
        }}
        onConfirm={handleSyncPassphrase}
        actionButtonLabel={syncLoading ? "Syncing…" : "Save"}
        actionColor="neutral"
        isConfirmDisabled={syncPassphrase.trim().length < 8 || syncLoading}
        body={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0 }}>
              Your encrypted chats are locked to this device. Set a passphrase
              — or enter the one you already use — to read them on every
              device you sign in to.
            </p>
            <input
              type="password"
              value={syncPassphrase}
              onChange={(e) => setSyncPassphrase(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={syncLoading}
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--bg-5)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: "var(--font-size-small)",
                padding: "10px 12px",
                width: "100%",
              }}
            />
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-xsmall)",
                margin: 0,
              }}
            >
              Keep it safe — without it, a new device can't unlock your
              message history.
            </p>
          </div>
        }
      />
    </>
  );
}
