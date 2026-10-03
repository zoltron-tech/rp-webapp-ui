"use client";

import type { Codex, StoryBoard } from "@nw/types";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LuCircleHelp } from "react-icons/lu";
import { StoryCodexView } from "@/components/story-codex";
import { StoryMapView } from "@/components/story-map";
import { StoryNotesView } from "@/components/story-notes";
import { StorySoundscapeView } from "@/components/story-soundscape/workspace-view";
import { StoryTimelineView } from "@/components/story-timeline";
import { UserGuideDialog, useUserGuide } from "@/components/user-guide-dialog";
import { STORYBOARD_GUIDE } from "@/components/user-guide-dialog/guides/storyboard";
import * as S from "./styles";
import { useSetSearchParams } from "@/lib/navigation";
import {
  isWorkspaceView,
  MEMBERS_ONLY_VIEWS,
  VIEW_META,
  WORKSPACE_VIEWS,
  type WorkspaceView,
} from "./views";

type Props = {
  storyboardId: string;
  story: StoryBoard | null;
  /** Members edit everything; everyone else gets the same views, read-only. */
  canEdit: boolean;
  /** The Chapters view — it stays on the page so it can keep its own
   *  chapter-editor overlays and limit checks. */
  chaptersView: ReactNode;
  /** Promo/demo only — hands the Codex view its data instead of fetching it.
   *  See `StoryCodexView`'s `seed`. */
  codexSeed?: Codex | null;
};

/**
 * The storyboard workspace.
 *
 * Desktop is the mock's frame: an icon rail and the canvas. Mobile drops the
 * rail for a full-bleed canvas and a bottom tab bar.
 *
 * The views are client-side tabs over one story fetch, not routes — switching
 * never reloads the page. Each view mounts on its first activation and then
 * stays mounted (hidden), so its own fetch happens once and coming back to it
 * is instant. The active view is mirrored into `?view=` so a view is linkable.
 */
export const StoryboardWorkspace: FC<Props> = ({
  storyboardId,
  story,
  canEdit,
  chaptersView,
  codexSeed = null,
}) => {
  const setSearchParams = useSetSearchParams();
  const [view, setView] = useState<WorkspaceView>("chapters");
  /** Views opened so far — they stay mounted once activated. */
  const [opened, setOpened] = useState<WorkspaceView[]>(["chapters"]);
  /** The chapter the Sound view is editing. */
  const [soundChapterId, setSoundChapterId] = useState<string | null>(null);
  /** The "About storyboards" walkthrough — offered unprompted the first time
   *  this novelist opens a storyboard, whether or not they write in it, and
   *  reachable from the Guide button after that. */
  const guide = useUserGuide(STORYBOARD_GUIDE.id, { auto: true });

  const chapters = useMemo(() => story?.events ?? [], [story?.events]);

  // The URL is the source of truth on first paint.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("view");
    if (!isWorkspaceView(initial) || initial === "chapters") return;
    setView(initial);
    setOpened((current) =>
      current.includes(initial) ? current : [...current, initial],
    );
  }, []);

  /** Notes and Sound are members-only. Everything else a public story shows
   *  read-only. */
  const views = useMemo(
    () =>
      canEdit
        ? WORKSPACE_VIEWS
        : WORKSPACE_VIEWS.filter(
            (candidate) => !MEMBERS_ONLY_VIEWS.includes(candidate),
          ),
    [canEdit],
  );

  // A ?view=notes link from a non-member lands on Chapters instead. Waits for
  // the story, since canEdit is false until it has loaded and the membership
  // check can run.
  useEffect(() => {
    if (!story || canEdit || !MEMBERS_ONLY_VIEWS.includes(view)) return;
    setView("chapters");
  }, [story, canEdit, view]);

  // Default the Sound view to the first chapter, once one exists.
  useEffect(() => {
    if (soundChapterId) return;
    const first = chapters[0]?.id;
    if (first) setSoundChapterId(first);
  }, [chapters, soundChapterId]);

  const switchView = useCallback((next: WorkspaceView) => {
    setView(next);
    setOpened((current) =>
      current.includes(next) ? current : [...current, next],
    );
    // Best effort — some in-app browsers restrict history writes, and that is
    // not worth losing the view switch over.
    setSearchParams((params) => {
      if (next === "chapters") params.delete("view");
      else params.set("view", next);
    });
  }, [setSearchParams]);

  /**
   * Mobile only — the tab bar is pinned to the foot of the page, so a tap
   * should carry the reader down to what it opened rather than leave them
   * wherever they were scrolled. The view mounts on this same switch, so its
   * height only exists after the next paint; two frames covers layout.
   */
  const scrollToBottom = useCallback(() => {
    // The document scrolls, not main.page-container (see rp/styles.ts).
    const scroller = document.scrollingElement;
    if (!scroller) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTo({ behavior: "smooth", top: scroller.scrollHeight });
      });
    });
  }, []);

  const isOpen = (candidate: WorkspaceView) => opened.includes(candidate);

  return (
    <>
      {/* The workspace is several screens deep and none of it is signposted on
          the page itself — so the walkthrough sits above it, on every device. */}
      <S.UtilityRow>
        <S.GuideButton
          type="button"
          title="A walkthrough of the storyboard workspace"
          onClick={guide.start}
        >
          <LuCircleHelp size={15} />
          Guide
        </S.GuideButton>
      </S.UtilityRow>

      <S.Frame>
        <S.Rail aria-label="Storyboard views">
          {views.map((candidate) => {
            const meta = VIEW_META[candidate];
            const Icon = meta.icon;
            return (
              <S.RailButton
                key={candidate}
                type="button"
                $active={view === candidate}
                aria-current={view === candidate ? "page" : undefined}
                title={meta.description}
                onClick={() => switchView(candidate)}
              >
                <Icon size={18} />
                {meta.label}
              </S.RailButton>
            );
          })}
        </S.Rail>

        <S.Canvas>
          <S.ViewSlot $active={view === "chapters"}>{chaptersView}</S.ViewSlot>

          {isOpen("timeline") && (
            <S.ViewSlot $active={view === "timeline"}>
              <StoryTimelineView
                storyboardId={storyboardId}
                canEdit={canEdit}
              />
            </S.ViewSlot>
          )}

          {isOpen("codex") && (
            <S.ViewSlot $active={view === "codex"}>
              <StoryCodexView
                storyboardId={storyboardId}
                chapters={chapters}
                cast={story?.cast ?? []}
                canEdit={canEdit}
                seed={codexSeed}
              />
            </S.ViewSlot>
          )}

          {isOpen("map") && (
            <S.ViewSlot $active={view === "map"}>
              <StoryMapView
                storyboardId={storyboardId}
                chapters={chapters}
                canEdit={canEdit}
              />
            </S.ViewSlot>
          )}

          {canEdit && isOpen("notes") && (
            <S.ViewSlot $active={view === "notes"}>
              <StoryNotesView storyboardId={storyboardId} canEdit={canEdit} />
            </S.ViewSlot>
          )}

          {canEdit && isOpen("sound") && (
            <S.ViewSlot $active={view === "sound"}>
              <StorySoundscapeView
                chapters={chapters}
                selectedChapterId={soundChapterId}
                onSelectChapter={setSoundChapterId}
                canEdit={canEdit}
              />
            </S.ViewSlot>
          )}
        </S.Canvas>
      </S.Frame>

      {/* Mobile: the rail becomes a bottom tab bar. */}
      <S.TabBar aria-label="Storyboard views">
        {views.map((candidate) => {
          const meta = VIEW_META[candidate];
          const Icon = meta.icon;
          return (
            <S.TabButton
              key={candidate}
              type="button"
              $active={view === candidate}
              aria-current={view === candidate ? "page" : undefined}
              aria-label={meta.description}
              onClick={() => {
                switchView(candidate);
                scrollToBottom();
              }}
            >
              <Icon size={19} />
              <span>{meta.label}</span>
            </S.TabButton>
          );
        })}
      </S.TabBar>

      <UserGuideDialog
        guide={STORYBOARD_GUIDE}
        open={guide.open}
        onClose={guide.close}
        onFinish={guide.markSeen}
        onSkip={guide.dismiss}
      />
    </>
  );
};

export type { WorkspaceView } from "./views";
export { VIEW_META, WORKSPACE_VIEWS } from "./views";
