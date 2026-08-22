"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Muse, MuseAboutSection } from "@nw/types";
import { useRef, useState } from "react";
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { removeMuseNoteAction, setMuseNoteAction } from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  aboutSections: MuseAboutSection[] | null;
  isOwnMuse: boolean;
  onMuseUpdate?: (updates: Partial<Muse>) => void;
};

export function BackStorySection({
  muse,
  aboutSections,
  isOwnMuse,
  onMuseUpdate,
}: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [confirmRemoveNote, setConfirmRemoveNote] = useState(false);
  const [noteRemoving, setNoteRemoving] = useState(false);

  const hasNote = Boolean(muse?.note?.length);

  function startNoteEdit() {
    setNoteDraft(muse?.note ?? "");
    setNoteEditing(true);
    // Let the textarea mount, then size it to its content
    setTimeout(() => {
      if (noteTextareaRef.current) {
        noteTextareaRef.current.style.height = "auto";
        noteTextareaRef.current.style.height = `${noteTextareaRef.current.scrollHeight}px`;
      }
    }, 0);
  }

  function cancelNoteEdit() {
    setNoteEditing(false);
    setNoteDraft("");
  }

  async function handleSaveNote() {
    if (!muse?.id || !noteDraft.trim()) return;
    setNoteSaving(true);
    const result = await setMuseNoteAction(muse.id, noteDraft.trim());
    setNoteSaving(false);
    if (result && typeof result === "object" && "message" in result) {
      errorToast("Failed to save note.");
      return;
    }
    onMuseUpdate?.({ note: result as string });
    setNoteEditing(false);
    setNoteDraft("");
    successToast("Note saved.");
  }

  async function handleRemoveNote() {
    if (!muse?.id) return;
    setNoteRemoving(true);
    const result = await removeMuseNoteAction(muse.id);
    setNoteRemoving(false);
    if (result && typeof result === "object" && "message" in result) {
      errorToast("Failed to remove note.");
      return;
    }
    onMuseUpdate?.({ note: undefined });
    successToast("Note removed.");
  }

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Story</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            <ShouldRender if={aboutSections === null}>
              <S.ShimmerGroup>
                <S.ShimmerLine />
                <S.ShimmerLine $width="88%" />
                <S.ShimmerLine $width="74%" />
                <S.ShimmerBlock $height="56px" style={{ marginTop: "12px" }} />
                <S.ShimmerLine style={{ marginTop: "12px" }} />
                <S.ShimmerLine $width="92%" />
                <S.ShimmerLine $width="65%" />
                <S.ShimmerLine $width="80%" style={{ marginTop: "12px" }} />
                <S.ShimmerLine $width="55%" />
              </S.ShimmerGroup>
            </ShouldRender>

            <ShouldRender if={aboutSections !== null}>
              {/* Note — owner can add / edit / remove */}
              {noteEditing ? (
                <S.NoteContainer>
                  <S.NoteControlRow className="always-visible">
                    <S.NoteControlBtn
                      type="button"
                      title="Cancel"
                      onClick={cancelNoteEdit}
                      disabled={noteSaving}
                    >
                      <FiX size={11} />
                    </S.NoteControlBtn>
                    <S.NoteControlBtn
                      type="button"
                      title="Save"
                      className="success"
                      onClick={handleSaveNote}
                      disabled={noteSaving || !noteDraft.trim()}
                    >
                      <FiCheck size={11} />
                    </S.NoteControlBtn>
                  </S.NoteControlRow>
                  <S.NoteEditTextarea
                    ref={noteTextareaRef}
                    value={noteDraft}
                    maxLength={100}
                    onChange={(e) => {
                      setNoteDraft(e.target.value);
                      const el = e.target;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    placeholder="Write a favorite quote…"
                    autoFocus
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelNoteEdit();
                    }}
                  />
                  <S.NoteCharCount
                    $near={noteDraft.length >= 80}
                    $atLimit={noteDraft.length >= 100}
                  >
                    {noteDraft.length}/100
                  </S.NoteCharCount>
                </S.NoteContainer>
              ) : hasNote ? (
                <S.NoteContainer>
                  <S.NoteQuote>{muse?.note}</S.NoteQuote>
                  {isOwnMuse && (
                    <S.NoteControlRow className="note-actions">
                      <S.NoteControlBtn
                        type="button"
                        title="Edit note"
                        onClick={startNoteEdit}
                      >
                        <FiEdit2 size={11} />
                      </S.NoteControlBtn>
                      <S.NoteControlBtn
                        type="button"
                        title="Remove note"
                        className="danger"
                        onClick={() => setConfirmRemoveNote(true)}
                        disabled={noteRemoving}
                      >
                        <FiTrash2 size={11} />
                      </S.NoteControlBtn>
                    </S.NoteControlRow>
                  )}
                </S.NoteContainer>
              ) : isOwnMuse ? (
                <S.NoteAddBtn type="button" onClick={startNoteEdit}>
                  <FiPlus size={12} />
                  Add {muse?.firstName}&apos;s favorite quote
                </S.NoteAddBtn>
              ) : null}

              <ShouldRender
                if={aboutSections !== null && aboutSections.length === 0}
              >
                <S.SectionEmptyWrap>
                  <S.SectionEmpty>No story yet.</S.SectionEmpty>
                  <ShouldRender if={isOwnMuse}>
                    <S.SectionEmptyCta
                      type="button"
                      onClick={() =>
                        routeToPage(
                          ROUTES.Profile.Muses.AboutCreate(muse?.id ?? ""),
                        )
                      }
                    >
                      <GrEdit size={13} />
                      Add story section
                    </S.SectionEmptyCta>
                  </ShouldRender>
                </S.SectionEmptyWrap>
              </ShouldRender>

              <ShouldRender
                if={Boolean(aboutSections && aboutSections.length > 0)}
              >
                {aboutSections?.map((section, index) => (
                  <div key={section.id ?? `about-section-${index}`}>
                    {section.image && (
                      <AppImageViewer
                        src={section.image}
                        alt="Section attachment"
                      >
                        <S.AboutSectionImage
                          src={section.image}
                          alt="Section attachment"
                        />
                      </AppImageViewer>
                    )}
                    <RichTextRenderer
                      savedText={section.text || ""}
                      overlayHidden
                      disableCollapse
                      accent={accent ?? null}
                    />
                  </div>
                ))}
              </ShouldRender>
            </ShouldRender>
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>

      <AppAlertDialog
        heading="Remove note?"
        text="Are you sure you want to remove this note? This cannot be undone."
        open={confirmRemoveNote}
        onOpenChange={(open) => {
          if (!open && !noteRemoving) setConfirmRemoveNote(false);
        }}
        onCancel={() => setConfirmRemoveNote(false)}
        onConfirm={() => {
          setConfirmRemoveNote(false);
          handleRemoveNote();
        }}
        actionButtonLabel={noteRemoving ? "Removing…" : "Remove"}
        actionColor="negative"
        isConfirmDisabled={noteRemoving}
      />
    </S.CardExpandedWrapper>
  );
}
