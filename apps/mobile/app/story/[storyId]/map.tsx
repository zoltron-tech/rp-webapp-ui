import { Ionicons } from "@expo/vector-icons";
import type { CodexEntry, StoryMapPin } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { Image } from "@/components/image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { MapSkeleton } from "@/components/sheet-skeletons";
import { ChapterChips } from "@/components/story/chapter-chips";
import { EntryGlyph, EntrySheet } from "@/components/story/entry-sheet";
import { useStory, useStoryCodex, useStoryMaps } from "@/hooks/use-story";
import { asColor } from "@/lib/color";
import { plainText } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

/**
 * The map — web's `StoryMapView`, read-only.
 *
 * The authors' map image, fitted to the stage, with its pins on top. Pinch to
 * zoom about the fingers, drag to pan, or use the buttons. Pin coordinates are
 * percentages of the image, so they land in the same place at any size; each
 * pin is counter-scaled so it stays the same size on screen while the map
 * grows under it.
 *
 * Tapping a pin opens its card over the foot of the stage: the codex entry it
 * points at, a preview, and the chapters it is used in — or, for a plain
 * marker, just its label.
 */

const MAX_ZOOM = 6;
/** A pin's touchable box, centred on its coordinate. */
const ANCHOR_WIDTH = 360;
const ANCHOR_HEIGHT = 48;
const TAP_SLOP = 5;

type Pose = { s: number; tx: number; ty: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function MapScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  const story = useStory(storyId);
  const maps = useStoryMaps(storyId);
  const codex = useStoryCodex(storyId);

  const sorted = useMemo(
    () => [...(maps.data?.maps ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [maps.data?.maps],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sorted.find((map) => map.id === activeId) ?? sorted[0] ?? null;
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [readEntry, setReadEntry] = useState<CodexEntry | null>(null);

  const entriesById = useMemo(
    () => new Map((codex.data?.entries ?? []).map((entry) => [entry.id, entry])),
    [codex.data?.entries],
  );
  const chapters = useMemo(
    () =>
      [...(story.data?.events ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [story.data?.events],
  );

  const nameOf = (pin: StoryMapPin) =>
    (pin.codexEntryId ? entriesById.get(pin.codexEntryId)?.name : null) ??
    pin.label ??
    "Untitled pin";

  // ── Stage geometry and the pose ─────────────────────────────────────────
  const [stage, setStage] = useState({ h: 0, w: 0 });
  const [natural, setNatural] = useState<{ h: number; w: number } | null>(null);
  const geometry = useRef({ ch: 0, cw: 0, h: 0, w: 0 });
  const stageOrigin = useRef({ x: 0, y: 0 });
  const stageRef = useRef<View>(null);

  const scale = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const inverse = useRef(Animated.divide(1, scale)).current;
  const pose = useRef<Pose>({ s: 1, tx: 0, ty: 0 });

  const fit =
    natural && stage.w && stage.h
      ? Math.min(stage.w / natural.w, stage.h / natural.h)
      : 0;
  const cw = natural ? natural.w * fit : 0;
  const ch = natural ? natural.h * fit : 0;
  geometry.current = { ch, cw, h: stage.h, w: stage.w };

  const legal = (raw: Pose): Pose => {
    const s = clamp(raw.s, 1, MAX_ZOOM);
    const { ch: h0, cw: w0, h, w } = geometry.current;
    const bx = Math.max(0, (w0 * s - w) / 2);
    const by = Math.max(0, (h0 * s - h) / 2);
    return { s, tx: clamp(raw.tx, -bx, bx), ty: clamp(raw.ty, -by, by) };
  };

  const draw = (next: Pose) => {
    pose.current = next;
    scale.setValue(next.s);
    panX.setValue(next.tx);
    panY.setValue(next.ty);
  };

  const settle = (next: Pose) => {
    const target = legal(next);
    pose.current = target;
    const spec = { bounciness: 0, speed: 18, useNativeDriver: true };
    Animated.parallel([
      Animated.spring(scale, { ...spec, toValue: target.s }),
      Animated.spring(panX, { ...spec, toValue: target.tx }),
      Animated.spring(panY, { ...spec, toValue: target.ty }),
    ]).start();
  };

  /** Zoom about a point given relative to the stage's centre. */
  const zoomAbout = (focal: { x: number; y: number }, from: Pose, s: number) => {
    const k = s / from.s;
    return {
      s,
      tx: focal.x - (focal.x - from.tx) * k,
      ty: focal.y - (focal.y - from.ty) * k,
    };
  };

  // A new map, or a new stage size, starts fitted.
  useEffect(() => {
    draw({ s: 1, tx: 0, ty: 0 });
    setSelectedPinId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, stage.w, stage.h]);

  useEffect(() => setNatural(null), [active?.image]);

  const gesture = useRef<{
    last: { x: number; y: number } | null;
    pinch: { d: number; mid: { x: number; y: number } } | null;
  }>({ last: null, pinch: null });

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (event, g) =>
        event.nativeEvent.touches.length >= 2 ||
        Math.hypot(g.dx, g.dy) > TAP_SLOP,
      onMoveShouldSetPanResponderCapture: (event, g) =>
        event.nativeEvent.touches.length >= 2 ||
        Math.hypot(g.dx, g.dy) > TAP_SLOP,
      onPanResponderGrant: () => {
        scale.stopAnimation();
        panX.stopAnimation();
        panY.stopAnimation();
        gesture.current = { last: null, pinch: null };
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const { h, w } = geometry.current;
        const fromCentre = (pageX: number, pageY: number) => ({
          x: pageX - stageOrigin.current.x - w / 2,
          y: pageY - stageOrigin.current.y - h / 2,
        });

        if (touches.length >= 2) {
          const [a, b] = touches;
          const d = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
          const mid = fromCentre((a.pageX + b.pageX) / 2, (a.pageY + b.pageY) / 2);
          const previous = gesture.current.pinch;
          gesture.current.last = null;
          gesture.current.pinch = { d, mid };
          if (!previous || previous.d === 0) return;
          const s = clamp(pose.current.s * (d / previous.d), 0.8, MAX_ZOOM * 1.2);
          const next = zoomAbout(mid, pose.current, s);
          next.tx += mid.x - previous.mid.x;
          next.ty += mid.y - previous.mid.y;
          draw(next);
          return;
        }

        const touch = touches[0];
        if (!touch) return;
        gesture.current.pinch = null;
        const previous = gesture.current.last;
        gesture.current.last = { x: touch.pageX, y: touch.pageY };
        if (!previous) return;
        draw({
          s: pose.current.s,
          tx: pose.current.tx + touch.pageX - previous.x,
          ty: pose.current.ty + touch.pageY - previous.y,
        });
      },
      onPanResponderRelease: () => settle(pose.current),
      onPanResponderTerminate: () => settle(pose.current),
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setStage({ h: height, w: width });
    stageRef.current?.measureInWindow((x, y) => {
      stageOrigin.current = { x, y };
    });
  };

  const zoomBy = (factor: number) =>
    settle(zoomAbout({ x: 0, y: 0 }, pose.current, pose.current.s * factor));

  if (!maps.data) {
    return (
      <View style={styles.fill}>
        <ListStatus
          error={maps.error}
          loading={maps.isPending}
          onRetry={() => void maps.refetch()}
          skeleton={<MapSkeleton />}
        />
      </View>
    );
  }

  if (!active) {
    return (
      <View style={[styles.fill, styles.empty]}>
        <Ionicons color={theme.textGray} name="map-outline" size={36} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No maps yet</Text>
        <Text style={[styles.emptyText, { color: theme.textGray }]}>
          This story's authors haven't drawn its world yet.
        </Text>
      </View>
    );
  }

  const selectedPin = active.pins.find((pin) => pin.id === selectedPinId) ?? null;
  const selectedEntry = selectedPin?.codexEntryId
    ? (entriesById.get(selectedPin.codexEntryId) ?? null)
    : null;
  const source = active.image
    ? wsrvImage(active.image, { fit: "inside", h: 2400, w: 2400 })
    : null;

  return (
    <View style={styles.fill}>
      {sorted.length > 1 ? (
        <ScrollView
          contentContainerStyle={styles.tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsBar}
        >
          {sorted.map((map) => {
            const selected = map.id === active.id;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={map.id}
                onPress={() => setActiveId(map.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: selected ? theme.accent.solid : theme.material.fill,
                    borderColor: selected ? theme.accent.solid : theme.material.edge,
                  },
                ]}
              >
                <Text style={[styles.tabLabel, { color: selected ? "#fff" : theme.text }]}>
                  {map.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View
        {...responder.panHandlers}
        onLayout={onStageLayout}
        ref={stageRef}
        style={[styles.stage, { backgroundColor: theme.material.fill }]}
      >
        {source ? (
          <Animated.View
            style={[
              styles.content,
              {
                height: ch || 1,
                left: (stage.w - cw) / 2,
                opacity: natural ? 1 : 0,
                top: (stage.h - ch) / 2,
                transform: [{ translateX: panX }, { translateY: panY }, { scale }],
                width: cw || 1,
              },
            ]}
          >
            <Image
              accessibilityLabel={active.name}
              cachePolicy="memory-disk"
              contentFit="fill"
              onLoad={({ source: loaded }) => {
                if (loaded?.width && loaded?.height) {
                  setNatural({ h: loaded.height, w: loaded.width });
                }
              }}
              source={{ uri: source }}
              style={StyleSheet.absoluteFill}
              transition={0}
            />
            {natural
              ? active.pins.map((pin) => {
                  const entry = pin.codexEntryId
                    ? entriesById.get(pin.codexEntryId)
                    : undefined;
                  const color = asColor(entry?.color) ?? theme.accent.solid;
                  const selected = pin.id === selectedPinId;
                  return (
                    <Animated.View
                      key={pin.id}
                      pointerEvents="box-none"
                      style={[
                        styles.anchor,
                        {
                          // Centred on the coordinate, so the counter-scale
                          // (which is about the centre) keeps the dot on it.
                          // Sized rather than zero-size: Android only
                          // delivers a touch inside its parent's bounds.
                          left: (pin.x / 100) * cw - ANCHOR_WIDTH / 2,
                          top: (pin.y / 100) * ch - ANCHOR_HEIGHT / 2,
                          transform: [{ scale: inverse }],
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityLabel={nameOf(pin)}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() =>
                          setSelectedPinId((current) =>
                            current === pin.id ? null : pin.id,
                          )
                        }
                        style={[
                          styles.pin,
                          {
                            backgroundColor: selected ? color : theme.material.fill,
                            borderColor: color,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.pinDot,
                            { backgroundColor: selected ? "#fff" : color },
                          ]}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.pinLabel,
                            { color: selected ? "#fff" : theme.text },
                          ]}
                        >
                          {nameOf(pin)}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })
              : null}
          </Animated.View>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textGray }]}>
              This map has no image.
            </Text>
          </View>
        )}

        <View style={styles.controls}>
          {[
            { icon: "add" as const, label: "Zoom in", onPress: () => zoomBy(1.5) },
            { icon: "remove" as const, label: "Zoom out", onPress: () => zoomBy(1 / 1.5) },
            { icon: "scan-outline" as const, label: "Fit the map", onPress: () => settle({ s: 1, tx: 0, ty: 0 }) },
          ].map((control) => (
            <IconButton
              accessibilityLabel={control.label}
              icon={control.icon}
              key={control.label}
              onPress={control.onPress}
              size={36}
              tone="surface"
            />
          ))}
        </View>

        {selectedPin ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
                bottom: space.m,
              },
            ]}
          >
            <View style={styles.cardHead}>
              {selectedEntry ? (
                <EntryGlyph entry={selectedEntry} size={36} />
              ) : (
                <Ionicons color={theme.accent.text} name="location" size={24} />
              )}
              <View style={styles.cardText}>
                <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>
                  {nameOf(selectedPin)}
                </Text>
                {selectedEntry ? (
                  <Text style={[styles.cardCategory, { color: theme.textGray }]}>
                    {codex.data?.categories.find(
                      (category) => category.id === selectedEntry.categoryId,
                    )?.name ?? "Codex"}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityLabel="Close"
                hitSlop={8}
                onPress={() => setSelectedPinId(null)}
              >
                <Ionicons color={theme.textGray} name="close" size={20} />
              </Pressable>
            </View>
            <Text numberOfLines={3} style={[styles.cardBody, { color: theme.textGray }]}>
              {selectedEntry
                ? plainText(selectedEntry.description) || "No description yet."
                : "A plain marker on the map."}
            </Text>
            {selectedEntry ? (
              <>
                <ChapterChips
                  chapters={chapters.filter(
                    (chapter) =>
                      chapter.id && selectedEntry.chapterIds.includes(chapter.id),
                  )}
                  label="Used in"
                  onOpen={(eventId) =>
                    router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" })
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReadEntry(selectedEntry)}
                  style={styles.readMore}
                >
                  <Text style={[styles.readMoreLabel, { color: theme.accent.text }]}>
                    Read entry
                  </Text>
                  <Ionicons color={theme.accent.text} name="arrow-forward" size={14} />
                </Pressable>
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.hint,
          { color: theme.textGray, paddingBottom: insets.bottom + space.sm },
        ]}
      >
        Pinch to zoom · drag to pan · tap a pin
      </Text>

      <EntrySheet
        categoryName={
          codex.data?.categories.find((category) => category.id === readEntry?.categoryId)
            ?.name
        }
        chapters={chapters}
        entry={readEntry}
        onClose={() => setReadEntry(null)}
        onOpenChapter={(eventId) => {
          setReadEntry(null);
          router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { height: ANCHOR_HEIGHT, position: "absolute", width: ANCHOR_WIDTH },
  card: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    left: space.m,
    padding: space.md,
    position: "absolute",
    right: space.m,
  },
  cardBody: { fontSize: fontSize.label, lineHeight: 19, marginTop: space.sm },
  cardCategory: { fontSize: fontSize.caption, textTransform: "uppercase" },
  cardHead: { alignItems: "center", flexDirection: "row", gap: space.ms },
  cardName: { fontSize: fontSize.body, fontWeight: "700" },
  cardText: { flex: 1, minWidth: 0 },
  content: { position: "absolute" },
  controls: { gap: space.sm, position: "absolute", right: space.m, top: space.m },
  empty: { alignItems: "center", flex: 1, gap: space.sm, justifyContent: "center", padding: space.xl },
  emptyText: { fontSize: fontSize.body, textAlign: "center" },
  emptyTitle: { fontSize: fontSize.title, fontWeight: "700" },
  fill: { flex: 1 },
  hint: { fontSize: fontSize.caption, paddingTop: space.sm, textAlign: "center" },
  pin: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 5,
    left: ANCHOR_WIDTH / 2 - 8,
    maxWidth: ANCHOR_WIDTH / 2,
    paddingLeft: space.xs,
    paddingRight: 9,
    paddingVertical: 3,
    position: "absolute",
    top: ANCHOR_HEIGHT / 2 - 12,
  },
  pinDot: { borderRadius: radius.xs, height: 8, width: 8 },
  pinLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  readMore: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: space.xs,
    marginTop: space.ms,
  },
  readMoreLabel: { fontSize: fontSize.label, fontWeight: "700" },
  stage: {
    borderRadius: radius.md + 4,
    flex: 1,
    marginHorizontal: space.m,
    marginTop: space.sm,
    overflow: "hidden",
  },
  tab: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: space.m,
    paddingVertical: 7,
  },
  tabLabel: { fontSize: fontSize.label, fontWeight: "600" },
  tabs: { gap: space.sm, paddingHorizontal: space.m, paddingVertical: space.sm },
  tabsBar: { flexGrow: 0 },
});
