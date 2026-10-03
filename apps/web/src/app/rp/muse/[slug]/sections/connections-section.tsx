"use client";

import { Flex } from "@novelist-world/ui";
import type { Muse, MuseConnectionGroup } from "@nw/types";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiCheck, FiChevronDown, FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { IoHeart } from "react-icons/io5";
import { VscUnverified, VscVerifiedFilled } from "react-icons/vsc";
import {
  deleteMuseConnectionAction,
  getMuseConnectionsByMuseAction,
  reactToMuseConnectionAction,
} from "@/app/rp/muse/connection-actions";
import { MuseBondArt } from "@/components/book-art";
import { AppAlertDialog } from "@/components/dialog";
import { MuseConnectionDetail } from "@/components/muse-connection/muse-connection-detail";
import {
  MuseConnectionForm,
  type MuseConnectionFormHandle,
  type MuseConnectionFormState,
  type PickedMuse,
} from "@/components/muse-connection/muse-connection-form";
import * as MC from "@/components/muse-connection/styled";
import { MuseConnectionTrayHeader } from "@/components/muse-connection/tray-header";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { getMuseAppearance } from "../appearance";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  isOwnMuse: boolean;
  /**
   * Connections handed in whole instead of fetched.
   *
   * Only the promo capture (`src/app/promo`) passes this — it renders this
   * section with fixture data and no backend. Left unset everywhere else, so
   * the app's own path is the fetch below, untouched.
   */
  seed?: MuseConnectionGroup[] | null;
};

export function ConnectionsSection({ muse, isOwnMuse, seed = null }: Props) {
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const authState = useGlobalState("authState");
  const theme = useGlobalState("theme");
  // Global theme accent class (e.g. "violet") — used to scope CSS vars for
  // the portaled mobile tray, same as AppAlertDialog does internally.
  const globalAccent = useGlobalState("accent");
  // Per-muse accent color override — used for this section's own styling
  // (card back, detail meta, etc.), distinct from the theme accent above.
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { hideExpandedBackground } = getMuseAppearance(muse);
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  const [connections, setConnections] = useState<MuseConnectionGroup[] | null>(
    null,
  );
  const [expandedConnectionId, setExpandedConnectionId] = useState<
    string | null
  >(null);
  const [reactingId, setReactingId] = useState<string | null>(null);
  const connectionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<MuseConnectionGroup | null>(null);
  const [deletingConnection, setDeletingConnection] =
    useState<MuseConnectionGroup | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const formRef = useRef<MuseConnectionFormHandle>(null);
  const [formState, setFormState] = useState<MuseConnectionFormState>({
    involvesFriendMuse: false,
    isEditMode: false,
    loading: false,
  });

  // ── Mobile sheet open/close animation (create/edit dialog only) ───────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [startY, setStartY] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSheet = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSheetVisible(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheetOpen(true)),
    );
  };

  const closeSheet = () => {
    setSheetOpen(false);
    closeTimerRef.current = setTimeout(() => setSheetVisible(false), 300);
  };

  useEffect(() => {
    if (!isMobile) return;
    if (formOpen) openSheet();
    else closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, isMobile]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );
  // ── /Mobile sheet open/close animation ─────────────────────────────────────

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingConnection(null);
  };

  // Bring the newly expanded card fully into view — its body renders taller
  // than the collapsed header, so without this the bottom (actions,
  // description) can end up clipped below the viewport on mobile. "end"
  // aligns the card's bottom edge with the scroll container's bottom edge;
  // the bottom spacer rendered after the list is what leaves room to scroll
  // that far even when the expanded card is the last one.
  useEffect(() => {
    if (!expandedConnectionId) return;
    const el = connectionCardRefs.current[expandedConnectionId];
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [expandedConnectionId]);

  useEffect(() => {
    if (seed) {
      setConnections(seed);
      return;
    }
    if (!muse?.id) return;
    let cancelled = false;
    getMuseConnectionsByMuseAction(muse.id).then((result) => {
      if (cancelled) return;
      setConnections(Array.isArray(result) ? result : []);
    });
    return () => {
      cancelled = true;
    };
  }, [muse?.id, seed]);

  const handleConnectionClick = (
    connection: NonNullable<Muse["connections"]>[number],
  ) => {
    const targetId =
      connection.sourceMuseId === muse?.id
        ? connection.targetMuseId
        : connection.sourceMuseId;
    if (targetId) routeToPage(ROUTES.Muse.View(targetId));
  };

  const initialMuse: PickedMuse | null = muse?.id
    ? {
        displayName: [muse.firstName, muse.lastName].filter(Boolean).join(" "),
        image: muse.image || null,
        museId: muse.id,
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
    setEditingConnection(null);
  };

  const handleReacted = (_connectionId: string, _accepted: boolean) => {
    // Approval states changed server-side (to DONE or REJECTED) — refetch.
    if (muse?.id) {
      getMuseConnectionsByMuseAction(muse.id).then((result) => {
        setConnections(Array.isArray(result) ? result : []);
      });
    }
  };

  const handleReact = async (connectionId: string, accepted: boolean) => {
    if (reactingId) return;
    setReactingId(connectionId);
    const response = await reactToMuseConnectionAction(connectionId, accepted);
    setReactingId(null);
    if (response?.message === API_MESSAGE.Success) {
      successToast(
        accepted ? "Muse connection accepted" : "Muse connection declined",
      );
      handleReacted(connectionId, accepted);
    } else {
      errorToast("Could not update the muse connection. Please try again.");
    }
  };

  const handleRerequested = (updated: MuseConnectionGroup) => {
    setConnections(
      (prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev,
    );
  };

  const handleDelete = async () => {
    if (!deletingConnection) return;
    setDeleteBusy(true);
    const response = await deleteMuseConnectionAction(deletingConnection.id);
    setDeleteBusy(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnections(
        (prev) => prev?.filter((c) => c.id !== deletingConnection.id) ?? prev,
      );
      successToast("Connection deleted");
      setDeletingConnection(null);
    } else {
      errorToast("Could not delete the connection. Please try again.");
    }
  };

  return (
    <S.CardExpandedWrapper $hideChrome={hideExpandedBackground}>
      <S.CardBack
        className="muse-card"
        accent={accent}
        $hideBackground={hideExpandedBackground}
      >
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.ConnectionsContainer>
            <S.ScrollableContent accent={accent}>
              {!muse && (
                <S.ShimmerGroup>
                  <S.ShimmerBlock $height="56px" />
                  <S.ShimmerBlock $height="56px" />
                  <S.ShimmerBlock $height="56px" />
                </S.ShimmerGroup>
              )}
              <S.ExpandedContentInner>
                {muse?.connections?.map((connection) => (
                  <S.ConnectionItem
                    key={`${connection.sourceMuseId}-${connection.targetMuseId}`}
                    onClick={() => handleConnectionClick(connection)}
                  >
                    <S.Avatar
                      src={connection.image}
                      alt={connection.firstName}
                      size={40}
                      className="paddington"
                      name={connection.firstName}
                    />
                    <Flex direction="column" align="flex-start">
                      <S.ConnectionLabel>
                        {connection.firstName} {connection.lastName}
                      </S.ConnectionLabel>
                      <Flex>
                        <S.ConnectionType>
                          {connection.connection}
                        </S.ConnectionType>
                        {connection.verified &&
                          connection.connection !== "RELATIONSHIP" && (
                            <VscVerifiedFilled
                              size={20}
                              color="rgb(21, 74, 117)"
                            />
                          )}
                        {connection.connection === "RELATIONSHIP" &&
                          connection.verified && (
                            <IoHeart size={20} color="rgb(151, 42, 42)" />
                          )}
                        {!connection.verified && (
                          <VscUnverified size={20} color="rgb(184, 184, 184)" />
                        )}
                      </Flex>
                    </Flex>
                  </S.ConnectionItem>
                ))}

                {/* ── Muse connections (titled, multi-muse bonds) ─────────── */}
                {muse && (
                  <>
                    <S.InfoDivider $accent={accent ?? null} />
                    <S.InfoAttrLabelRow>
                      Muse Connections
                      {authState === "LOGGED_IN" && (
                        <S.InfoAttrAddBtn
                          type="button"
                          onClick={() => {
                            setEditingConnection(null);
                            setFormOpen(true);
                          }}
                        >
                          <FiPlus size={10} />
                          {isOwnMuse ? "Add" : "Request"}
                        </S.InfoAttrAddBtn>
                      )}
                    </S.InfoAttrLabelRow>

                    {connections === null && (
                      <S.ShimmerGroup>
                        <S.ShimmerBlock $height="56px" />
                      </S.ShimmerGroup>
                    )}

                    {connections?.map((connection) => {
                      const isExpanded = expandedConnectionId === connection.id;
                      const previewMuses = connection.muses.slice(0, 3);
                      const overflowCount =
                        connection.muses.length - previewMuses.length;
                      // Viewer is involved but hasn't yet accepted/declined —
                      // they must respond before they can edit, so show the
                      // tick/cross actions in place of the edit button.
                      const awaitingViewer =
                        connection.status === "PENDING" &&
                        connection.viewerApproved === false;
                      const busyReacting = reactingId === connection.id;

                      return (
                        <S.ConnectionCard
                          key={connection.id}
                          $accent={accent ?? null}
                          ref={(el) => {
                            connectionCardRefs.current[connection.id] = el;
                          }}
                        >
                          <S.ConnectionCardHeader
                            type="button"
                            onClick={() =>
                              setExpandedConnectionId((prev) =>
                                prev === connection.id ? null : connection.id,
                              )
                            }
                          >
                            <S.ConnectionAvatarStack>
                              {previewMuses.map((m) => (
                                <S.ConnectionAvatar
                                  key={m.museId}
                                  $src={m.image}
                                  title={[m.firstName, m.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                                />
                              ))}
                              {overflowCount > 0 && (
                                <S.ConnectionOverflowBadge>
                                  +{overflowCount}
                                </S.ConnectionOverflowBadge>
                              )}
                            </S.ConnectionAvatarStack>

                            <S.ConnectionCardTitle>
                              {connection.title}
                            </S.ConnectionCardTitle>

                            <S.ConnectionCardActions>
                              {awaitingViewer ? (
                                <>
                                  <S.ConnectionReactButton
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
                                  </S.ConnectionReactButton>
                                  <S.ConnectionReactButton
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
                                  </S.ConnectionReactButton>
                                </>
                              ) : (
                                connection.canEdit && (
                                  <S.ConnectionIconButton
                                    type="button"
                                    aria-label="Edit connection"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingConnection(connection);
                                      setFormOpen(true);
                                    }}
                                  >
                                    <FiEdit2 size={13} />
                                  </S.ConnectionIconButton>
                                )
                              )}
                              {connection.canEdit && (
                                <S.ConnectionIconButton
                                  type="button"
                                  $variant="danger"
                                  aria-label="Delete connection"
                                  title="Delete connection"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingConnection(connection);
                                  }}
                                >
                                  <FaRegTrashCan size={12} />
                                </S.ConnectionIconButton>
                              )}
                              <S.ConnectionChevron $expanded={isExpanded}>
                                <FiChevronDown size={16} />
                              </S.ConnectionChevron>
                            </S.ConnectionCardActions>
                          </S.ConnectionCardHeader>

                          {isExpanded && (
                            <S.ConnectionCardBody>
                              <MuseConnectionDetail
                                connection={connection}
                                accent={accent ?? null}
                                onReacted={handleReacted}
                                onRerequested={handleRerequested}
                                hideReactButtons
                                variant="glass"
                              />
                            </S.ConnectionCardBody>
                          )}
                        </S.ConnectionCard>
                      );
                    })}

                    {connections?.length === 0 && (
                      <S.SectionEmptyWrap>
                        <MuseBondArt accent={accent} />
                        <S.SectionEmpty>
                          No muse connections yet.
                        </S.SectionEmpty>
                      </S.SectionEmptyWrap>
                    )}

                    {/* Guarantees scroll room below the last card so an
                        expanded item (even the last one) can scroll fully
                        into view with margin to spare. */}
                    {expandedConnectionId && <S.ConnectionsBottomSpacer />}
                  </>
                )}
              </S.ExpandedContentInner>
            </S.ScrollableContent>
          </S.ConnectionsContainer>
        </S.InfoCardContent>
      </S.CardBack>

      {/* Create / edit dialog — centered modal on desktop, bottom tray on mobile */}
      {!isMobile && (
        <AppAlertDialog
          heading={
            editingConnection ? "Edit Connection" : "New Character Connection"
          }
          text=""
          body={
            formOpen ? (
              <MuseConnectionForm
                connection={editingConnection ?? undefined}
                initialMuse={
                  editingConnection ? undefined : (initialMuse ?? undefined)
                }
                onSave={handleSaved}
                onCancel={handleFormCancel}
              />
            ) : null
          }
          open={formOpen}
          onOpenChange={(open) => {
            if (!open) handleFormCancel();
          }}
          showConfirm={false}
          isCancelHidden
        />
      )}

      {isMobile &&
        sheetVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <SheetS.MobilePortalRoot
            className={classNames([globalAccent, theme])}
          >
            <SheetS.MobileBackdrop
              $open={sheetOpen}
              onClick={(e) => {
                if (e.target === e.currentTarget) handleFormCancel();
              }}
            />
            <SheetS.MobileSheet
              $open={sheetOpen}
              onTouchStart={(e) => setStartY(e.touches[0].clientY)}
              onTouchEnd={(e) => {
                if (e.changedTouches[0].clientY - startY > 50)
                  handleFormCancel();
              }}
            >
              <SheetS.DragHandle />
              <SheetS.MobileContent>
                <MuseConnectionTrayHeader
                  title={
                    editingConnection
                      ? "Edit Connection"
                      : "New Character Connection"
                  }
                >
                  <MC.TrayActionButton
                    type="button"
                    $variant="cancel"
                    aria-label="Cancel"
                    onClick={handleFormCancel}
                  >
                    <FiX size={18} />
                  </MC.TrayActionButton>
                  <MC.TrayActionButton
                    type="button"
                    $variant="confirm"
                    aria-label={
                      editingConnection
                        ? "Save"
                        : formState.involvesFriendMuse
                          ? "Request connection"
                          : "Create connection"
                    }
                    disabled={formState.loading}
                    onClick={() => formRef.current?.submit()}
                  >
                    <FiCheck size={18} />
                  </MC.TrayActionButton>
                </MuseConnectionTrayHeader>

                {formOpen && (
                  <MuseConnectionForm
                    ref={formRef}
                    connection={editingConnection ?? undefined}
                    initialMuse={
                      editingConnection ? undefined : (initialMuse ?? undefined)
                    }
                    onSave={handleSaved}
                    onCancel={handleFormCancel}
                    hideActions
                    onStateChange={setFormState}
                  />
                )}
              </SheetS.MobileContent>
            </SheetS.MobileSheet>
          </SheetS.MobilePortalRoot>,
          document.body,
        )}

      {/* Delete confirmation */}
      <AppAlertDialog
        heading="Delete connection?"
        text={`"${deletingConnection?.title ?? ""}" will be permanently removed for every character and novelist involved. This cannot be undone.`}
        open={deletingConnection !== null}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) setDeletingConnection(null);
        }}
        onCancel={() => setDeletingConnection(null)}
        onConfirm={handleDelete}
        actionButtonLabel={deleteBusy ? "Deleting…" : "Delete"}
        actionColor="negative"
        isConfirmDisabled={deleteBusy}
      />
    </S.CardExpandedWrapper>
  );
}
