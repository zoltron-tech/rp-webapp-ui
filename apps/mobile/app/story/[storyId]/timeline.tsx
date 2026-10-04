import { Ionicons } from "@expo/vector-icons";
import type { StoryBoardEvent } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";
import { CroppedImage } from "@/components/cropped-image";
import { ListStatus } from "@/components/list-status";
import { TimelineSkeleton } from "@/components/sheet-skeletons";
import { PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useStoryTimeline } from "@/hooks/use-story";
import { asColor } from "@/lib/color";
import { chapterColor, plainText, storyClock, storyDate } from "@/lib/story";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * The timelines — web's `StoryTimelineView`, read-only.
 *
 * When the chapters happen, as opposed to the order they are read in. Each
 * timeline is a line across the board; a chapter branches off it at its start
 * on a short diagonal and hangs above or below as a bar, packed outwards
 * alternately so overlapping chapters straddle their line instead of covering
 * each other. Named markers tick the axis and drop a rule down the board.
 *
 * The geometry is web's, number for number (bar 42, level pitch 48, stem 16),
 * and the packing is the same interval sweep, so a board reads the same on
 * both. The board scrolls sideways; a bar opens its chapter's detail sheet,
 * and chapters not on any timeline wait on a shelf beneath.
 */

const AXIS_MAX = 100;
const BAR_HEIGHT = 42;
const LEVEL_GAP = 48;
const STEM_RISE = 16;
const STEM_RUN = 16;
const BAND_PAD = 10;
const MARKER_ROW = 34;
const SLOT_GAP = 1.5;
const MIN_BAR = 88;
const TRACK_PAD = 20;
/** Room past 100 for a bar near the end to keep its minimum width. */
const TRACK_TAIL = MIN_BAR + STEM_RUN;

type Side = "above" | "below";
type Slotted = {
  end: number;
  event: StoryBoardEvent;
  laneIndex: number;
  level: number;
  side: Side;
  start: number;
};

const bandHeight = (maxLevel: number) =>
  2 * (STEM_RISE + maxLevel * LEVEL_GAP + BAR_HEIGHT + BAND_PAD);
const levelOffset = (level: number) => STEM_RISE + level * LEVEL_GAP;

const isPlaced = (event: StoryBoardEvent) =>
  event.timelineStart != null && event.timelineEnd != null;

export default function TimelineScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const timeline = useStoryTimeline(storyId);

  const [openId, setOpenId] = useState<string | null>(null);

  const events = timeline.data?.events ?? [];
  const lanes = useMemo(
    () => [...(timeline.data?.lanes ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [timeline.data?.lanes],
  );
  const markers = timeline.data?.markers ?? [];

  const readingPositions = useMemo(() => {
    const map = new Map<string, number>();
    [...events]
      .sort((a, b) => a.ordinal - b.ordinal)
      .forEach((event, index) => event.id && map.set(event.id, index + 1));
    return map;
  }, [events]);

  const { chronoPositions, maxLevel, slotted, unplaced } = useMemo(() => {
    const laneIndexOf = (laneId: string | null | undefined) => {
      const index = lanes.findIndex((lane) => lane.id === laneId);
      return index < 0 ? 0 : index;
    };
    const placed = events.filter(isPlaced).map((event) => ({
      end: event.timelineEnd as number,
      event,
      laneIndex: laneIndexOf(event.timelineLaneId),
      start: event.timelineStart as number,
    }));

    const chrono = new Map<string, number>();
    [...placed]
      .sort((a, b) => a.start - b.start || a.event.ordinal - b.event.ordinal)
      .forEach((item, index) => item.event.id && chrono.set(item.event.id, index + 1));

    // Innermost berth whose occupant has ended; berths alternate sides.
    const result: Slotted[] = [];
    let deepest = 0;
    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const berthEnds: number[] = [];
      const bucket = placed
        .filter((item) => item.laneIndex === laneIndex)
        .sort((a, b) => a.start - b.start || a.event.ordinal - b.event.ordinal);
      for (const item of bucket) {
        let berth = berthEnds.findIndex((end) => end <= item.start - SLOT_GAP);
        if (berth < 0) {
          berth = berthEnds.length;
          berthEnds.push(item.end);
        } else {
          berthEnds[berth] = item.end;
        }
        const level = Math.floor(berth / 2);
        deepest = Math.max(deepest, level);
        result.push({ ...item, level, side: berth % 2 === 0 ? "above" : "below" });
      }
    }

    return {
      chronoPositions: chrono,
      maxLevel: deepest,
      slotted: result,
      unplaced: lanes.length === 0 ? events : events.filter((e) => !isPlaced(e)),
    };
  }, [events, lanes]);

  const pull = usePullToRefresh(timeline.refetch);

  if (!timeline.data) {
    return (
      <View style={styles.fill}>
        <ListStatus
          error={timeline.error}
          loading={timeline.isPending}
          onRetry={() => void timeline.refetch()}
          skeleton={<TimelineSkeleton />}
        />
      </View>
    );
  }

  const band = bandHeight(maxLevel);
  const spineY = band / 2;
  const axisWidth = Math.max(640, width * 1.8);
  const trackWidth = TRACK_PAD + axisWidth + TRACK_TAIL;
  const trackHeight = MARKER_ROW + lanes.length * band;
  const x = (position: number) => TRACK_PAD + (position / AXIS_MAX) * axisWidth;

  const opened = events.find((event) => event.id === openId) ?? null;

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
      >
        <Text style={[styles.hint, { color: theme.textGray }]}>
          Story time, not reading order. Each timeline runs as one line and its
          chapters branch off it. Scroll sideways, and tap a chapter for its
          details.
        </Text>

        {lanes.length === 0 ? (
          <View
            style={[
              styles.emptyBoard,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.textGray} name="git-branch-outline" size={28} />
            <Text style={[styles.emptyText, { color: theme.textGray }]}>
              This story hasn't mapped its timelines yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.boardContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              styles.board,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <View style={{ height: trackHeight, width: trackWidth }}>
              {/* Marker rules, dropped from the axis down the whole board. */}
              {markers.map((marker) => (
                <View
                  key={`rule-${marker.id}`}
                  style={[
                    styles.markerRule,
                    {
                      backgroundColor: theme.material.edge,
                      height: trackHeight - MARKER_ROW,
                      left: x(marker.position),
                      top: MARKER_ROW,
                    },
                  ]}
                />
              ))}
              <View style={[styles.axis, { borderBottomColor: theme.material.edge }]}>
                {markers.length === 0 ? (
                  <Text
                    style={[
                      styles.marker,
                      { color: theme.textGray, left: x(50) - 60 },
                    ]}
                  >
                    story time →
                  </Text>
                ) : (
                  markers.map((marker) => (
                    <Text
                      key={marker.id}
                      numberOfLines={1}
                      style={[
                        styles.marker,
                        { color: theme.text, left: x(marker.position) - 60 },
                      ]}
                    >
                      {marker.label}
                    </Text>
                  ))
                )}
              </View>

              {lanes.map((lane, laneIndex) => {
                const laneColor = asColor(lane.color) ?? theme.accent.solid;
                const items = slotted.filter((item) => item.laneIndex === laneIndex);
                return (
                  <View key={lane.id} style={{ height: band, width: trackWidth }}>
                    <View
                      style={[
                        styles.spine,
                        { backgroundColor: laneColor, top: spineY - 1 },
                      ]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.laneName,
                        { color: laneColor, top: spineY + 5 },
                      ]}
                    >
                      {lane.name}
                    </Text>

                    <Svg
                      height={band}
                      pointerEvents="none"
                      style={StyleSheet.absoluteFill}
                      width={trackWidth}
                    >
                      {items.map((item) => {
                        const reading = readingPositions.get(item.event.id ?? "") ?? 0;
                        const sx = x(item.start);
                        const edge =
                          item.side === "above"
                            ? spineY - levelOffset(item.level)
                            : spineY + levelOffset(item.level);
                        return (
                          <Line
                            key={item.event.id}
                            stroke={chapterColor(reading)}
                            strokeWidth={2}
                            x1={sx}
                            x2={sx + STEM_RUN}
                            y1={spineY}
                            y2={edge}
                          />
                        );
                      })}
                    </Svg>

                    {items.map((item) => {
                      const eventId = item.event.id ?? "";
                      const reading = readingPositions.get(eventId) ?? 0;
                      const chrono = chronoPositions.get(eventId) ?? 0;
                      const color = chapterColor(reading);
                      const sx = x(item.start);
                      const barWidth = Math.max(MIN_BAR, x(item.end) - sx - STEM_RUN);
                      const top =
                        item.side === "above"
                          ? spineY - levelOffset(item.level) - BAR_HEIGHT
                          : spineY + levelOffset(item.level);
                      const date = storyDate(item.event.eventTime);
                      return (
                        <View key={eventId}>
                          <View
                            style={[
                              styles.node,
                              { backgroundColor: color, left: sx - 5, top: spineY - 5 },
                            ]}
                          />
                          <Pressable
                            accessibilityLabel={`${item.event.name}, reads ${reading}, happens ${chrono}`}
                            accessibilityRole="button"
                            onPress={() => setOpenId(eventId)}
                            style={({ pressed }) => [
                              styles.bar,
                              {
                                backgroundColor: color,
                                left: sx + STEM_RUN,
                                opacity: pressed ? 0.8 : 1,
                                top,
                                width: barWidth,
                              },
                              item.event.isFlashback && styles.flashback,
                            ]}
                          >
                            <View style={styles.barTop}>
                              {chrono !== reading ? <View style={styles.outOfOrder} /> : null}
                              <Text numberOfLines={1} style={styles.barLabel}>
                                {item.event.name}
                              </Text>
                              {item.event.isFlashback ? (
                                <Ionicons color="#fff" name="time-outline" size={12} />
                              ) : null}
                            </View>
                            {date ? (
                              <Text numberOfLines={1} style={styles.barDate}>
                                {date}
                              </Text>
                            ) : null}
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {lanes.length > 0 ? (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.outOfOrder, styles.legendDot]} />
              <Text style={[styles.legendText, { color: theme.textGray }]}>
                Read out of story order
              </Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons color={theme.textGray} name="time-outline" size={12} />
              <Text style={[styles.legendText, { color: theme.textGray }]}>
                Flashback
              </Text>
            </View>
          </View>
        ) : null}

        {unplaced.length > 0 ? (
          <View style={styles.shelf}>
            <Text style={[styles.shelfTitle, { color: theme.textGray }]}>
              {lanes.length === 0 ? "Chapters" : `Not on a timeline (${unplaced.length})`}
            </Text>
            <View style={styles.shelfRow}>
              {unplaced.map((event) => (
                <Pressable
                  accessibilityRole="button"
                  key={event.id}
                  onPress={() => setOpenId(event.id)}
                  style={({ pressed }) => [
                    styles.shelfChip,
                    {
                      backgroundColor: pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                      borderColor: theme.material.edge,
                    },
                  ]}
                >
                  <Text style={[styles.shelfOrdinal, { color: theme.accent.text }]}>
                    {readingPositions.get(event.id ?? "")}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.shelfLabel, { color: theme.text }]}
                  >
                    {event.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <ChapterSheet
        chrono={opened?.id ? (chronoPositions.get(opened.id) ?? null) : null}
        event={opened}
        laneName={lanes.find((lane) => lane.id === opened?.timelineLaneId)?.name}
        onClose={() => setOpenId(null)}
        onRead={(eventId) => {
          setOpenId(null);
          router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" });
        }}
        reading={opened?.id ? (readingPositions.get(opened.id) ?? 0) : 0}
      />
    </View>
  );
}

/** A chapter's detail — web's bar card and block sheet, without the editing. */
const ChapterSheet = ({
  chrono,
  event,
  laneName,
  onClose,
  onRead,
  reading,
}: {
  chrono: number | null;
  event: StoryBoardEvent | null;
  laneName?: string;
  onClose: () => void;
  onRead: (eventId: string) => void;
  reading: number;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState(event);
  const [numbers, setNumbers] = useState({ chrono, reading });
  useEffect(() => {
    if (event) {
      setShown(event);
      setNumbers({ chrono, reading });
    }
  }, [event, chrono, reading]);

  const date = storyDate(shown?.eventTime);
  const clock = storyClock(shown?.eventTime);
  const preview = plainText(shown?.description);
  const cover = shown
    ? wsrvImage(shown.avatar?.src || shown.image, { fit: "inside", h: 300, w: 200 })
    : null;
  const placed = shown ? isPlaced(shown) : false;

  return (
    <BottomSheet
      onClose={onClose}
      title={shown ? `Chapter ${numbers.reading}` : undefined}
      visible={Boolean(event)}
    >
      {shown ? (
        <View style={[styles.sheetBody, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.sheetHead}>
            <View style={[styles.sheetCover, { backgroundColor: chapterColor(numbers.reading) }]}>
              {cover ? (
                <CroppedImage
                  crop={shown.avatar?.crop}
                  maxScalePct={800}
                  style={StyleSheet.absoluteFill}
                  uri={cover}
                />
              ) : null}
            </View>
            <View style={styles.sheetText}>
              <Text style={[styles.sheetName, { color: theme.text }]}>
                {shown.name}
                {shown.isFlashback ? "  ⟲" : ""}
              </Text>
              <Text style={[styles.sheetFact, { color: theme.textGray }]}>
                {placed && numbers.chrono
                  ? numbers.chrono === numbers.reading
                    ? `Reads and happens ${ordinal(numbers.reading)}`
                    : `Reads ${ordinal(numbers.reading)} · happens ${ordinal(numbers.chrono)}`
                  : "Not placed on a timeline"}
                {shown.isFlashback ? " · flashback" : ""}
              </Text>
              {laneName && placed ? (
                <Text style={[styles.sheetFact, { color: theme.textGray }]}>
                  On {laneName}
                </Text>
              ) : null}
              {date || shown.location ? (
                <View style={styles.sheetMeta}>
                  {date ? (
                    <Text style={[styles.sheetFact, { color: theme.text }]}>
                      <Ionicons name="calendar-outline" size={12} /> {date}
                      {clock ? ` · ${clock}` : ""}
                    </Text>
                  ) : null}
                  {shown.location ? (
                    <Text style={[styles.sheetFact, { color: theme.text }]}>
                      <Ionicons name="location-outline" size={12} /> {shown.location}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
          {preview ? (
            <Text numberOfLines={5} style={[styles.sheetPreview, { color: theme.textGray }]}>
              {preview}
            </Text>
          ) : null}
          <PillButton
            icon="book-outline"
            label="Read chapter"
            onPress={() => shown.id && onRead(shown.id)}
            tone="accent"
          />
        </View>
      ) : null}
    </BottomSheet>
  );
};

const ordinal = (n: number) => {
  const tens = n % 100;
  const suffix =
    tens >= 11 && tens <= 13
      ? "th"
      : n % 10 === 1
        ? "st"
        : n % 10 === 2
          ? "nd"
          : n % 10 === 3
            ? "rd"
            : "th";
  return `${n}${suffix}`;
};

const styles = StyleSheet.create({
  axis: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: MARKER_ROW,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  bar: {
    borderRadius: radius.md,
    gap: 1,
    height: BAR_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: space.sm,
    position: "absolute",
  },
  barDate: { color: "rgba(255,255,255,0.85)", fontSize: fontSize.meta },
  barLabel: { color: "#fff", flexShrink: 1, fontSize: fontSize.caption, fontWeight: "700" },
  barTop: { alignItems: "center", flexDirection: "row", gap: space.xs },
  board: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    marginHorizontal: space.m,
  },
  boardContent: { paddingTop: MARKER_ROW },
  emptyBoard: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    gap: space.sm,
    marginHorizontal: space.m,
    padding: space.xl,
  },
  emptyText: { fontSize: fontSize.body, textAlign: "center" },
  fill: { flex: 1 },
  flashback: { borderColor: "rgba(255,255,255,0.7)", borderStyle: "dashed", borderWidth: 1.5 },
  hint: {
    fontSize: fontSize.caption,
    lineHeight: 17,
    paddingHorizontal: space.md,
    paddingVertical: space.m,
  },
  laneName: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    left: 6,
    letterSpacing: 0.6,
    maxWidth: 140,
    position: "absolute",
    textTransform: "uppercase",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  legendDot: { backgroundColor: "#999" },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 5 },
  legendText: { fontSize: fontSize.caption },
  marker: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    position: "absolute",
    textAlign: "center",
    top: 9,
    width: 120,
  },
  markerRule: { position: "absolute", width: 1 },
  node: {
    borderColor: "#fff",
    borderRadius: radius.sm,
    borderWidth: 1.5,
    height: 10,
    position: "absolute",
    width: 10,
  },
  outOfOrder: { backgroundColor: "#fff", borderRadius: 3, height: 6, width: 6 },
  sheetBody: { gap: space.md, paddingHorizontal: space.md },
  sheetCover: { aspectRatio: 2 / 3, borderRadius: radius.md, overflow: "hidden", width: 64 },
  sheetFact: { fontSize: fontSize.caption },
  sheetHead: { flexDirection: "row", gap: space.md },
  sheetMeta: { gap: space.xxs, marginTop: space.xxs },
  sheetName: { fontSize: fontSize.title - 2, fontWeight: "700" },
  sheetPreview: { fontSize: fontSize.label, lineHeight: 19 },
  sheetText: { flex: 1, gap: 3 },
  shelf: { gap: space.sm, paddingHorizontal: space.m, paddingTop: space.lg },
  shelfChip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    maxWidth: "100%",
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  shelfLabel: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  shelfOrdinal: { fontSize: fontSize.caption, fontWeight: "700" },
  shelfRow: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  shelfTitle: type.eyebrow,
  spine: { height: 2, left: 0, position: "absolute", right: 0 },
});
