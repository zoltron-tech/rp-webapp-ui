import type {
  StoryBoardEvent,
  StoryTimelineLane,
  StoryTimelineMarker,
} from "@nw/types";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton } from "@/components/icon-button";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import { Slider } from "@/components/slider";
import {
  Choice,
  DangerRow,
  FieldLabel,
  Hint,
  Swatches,
  useFieldStyle,
} from "@/components/story/form-bits";
import { Text, TextInput } from "@/components/text";
import type { StoryTimelineEdit } from "@/hooks/use-story-timeline-edit";
import { asColor } from "@/lib/color";
import { CODEX_COLORS } from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Writing the timelines — web's `TimelineSheet`, `MarkerSheet` and `BlockSheet`.
 *
 * Web places a chapter by dragging its bar. Dragging around a track on a phone
 * is not a real gesture, as web's own sheet says of its narrow view, so a
 * chapter is placed here, with two sliders.
 *
 * The wire still calls a timeline a "lane"; only the reader-facing name changed.
 */

const DEFAULT_SPAN = 8;
const position = (value: number) => value.toFixed(1);

const confirmDelete = (title: string, message: string, run: () => void) =>
  Alert.alert(title, message, [
    { style: "cancel", text: "Cancel" },
    { onPress: run, style: "destructive", text: "Delete" },
  ]);

export const LaneSheet = ({
  edit,
  lane,
  onClose,
  visible,
}: {
  edit: StoryTimelineEdit;
  /** Null when creating. */
  lane: StoryTimelineLane | null;
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(lane?.name ?? "");
    setColor(lane?.color ?? CODEX_COLORS[0]);
    setError(null);
  }, [lane, visible]);

  const trimmed = name.trim();

  const save = async () => {
    const ok = await edit.saveLane({
      color,
      id: lane?.id ?? null,
      name: trimmed,
      ordinal: lane?.ordinal ?? 0,
    });
    if (ok) onClose();
    else setError("Could not save that timeline. Please try again.");
  };

  const remove = () => {
    if (!lane?.id) return;
    const id = lane.id;
    confirmDelete(
      `Delete ${lane.name}?`,
      "Its chapters go back to the unplaced shelf.",
      () => {
        onClose();
        void edit.deleteLane(id).then((ok) => {
          if (!ok) Alert.alert("Not deleted", "Please try again.");
        });
      },
    );
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(trimmed)}
      error={error}
      fill
      onClose={onClose}
      onConfirm={() => void save()}
      title={lane ? "Edit timeline" : "New timeline"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel>Name</FieldLabel>
        <TextInput
          accessibilityLabel="Name"
          maxLength={60}
          onChangeText={setName}
          placeholder="Kael · the drowned coast"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />
        <FieldLabel>Colour</FieldLabel>
        <Swatches onChange={setColor} value={color} />
        <Hint>
          A timeline is a thread of the story: a POV character, a plotline, a
          faction. It runs as one line across the board, and its chapters branch
          off it.
        </Hint>
        {lane ? <DangerRow label="Delete timeline" onPress={remove} /> : null}
      </ScrollView>
    </FormSheet>
  );
};

export const MarkerSheet = ({
  edit,
  marker,
  onClose,
  visible,
}: {
  edit: StoryTimelineEdit;
  /** Null when creating. */
  marker: StoryTimelineMarker | null;
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [label, setLabel] = useState("");
  const [where, setWhere] = useState(50);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLabel(marker?.label ?? "");
    setWhere(marker?.position ?? 50);
    setError(null);
  }, [marker, visible]);

  const trimmed = label.trim();

  const save = async () => {
    const ok = await edit.saveMarker({
      id: marker?.id ?? null,
      label: trimmed,
      ordinal: marker?.ordinal ?? 0,
      position: where,
    });
    if (ok) onClose();
    else setError("Could not save that marker. Please try again.");
  };

  const remove = () => {
    if (!marker?.id) return;
    const id = marker.id;
    confirmDelete(
      `Delete ${marker.label}?`,
      "Chapters stay where they are.",
      () => {
        onClose();
        void edit.deleteMarker(id).then((ok) => {
          if (!ok) Alert.alert("Not deleted", "Please try again.");
        });
      },
    );
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(trimmed)}
      error={error}
      fill
      onClose={onClose}
      onConfirm={() => void save()}
      title={marker ? "Edit marker" : "New marker"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel>Label</FieldLabel>
        <TextInput
          accessibilityLabel="Label"
          maxLength={80}
          onChangeText={setLabel}
          placeholder="The Drowning"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={label}
        />
        <Slider
          format={position}
          label="Position on the axis"
          max={100}
          min={0}
          onChange={setWhere}
          step={0.5}
          value={where}
        />
        <Hint>
          The axis is story time, not real dates: 0 is the earliest thing that
          happens, 100 the latest. Markers name the points that matter.
        </Hint>
        {marker ? <DangerRow label="Delete marker" onPress={remove} /> : null}
      </ScrollView>
    </FormSheet>
  );
};

/** The timelines in order, and the markers. Moving restages; the tick saves. */
export const TimelinesManager = ({
  edit,
  lanes,
  markers,
  onClose,
  onEditLane,
  onEditMarker,
  visible,
}: {
  edit: StoryTimelineEdit;
  lanes: StoryTimelineLane[];
  markers: StoryTimelineMarker[];
  onClose: () => void;
  onEditLane: (lane: StoryTimelineLane | null) => void;
  onEditMarker: (marker: StoryTimelineMarker | null) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [order, setOrder] = useState(lanes);

  useEffect(() => {
    if (visible) setOrder(lanes);
  }, [lanes, visible]);

  const dirty = order.some((lane, index) => lane.id !== lanes[index]?.id);

  const move = (index: number, by: -1 | 1) => {
    const to = index + by;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[index], next[to]] = [next[to], next[index]];
    setOrder(next);
  };

  const save = async () => {
    if (!dirty) {
      onClose();
      return;
    }
    const ok = await edit.reorderLanes(
      order.flatMap((lane) => (lane.id ? [lane.id] : [])),
    );
    if (ok) onClose();
    else Alert.alert("Not saved", "The new order was not saved. Try again.");
  };

  const rowStyle = [
    styles.row,
    { backgroundColor: theme.material.fill, borderColor: theme.material.edge },
  ];

  return (
    <FormSheet
      busy={edit.pending}
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      onConfirm={() => void save()}
      title="Timelines"
      visible={visible}
    >
      <ScrollView contentContainerStyle={styles.list}>
        {order.map((lane, index) => (
          <View key={lane.id} style={rowStyle}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: asColor(lane.color) ?? theme.accent.solid,
                },
              ]}
            />
            <Pressable
              accessibilityLabel={`Edit ${lane.name}`}
              accessibilityRole="button"
              onPress={() => onEditLane(lane)}
              style={styles.rowName}
            >
              <Text
                numberOfLines={1}
                style={[styles.rowLabel, { color: theme.text }]}
              >
                {lane.name}
              </Text>
            </Pressable>
            <IconButton
              accessibilityLabel={`Move ${lane.name} up`}
              disabled={index === 0}
              icon="chevron-up"
              onPress={() => move(index, -1)}
              size={32}
            />
            <IconButton
              accessibilityLabel={`Move ${lane.name} down`}
              disabled={index === order.length - 1}
              icon="chevron-down"
              onPress={() => move(index, 1)}
              size={32}
            />
          </View>
        ))}
        <PillButton
          icon="add"
          label="New timeline"
          onPress={() => onEditLane(null)}
        />

        <FieldLabel>Markers</FieldLabel>
        {markers.length === 0 ? (
          <Hint>Markers name the moments the axis is measured from.</Hint>
        ) : null}
        {[...markers]
          .sort((a, b) => a.position - b.position)
          .map((marker) => (
            <Pressable
              accessibilityLabel={`Edit ${marker.label}`}
              accessibilityRole="button"
              key={marker.id}
              onPress={() => onEditMarker(marker)}
              style={rowStyle}
            >
              <Text
                numberOfLines={1}
                style={[styles.rowLabel, styles.grow, { color: theme.text }]}
              >
                {marker.label}
              </Text>
              <Text style={[styles.rowValue, { color: theme.textGray }]}>
                {position(marker.position)}
              </Text>
            </Pressable>
          ))}
        <PillButton
          icon="add"
          label="New marker"
          onPress={() => onEditMarker(null)}
        />
      </ScrollView>
    </FormSheet>
  );
};

/** A chapter's place — web's `BlockSheet`, which on a phone is the edit path. */
export const PlacementSheet = ({
  chrono,
  edit,
  event,
  lanes,
  onClose,
  reading,
  visible,
}: {
  /** 1-based position in story-time order; null while unplaced. */
  chrono: number | null;
  edit: StoryTimelineEdit;
  event: StoryBoardEvent | null;
  lanes: StoryTimelineLane[];
  onClose: () => void;
  /** 1-based position in reading order. */
  reading: number;
  visible: boolean;
}) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(DEFAULT_SPAN);
  const [laneId, setLaneId] = useState<string | null>(null);
  const [isFlashback, setIsFlashback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !event) return;
    const placed = event.timelineStart != null && event.timelineEnd != null;
    setStart(placed ? (event.timelineStart as number) : 0);
    setEnd(placed ? (event.timelineEnd as number) : DEFAULT_SPAN);
    setLaneId(event.timelineLaneId ?? lanes[0]?.id ?? null);
    setIsFlashback(Boolean(event.isFlashback));
    setError(null);
  }, [event, lanes, visible]);

  const place = async () => {
    if (!event?.id) return;
    const ok = await edit.placeChapter(event.id, {
      end: Math.max(start, end),
      isFlashback,
      laneId,
      start: Math.min(start, end),
    });
    if (ok) onClose();
    else setError("Could not move that chapter. Please try again.");
  };

  const unplace = async () => {
    if (!event?.id) return;
    const ok = await edit.placeChapter(event.id, null);
    if (ok) onClose();
    else setError("Could not move that chapter. Please try again.");
  };

  const outOfOrder = chrono !== null && chrono !== reading;

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(laneId)}
      error={error}
      fill
      maxHeightRatio={0.8}
      onClose={onClose}
      onConfirm={() => void place()}
      title={event?.name ?? "Chapter"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        <Hint>
          {chrono !== null
            ? `Reads ${reading} · happens ${chrono}`
            : `Reads ${reading} · not placed on the timeline yet`}
        </Hint>
        {outOfOrder ? (
          <Hint>
            This chapter is read out of story order. Flag it as a flashback so
            readers see it that way.
          </Hint>
        ) : null}
        <Slider
          format={position}
          label="Starts at"
          max={100}
          min={0}
          onChange={setStart}
          step={0.5}
          value={start}
        />
        <Slider
          format={position}
          label="Ends at"
          max={100}
          min={0}
          onChange={setEnd}
          step={0.5}
          value={end}
        />
        <FieldLabel>Timeline</FieldLabel>
        {lanes.length === 0 ? (
          <Hint>Add a timeline first: chapters branch off one.</Hint>
        ) : (
          <View style={styles.choices}>
            {lanes.map((lane) => (
              <Choice
                active={laneId === lane.id}
                color={asColor(lane.color) ?? undefined}
                key={lane.id}
                label={lane.name}
                onPress={() => setLaneId(lane.id)}
              />
            ))}
          </View>
        )}
        <View style={styles.choices}>
          <Choice
            active={isFlashback}
            label="Flashback: reads later than it happens"
            onPress={() => setIsFlashback((current) => !current)}
          />
        </View>
        {event?.timelineStart != null ? (
          <DangerRow
            label="Remove from the timeline"
            onPress={() => void unplace()}
          />
        ) : null}
      </ScrollView>
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  choices: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  dot: { borderRadius: 6, height: 12, width: 12 },
  grow: { flex: 1 },
  list: { gap: space.sm, paddingBottom: space.xl },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 48,
    padding: space.sm,
  },
  rowLabel: { fontSize: fontSize.body, fontWeight: "600" },
  rowName: { flex: 1, minWidth: 0 },
  rowValue: { fontSize: fontSize.caption },
});
