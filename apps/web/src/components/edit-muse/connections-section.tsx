"use client";

import type { MuseConnectionGroup } from "@nw/types";
import { Separator } from "radix-ui";
import { useCallback, useEffect, useState } from "react";
import { BsArrowLeft, BsPeopleFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiCheck, FiChevronDown, FiEdit2, FiPlus, FiX } from "react-icons/fi";
import {
  deleteMuseConnectionAction,
  getMuseConnectionsByMuseAction,
  reactToMuseConnectionAction,
} from "@/app/rp/muse/connection-actions";
import { AppAlertDialog } from "@/components/dialog";
import { MuseConnectionDetail } from "@/components/muse-connection/muse-connection-detail";
import {
  MuseConnectionForm,
  type PickedMuse,
} from "@/components/muse-connection/muse-connection-form";
import * as MC from "@/components/muse-connection/styled";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { useMuseState } from "./muse.store";
import * as S from "./styled";

type Props = {
  onBack: () => void;
};

export function ConnectionsSection({ onBack }: Props) {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const { successToast, errorToast } = useUIContext();

  const [connections, setConnections] = useState<MuseConnectionGroup[] | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MuseConnectionGroup | null>(null);
  const [deleting, setDeleting] = useState<MuseConnectionGroup | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refetch = useCallback(() => {
    if (!id) return;
    getMuseConnectionsByMuseAction(id).then((res) => {
      setConnections(Array.isArray(res) ? res : []);
    });
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const initialMuse: PickedMuse | null = id
    ? {
        displayName: [firstName, lastName].filter(Boolean).join(" "),
        image: image || null,
        museId: id,
      }
    : null;

  const handleSaved = (saved: MuseConnectionGroup) => {
    setConnections((prev) => {
      if (!prev) return [saved];
      const exists = prev.some((c) => c.id === saved.id);
      return exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...prev];
    });
    setFormOpen(false);
    setEditing(null);
  };

  const handleReacted = () => {
    // Approval states changed server-side (to DONE or REJECTED) — refetch.
    refetch();
  };

  const handleRerequested = (updated: MuseConnectionGroup) => {
    setConnections(
      (prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev,
    );
  };

  const handleReact = async (connectionId: string, accepted: boolean) => {
    if (reactingId) return;
    setReactingId(connectionId);
    const response = await reactToMuseConnectionAction(connectionId, accepted);
    setReactingId(null);
    if (response?.message === API_MESSAGE.Success) {
      successToast(
        accepted
          ? "Character connection accepted"
          : "Character connection declined",
      );
      refetch();
    } else {
      errorToast("Could not update the connection. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const response = await deleteMuseConnectionAction(deleting.id);
    setDeleteBusy(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnections(
        (prev) => prev?.filter((c) => c.id !== deleting.id) ?? prev,
      );
      successToast("Connection deleted");
      setDeleting(null);
    } else {
      errorToast("Could not delete the connection. Please try again.");
    }
  };

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={onBack} aria-label="Back">
            <BsArrowLeft />
          </S.BackButton>
          <S.FormHeading>
            <BsPeopleFill />
            <h1>Connections</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <ConnectionsIntro>
        Titled, multi-character bonds linking this character to your own or your
        friends' characters. All involved novelists must accept before a
        connection goes live.
      </ConnectionsIntro>

      <SectionHeadingRow>
        <SectionHeading>Connections</SectionHeading>
        {id && (
          <AddButton
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={14} />
            Add connection
          </AddButton>
        )}
      </SectionHeadingRow>

      {!id && (
        <EmptyNote>Save this character first to add connections.</EmptyNote>
      )}

      {id && connections === null && <EmptyNote>Loading…</EmptyNote>}

      {id && connections?.length === 0 && (
        <EmptyNote>No connections yet. Add one above.</EmptyNote>
      )}

      {connections?.map((connection) => {
        const isExpanded = expandedId === connection.id;
        const previewMuses = connection.muses.slice(0, 3);
        const overflowCount = connection.muses.length - previewMuses.length;
        const awaitingViewer =
          connection.status === "PENDING" &&
          connection.viewerApproved === false;
        const busyReacting = reactingId === connection.id;

        return (
          <MC.ConnectionCard key={connection.id}>
            <MC.ConnectionCardHeader
              type="button"
              onClick={() =>
                setExpandedId((prev) =>
                  prev === connection.id ? null : connection.id,
                )
              }
            >
              <MC.ConnectionAvatarStack>
                {previewMuses.map((m) => (
                  <MC.MuseChipAvatar
                    key={m.museId}
                    $src={m.image}
                    title={[m.firstName, m.lastName].filter(Boolean).join(" ")}
                  />
                ))}
                {overflowCount > 0 && (
                  <MC.ConnectionOverflowBadge>
                    +{overflowCount}
                  </MC.ConnectionOverflowBadge>
                )}
              </MC.ConnectionAvatarStack>

              <MC.ConnectionCardTitle>
                {connection.title}
              </MC.ConnectionCardTitle>

              {connection.status !== "DONE" && (
                <MC.StatusChip $status={connection.status}>
                  {connection.status === "PENDING" ? "Pending" : "Declined"}
                </MC.StatusChip>
              )}

              <MC.ConnectionCardActions>
                {awaitingViewer ? (
                  <>
                    <MC.ConnectionReactButton
                      type="button"
                      $variant="decline"
                      aria-label="Decline"
                      title="Decline"
                      disabled={busyReacting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReact(connection.id, false);
                      }}
                    >
                      <FiX size={15} />
                    </MC.ConnectionReactButton>
                    <MC.ConnectionReactButton
                      type="button"
                      $variant="accept"
                      aria-label="Accept"
                      title="Accept"
                      disabled={busyReacting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReact(connection.id, true);
                      }}
                    >
                      <FiCheck size={15} />
                    </MC.ConnectionReactButton>
                  </>
                ) : (
                  connection.canEdit && (
                    <MC.ConnectionEditIconButton
                      type="button"
                      aria-label="Edit connection"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(connection);
                        setFormOpen(true);
                      }}
                    >
                      <FiEdit2 size={13} />
                    </MC.ConnectionEditIconButton>
                  )
                )}
                {connection.canEdit && (
                  <MC.ConnectionDeleteIconButton
                    type="button"
                    aria-label="Delete connection"
                    title="Delete connection"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(connection);
                    }}
                  >
                    <FaRegTrashCan size={12} />
                  </MC.ConnectionDeleteIconButton>
                )}
                <MC.ConnectionChevron $expanded={isExpanded}>
                  <FiChevronDown size={16} />
                </MC.ConnectionChevron>
              </MC.ConnectionCardActions>
            </MC.ConnectionCardHeader>

            {isExpanded && (
              <MC.ConnectionCardBody>
                <MuseConnectionDetail
                  connection={connection}
                  accent={null}
                  onReacted={handleReacted}
                  onRerequested={handleRerequested}
                  hideReactButtons
                />
              </MC.ConnectionCardBody>
            )}
          </MC.ConnectionCard>
        );
      })}

      {/* Add / edit dialog */}
      <AppAlertDialog
        heading={editing ? "Edit Connection" : "New Character Connection"}
        text=""
        body={
          formOpen ? (
            <MuseConnectionForm
              connection={editing ?? undefined}
              initialMuse={editing ? undefined : (initialMuse ?? undefined)}
              onSave={handleSaved}
              onCancel={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            />
          ) : null
        }
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        showConfirm={false}
        isCancelHidden
      />

      {/* Delete confirmation */}
      <AppAlertDialog
        heading="Delete connection?"
        text={`"${deleting?.title ?? ""}" will be permanently removed for every character and novelist involved. This cannot be undone.`}
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        actionButtonLabel={deleteBusy ? "Deleting…" : "Delete"}
        actionColor="negative"
        isConfirmDisabled={deleteBusy}
      />
    </>
  );
}

// ── Inline styled components (connections-specific) ─────────────────────────

import styled from "styled-components";

const ConnectionsIntro = styled.p`
  margin: 16px 0 12px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

const SectionHeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
`;

const SectionHeading = styled.h2`
  all: unset;
  display: block;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

const AddButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--bg-8);
  background: var(--bg-2);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const EmptyNote = styled.p`
  margin: 0 0 16px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-style: italic;
`;
