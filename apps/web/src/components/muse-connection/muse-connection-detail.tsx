"use client";

import type { MuseConnectionGroup } from "@nw/types";
import { useState } from "react";
import { FiCheck, FiClock, FiEdit2, FiX } from "react-icons/fi";
import {
  reactToMuseConnectionAction,
  reRequestMuseConnectionAction,
} from "@/app/rp/muse/connection-actions";
import { Button } from "@/components/common";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

const STATUS_LABELS: Record<MuseConnectionGroup["status"], string> = {
  DONE: "Connected",
  PENDING: "Pending",
  REJECTED: "Declined",
};

type Props = {
  connection: MuseConnectionGroup;
  accent?: string | null;
  /** Called after the viewer accepted or declined the pending request. */
  onReacted: (connectionId: string, accepted: boolean) => void;
  /** Called after the creator re-sent a declined request. */
  onRerequested?: (connection: MuseConnectionGroup) => void;
  onEdit?: () => void;
  /** Suppress the accept/decline buttons when the caller renders them itself. */
  hideReactButtons?: boolean;
  /** "glass" matches the muse profile page's translucent accent-tinted cards
   * instead of the flat edit-muse form panel. Same card footprint either way. */
  variant?: "default" | "glass";
};

export function MuseConnectionDetail({
  connection,
  accent,
  onReacted,
  onRerequested,
  onEdit,
  hideReactButtons = false,
  variant = "default",
}: Props) {
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const [busy, setBusy] = useState(false);

  const isPending = connection.status === "PENDING";
  const isRejected = connection.status === "REJECTED";
  const awaitingViewer =
    isPending && connection.viewerApproved === false && !hideReactButtons;
  const canRerequest = isRejected && connection.viewerIsCreator;

  const handleReact = async (accepted: boolean) => {
    if (busy) return;
    setBusy(true);
    const response = await reactToMuseConnectionAction(connection.id, accepted);
    setBusy(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast(
        accepted ? "Muse connection accepted" : "Muse connection declined",
      );
      onReacted(connection.id, accepted);
    } else {
      errorToast("Could not update the muse connection. Please try again.");
    }
  };

  const handleRerequest = async () => {
    if (busy) return;
    setBusy(true);
    const response = await reRequestMuseConnectionAction(connection.id);
    setBusy(false);
    if (response && !("message" in response)) {
      successToast("Connection requested again");
      onRerequested?.(response);
    } else {
      errorToast("Could not re-send the connection request. Please try again.");
    }
  };

  return (
    <S.DetailRoot>
      {connection.canEdit && (
        <S.DetailHeaderRow>
          <S.DetailHeaderInfo>
            <S.StatusChip $status={connection.status}>
              {STATUS_LABELS[connection.status]}
            </S.StatusChip>
            {connection.createdByName && (
              <S.DetailMeta>created by {connection.createdByName}</S.DetailMeta>
            )}
          </S.DetailHeaderInfo>
          {onEdit && (
            <S.DetailEditButton
              type="button"
              onClick={onEdit}
              aria-label="Edit connection"
            >
              <FiEdit2 size={13} />
              Edit
            </S.DetailEditButton>
          )}
        </S.DetailHeaderRow>
      )}

      <S.DetailMuseGrid>
        {connection.muses.map((muse) => (
          <S.DetailMuseCard
            key={muse.museId}
            type="button"
            $variant={variant}
            $accent={accent}
            onClick={() => {
              // The muse of a novelist who disabled their account has no page.
              if (muse.isPlaceholder) return;
              routeToPage(ROUTES.Muse.View(muse.museId));
            }}
          >
            <S.MuseChipAvatar $src={muse.image} />
            <S.DetailMuseCardInfo>
              <S.DetailMuseName title={muse.firstName}>
                {muse.firstName}
              </S.DetailMuseName>
              {muse.novelistName && (
                <S.DetailMuseOwner title={`by ${muse.novelistName}`}>
                  by {muse.novelistName}
                </S.DetailMuseOwner>
              )}
            </S.DetailMuseCardInfo>
          </S.DetailMuseCard>
        ))}
      </S.DetailMuseGrid>

      {isPending && (
        <S.ApprovalList>
          {connection.approvals.map((approval) => (
            <S.ApprovalRow
              key={approval.novelistId}
              $approved={approval.approved}
            >
              {approval.approved ? (
                <FiCheck size={13} color="#15803d" />
              ) : (
                <FiClock size={13} />
              )}
              {approval.novelistName || "A novelist"}
              {approval.approved ? " accepted" : " hasn't responded yet"}
            </S.ApprovalRow>
          ))}
        </S.ApprovalList>
      )}

      {isRejected && (
        <S.DetailMeta>
          This connection request was declined.
          {connection.viewerIsCreator &&
            " You can send the same request again."}
        </S.DetailMeta>
      )}

      {connection.description && (
        <S.DescriptionWrap>
          <RichTextRenderer
            savedText={connection.description}
            overlayHidden
            disableCollapse
            accent={accent ?? null}
          />
        </S.DescriptionWrap>
      )}

      {(awaitingViewer || canRerequest) && (
        <S.DetailActions>
          {awaitingViewer && (
            <>
              <S.DetailReactButton
                type="button"
                $variant="decline"
                title="Decline"
                aria-label="Decline"
                disabled={busy}
                onClick={() => handleReact(false)}
              >
                <FiX size={20} />
              </S.DetailReactButton>
              <S.DetailReactButton
                type="button"
                $variant="accept"
                title="Accept"
                aria-label="Accept"
                disabled={busy}
                onClick={() => handleReact(true)}
              >
                <FiCheck size={20} />
              </S.DetailReactButton>
            </>
          )}
          {canRerequest && (
            <Button
              variant="positive"
              className={busy ? "messaging" : undefined}
              onClick={handleRerequest}
            >
              {busy ? "…" : "Request again"}
            </Button>
          )}
        </S.DetailActions>
      )}
    </S.DetailRoot>
  );
}
