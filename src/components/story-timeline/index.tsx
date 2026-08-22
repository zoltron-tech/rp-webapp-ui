"use client";

import type {
  StoryBoardEvent,
  StoryTimelineLane,
  StoryTimelineMarker,
} from "@nw/types";
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
import { LuHistory, LuMapPin } from "react-icons/lu";
import {
  deleteStoryTimelineLaneAction,
  deleteStoryTimelineMarkerAction,
  getStoryTimelineAction,
  saveStoryboardEventTimelineAction,
  saveStoryTimelineLaneAction,
  saveStoryTimelineMarkerAction,
} from "@/app/rp/story/actions";
import { toShortStoryDate } from "@/components/date-time-picker/date-format";
import { useUIContext } from "@/hooks";
import { useTrackDrag } from "@/lib/track-drag";
import { API_MESSAGE } from "@/utils/constants";
import { type BlockPlacement, BlockSheet } from "./block-sheet";
import { LaneSheet } from "./lane-sheet";
import { MarkerSheet } from "./marker-sheet";
import * as S from "./styles";

/** The abstract story-time axis. Positions only mean something relative to
 *  the markers the authors name on it. */
const AXIS_MIN = 0;
const AXIS_MAX = 100;
/** How close (in axis units) a dragged edge has to get to snap to a marker. */
const SNAP_THRESHOLD = 1.5;
/** Narrowest a block may be dragged, so it never collapses out of reach. */
const MIN_SPAN = 1.5;
/** Span given to a chapter placed from the unplaced shelf. */
const DEFAULT_SPAN = 8;

type Props = {
  storyboardId: string;
  /** Members edit the timeline; everyone else gets a read-only board. */
  canEdit: boolean;
};

type Placed = {
  event: StoryBoardEvent;
  start: number;
  end: number;
  laneIndex: number;
};

const isPlaced = (event: StoryBoardEvent) =>
  event.timelineStart != null && event.timelineEnd != null;

/**
 * Timeline view: when the chapters *happen*, as opposed to the order they are
 * read in.
 *
 * Chapters keep their reading order (`ordinal`) untouched — placing a block
 * here only writes the timeline columns, through the narrow placement
 * endpoint, so a drag can never disturb a chapter's prose. Where the two
 * orders disagree the block is marked, and the detail sheet offers the
 * flashback flag.
 */
export const StoryTimelineView: FC<Props> = ({ storyboardId, canEdit }) => {
  const { successToast, errorToast } = useUIContext();

  const [events, setEvents] = useState<StoryBoardEvent[]>([]);
  const [lanes, setLanes] = useState<StoryTimelineLane[]>([]);
  const [markers, setMarkers] = useState<StoryTimelineMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const [laneSheet, setLaneSheet] = useState<{
    open: boolean;
    lane: StoryTimelineLane | null;
  }>({ lane: null, open: false });
  const [markerSheet, setMarkerSheet] = useState<{
    open: boolean;
    marker: StoryTimelineMarker | null;
  }>({ marker: null, open: false });
  const [blockSheetId, setBlockSheetId] = useState<string | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const result = await getStoryTimelineAction(storyboardId);
    setLoading(false);
    if (!result || "message" in result) return;
    setEvents(result.events);
    setLanes(result.lanes);
    setMarkers(result.markers);
  }, [storyboardId]);

  useEffect(() => {
    load();
  }, [load]);

  // Last-write-wins is fine here, so simply resync when the tab regains focus
  // — a co-author may have moved a block while it was in the background.
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const laneIndexOf = useCallback(
    (laneId: string | null | undefined) => {
      const index = lanes.findIndex((lane) => lane.id === laneId);
      return index < 0 ? 0 : index;
    },
    [lanes],
  );

  const placed: Placed[] = useMemo(
    () =>
      events.filter(isPlaced).map((event) => ({
        end: event.timelineEnd as number,
        event,
        laneIndex: laneIndexOf(event.timelineLaneId),
        start: event.timelineStart as number,
      })),
    [events, laneIndexOf],
  );

  const unplaced = useMemo(() => events.filter((e) => !isPlaced(e)), [events]);

  /** Story-time order — the second ordering this whole view exists to show. */
  const chronoPositions = useMemo(() => {
    const map = new Map<string, number>();
    [...placed]
      .sort((a, b) => a.start - b.start || a.event.ordinal - b.event.ordinal)
      .forEach((item, index) => {
        if (item.event.id) map.set(item.event.id, index + 1);
      });
    return map;
  }, [placed]);

  /** Reading order position, 1-based. */
  const readingPositions = useMemo(() => {
    const map = new Map<string, number>();
    [...events]
      .sort((a, b) => a.ordinal - b.ordinal)
      .forEach((event, index) => {
        if (event.id) map.set(event.id, index + 1);
      });
    return map;
  }, [events]);

  const snapTargets = useMemo(
    () => markers.map((marker) => marker.position),
    [markers],
  );

  // ── Saving ───────────────────────────────────────────────────────────────

  /** Optimistic placement write: patch locally, then reconcile with the server. */
  const commitPlacement = useCallback(
    async (event: StoryBoardEvent, placement: BlockPlacement | null) => {
      const eventId = event.id;
      if (!eventId) return;

      const previous = events;
      setEvents((current) =>
        current.map((candidate) =>
          candidate.id === eventId
            ? {
                ...candidate,
                isFlashback: placement?.isFlashback ?? false,
                timelineEnd: placement?.end ?? null,
                timelineLaneId: placement?.laneId ?? null,
                timelineStart: placement?.start ?? null,
              }
            : candidate,
        ),
      );

      const saved = await saveStoryboardEventTimelineAction(eventId, {
        isFlashback: placement?.isFlashback ?? false,
        laneId: placement?.laneId ?? null,
        timelineEnd: placement?.end ?? null,
        timelineStart: placement?.start ?? null,
      });

      if (!saved || "message" in saved) {
        setEvents(previous);
        errorToast("Could not move that chapter. Please try again.");
        return;
      }

      // The server clamps and normalises (flipped edges, foreign lanes), so
      // take its answer rather than trusting the optimistic patch.
      setEvents((current) =>
        current.map((candidate) =>
          candidate.id === eventId ? saved : candidate,
        ),
      );
    },
    [events, errorToast],
  );

  // ── Dragging ─────────────────────────────────────────────────────────────

  const getGeometry = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    return {
      axisMax: AXIS_MAX,
      axisMin: AXIS_MIN,
      left: rect.left,
      width: rect.width,
    };
  }, []);

  const { drag, begin } = useTrackDrag<StoryBoardEvent>({
    getGeometry,
    laneCount: lanes.length,
    laneHeight: S.LANE_HEIGHT,
    minSpan: MIN_SPAN,
    onCommit: (state) => {
      const lane = state.laneIndex !== null ? lanes[state.laneIndex] : null;
      commitPlacement(state.item, {
        end: state.end,
        isFlashback: Boolean(state.item.isFlashback),
        laneId: lane?.id ?? state.item.timelineLaneId ?? null,
        start: state.start,
      });
    },
    snapTargets,
    snapThreshold: SNAP_THRESHOLD,
  });

  // ── Lanes ────────────────────────────────────────────────────────────────

  const handleSaveLane = async (lane: StoryTimelineLane) => {
    const saved = await saveStoryTimelineLaneAction(storyboardId, lane);
    if (!saved || "message" in saved) {
      errorToast("Could not save that lane. Please try again.");
      return;
    }
    setLanes((current) => {
      const exists = current.some((candidate) => candidate.id === saved.id);
      return exists
        ? current.map((candidate) =>
            candidate.id === saved.id ? saved : candidate,
          )
        : [...current, saved];
    });
    setLaneSheet({ lane: null, open: false });
  };

  const handleDeleteLane = async (lane: StoryTimelineLane) => {
    if (!lane.id) return;
    const result = await deleteStoryTimelineLaneAction(lane.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that lane. Please try again.");
      return;
    }
    setLaneSheet({ lane: null, open: false });
    successToast("Lane removed — its chapters are back on the shelf.");
    // Chapters on the lane are unplaced server-side; refetch rather than
    // guessing at the new shape.
    load();
  };

  // ── Markers ──────────────────────────────────────────────────────────────

  const handleSaveMarker = async (marker: StoryTimelineMarker) => {
    const saved = await saveStoryTimelineMarkerAction(storyboardId, marker);
    if (!saved || "message" in saved) {
      errorToast("Could not save that marker. Please try again.");
      return;
    }
    setMarkerSheet({ marker: null, open: false });
    // Saving a marker resequences every marker's ordinal, so refetch.
    load();
  };

  const handleDeleteMarker = async (marker: StoryTimelineMarker) => {
    if (!marker.id) return;
    const result = await deleteStoryTimelineMarkerAction(marker.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that marker. Please try again.");
      return;
    }
    setMarkerSheet({ marker: null, open: false });
    load();
  };

  // ── Placement from the shelf ─────────────────────────────────────────────

  const placeOnTimeline = (event: StoryBoardEvent) => {
    if (!canEdit) return;
    if (lanes.length === 0) {
      errorToast("Add a lane first — chapters sit on one each.");
      return;
    }
    // Drop it where its reading order suggests, then let the author drag it.
    const reading = readingPositions.get(event.id ?? "") ?? 1;
    const spread = Math.max(1, events.length);
    const start = Math.min(
      AXIS_MAX - DEFAULT_SPAN,
      ((reading - 1) / spread) * AXIS_MAX,
    );
    commitPlacement(event, {
      end: start + DEFAULT_SPAN,
      isFlashback: false,
      laneId: lanes[0]?.id ?? null,
      start,
    });
  };

  const sheetEvent = events.find((event) => event.id === blockSheetId) ?? null;

  /** The block being dragged reads from the live drag, not from state. */
  const liveSpan = (item: Placed) => {
    if (drag && drag.item.id === item.event.id) {
      return {
        end: drag.end,
        laneIndex: drag.laneIndex ?? item.laneIndex,
        start: drag.start,
      };
    }
    return { end: item.end, laneIndex: item.laneIndex, start: item.start };
  };

  const toPercent = (value: number) =>
    ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

  const dragStartPercent = drag ? toPercent(drag.start) : 0;

  // Keep a badge inside the track at either end, where centring it on the
  // start edge would push half of it out of view.
  const labelShift = (percent: number) =>
    percent < 8 ? "0" : percent > 92 ? "-100%" : "-50%";

  /** Every placed chapter's in-story date, read out on the axis above its
   *  start edge and kept on show — the one being dragged reads from the live
   *  drag, and falls back to the bare axis position when the authors never
   *  gave it a date. */
  const axisDates = (() => {
    type Chip = {
      dragging: boolean;
      eventId: string;
      label: string;
      percent: number;
    };

    const chips = placed
      .map((item): Chip | null => {
        const dragging = drag?.item.id === item.event.id;
        const start = dragging && drag ? drag.start : item.start;
        const label =
          toShortStoryDate(item.event.eventTime) ??
          (dragging ? `at ${start.toFixed(1)}` : null);
        if (!label) return null;
        return {
          dragging,
          eventId: item.event.id ?? "",
          label,
          percent: toPercent(start),
        };
      })
      .filter((chip): chip is Chip => chip !== null)
      .sort((a, b) => a.percent - b.percent);

    // Thin out dates that would print on top of each other. The chapter under
    // the pointer always wins its spot, since that is the one being read.
    const MIN_GAP = 11;
    const kept: Chip[] = [];
    for (const chip of chips) {
      const previous = kept[kept.length - 1];
      if (!previous || chip.percent - previous.percent >= MIN_GAP) {
        kept.push(chip);
      } else if (chip.dragging) {
        kept[kept.length - 1] = chip;
      }
    }
    return kept;
  })();

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Timeline</S.Title>
        <S.Spacer />
        {canEdit && (
          <>
            <S.ToolButton
              type="button"
              onClick={() => setMarkerSheet({ marker: null, open: true })}
            >
              <LuMapPin size={14} />
              Add marker
            </S.ToolButton>
            <S.ToolButton
              type="button"
              $primary
              onClick={() => setLaneSheet({ lane: null, open: true })}
            >
              <IoMdAdd size={16} />
              Add lane
            </S.ToolButton>
          </>
        )}
      </S.HeaderRow>

      <S.Hint>
        Story time, not reading order. Drag a chapter to move it, drag its edges
        to stretch it, and drag it up or down to change lane — it snaps to your
        markers.
      </S.Hint>

      <S.Board>
        <S.Gutter>
          <S.GutterHead />
          {lanes.map((lane) => (
            <S.GutterRow key={lane.id} $color={lane.color}>
              <S.GutterName title={lane.name}>{lane.name}</S.GutterName>
              {canEdit && (
                <S.GutterAction
                  type="button"
                  aria-label={`Edit lane ${lane.name}`}
                  title="Edit lane"
                  onClick={() => setLaneSheet({ lane, open: true })}
                >
                  <GrEdit size={12} />
                </S.GutterAction>
              )}
            </S.GutterRow>
          ))}
        </S.Gutter>

        <S.Scroller>
          <S.Track ref={trackRef}>
            <S.DateRow>
              {axisDates.map((chip) => (
                <S.EventDate
                  key={chip.eventId}
                  $active={chip.dragging}
                  style={{
                    left: `${chip.percent}%`,
                    transform: `translate(${labelShift(chip.percent)}, -50%)`,
                  }}
                >
                  {chip.label}
                </S.EventDate>
              ))}
            </S.DateRow>

            <S.AxisRow>
              {markers.map((marker) => (
                <S.Marker
                  key={marker.id}
                  style={{ left: `${toPercent(marker.position)}%` }}
                  onClick={() =>
                    canEdit && setMarkerSheet({ marker, open: true })
                  }
                >
                  {marker.label}
                </S.Marker>
              ))}
              {markers.length === 0 && !drag && (
                <S.Marker as="span" style={{ cursor: "default", left: "50%" }}>
                  story time →
                </S.Marker>
              )}
            </S.AxisRow>

            {drag && <S.DragLine style={{ left: `${dragStartPercent}%` }} />}

            {markers.map((marker) => (
              <S.MarkerLine
                key={`line-${marker.id}`}
                style={{ left: `${toPercent(marker.position)}%` }}
              />
            ))}

            {lanes.length === 0 ? (
              <S.EmptyBoard>
                {loading
                  ? "Loading the timeline…"
                  : canEdit
                    ? "No lanes yet. Add one for each POV or plotline, then drop your chapters onto it."
                    : "This story hasn't mapped its timeline yet."}
              </S.EmptyBoard>
            ) : (
              lanes.map((lane, laneIndex) => (
                <S.LaneRow
                  key={lane.id}
                  data-lane-name={lane.name}
                  $dropTarget={drag?.laneIndex === laneIndex}
                >
                  {placed
                    .filter((item) => liveSpan(item).laneIndex === laneIndex)
                    .map((item) => {
                      const span = liveSpan(item);
                      const eventId = item.event.id ?? "";
                      const reading = readingPositions.get(eventId) ?? 0;
                      const chrono = chronoPositions.get(eventId) ?? 0;
                      const dragging = drag?.item.id === item.event.id;
                      return (
                        <S.Block
                          key={eventId}
                          $color={lane.color}
                          $dragging={dragging}
                          $editable={canEdit}
                          $flashback={Boolean(item.event.isFlashback)}
                          style={{
                            left: `${toPercent(span.start)}%`,
                            width: `${toPercent(span.end) - toPercent(span.start)}%`,
                          }}
                          title={`${item.event.name} — reads ${reading}, happens ${chrono}`}
                          onPointerDown={(e) => {
                            if (!canEdit) return;
                            begin(e, item.event, "move", {
                              end: span.end,
                              laneIndex,
                              start: span.start,
                            });
                          }}
                          onClick={() => {
                            // A drag ends with a pointerup, not a click, so a
                            // click here really is a tap on the block.
                            if (!dragging) setBlockSheetId(eventId);
                          }}
                        >
                          {canEdit && (
                            <S.BlockHandle
                              $side="start"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                begin(e, item.event, "resize-start", {
                                  end: span.end,
                                  laneIndex,
                                  start: span.start,
                                });
                              }}
                            />
                          )}
                          {chrono !== reading && (
                            <S.OutOfOrderDot title="Read out of story order" />
                          )}
                          <S.BlockLabel>{item.event.name}</S.BlockLabel>
                          {item.event.isFlashback && (
                            <LuHistory size={12} style={{ flexShrink: 0 }} />
                          )}
                          {canEdit && (
                            <S.BlockHandle
                              $side="end"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                begin(e, item.event, "resize-end", {
                                  end: span.end,
                                  laneIndex,
                                  start: span.start,
                                });
                              }}
                            />
                          )}
                        </S.Block>
                      );
                    })}
                </S.LaneRow>
              ))
            )}
          </S.Track>
        </S.Scroller>
      </S.Board>

      {unplaced.length > 0 && (
        <S.Shelf>
          <S.ShelfTitle>Not on the timeline ({unplaced.length})</S.ShelfTitle>
          <S.ShelfRow>
            {unplaced.map((event) => (
              <S.ShelfChip
                key={event.id}
                type="button"
                disabled={!canEdit}
                title={
                  canEdit
                    ? "Place this chapter on the timeline"
                    : "Not placed on the timeline"
                }
                onClick={() => placeOnTimeline(event)}
              >
                <span className="ordinal">
                  {readingPositions.get(event.id ?? "")}
                </span>
                {event.name}
                {canEdit && <IoMdAdd size={13} />}
              </S.ShelfChip>
            ))}
          </S.ShelfRow>
        </S.Shelf>
      )}

      <LaneSheet
        open={laneSheet.open}
        lane={laneSheet.lane}
        onClose={() => setLaneSheet({ lane: null, open: false })}
        onSave={handleSaveLane}
        onDelete={handleDeleteLane}
      />

      <MarkerSheet
        open={markerSheet.open}
        marker={markerSheet.marker}
        onClose={() => setMarkerSheet({ marker: null, open: false })}
        onSave={handleSaveMarker}
        onDelete={handleDeleteMarker}
      />

      <BlockSheet
        open={blockSheetId !== null}
        event={sheetEvent}
        lanes={lanes}
        canEdit={canEdit}
        readingPosition={readingPositions.get(blockSheetId ?? "") ?? 0}
        chronoPosition={chronoPositions.get(blockSheetId ?? "") ?? null}
        onClose={() => setBlockSheetId(null)}
        onSave={(placement) => {
          if (sheetEvent) commitPlacement(sheetEvent, placement);
          setBlockSheetId(null);
        }}
        onUnplace={() => {
          if (sheetEvent) commitPlacement(sheetEvent, null);
          setBlockSheetId(null);
        }}
      />
    </S.Root>
  );
};
