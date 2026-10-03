"use client";

import type {
  CreateUpdateMuse,
  Muse,
  MuseAboutSection,
} from "@nw/types/novelist";
import { useParams } from "@/lib/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowLeft, BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { MdAutoStories } from "react-icons/md";
import {
  deleteMuseAboutSectionAction,
  getMuseAboutSectionsAction,
  getMuseAction,
  updateMuseAction,
} from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { MuseAboutSectionForm } from "@/components/edit-muse-about-section/muse-about-section-form";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; section: MuseAboutSection };

const CLOSE_DURATION = 290; // matches CSS animation duration
const MAX_QUOTE_LENGTH = 100;

export default function MuseAboutListSectionsPage() {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");
  const [aboutSections, setAboutSections] = useState<MuseAboutSection[] | null>(
    null,
  );
  const { successToast, errorToast } = useUIContext();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const { routeToPage, baseDataLoader, stopPageLoading } = usePageRouter();
  const [muse, setMuse] = useState<Muse | null>(null);
  const [museLoaded, setMuseLoaded] = useState(false);
  const [quoteValue, setQuoteValue] = useState("");
  const [quoteSaving, setQuoteSaving] = useState(false);

  // ── Form sheet / inline panel state ─────────────────────────────────────
  const [activeForm, setActiveForm] = useState<FormState | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCreate = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosing(false);
    setActiveForm({ mode: "create" });
  }, []);

  const openEdit = useCallback((section: MuseAboutSection) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosing(false);
    setActiveForm({ mode: "edit", section });
  }, []);

  const closeForm = useCallback(() => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setActiveForm(null);
      setIsClosing(false);
    }, CLOSE_DURATION);
  }, []);

  const handleSaved = useCallback(
    (section: MuseAboutSection) => {
      setAboutSections((prev) => {
        if (!prev) return [section];
        if (activeForm?.mode === "edit") {
          return prev.map((s) => (s.id === section.id ? section : s));
        }
        return [...prev, section];
      });
      closeForm();
    },
    [activeForm, closeForm],
  );
  // ────────────────────────────────────────────────────────────────────────

  const handleDeleteSection = async () => {
    if (!selectedSectionId) {
      errorToast("Failed to delete section");
      setShowDeleteAlert(false);
      return;
    }
    const response = await deleteMuseAboutSectionAction(selectedSectionId);
    if (response?.message === API_MESSAGE.Success) {
      setAboutSections((prev) =>
        prev ? prev.filter((s) => s.id !== selectedSectionId) : prev,
      );
      successToast("Section deleted successfully");
    } else {
      errorToast("Failed to delete section");
    }
    setSelectedSectionId(null);
    setShowDeleteAlert(false);
  };

  const fetchMuseAboutSections = async () => {
    try {
      const sections = await baseDataLoader(() =>
        getMuseAboutSectionsAction(id),
      );
      setAboutSections(sections ?? []);
    } catch {
      stopPageLoading();
      setAboutSections([]);
    }
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    if (aboutSections !== null) return;
    fetchMuseAboutSections();
  }, [authState, aboutSections]);

  const fetchMuse = async () => {
    try {
      const result = await baseDataLoader(() => getMuseAction(id));
      if (result && !("message" in result)) {
        setMuse(result);
        setQuoteValue(result.note ?? "");
      }
    } finally {
      setMuseLoaded(true);
    }
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    if (museLoaded) return;
    fetchMuse();
  }, [authState, museLoaded]);

  const isQuoteDirty = quoteValue !== (muse?.note ?? "");
  const quoteLength = quoteValue.length;
  const quoteRemaining = MAX_QUOTE_LENGTH - quoteLength;

  const handleQuoteSave = useCallback(async () => {
    if (!muse || !id || !isQuoteDirty) return;
    setQuoteSaving(true);
    const payload: CreateUpdateMuse = {
      accent: muse.accent,
      cardBackground: muse.cardBackground ?? null,
      connections: muse.connections ?? [],
      extraAttributes: muse.extraAttributes ?? null,
      fandom: (muse.fandom?.id ??
        "FANDOMLESS") as unknown as typeof muse.fandom,
      firstName: muse.firstName ?? "",
      hideExpandedBackground: muse.hideExpandedBackground ?? false,
      hideSideMenuBackground: muse.hideSideMenuBackground ?? false,
      image: muse.image ?? null,
      lastName: muse.lastName ?? "",
      nameColor: muse.nameColor ?? null,
      nicknames: muse.nicknames ?? [],
      note: quoteValue.trim() || null,
      pennedByColor: muse.pennedByColor ?? null,
      privacy: muse.privacy ?? "PUBLIC",
      sideMenuBgColor: muse.sideMenuBgColor ?? null,
      sideMenuTextColor: muse.sideMenuTextColor ?? null,
      song: muse.song ?? null,
      story: muse.story ?? null,
      tags: muse.tags ?? null,
      useAccent: muse.useAccent ?? false,
      useExtraImages: muse.useExtraImages ?? false,
      video: muse.video ?? null,
      wallpaper: muse.wallpaper ?? null,
    };
    const result = await updateMuseAction(id, payload);
    setQuoteSaving(false);
    if ("message" in result) {
      errorToast("Failed to save quote.");
      return;
    }
    setMuse((prev) => (prev ? { ...prev, note: quoteValue } : prev));
    successToast("Quote saved.");
  }, [muse, id, isQuoteDirty, quoteValue, errorToast, successToast]);

  const sectionCount = aboutSections?.length ?? 0;
  const isFormOpen = activeForm !== null || isClosing;
  const formKey =
    activeForm?.mode === "edit" ? activeForm.section.id : "create";

  return (
    <S.Container>
      {/* ── Header ──────────────────────────────────────────────── */}
      <S.TopBar>
        <S.BackButton
          onClick={() => routeToPage(ROUTES.Profile.Muses.Edit(id || ""))}
          aria-label="Back to edit muse"
        >
          <BsArrowLeft />
        </S.BackButton>
        <MdAutoStories className="icon" size={26} />
        <S.PageTitle>Story</S.PageTitle>
      </S.TopBar>

      {/* ── Description ─────────────────────────────────────────── */}
      <S.HeroSection>
        <S.Description>
          Tell your character&apos;s story through sections — each can contain
          rich text and an optional image. Readers will see these in order.
        </S.Description>
      </S.HeroSection>

      {/* ── Favorite Quote ──────────────────────────────────────── */}
      <S.QuoteBlock>
        <S.QuoteLabel htmlFor="about-muse-quote">
          Favorite Quote{muse?.firstName ? ` by ${muse.firstName}` : ""}
        </S.QuoteLabel>
        <S.QuoteTextarea
          id="about-muse-quote"
          value={quoteValue}
          onChange={(e) => {
            if (e.target.value.length <= MAX_QUOTE_LENGTH)
              setQuoteValue(e.target.value);
          }}
          placeholder='"A quote that defines your character…"'
          rows={3}
          maxLength={MAX_QUOTE_LENGTH}
          disabled={!museLoaded || !muse}
        />
        <S.QuoteFooter>
          <S.QuoteCharCount
            className={quoteRemaining <= 20 ? "warn" : undefined}
          >
            {quoteLength} / {MAX_QUOTE_LENGTH}
          </S.QuoteCharCount>
          {isQuoteDirty && (
            <S.QuoteSaveButton
              type="button"
              onClick={handleQuoteSave}
              disabled={quoteSaving}
            >
              {quoteSaving ? "Saving…" : "Save Quote"}
            </S.QuoteSaveButton>
          )}
        </S.QuoteFooter>
      </S.QuoteBlock>

      {/* ── Actions row ─────────────────────────────────────────── */}
      <S.ActionsRow>
        {sectionCount > 0 && (
          <S.SectionCount>
            {sectionCount} section{sectionCount !== 1 ? "s" : ""}
          </S.SectionCount>
        )}
        <S.AddButton onClick={openCreate} disabled={isFormOpen}>
          <FiPlus />
          Add new section
        </S.AddButton>
      </S.ActionsRow>

      {/* ── Form panel ──────────────────────────────────────────────────
           Mobile  → fixed bottom sheet, slides up/down
           Desktop → inline card rendered above the section list         */}
      {isFormOpen && (
        <>
          <S.SheetOverlay $closing={isClosing} onClick={closeForm} />
          <S.SheetPanel $closing={isClosing}>
            <S.SheetHandle />
            <MuseAboutSectionForm
              key={formKey}
              museId={id}
              section={
                activeForm?.mode === "edit" ? activeForm.section : undefined
              }
              sectionCount={sectionCount}
              onSave={handleSaved}
              onCancel={closeForm}
            />
          </S.SheetPanel>
        </>
      )}

      {/* ── Sections list ───────────────────────────────────────── */}
      {aboutSections !== null && aboutSections.length === 0 ? (
        <S.EmptyState>
          <MdAutoStories />
          <h3>No story sections yet</h3>
          <p>
            Add your first section to start building your character&apos;s
            story.
          </p>
        </S.EmptyState>
      ) : (
        <S.ListContainer>
          {aboutSections?.map((section, index) => {
            const dropdownItems = [
              {
                icon: <FaRegEdit />,
                label: "Edit section",
                onClick: () => openEdit(section),
              },
              { separator: true },
              {
                icon: <FaRegTrashCan />,
                label: "Delete this section",
                onClick: () => {
                  setSelectedSectionId(section.id);
                  setShowDeleteAlert(true);
                },
                variant: "danger" as const,
              },
            ];

            return (
              <S.SectionCard key={section.id}>
                <S.SectionCardHeader>
                  <S.SectionOrdinal>Section {index + 1}</S.SectionOrdinal>
                  <AppDropdownMenu
                    trigger={<BsThreeDots size={16} />}
                    items={dropdownItems}
                  />
                </S.SectionCardHeader>
                <S.SectionCardBody>
                  {section.image && (
                    <AppImageViewer
                      src={section.image}
                      alt="Section attachment"
                    >
                      <S.SectionImage
                        src={section.image}
                        alt="Section attachment"
                      />
                    </AppImageViewer>
                  )}
                  <RichTextRenderer
                    savedText={section.text || ""}
                    overlayHidden
                  />
                </S.SectionCardBody>
              </S.SectionCard>
            );
          })}
        </S.ListContainer>
      )}

      <AppAlertDialog
        heading="Delete this section?"
        text="Deleting the section will remove all of its content. Are you sure you want to delete this section?"
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDeleteSection}
        actionButtonLabel="Delete"
      />
    </S.Container>
  );
}
