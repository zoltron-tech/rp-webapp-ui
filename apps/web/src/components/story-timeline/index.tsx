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
import {
  LuCalendarDays,
  LuHistory,
  LuInfo,
  LuMapPin,
  LuX,
} from "react-icons/lu";
import {
  deleteStoryTimelineLaneAction,
  deleteStoryTimelineMarkerAction,
  getStoryTimelineAction,
  saveStoryboardEventTimelineAction,
  saveStoryTimelineLaneAction,
  saveStoryTimelineMarkerAction,
} from "@/app/rp/story/actions";
import { CanvasWeave } from "@/components/common/canvas-weave";
import CoverImage from "@/components/common/cover-image";
import {
  toShortStoryDate,
  toStoryClock,
} from "@/components/date-time-picker/date-format";
import { useUIContext } from "@/hooks";
import { useTrackDrag } from "@/lib/track-drag";
import { API_MESSAGE } from "@/utils/constants";
import { type BlockPlacement, BlockSheet } from "./block-sheet";
import { chapterColor } from "./chapter-colors";
import { MarkerSheet } from "./marker-sheet";
import * as S from "./styles";
import { TimelineSheet } from "./timeline-sheet";

/** The abstract story-time axis. Positions only mean something relative to
 *  the markers the authors name on it. */
const AXIS_MIN = 0;
const AXIS_MAX = 100;
/** How close (in axis units) a dragged edge has to get to snap to a marker. */
const SNAP_THRESHOLD = 1.5;
/** Narrowest a chapter may be dragged, so it never collapses out of reach. */
const MIN_SPAN = 1.5;
/** Span given to a chapter placed from the unplaced shelf. */
const DEFAULT_SPAN = 8;
/** Clear axis distance two chapters need before they can share a berth. */
const SLOT_GAP = 1.5;

type Props = {
  storyboardId: string;
  /** Members edit the timelines; everyone else gets a read-only board. */
  canEdit: boolean;
};

type Side = "above" | "below";

type Placed = {
  event: StoryBoardEvent;
  start: number;
  end: number;
  laneIndex: number;
};

/** A chapter with the berth it was packed into: which side of its timeline it
 *  hangs off, and how far out from it. */
type Slotted = Placed & { side: Side; level: number };

const isPlaced = (event: StoryBoardEvent) =>
  event.timelineStart != null && event.timelineEnd != null;

/**
 * Timeline view: when the chapters *happen*, as opposed to the order they are
 * read in.
 *
 * Each timeline is one horizontal thread across the board. A chapter does not
 * sit inside a row — it branches off the thread at its start position, on a
 * diagonal stem, and hangs above or below as a bar. Overlapping chapters are
 * packed outwards alternately (first above, then below, then further out), so
 * two chapters that share story time straddle their timeline instead of
 * covering each other.
 *
 * Chapters keep their reading order (`ordinal`) untouched — placing a bar
 * here only writes the timeline columns, through the narrow placement
 * endpoint, so a drag can never disturb a chapter's prose. Where the two
 * orders disagree the bar is marked, and the detail sheet offers the
 * flashback flag.
 */
export const StoryTimelineView: FC<Props> = ({ storyboardId, canEdit }) => {
  const { successToast, errorToast } = useUIContext();

  const [events, setEvents] = useState<StoryBoardEvent[]>([]);
  const [lanes, setLanes] = useState<StoryTimelineLane[]>([]);
  const [markers, setMarkers] = useState<StoryTimelineMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const [timelineSheet, setTimelineSheet] = useState<{
    open: boolean;
    lane: StoryTimelineLane | null;
  }>({ lane: null, open: false });
  const [markerSheet, setMarkerSheet] = useState<{
    open: boolean;
    marker: StoryTimelineMarker | null;
  }>({ marker: null, open: false });
  const [blockSheetId, setBlockSheetId] = useState<string | null>(null);

  /** The chapter whose detail card is open. One toggle on the bar opens and
   *  closes it, the same gesture on a mouse as under a thumb — hover would
   *  have given desktop a second, invisible way in that touch could never
   *  reach, and a card that opens on the way past is a card that opens by
   *  accident. */
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  /** The marker under the pointer; its dropped rule lights up with it, which
   *  is what makes one rule followable down a crowded board. */
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

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
  // — a co-author may have moved a chapter while it was in the background.
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

  /** Optimistic placement write: patch locally, then reconcile with the server.
   *  Resolves true once the server has it. */
  const commitPlacement = useCallback(
    async (event: StoryBoardEvent, placement: BlockPlacement | null) => {
      const eventId = event.id;
      if (!eventId) return false;

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
      }).catch(() => null);

      if (!saved || "message" in saved) {
        setEvents(previous);
        errorToast("Could not move that chapter. Please try again.");
        return false;
      }

      // The server clamps and normalises (flipped edges, foreign timelines),
      // so take its answer rather than trusting the optimistic patch.
      setEvents((current) =>
        current.map((candidate) =>
          candidate.id === eventId ? saved : candidate,
        ),
      );
      return true;
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

  /** Band height as of the last render, for the drag engine's row stepping. */
  const bandHeightRef = useRef(S.bandHeight(0));

  const { drag, begin } = useTrackDrag<StoryBoardEvent>({
    getGeometry,
    laneCount: lanes.length,
    laneHeight: bandHeightRef.current,
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

  // ── Packing ──────────────────────────────────────────────────────────────

  /**
   * Assigns every placed chapter a berth on its timeline.
   *
   * Berths run outwards from the thread, alternating sides: berth 0 is the
   * first bar above, berth 1 the first below, berth 2 the second above, and
   * so on. A chapter takes the innermost berth whose last occupant has
   * already ended, which is the classic interval-packing sweep — so a bar
   * only moves further out when it genuinely overlaps everything nearer in.
   *
   * The dragged chapter is packed from its *live* span, so the stack
   * rearranges under the pointer rather than after the drop.
   */
  const { slotted, maxLevel } = useMemo(() => {
    const live: Placed[] = placed.map((item) =>
      drag && drag.item.id === item.event.id
        ? {
            end: drag.end,
            event: item.event,
            laneIndex: drag.laneIndex ?? item.laneIndex,
            start: drag.start,
          }
        : item,
    );

    const byLane = new Map<number, Placed[]>();
    for (const item of live) {
      const bucket = byLane.get(item.laneIndex);
      if (bucket) bucket.push(item);
      else byLane.set(item.laneIndex, [item]);
    }

    const result: Slotted[] = [];
    let deepest = 0;

    for (const bucket of byLane.values()) {
      /** Where each berth's current occupant ends, in axis units. */
      const berthEnds: number[] = [];
      const ordered = [...bucket].sort(
        (a, b) => a.start - b.start || a.event.ordinal - b.event.ordinal,
      );
      for (const item of ordered) {
        let berth = berthEnds.findIndex((end) => end <= item.start - SLOT_GAP);
        if (berth < 0) {
          berth = berthEnds.length;
          berthEnds.push(item.end);
        } else {
          berthEnds[berth] = item.end;
        }
        const level = Math.floor(berth / 2);
        deepest = Math.max(deepest, level);
        result.push({
          ...item,
          level,
          side: berth % 2 === 0 ? "above" : "below",
        });
      }
    }

    return { maxLevel: deepest, slotted: result };
    // `drag` is read inside; it is intentionally part of the dependency list
    // so the packing follows the pointer.
  }, [placed, drag]);

  const bandHeight = S.bandHeight(maxLevel);
  const spineY = bandHeight / 2;
  // The drag engine reads the band height a render late, which is what we
  // want: a stack that deepens *during* a drag must not resize the bands out
  // from under the pointer mid-gesture.
  bandHeightRef.current = bandHeight;
  // ── Timelines ────────────────────────────────────────────────────────────

  const handleSaveTimeline = async (lane: StoryTimelineLane) => {
    const saved = await saveStoryTimelineLaneAction(storyboardId, lane).catch(
      () => null,
    );
    if (!saved || "message" in saved) {
      errorToast("Could not save that timeline. Please try again.");
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
    setTimelineSheet({ lane: null, open: false });
  };

  const handleDeleteTimeline = async (lane: StoryTimelineLane) => {
    if (!lane.id) return;
    const result = await deleteStoryTimelineLaneAction(lane.id).catch(
      () => null,
    );
    if (result?.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that timeline. Please try again.");
      return;
    }
    setTimelineSheet({ lane: null, open: false });
    successToast("Timeline removed — its chapters are back on the shelf.");
    // Chapters on the timeline are unplaced server-side; refetch rather than
    // guessing at the new shape.
    load();
  };

  // ── Markers ──────────────────────────────────────────────────────────────

  const handleSaveMarker = async (marker: StoryTimelineMarker) => {
    const saved = await saveStoryTimelineMarkerAction(
      storyboardId,
      marker,
    ).catch(() => null);
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
    const result = await deleteStoryTimelineMarkerAction(marker.id).catch(
      () => null,
    );
    if (result?.message !== API_MESSAGE.Success) {
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
      errorToast("Add a timeline first — chapters branch off one.");
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

  const toPercent = (value: number) =>
    ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

  const dragStartPercent = drag ? toPercent(drag.start) : 0;

  // ── Geometry helpers ─────────────────────────────────────────────────────

  /** A bar's top edge inside its band. */
  const barTop = (side: Side, level: number) =>
    side === "above"
      ? spineY - S.levelOffset(level) - S.BAR_HEIGHT
      : spineY + S.levelOffset(level);

  /** The stem box: the spine at one corner, the bar's inner edge at the
   *  other, with the thread drawn across its diagonal. */
  const stemTop = (side: Side, level: number) =>
    side === "above" ? spineY - S.levelOffset(level) : spineY;

  // ── The expanded chapter ─────────────────────────────────────────────────

  // A drag is not a read: whatever was open closes for the duration.
  const expandedId = drag ? null : pinnedId;
  const expanded = slotted.find((item) => item.event.id === expandedId) ?? null;

  const card = (() => {
    if (!expanded) return null;

    const trackHeight = Math.max(
      S.AXIS_HEIGHT + lanes.length * bandHeight,
      S.AXIS_HEIGHT + S.CARD_HEIGHT + 16,
    );
    const bandTop = S.AXIS_HEIGHT + expanded.laneIndex * bandHeight;
    const top = barTop(expanded.side, expanded.level);
    // Grow away from the thread, then keep the whole card inside the track —
    // a card clipped by the board's scroller is worse than one that overlaps
    // its neighbours.
    const wanted =
      expanded.side === "above"
        ? bandTop + top - S.CARD_HEIGHT - 8
        : bandTop + top + S.BAR_HEIGHT + 8;
    const lowest = Math.max(4, trackHeight - S.CARD_HEIGHT - 4);

    // Where the bar actually ends, mirroring how it is laid out: its left edge
    // plus its width, min-width and all. A short chapter's bar is wider than
    // its span, so its span alone would put the anchor short of the toggle.
    const startPercent = toPercent(expanded.start);
    const spanPercent = toPercent(expanded.end) - startPercent;
    const barRight = `calc(${startPercent}% + ${S.STEM_RUN}px + max(5.5rem, calc(${spanPercent}% - ${S.STEM_RUN}px)))`;

    const event = expanded.event;
    const eventId = event.id ?? "";
    const reading = readingPositions.get(eventId) ?? 0;
    const date = toShortStoryDate(event.eventTime);
    const clock = toStoryClock(event.eventTime);

    return {
      clock,
      color: chapterColor(reading),
      date,
      event,
      // Anchored on the toggle that opened it, which sits at the *end* of the
      // bar — not on the chapter's start.
      //
      // The two are the same point only for a short chapter. A long one can
      // begin far off the left of the scroller, and a card hung off that start
      // opens somewhere the reader is not looking, or off the board entirely.
      // The toggle, on the other hand, is by definition on screen: they just
      // pressed it. Centred on it and clamped to the track, so it can neither
      // overflow nor drift away from the press.
      left: `clamp(4px, calc(${barRight} - ${S.CARD_WIDTH / 2}px), calc(100% - ${
        S.CARD_WIDTH + 4
      }px))`,
      top: Math.min(Math.max(4, wanted), lowest),
    };
  })();

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Timelines</S.Title>
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
              onClick={() => setTimelineSheet({ lane: null, open: true })}
            >
              <IoMdAdd size={16} />
              Add timeline
            </S.ToolButton>
          </>
        )}
      </S.HeaderRow>

      <S.Hint>
        Story time, not reading order. Each timeline runs as one line; its
        chapters branch off it above and below. Use a chapter's ⓘ button for its
        detail, and the bar itself to edit where it sits — drag it to move it,
        drag its edges to stretch it, and drag it up or down to change timeline,
        snapping to your markers as it goes.
      </S.Hint>

      <S.Board>
        <S.Gutter>
          <S.GutterHead />
          {lanes.map((lane) => (
            <S.GutterRow key={lane.id} $color={lane.color} $height={bandHeight}>
              <S.GutterName title={lane.name}>{lane.name}</S.GutterName>
              {canEdit && (
                <S.GutterAction
                  type="button"
                  aria-label={`Edit timeline ${lane.name}`}
                  title="Edit timeline"
                  onClick={() => setTimelineSheet({ lane, open: true })}
                >
                  <GrEdit size={12} />
                </S.GutterAction>
              )}
            </S.GutterRow>
          ))}
        </S.Gutter>

        <S.Scroller>
          <S.Track
            ref={trackRef}
            onPointerDown={(e) => {
              // A press anywhere but on a bar or on the card itself dismisses
              // a pinned card.
              const target = e.target as HTMLElement;
              if (!target.closest("[data-keeps-card]")) setPinnedId(null);
            }}
          >
            <S.Weave aria-hidden>
              <CanvasWeave />
            </S.Weave>

            <S.AxisRow>
              {markers.map((marker) => (
                <S.Marker
                  key={marker.id}
                  $active={hoveredMarkerId === marker.id}
                  style={{ left: `${toPercent(marker.position)}%` }}
                  onPointerEnter={() => setHoveredMarkerId(marker.id)}
                  onPointerLeave={() => setHoveredMarkerId(null)}
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
                $active={hoveredMarkerId === marker.id}
                style={{ left: `${toPercent(marker.position)}%` }}
              />
            ))}

            {lanes.length === 0 ? (
              <S.EmptyBoard>
                {loading
                  ? "Loading the timelines…"
                  : canEdit
                    ? "No timelines yet. Add one for each POV or plotline, then branch your chapters off it."
                    : "This story hasn't mapped its timelines yet."}
              </S.EmptyBoard>
            ) : (
              lanes.map((lane, laneIndex) => (
                <S.Band
                  key={lane.id}
                  $height={bandHeight}
                  $dropTarget={drag?.laneIndex === laneIndex}
                >
                  <S.BandName style={{ marginTop: spineY + 4 }}>
                    {lane.name}
                  </S.BandName>

                  <S.Spine $color={lane.color} style={{ top: spineY - 1 }} />

                  {slotted
                    .filter((item) => item.laneIndex === laneIndex)
                    .map((item) => {
                      const eventId = item.event.id ?? "";
                      const reading = readingPositions.get(eventId) ?? 0;
                      const chrono = chronoPositions.get(eventId) ?? 0;
                      const dragging = drag?.item.id === item.event.id;
                      const active = expandedId === eventId;
                      const startPercent = toPercent(item.start);
                      const spanPercent =
                        toPercent(item.end) - toPercent(item.start);
                      const offset = S.levelOffset(item.level);
                      // The branch wears the chapter's own accent, not the
                      // timeline's — the spine already carries that, and a bar
                      // in the same hue reads as part of the line.
                      const accent = chapterColor(reading);
                      // The in-story date the authors gave it. While it is
                      // being dragged and has none, the bare axis position
                      // stands in, so the gesture still reads out somewhere.
                      const barDate =
                        toShortStoryDate(item.event.eventTime) ??
                        (dragging ? `at ${item.start.toFixed(1)}` : null);

                      return (
                        <div key={eventId}>
                          <S.Stem
                            $side={item.side}
                            $color={accent}
                            style={{
                              height: offset,
                              left: `${startPercent}%`,
                              top: stemTop(item.side, item.level),
                              width: S.STEM_RUN,
                            }}
                          />
                          <S.Node
                            $color={accent}
                            $active={active || dragging}
                            style={{ left: `${startPercent}%`, top: spineY }}
                          />
                          <S.Bar
                            data-keeps-card
                            $color={accent}
                            $dragging={dragging}
                            $editable={canEdit}
                            $active={active}
                            $flashback={Boolean(item.event.isFlashback)}
                            style={{
                              left: `calc(${startPercent}% + ${S.STEM_RUN}px)`,
                              top: barTop(item.side, item.level),
                              width: `max(5.5rem, calc(${spanPercent}% - ${S.STEM_RUN}px))`,
                            }}
                            title={`${item.event.name} — reads ${reading}, happens ${chrono}`}
                            onPointerDown={(e) => {
                              if (!canEdit) return;
                              begin(e, item.event, "move", {
                                end: item.end,
                                laneIndex,
                                start: item.start,
                              });
                            }}
                            onClick={() => {
                              // A drag ends with a pointerup, not a click, so
                              // a click here really is a tap on the bar.
                              if (!dragging) setBlockSheetId(eventId);
                            }}
                          >
                            {canEdit && (
                              <S.BarHandle
                                $side="start"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  begin(e, item.event, "resize-start", {
                                    end: item.end,
                                    laneIndex,
                                    start: item.start,
                                  });
                                }}
                              />
                            )}
                            <S.BarTopRow>
                              {chrono !== reading && (
                                <S.OutOfOrderDot title="Read out of story order" />
                              )}
                              <S.BarLabel>{item.event.name}</S.BarLabel>
                              {item.event.isFlashback && (
                                <LuHistory
                                  size={12}
                                  style={{ flexShrink: 0 }}
                                />
                              )}
                              <S.ExpandButton
                                type="button"
                                $active={active}
                                aria-label={
                                  active
                                    ? `Hide details for ${item.event.name}`
                                    : `Show details for ${item.event.name}`
                                }
                                aria-expanded={active}
                                title={active ? "Hide details" : "Show details"}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinnedId((current) =>
                                    current === eventId ? null : eventId,
                                  );
                                }}
                              >
                                <LuInfo size={11} />
                              </S.ExpandButton>
                            </S.BarTopRow>
                            {barDate && <S.BarDate>{barDate}</S.BarDate>}
                            {canEdit && (
                              <S.BarHandle
                                $side="end"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  begin(e, item.event, "resize-end", {
                                    end: item.end,
                                    laneIndex,
                                    start: item.start,
                                  });
                                }}
                              />
                            )}
                          </S.Bar>
                        </div>
                      );
                    })}
                </S.Band>
              ))
            )}

            {card && (
              <S.Card
                data-keeps-card
                $accent={card.color}
                style={{ left: card.left, top: card.top }}
              >
                <S.CardCover>
                  <CoverImage
                    src={card.event.image}
                    nwImage={card.event.avatar}
                  />
                </S.CardCover>
                <S.CardBody>
                  {/* Two lines. The flashback mark rides on the title rather
                      than taking a row of its own, and the when and the where
                      share the second — the date as a chip, the place trailing
                      off it, so they are told apart without a third row. */}
                  <S.CardTitle>
                    <b>{card.event.name}</b>
                    {card.event.isFlashback && (
                      <LuHistory size={10} title="Flashback" />
                    )}
                  </S.CardTitle>
                  <S.CardFacts>
                    {card.date && (
                      <S.CardDate $accent={card.color}>
                        <LuCalendarDays size={9} />
                        {card.date}
                        {card.clock ? ` · ${card.clock}` : ""}
                      </S.CardDate>
                    )}
                    {card.event.location && (
                      <S.CardPlace>
                        <LuMapPin size={9} />
                        <span>{card.event.location}</span>
                      </S.CardPlace>
                    )}
                  </S.CardFacts>
                </S.CardBody>
                <S.CardClose
                  type="button"
                  aria-label="Close details"
                  onClick={() => setPinnedId(null)}
                >
                  <LuX size={11} />
                </S.CardClose>
              </S.Card>
            )}
          </S.Track>
        </S.Scroller>
      </S.Board>

      {unplaced.length > 0 && (
        <S.Shelf>
          <S.ShelfTitle>Not on a timeline ({unplaced.length})</S.ShelfTitle>
          <S.ShelfRow>
            {unplaced.map((event) => (
              <S.ShelfChip
                key={event.id}
                type="button"
                disabled={!canEdit}
                title={
                  canEdit
                    ? "Place this chapter on a timeline"
                    : "Not placed on a timeline"
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

      <TimelineSheet
        open={timelineSheet.open}
        lane={timelineSheet.lane}
        chapterCount={
          timelineSheet.lane?.id
            ? events.filter(
                (event) =>
                  event.timelineLaneId === timelineSheet.lane?.id &&
                  event.timelineStart != null,
              ).length
            : 0
        }
        onClose={() => setTimelineSheet({ lane: null, open: false })}
        onSave={handleSaveTimeline}
        onDelete={handleDeleteTimeline}
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
        onSave={async (placement) => {
          // A failed save keeps the sheet open on the author's placement.
          if (!sheetEvent || (await commitPlacement(sheetEvent, placement))) {
            setBlockSheetId(null);
          }
        }}
        onUnplace={() => {
          if (sheetEvent) commitPlacement(sheetEvent, null);
          setBlockSheetId(null);
        }}
      />
    </S.Root>
  );
};
