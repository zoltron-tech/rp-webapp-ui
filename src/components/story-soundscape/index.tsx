"use client";

import type { SoundCue } from "@nw/types";
import type { Song } from "@nw/types/music";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { LuRepeat } from "react-icons/lu";
import { getOwnMusicAction } from "@/app/rp/profile/[slug]/music/action";
import {
  deleteSoundCueAction,
  saveSoundCueAction,
} from "@/app/rp/story/actions";
import { useUIContext } from "@/hooks";
import { useTrackDrag } from "@/lib/track-drag";
import { API_MESSAGE } from "@/utils/constants";
import { CueSheet } from "./cue-sheet";
import * as S from "./styles";

/** A cue always covers at least one whole passage. */
const MIN_SPAN = 1;
/** New cues start on the passage the reader is looking at. */
const DEFAULT_SPAN = 2;

type Props = {
  storyboardEventId: string;
  cues: SoundCue[];
  passageCount: number;
  /** The passage the reader is on, drawn as the board's playhead. */
  currentPassage: number;
  canEdit: boolean;
  /** Called with the server's answer after any cue write. */
  onCuesChanged: (cues: SoundCue[]) => void;
};

/**
 * The cue lane board for one chapter.
 *
 * The ruler is the chapter's passages (P1…Pn) — a cue is a range over them,
 * not a range over time, so bars snap to whole passages. Dragging uses the
 * same `track-drag` engine as the story timeline.
 */
export const StorySoundscapeBoard: FC<Props> = ({
  storyboardEventId,
  cues,
  passageCount,
  currentPassage,
  canEdit,
  onCuesChanged,
}) => {
  const { errorToast } = useUIContext();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; cue: SoundCue | null }>({
    cue: null,
    open: false,
  });

  const trackRef = useRef<HTMLDivElement>(null);

  // The author's library is only needed once the editor is actually opened.
  useEffect(() => {
    if (!canEdit || songs.length > 0 || loadingSongs) return;
    setLoadingSongs(true);
    getOwnMusicAction().then((result) => {
      setLoadingSongs(false);
      if (!result || "message" in result) return;
      setSongs(result);
    });
  }, [canEdit, songs.length, loadingSongs]);

  const lastPassage = Math.max(0, passageCount - 1);

  // ── Saving ───────────────────────────────────────────────────────────────

  const commitCue = useCallback(
    async (cue: SoundCue) => {
      const previous = cues;
      // Optimistic for an existing cue; a new one waits for its server id.
      if (cue.id) {
        onCuesChanged(
          cues.map((candidate) => (candidate.id === cue.id ? cue : candidate)),
        );
      }

      const saved = await saveSoundCueAction(storyboardEventId, cue);
      if (!saved || "message" in saved) {
        onCuesChanged(previous);
        errorToast("Could not save that cue. Please try again.");
        return;
      }

      const exists = previous.some((candidate) => candidate.id === saved.id);
      onCuesChanged(
        exists
          ? previous.map((candidate) =>
              candidate.id === saved.id ? saved : candidate,
            )
          : [...previous, saved],
      );
    },
    [cues, storyboardEventId, onCuesChanged, errorToast],
  );

  const handleDelete = async (cue: SoundCue) => {
    if (!cue.id) return;
    const result = await deleteSoundCueAction(cue.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that cue. Please try again.");
      return;
    }
    onCuesChanged(cues.filter((candidate) => candidate.id !== cue.id));
    setSheet({ cue: null, open: false });
  };

  // ── Dragging ─────────────────────────────────────────────────────────────

  const getGeometry = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    return {
      // The axis is passage positions. Ranges are inclusive, so the axis runs
      // to `passageCount` — a bar covering the last passage ends at its right
      // edge, not at its left.
      axisMax: Math.max(1, passageCount),
      axisMin: 0,
      left: rect.left,
      width: rect.width,
    };
  }, [passageCount]);

  const { drag, begin } = useTrackDrag<SoundCue>({
    getGeometry,
    minSpan: MIN_SPAN,
    onCommit: (state) => {
      // Bars snap to whole passages — a cue that starts halfway through one
      // has no meaning.
      const start = Math.round(state.start);
      const end = Math.round(state.end) - 1;
      commitCue({
        ...state.item,
        endThreadOrdinal: Math.min(lastPassage, Math.max(start, end)),
        startThreadOrdinal: Math.max(0, Math.min(start, end)),
      });
    },
  });

  /** The bar being dragged reads from the live drag, not from state. */
  const liveSpan = (cue: SoundCue) => {
    if (drag && drag.item.id === cue.id) {
      return { end: drag.end, start: drag.start };
    }
    // Inclusive range → an exclusive right edge for rendering.
    return { end: cue.endThreadOrdinal + 1, start: cue.startThreadOrdinal };
  };

  const toPercent = (value: number) =>
    (value / Math.max(1, passageCount)) * 100;

  const addCue = () => {
    if (!canEdit) return;
    setSheet({ cue: null, open: true });
  };

  if (passageCount === 0) {
    return (
      <S.Root>
        <S.HeaderRow>
          <S.Title>Soundscape</S.Title>
        </S.HeaderRow>
        <S.EmptyBoard>
          Cues are mounted to passages, so this chapter needs some prose first.
        </S.EmptyBoard>
      </S.Root>
    );
  }

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Soundscape</S.Title>
        <S.Spacer />
        {canEdit && (
          <S.ToolButton type="button" $primary onClick={addCue}>
            <IoMdAdd size={16} />
            New cue
          </S.ToolButton>
        )}
      </S.HeaderRow>

      <S.Hint>
        A cue plays across a stretch of passages, fading in as the reader
        arrives and out as they leave. Drag a bar to move it, drag its edges to
        cover more passages.
      </S.Hint>

      <S.Board>
        <S.Gutter>
          <S.GutterHead />
          {cues.map((cue) => (
            <S.GutterRow key={cue.id} $color={cue.color}>
              <S.GutterName title={cue.name}>{cue.name}</S.GutterName>
              {canEdit && (
                <S.GutterAction
                  type="button"
                  aria-label={`Edit ${cue.name}`}
                  title="Edit cue"
                  onClick={() => setSheet({ cue, open: true })}
                >
                  <GrEdit size={12} />
                </S.GutterAction>
              )}
            </S.GutterRow>
          ))}
        </S.Gutter>

        <S.Scroller>
          <S.Track ref={trackRef}>
            <S.Ruler>
              {Array.from({ length: passageCount }, (_, index) => (
                <S.RulerCell
                  key={index}
                  $current={index === currentPassage}
                  title={`Passage ${index + 1}`}
                >
                  P{index + 1}
                </S.RulerCell>
              ))}
            </S.Ruler>

            {/* Where the reader is now. */}
            <S.Playhead
              style={{
                left: `${toPercent(currentPassage)}%`,
                width: `${toPercent(1)}%`,
              }}
            />

            {cues.length === 0 ? (
              <S.EmptyBoard>
                {canEdit
                  ? "No cues yet. Add one and drag it over the passages it should play across."
                  : "This chapter has no soundscape yet."}
              </S.EmptyBoard>
            ) : (
              cues.map((cue) => {
                const span = liveSpan(cue);
                const dragging = drag?.item.id === cue.id;
                const live =
                  currentPassage >= cue.startThreadOrdinal &&
                  currentPassage <= cue.endThreadOrdinal;
                return (
                  <S.CueRow key={cue.id} data-cue-name={cue.name}>
                    <S.Bar
                      $color={cue.color}
                      $dragging={dragging}
                      $editable={canEdit}
                      $live={live}
                      style={{
                        left: `${toPercent(span.start)}%`,
                        width: `${toPercent(span.end) - toPercent(span.start)}%`,
                      }}
                      title={`${cue.name} — P${cue.startThreadOrdinal + 1}–P${cue.endThreadOrdinal + 1}`}
                      onPointerDown={(e) => {
                        if (!canEdit) return;
                        begin(e, cue, "move", {
                          end: span.end,
                          start: span.start,
                        });
                      }}
                      onClick={() => {
                        if (!dragging) setSheet({ cue, open: true });
                      }}
                    >
                      {canEdit && (
                        <S.BarHandle
                          $side="start"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            begin(e, cue, "resize-start", {
                              end: span.end,
                              start: span.start,
                            });
                          }}
                        />
                      )}
                      <S.BarLabel>{cue.name}</S.BarLabel>
                      {cue.isLoop && (
                        <LuRepeat size={11} style={{ flexShrink: 0 }} />
                      )}
                      {canEdit && (
                        <S.BarHandle
                          $side="end"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            begin(e, cue, "resize-end", {
                              end: span.end,
                              start: span.start,
                            });
                          }}
                        />
                      )}
                    </S.Bar>
                  </S.CueRow>
                );
              })
            )}
          </S.Track>
        </S.Scroller>
      </S.Board>

      <CueSheet
        open={sheet.open}
        cue={sheet.cue}
        defaultRange={{
          end: Math.min(lastPassage, currentPassage + DEFAULT_SPAN - 1),
          start: currentPassage,
        }}
        songs={songs}
        loadingSongs={loadingSongs}
        passageCount={passageCount}
        canEdit={canEdit}
        onClose={() => setSheet({ cue: null, open: false })}
        onSave={(cue) => {
          commitCue(cue);
          setSheet({ cue: null, open: false });
        }}
        onDelete={handleDelete}
      />
    </S.Root>
  );
};
