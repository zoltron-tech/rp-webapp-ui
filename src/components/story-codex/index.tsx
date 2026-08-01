"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { LuNetwork, LuSettings2, LuUsers } from "react-icons/lu";
import {
  deleteCodexCategoryAction,
  deleteCodexEntryAction,
  deleteCodexRelationshipAction,
  getStoryCodexAction,
  reorderCodexCategoriesAction,
  saveCodexCategoryAction,
  saveCodexEntryAction,
  saveCodexRelationshipAction,
} from "@/app/rp/story/actions";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type {
  CodexCategory,
  CodexEntry,
  CodexRelationship,
  StoryBoardEvent,
  StoryCastMember,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { CategoryManager } from "./category-manager";
import { CategorySheet } from "./category-sheet";
import { EntryReader } from "./entry-reader";
import { EntrySheet } from "./entry-sheet";
import { resolveCodexIcon } from "./icons";
import { RelationshipsSection } from "./relationships";
import * as S from "./styles";

/** The Characters tab is the story's derived cast, not a codex category. */
const CAST_TAB = "cast";
/** The Relationships tab draws the cast's mesh, also not a category. */
const MESH_TAB = "mesh";

type Props = {
  storyboardId: string;
  /** The story's chapters, for entry links and the "used in" chips. */
  chapters: StoryBoardEvent[];
  /** The derived cast (muses with dialog in this story) — read-only here. */
  cast: StoryCastMember[];
  /** Members write the codex; everyone else reads it. */
  canEdit: boolean;
};

/**
 * What the card shows of a rich-text description: its prose, stripped of
 * markup, and its first embedded image — an entry whose description is a
 * picture or a GIF still gets a thumbnail rather than a bare name.
 */
const summarise = (html: string | null | undefined) => {
  if (!html || typeof document === "undefined") {
    return { image: null as string | null, text: "" };
  }
  const scratch = document.createElement("div");
  scratch.innerHTML = html;
  return {
    image: scratch.querySelector("img")?.getAttribute("src") ?? null,
    text: (scratch.textContent ?? "").trim(),
  };
};

/**
 * The codex: a story's world bible — places, items, lore, and any categories
 * its authors invent.
 *
 * Characters are deliberately not editable here. They are the story's derived
 * cast, materialised from the muses actually speaking in its threads, so this
 * view renders them read-only and points at the existing muse flows.
 */
export const StoryCodexView: FC<Props> = ({
  storyboardId,
  chapters,
  cast,
  canEdit,
}) => {
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const [categories, setCategories] = useState<CodexCategory[]>([]);
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [relationships, setRelationships] = useState<CodexRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(CAST_TAB);

  const [entrySheet, setEntrySheet] = useState<{
    open: boolean;
    entry: CodexEntry | null;
  }>({ entry: null, open: false });
  const [categorySheet, setCategorySheet] = useState<{
    open: boolean;
    category: CodexCategory | null;
  }>({ category: null, open: false });
  const [managerOpen, setManagerOpen] = useState(false);
  /** The entry being read. The card only shows a clamped preview. */
  const [readerEntry, setReaderEntry] = useState<CodexEntry | null>(null);

  const tabRowRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  /** Whether the tab row still has tabs to the right of what's shown. */
  const [tabsOverflow, setTabsOverflow] = useState(false);

  const load = useCallback(async () => {
    const result = await getStoryCodexAction(storyboardId);
    setLoading(false);
    if (!result || "message" in result) return;
    setCategories(result.categories);
    setEntries(result.entries);
    setRelationships(result.relationships ?? []);
  }, [storyboardId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Whether the opening tab has been chosen — see the effect below. */
  const pickedOpeningTab = useRef(false);

  // Open on the first real category once the lazily-seeded ones arrive, so the
  // view doesn't sit on an empty Characters tab for a story with no cast yet.
  // Once only: re-running would bounce a reader straight back out of the
  // Characters tab every time they chose it on a story with no cast.
  useEffect(() => {
    if (pickedOpeningTab.current || activeTab !== CAST_TAB) return;
    if (cast.length > 0) {
      pickedOpeningTab.current = true;
      return;
    }
    const first = categories[0]?.id;
    if (!first) return;
    pickedOpeningTab.current = true;
    setActiveTab(first);
  }, [categories, cast.length, activeTab]);

  // Keep the selected tab in view: the row scrolls sideways on a phone, and a
  // tab can also be selected by saving an entry into another category.
  useEffect(() => {
    const row = tabRowRef.current;
    const tab = activeTabRef.current;
    if (!row || !tab) return;
    row.scrollTo({
      behavior: "smooth",
      left: Math.max(
        0,
        tab.offsetLeft - (row.clientWidth - tab.clientWidth) / 2,
      ),
    });
  }, [activeTab]);

  // The edge fade is a promise that there is more to reach — so it tracks the
  // real scroll state rather than sitting over a row that already fits.
  useEffect(() => {
    const row = tabRowRef.current;
    if (!row) return;
    const measure = () =>
      setTabsOverflow(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    row.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", measure);
    };
  }, [categories.length]);

  const entriesByCategory = useMemo(() => {
    const map = new Map<string, CodexEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.categoryId) ?? [];
      list.push(entry);
      map.set(entry.categoryId, list);
    }
    return map;
  }, [entries]);

  const entryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [categoryId, list] of entriesByCategory) {
      counts[categoryId] = list.length;
    }
    return counts;
  }, [entriesByCategory]);

  const chaptersById = useMemo(() => {
    const map = new Map<string, StoryBoardEvent>();
    for (const chapter of chapters) {
      if (chapter.id) map.set(chapter.id, chapter);
    }
    return map;
  }, [chapters]);

  const activeCategory =
    activeTab === CAST_TAB || activeTab === MESH_TAB
      ? null
      : (categories.find((category) => category.id === activeTab) ?? null);
  const visibleEntries = activeCategory?.id
    ? (entriesByCategory.get(activeCategory.id) ?? [])
    : [];

  // ── Entries ──────────────────────────────────────────────────────────────

  const handleSaveEntry = async (entry: CodexEntry) => {
    const saved = await saveCodexEntryAction(storyboardId, entry);
    if (!saved || "message" in saved) {
      errorToast("Could not save that entry. Please try again.");
      return;
    }
    setEntries((current) => {
      const exists = current.some((candidate) => candidate.id === saved.id);
      return exists
        ? current.map((candidate) =>
            candidate.id === saved.id ? saved : candidate,
          )
        : [...current, saved];
    });
    setEntrySheet({ entry: null, open: false });
    // Follow the entry if it was filed under a different category.
    setActiveTab(saved.categoryId);
  };

  const handleDeleteEntry = async (entry: CodexEntry) => {
    if (!entry.id) return;
    const result = await deleteCodexEntryAction(entry.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that entry. Please try again.");
      return;
    }
    setEntries((current) =>
      current.filter((candidate) => candidate.id !== entry.id),
    );
    setEntrySheet({ entry: null, open: false });
  };

  // ── Relationships ────────────────────────────────────────────────────────

  const handleSaveRelationship = async (relationship: CodexRelationship) => {
    const saved = await saveCodexRelationshipAction(storyboardId, relationship);
    if (!saved || "message" in saved) {
      errorToast("Could not save that relationship. Please try again.");
      return;
    }
    setRelationships((current) => {
      const exists = current.some((candidate) => candidate.id === saved.id);
      return exists
        ? current.map((candidate) =>
            candidate.id === saved.id ? saved : candidate,
          )
        : [...current, saved];
    });
  };

  const handleDeleteRelationship = async (relationship: CodexRelationship) => {
    if (!relationship.id) return;
    const result = await deleteCodexRelationshipAction(relationship.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that relationship. Please try again.");
      return;
    }
    setRelationships((current) =>
      current.filter((candidate) => candidate.id !== relationship.id),
    );
  };

  // ── Categories ───────────────────────────────────────────────────────────

  const handleSaveCategory = async (category: CodexCategory) => {
    const saved = await saveCodexCategoryAction(storyboardId, category);
    if (!saved || "message" in saved) {
      errorToast("Could not save that category. Please try again.");
      return;
    }
    setCategories((current) => {
      const exists = current.some((candidate) => candidate.id === saved.id);
      return exists
        ? current.map((candidate) =>
            candidate.id === saved.id ? saved : candidate,
          )
        : [...current, saved];
    });
    setCategorySheet({ category: null, open: false });
    if (saved.id) setActiveTab(saved.id);
  };

  const handleDeleteCategory = async (category: CodexCategory) => {
    if (!category.id) return;
    const result = await deleteCodexCategoryAction(category.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast(
        "Could not delete that category. Move its entries out of it first.",
      );
      return;
    }
    setCategories((current) =>
      current.filter((candidate) => candidate.id !== category.id),
    );
    setCategorySheet({ category: null, open: false });
    if (activeTab === category.id) setActiveTab(CAST_TAB);
    successToast("Category removed.");
  };

  const handleReorderCategories = async (orderedCategoryIds: string[]) => {
    const previous = categories;
    // Restage locally so the tabs move the instant the sheet closes.
    const byId = new Map(previous.map((category) => [category.id, category]));
    setCategories(
      orderedCategoryIds
        .map((id) => byId.get(id))
        .filter((category): category is CodexCategory => Boolean(category)),
    );
    setManagerOpen(false);

    const result = await reorderCodexCategoriesAction(
      storyboardId,
      orderedCategoryIds,
    );
    if (!result || "message" in result) {
      setCategories(previous);
      errorToast("Could not reorder the categories. Please try again.");
      return;
    }
    setCategories(result);
  };

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Codex</S.Title>
        <S.Spacer />
        {canEdit && (
          <>
            <S.ToolButton
              type="button"
              onClick={() => setManagerOpen(true)}
              title="Reorder and rename categories"
            >
              <LuSettings2 size={14} />
              Categories
            </S.ToolButton>
            <S.ToolButton
              type="button"
              $primary
              disabled={categories.length === 0}
              title={
                categories.length === 0
                  ? "Add a category first — every entry is filed under one"
                  : "Add a codex entry"
              }
              onClick={() => setEntrySheet({ entry: null, open: true })}
            >
              <IoMdAdd size={16} />
              New entry
            </S.ToolButton>
          </>
        )}
      </S.HeaderRow>

      <S.TabScroller $fade={tabsOverflow}>
        <S.TabRow ref={tabRowRef} role="tablist" aria-label="Codex categories">
          <S.Tab
            ref={activeTab === CAST_TAB ? activeTabRef : undefined}
            type="button"
            role="tab"
            aria-selected={activeTab === CAST_TAB}
            $active={activeTab === CAST_TAB}
            onClick={() => setActiveTab(CAST_TAB)}
          >
            <LuUsers size={14} />
            Characters
            <span className="count">{cast.length}</span>
          </S.Tab>
          <S.Tab
            ref={activeTab === MESH_TAB ? activeTabRef : undefined}
            type="button"
            role="tab"
            aria-selected={activeTab === MESH_TAB}
            $active={activeTab === MESH_TAB}
            title="How the cast stand toward each other"
            onClick={() => setActiveTab(MESH_TAB)}
          >
            <LuNetwork size={14} />
            Relationships
            <span className="count">{relationships.length}</span>
          </S.Tab>
          {categories.map((category) => {
            const Icon = resolveCodexIcon(category.icon);
            const count = category.id
              ? (entriesByCategory.get(category.id)?.length ?? 0)
              : 0;
            return (
              <S.Tab
                key={category.id}
                ref={activeTab === category.id ? activeTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={activeTab === category.id}
                $active={activeTab === category.id}
                onClick={() => setActiveTab(category.id ?? CAST_TAB)}
              >
                <Icon size={14} />
                {category.name}
                <span className="count">{count}</span>
              </S.Tab>
            );
          })}
          {canEdit && (
            <S.Tab
              type="button"
              title="Add a category"
              aria-label="Add a category"
              onClick={() => setCategorySheet({ category: null, open: true })}
            >
              <IoMdAdd size={15} />
            </S.Tab>
          )}
        </S.TabRow>
      </S.TabScroller>

      {activeTab === MESH_TAB ? (
        <RelationshipsSection
          cast={cast}
          relationships={relationships}
          canEdit={canEdit}
          onSave={handleSaveRelationship}
          onDelete={handleDeleteRelationship}
        />
      ) : activeTab === CAST_TAB ? (
        // The derived cast: every muse with dialog somewhere in this story.
        // Read-only — the muse system owns these.
        cast.length === 0 ? (
          <S.Empty>
            No characters yet. A muse joins the cast as soon as one of its
            dialogs appears in a passage.
          </S.Empty>
        ) : (
          <>
            <S.CastRow>
              {cast.map((member) => {
                const avatarSrc = member.image || museAvatarUrl(member.id);
                return (
                  <S.CastChip
                    key={member.id}
                    type="button"
                    title={`Open ${member.name}`}
                    onClick={() => routeToPage(ROUTES.Muse.View(member.id))}
                  >
                    {avatarSrc ? (
                      <S.CastAvatar src={avatarSrc} alt="" />
                    ) : (
                      <S.CastAvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </S.CastAvatarFallback>
                    )}
                    {member.name}
                  </S.CastChip>
                );
              })}
            </S.CastRow>
            <S.Note>
              Characters are your muses — they join this cast automatically when
              they speak in a passage. Edit them from their own pages.
            </S.Note>
          </>
        )
      ) : loading ? (
        <S.Grid aria-busy="true" aria-label="Loading the codex">
          <S.Skeleton />
          <S.Skeleton />
          <S.Skeleton />
        </S.Grid>
      ) : visibleEntries.length === 0 ? (
        <S.Empty>
          Nothing in {activeCategory?.name ?? "this category"} yet.
          {canEdit && (
            <S.ToolButton
              type="button"
              $primary
              onClick={() => setEntrySheet({ entry: null, open: true })}
            >
              <IoMdAdd size={16} />
              Add the first entry
            </S.ToolButton>
          )}
        </S.Empty>
      ) : (
        <S.Grid>
          {visibleEntries.map((entry) => {
            const Icon = resolveCodexIcon(entry.icon);
            const { image: embedded, text: preview } = summarise(
              entry.description,
            );
            const thumb = entry.image || embedded;
            return (
              <S.Card key={entry.id} $color={entry.color}>
                {canEdit && (
                  <S.CardAction
                    type="button"
                    aria-label={`Edit ${entry.name}`}
                    title="Edit entry"
                    onClick={() => setEntrySheet({ entry, open: true })}
                  >
                    <GrEdit size={13} />
                  </S.CardAction>
                )}

                <S.CardOpen
                  type="button"
                  aria-label={`Read ${entry.name}`}
                  onClick={() => setReaderEntry(entry)}
                >
                  <S.CardHead>
                    {thumb ? (
                      <S.CardThumb src={thumb} alt="" />
                    ) : (
                      <S.CardIcon $color={entry.color}>
                        <Icon size={16} />
                      </S.CardIcon>
                    )}
                    <S.CardName title={entry.name}>{entry.name}</S.CardName>
                    {/* Room for the edit action floating above. */}
                    {canEdit && <span style={{ width: 28 }} />}
                  </S.CardHead>

                  {preview.length > 0 && <S.CardBody>{preview}</S.CardBody>}
                </S.CardOpen>

                {entry.chapterIds.length > 0 && (
                  <S.ChapterRow>
                    Used in
                    {entry.chapterIds.map((chapterId) => {
                      const chapter = chaptersById.get(chapterId);
                      if (!chapter) return null;
                      return (
                        <S.ChapterChip
                          key={chapterId}
                          type="button"
                          title={`Open ${chapter.name}`}
                          onClick={() =>
                            routeToPage(ROUTES.Story.Event.View(chapterId))
                          }
                        >
                          {chapter.name}
                        </S.ChapterChip>
                      );
                    })}
                  </S.ChapterRow>
                )}
              </S.Card>
            );
          })}
        </S.Grid>
      )}

      <EntryReader
        open={readerEntry !== null}
        entry={readerEntry}
        category={
          categories.find(
            (category) => category.id === readerEntry?.categoryId,
          ) ?? null
        }
        chapters={(readerEntry?.chapterIds ?? [])
          .map((chapterId) => chaptersById.get(chapterId))
          .filter((chapter): chapter is StoryBoardEvent => Boolean(chapter))}
        canEdit={canEdit}
        onClose={() => setReaderEntry(null)}
        onEdit={(entry) => {
          setReaderEntry(null);
          setEntrySheet({ entry, open: true });
        }}
        onOpenChapter={(chapterId) => {
          setReaderEntry(null);
          routeToPage(ROUTES.Story.Event.View(chapterId));
        }}
      />

      <EntrySheet
        open={entrySheet.open}
        entry={entrySheet.entry}
        defaultCategoryId={activeCategory?.id ?? categories[0]?.id ?? null}
        categories={categories}
        chapters={chapters}
        onClose={() => setEntrySheet({ entry: null, open: false })}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />

      <CategorySheet
        open={categorySheet.open}
        category={categorySheet.category}
        entryCount={
          categorySheet.category?.id
            ? (entryCounts[categorySheet.category.id] ?? 0)
            : 0
        }
        onClose={() => setCategorySheet({ category: null, open: false })}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <CategoryManager
        open={managerOpen}
        categories={categories}
        entryCounts={entryCounts}
        onClose={() => setManagerOpen(false)}
        onReorder={handleReorderCategories}
        onEditCategory={(category) => {
          setManagerOpen(false);
          setCategorySheet({ category, open: true });
        }}
      />
    </S.Root>
  );
};
