import type { CodexGroup, CodexRelationship, CodexTone } from "@nw/types";
import { wsrvImage } from "@nw/utils/image";
import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import Svg, {
  Circle,
  ClipPath,
  G,
  Path,
  Image as SvgImage,
  Text as SvgText,
} from "react-native-svg";
import { IconButton } from "@/components/icon-button";
import type { StoryFace } from "@/components/story/character-sheet";
import { asColor, withAlpha } from "@/lib/color";
import { speakerAvatarUrl } from "@/lib/story";
import {
  buildEdges,
  buildTonePalette,
  collarArc,
  createSimulation,
  edgeDistance,
  groupField,
  nodeKey,
  relationshipEnds,
  resolveTone,
  type SimNode,
  strengthWidth,
} from "@/lib/story-mesh";
import { radius, space, useAppTheme } from "@/theme";

/**
 * The relationship mesh: web's `mesh.tsx`, drawn with `react-native-svg`.
 *
 * The same simulation and edge geometry (`lib/story-mesh`), so a story
 * opens to the same shape as on web. What differs is the hand: there is no
 * hover, so a tap on a character focuses them (they and their neighbours
 * stay lit, the rest dims); a drag pans; two fingers zoom; a tap on an edge
 * opens it.
 *
 * ## Still, by design
 *
 * Web lets a character be dragged, with the springs easing the others along.
 * Here the layout is settled once, off-screen, and then left alone.
 * `react-native-svg` repaints a whole `<Svg>` for any change in it, and on a
 * phone a board of discs, clipped portraits and haloed text is a slow
 * paint — a hundred milliseconds a frame on the Pixel 7 image, and still
 * thirty with the moving piece split onto its own surface and driven
 * natively. A graph that stutters under the finger is worse than one that
 * holds still, so the mesh is a picture to read and pan, not a thing to
 * rearrange. The simulation is deterministic, so it is the same picture
 * every time.
 *
 * ## One responder
 *
 * It claims the touch at the start — a `Pressable` under the finger would
 * own it otherwise — and finds the character or edge under a tap by
 * geometry. It is rebuilt whenever the layout, board or palette change, so
 * it never holds a stale one.
 */

/** The board is the stage seen at this zoom. 1: nothing can leave view. */
const OPEN_ZOOM = 1;
const MAX_ZOOM = 3.5;
const TAP_SLOP = 4;
const DIM = 0.16;
const LABEL_LIMIT = 40;
const COLLAR_MAX = 14;

type Pose = { s: number; tx: number; ty: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export interface RelationshipMeshProps {
  faces: readonly StoryFace[];
  relationships: readonly CodexRelationship[];
  tones: readonly CodexTone[];
  groups: readonly CodexGroup[];
  /** Tone keys whose edges are not drawn. They still shape the layout. */
  hiddenTones: ReadonlySet<string>;
  /** Group ids whose fields are not drawn. */
  hiddenGroups: ReadonlySet<string>;
  /** The focused character's key, or null. */
  focused: string | null;
  onFocus: (key: string | null) => void;
  onEdgePress: (relationship: CodexRelationship) => void;
}

/** The look the glyphs share, settled once per theme. */
interface Paint {
  accent: string;
  disc: string;
  halo: string;
  ink: string;
  ringFallback: string;
}

export const RelationshipMesh = ({
  faces,
  focused,
  groups,
  hiddenGroups,
  hiddenTones,
  onEdgePress,
  onFocus,
  relationships,
  tones,
}: RelationshipMeshProps) => {
  const theme = useAppTheme();
  const light = theme.name === "light";
  const palette = useMemo(() => buildTonePalette(tones, light), [tones, light]);
  const paint = useMemo<Paint>(
    () => ({
      accent: theme.accent.solid,
      disc: light ? "#dcd8cf" : "#2d2d36",
      halo: light ? "#ffffff" : "#15151a",
      ink: theme.text,
      ringFallback: light ? "#ffffff" : "#2a2a33",
    }),
    [light, theme.accent.solid, theme.text],
  );
  const boardFill = light ? "#f6f4ef" : "#1b1b21";

  // Only relationships whose both ends are on the board are drawn or simulated.
  const faceKeys = useMemo(
    () => new Set(faces.map((face) => nodeKey(face.id, face.refType))),
    [faces],
  );
  const drawable = useMemo(
    () =>
      relationships.filter((relationship) => {
        const ends = relationshipEnds(relationship);
        return faceKeys.has(ends.from) && faceKeys.has(ends.to);
      }),
    [faceKeys, relationships],
  );

  // ── Stage and board ─────────────────────────────────────────────────────
  const [stage, setStage] = useState({ h: 0, w: 0 });
  const board = useMemo(
    () =>
      stage.w && stage.h
        ? { h: stage.h / OPEN_ZOOM, w: stage.w / OPEN_ZOOM }
        : { h: 620, w: 900 },
    [stage.h, stage.w],
  );

  // ── The layout, settled off-screen the moment its inputs change ─────────
  const nodes = useMemo(() => {
    const sim = createSimulation({
      cast: faces.map((face) => ({
        id: face.id,
        name: face.name,
        refType: face.refType,
      })),
      groups: groups
        .filter((group) => group.id)
        .map((group) => ({
          id: group.id as string,
          memberKeys: group.members.map((member) =>
            nodeKey(member.id, member.refType),
          ),
        })),
      height: board.h,
      relationships: drawable,
      width: board.w,
    });
    sim.settle();
    return sim.nodes;
  }, [board.h, board.w, drawable, faces, groups]);

  const edges = useMemo(() => buildEdges(nodes, drawable), [nodes, drawable]);
  const byKey = useMemo(
    () => new Map(nodes.map((node) => [node.key, node])),
    [nodes],
  );
  const relationshipByEdge = useMemo(() => {
    const map = new Map<string, CodexRelationship>();
    drawable.forEach((relationship, index) => {
      map.set(relationship.id ?? `edge-${index}`, relationship);
    });
    return map;
  }, [drawable]);

  // What each avatar is drawn from, once per cast: a fresh `href` object
  // every render makes react-native-svg reload the picture.
  const uriByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const face of faces) {
      const source =
        face.avatar?.src ??
        face.image ??
        speakerAvatarUrl(face.id, face.refType);
      if (!source) continue;
      map.set(
        nodeKey(face.id, face.refType),
        wsrvImage(source, { fit: "cover", h: 96, w: 96 }),
      );
    }
    return map;
  }, [faces]);
  const ringByKey = useMemo(
    () =>
      new Map(
        faces.map((face) => [
          nodeKey(face.id, face.refType),
          asColor(face.accent) ?? paint.ringFallback,
        ]),
      ),
    [faces, paint.ringFallback],
  );
  // Each character's collar as one string of tone colours, so a glyph whose
  // ties have not changed keeps its props by value.
  const collarByKey = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const relationship of drawable) {
      const ends = relationshipEnds(relationship);
      const color = resolveTone(relationship, palette, light).color;
      for (const key of [ends.from, ends.to]) {
        const list = map.get(key) ?? [];
        if (list.length < COLLAR_MAX) list.push(color);
        map.set(key, list);
      }
    }
    return new Map([...map].map(([key, list]) => [key, list.join(",")]));
  }, [drawable, light, palette]);

  // ── Pose: fit, pan, pinch ───────────────────────────────────────────────
  const geometry = useRef({ h: 0, w: 0 });
  const stageOrigin = useRef({ x: 0, y: 0 });
  const stageRef = useRef<View>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const pose = useRef<Pose>({ s: 1, tx: 0, ty: 0 });
  const fit = stage.w && stage.h ? OPEN_ZOOM : 0;
  geometry.current = stage;

  const legal = (raw: Pose): Pose => {
    const minimum = fit || 0.2;
    const s = clamp(raw.s, minimum, MAX_ZOOM);
    const { h, w } = geometry.current;
    const bx = Math.max(0, (board.w * s - w) / 2) + 40 * s;
    const by = Math.max(0, (board.h * s - h) / 2) + 40 * s;
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
  const zoomAbout = (
    focal: { x: number; y: number },
    from: Pose,
    s: number,
  ) => {
    const k = s / from.s;
    return {
      s,
      tx: focal.x - (focal.x - from.tx) * k,
      ty: focal.y - (focal.y - from.ty) * k,
    };
  };

  useLayoutEffect(() => {
    if (fit > 0) draw({ s: fit, tx: 0, ty: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit]);

  /** A stage point (from its centre) as a board point. */
  const toBoard = (x: number, y: number) => {
    const { s, tx, ty } = pose.current;
    return { x: (x - tx) / s + board.w / 2, y: (y - ty) / s + board.h / 2 };
  };

  // ── The one responder ───────────────────────────────────────────────────
  const gesture = useRef<{
    last: { x: number; y: number } | null;
    moved: boolean;
    origin: { x: number; y: number } | null;
    pinch: { d: number; mid: { x: number; y: number } } | null;
  }>({ last: null, moved: false, origin: null, pinch: null });

  // The responder reads the latest of these through refs.
  const hiddenTonesRef = useRef(hiddenTones);
  hiddenTonesRef.current = hiddenTones;
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;
  const onEdgePressRef = useRef(onEdgePress);
  onEdgePressRef.current = onEdgePress;

  const responder = useMemo(() => {
    /** A page point as a point on the board, through the current pose. */
    const boardPoint = (pageX: number, pageY: number) => {
      const { h, w } = geometry.current;
      return toBoard(
        pageX - stageOrigin.current.x - w / 2,
        pageY - stageOrigin.current.y - h / 2,
      );
    };

    const nodeAt = (x: number, y: number): SimNode | null => {
      let hit: SimNode | null = null;
      let best = Number.POSITIVE_INFINITY;
      for (const node of nodes) {
        const d = Math.hypot(node.x - x, node.y - y);
        // A little past the disc: the collar, and a thumb's imprecision.
        if (d <= node.radius + 8 && d < best) {
          best = d;
          hit = node;
        }
      }
      return hit;
    };

    const edgeAt = (x: number, y: number): CodexRelationship | null => {
      let hit: CodexRelationship | null = null;
      let best = 14 / Math.max(pose.current.s, 0.2);
      for (const edge of edges) {
        const relationship = relationshipByEdge.get(edge.id);
        if (!relationship) continue;
        const tone = resolveTone(relationship, palette, light);
        if (hiddenTonesRef.current.has(tone.key)) continue;
        const d = edgeDistance(edge, x, y);
        if (d < best) {
          best = d;
          hit = relationship;
        }
      }
      return hit;
    };

    const finish = () => {
      const { moved, origin } = gesture.current;
      if (!moved && origin) {
        // A tap: the character under it, else the edge, else nothing.
        const at = boardPoint(origin.x, origin.y);
        const node = nodeAt(at.x, at.y);
        if (node) {
          onFocusRef.current(node.key === focusedRef.current ? null : node.key);
        } else {
          const edge = edgeAt(at.x, at.y);
          if (edge) onEdgePressRef.current(edge);
          else onFocusRef.current(null);
        }
      } else {
        settle(pose.current);
      }
      gesture.current.origin = null;
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        scale.stopAnimation();
        panX.stopAnimation();
        panY.stopAnimation();
        // Where the stage is on the screen, from the touch itself: its
        // page point less its point within the view. Measuring at layout
        // answered mid-transition, while the screen was still sliding in.
        const { locationX, locationY, pageX, pageY } = event.nativeEvent;
        if (Number.isFinite(locationX) && Number.isFinite(locationY)) {
          stageOrigin.current = { x: pageX - locationX, y: pageY - locationY };
        }
        const touch = event.nativeEvent.touches[0] ?? event.nativeEvent;
        gesture.current = {
          last: null,
          moved: false,
          origin: { x: touch.pageX, y: touch.pageY },
          pinch: null,
        };
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const { h, w } = geometry.current;
        const fromCentre = (pageX: number, pageY: number) => ({
          x: pageX - stageOrigin.current.x - w / 2,
          y: pageY - stageOrigin.current.y - h / 2,
        });
        const origin = gesture.current.origin;
        const touch = touches[0];
        if (
          !gesture.current.moved &&
          origin &&
          touch &&
          touches.length < 2 &&
          Math.hypot(touch.pageX - origin.x, touch.pageY - origin.y) <= TAP_SLOP
        ) {
          return;
        }
        gesture.current.moved = true;

        if (touches.length >= 2) {
          const [a, b] = touches;
          const d = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
          const mid = fromCentre(
            (a.pageX + b.pageX) / 2,
            (a.pageY + b.pageY) / 2,
          );
          const previous = gesture.current.pinch;
          gesture.current.last = null;
          gesture.current.pinch = { d, mid };
          if (!previous || previous.d === 0) return;
          const s = clamp(
            pose.current.s * (d / previous.d),
            (fit || 0.2) * 0.8,
            MAX_ZOOM * 1.2,
          );
          const next = zoomAbout(mid, pose.current, s);
          next.tx += mid.x - previous.mid.x;
          next.ty += mid.y - previous.mid.y;
          draw(next);
          return;
        }

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
      onPanResponderRelease: () => finish(),
      onPanResponderTerminate: () => finish(),
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.h, board.w, edges, fit, light, nodes, palette, relationshipByEdge]);

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setStage({ h: height, w: width });
    stageRef.current?.measureInWindow((x, y) => {
      stageOrigin.current = { x, y };
    });
  };

  const zoomBy = (factor: number) =>
    settle(zoomAbout({ x: 0, y: 0 }, pose.current, pose.current.s * factor));

  // ── What is lit ─────────────────────────────────────────────────────────
  const neighbours = useMemo(() => {
    if (!focused) return null;
    const set = new Set<string>([focused]);
    for (const edge of edges) {
      if (edge.from === focused) set.add(edge.to);
      if (edge.to === focused) set.add(edge.from);
    }
    return set;
  }, [edges, focused]);

  const showLabels = edges.length <= LABEL_LIMIT;

  return (
    <View style={styles.wrap}>
      <View
        accessibilityLabel="Relationship mesh"
        onLayout={onStageLayout}
        ref={stageRef}
        style={[styles.stage, { backgroundColor: boardFill }]}
        {...responder.panHandlers}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.board,
            {
              height: board.h,
              left: (stage.w - board.w) / 2,
              top: (stage.h - board.h) / 2,
              transform: [
                { translateX: panX },
                { translateY: panY },
                { scale },
              ],
              width: board.w,
            },
          ]}
        >
          <Svg height={board.h} width={board.w}>
            {groups.map((group) => {
              if (!group.id || hiddenGroups.has(group.id)) return null;
              const members = group.members
                .map((member) => byKey.get(nodeKey(member.id, member.refType)))
                .filter((node): node is SimNode => Boolean(node));
              const path = groupField(members, 18);
              if (!path) return null;
              return (
                <GroupGlyph
                  color={asColor(group.color) ?? paint.accent}
                  dim={focused !== null}
                  key={group.id}
                  labelX={
                    members.reduce((sum, m) => sum + m.x, 0) / members.length
                  }
                  labelY={Math.min(...members.map((m) => m.y - m.radius)) - 26}
                  name={group.name}
                  path={path}
                />
              );
            })}

            {edges.map((edge) => {
              const relationship = relationshipByEdge.get(edge.id);
              if (!relationship) return null;
              const tone = resolveTone(relationship, palette, light);
              if (hiddenTones.has(tone.key)) return null;
              const lit =
                !focused || edge.from === focused || edge.to === focused;
              return (
                <EdgeGlyph
                  color={tone.color}
                  dash={tone.dash}
                  directed={relationship.isDirected}
                  halo={paint.halo}
                  ink={paint.ink}
                  key={edge.id}
                  label={relationship.label}
                  labelAngle={edge.labelAngle}
                  labelX={edge.labelX}
                  labelY={edge.labelY}
                  lit={lit}
                  path={edge.path}
                  showLabel={showLabels || lit}
                  tipAngle={edge.tipAngle}
                  tipX={edge.tipX}
                  tipY={edge.tipY}
                  width={strengthWidth(relationship.strength)}
                />
              );
            })}

            {nodes.map((node) => (
              <NodeGlyph
                accent={paint.accent}
                collar={collarByKey.get(node.key) ?? ""}
                degree={node.degree}
                disc={paint.disc}
                focused={node.key === focused}
                halo={paint.halo}
                ink={paint.ink}
                key={node.key}
                lit={!neighbours || neighbours.has(node.key)}
                name={node.name}
                nodeKey={node.key}
                radius={node.radius}
                ring={ringByKey.get(node.key) ?? paint.ringFallback}
                uri={uriByKey.get(node.key) ?? null}
                x={node.x}
                y={node.y}
              />
            ))}
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.zoom}>
        <IconButton
          accessibilityLabel="Zoom in"
          icon="add"
          onPress={() => zoomBy(1.3)}
          size={30}
        />
        <IconButton
          accessibilityLabel="Zoom out"
          icon="remove"
          onPress={() => zoomBy(1 / 1.3)}
          size={30}
        />
        <IconButton
          accessibilityLabel="Reset view"
          icon="scan-outline"
          onPress={() => settle({ s: fit || 1, tx: 0, ty: 0 })}
          size={30}
        />
      </View>
    </View>
  );
};

/** What the hand can do here, said once under the board. */
export const MESH_HINT =
  "Tap a character to light up their ties, tap an edge to read it. Drag to pan, pinch to zoom.";

// ─── Glyphs ─────────────────────────────────────────────────────────────────

/*
 * Memoised, with primitive props: a focus change re-renders the board, and
 * only the glyphs whose values changed are painted again. The avatar's
 * `href` is a stable object per URL, or react-native-svg reloads the
 * picture each time.
 */

const GroupGlyph = memo(function GroupGlyph({
  color,
  dim,
  labelX,
  labelY,
  name,
  path,
}: {
  color: string;
  dim: boolean;
  labelX: number;
  labelY: number;
  name: string;
  path: string;
}) {
  return (
    <G opacity={dim ? 0.55 : 1}>
      <Path d={path} fill={color} fillOpacity={0.22} />
      <Path
        d={path}
        fill="none"
        stroke={color}
        strokeOpacity={0.42}
        strokeWidth={1.6}
      />
      <SvgText
        fill={color}
        fontSize={11}
        fontWeight="700"
        textAnchor="middle"
        x={labelX}
        y={labelY}
      >
        {name}
      </SvgText>
    </G>
  );
});

const EdgeGlyph = memo(function EdgeGlyph({
  color,
  dash,
  directed,
  halo,
  ink,
  label,
  labelAngle,
  labelX,
  labelY,
  lit,
  path,
  showLabel,
  tipAngle,
  tipX,
  tipY,
  width,
}: {
  color: string;
  dash?: string;
  directed: boolean;
  halo: string;
  ink: string;
  label: string;
  labelAngle: number;
  labelX: number;
  labelY: number;
  lit: boolean;
  path: string;
  showLabel: boolean;
  tipAngle: number;
  tipX: number;
  tipY: number;
  width: number;
}) {
  const labelTransform = `translate(${labelX} ${labelY - 5}) rotate(${labelAngle})`;
  return (
    <G opacity={lit ? 1 : DIM}>
      <Path d={path} fill="none" stroke={halo} strokeWidth={width + 5} />
      <Path
        d={path}
        fill="none"
        stroke={color}
        strokeDasharray={dash}
        strokeLinecap="round"
        strokeWidth={width}
      />
      {directed ? (
        <Path
          d="M -9 -5 L 0 0 L -9 5 Z"
          fill={color}
          transform={`translate(${tipX} ${tipY}) rotate(${tipAngle})`}
        />
      ) : null}
      {showLabel ? (
        <>
          <SvgText
            fill={ink}
            fontSize={10}
            fontWeight="600"
            stroke={halo}
            strokeWidth={3}
            textAnchor="middle"
            transform={labelTransform}
          >
            {label}
          </SvgText>
          <SvgText
            fill={ink}
            fontSize={10}
            fontWeight="600"
            textAnchor="middle"
            transform={labelTransform}
          >
            {label}
          </SvgText>
        </>
      ) : null}
    </G>
  );
});

const NodeGlyph = memo(function NodeGlyph({
  accent,
  collar,
  degree,
  disc,
  focused,
  halo,
  ink,
  lit,
  name,
  nodeKey: key,
  radius,
  ring,
  uri,
  x,
  y,
}: {
  accent: string;
  /** Tone colours, comma-joined, one per relationship. */
  collar: string;
  degree: number;
  disc: string;
  focused: boolean;
  halo: string;
  ink: string;
  lit: boolean;
  name: string;
  nodeKey: string;
  radius: number;
  ring: string;
  uri: string | null;
  x: number;
  y: number;
}) {
  const href = useMemo(() => (uri ? { uri } : null), [uri]);
  const colors = collar ? collar.split(",") : [];
  const gap = 0.12;
  const span = colors.length > 0 ? (Math.PI * 2) / colors.length : 0;
  const clipId = `clip-${key}`;
  const labelY = y + radius + 16;
  return (
    <G opacity={lit ? 1 : DIM}>
      <ClipPath id={clipId}>
        <Circle cx={x} cy={y} r={radius - 1.5} />
      </ClipPath>
      {focused ? (
        <Circle cx={x} cy={y} fill={withAlpha(accent, 0.18)} r={radius + 12} />
      ) : null}
      {colors.map((color, index) => {
        const from = -Math.PI / 2 + index * span + gap / 2;
        return (
          <Path
            d={collarArc(x, y, radius + 5, from, from + span - gap)}
            fill="none"
            key={`${index}-${color}`}
            stroke={color}
            strokeLinecap="round"
            strokeWidth={2.5}
          />
        );
      })}
      <Circle cx={x} cy={y} fill={disc} r={radius} />
      <SvgText
        fill={ink}
        fontSize={radius * 0.9}
        fontWeight="700"
        textAnchor="middle"
        x={x}
        y={y + radius * 0.33}
      >
        {(name[0] ?? "?").toUpperCase()}
      </SvgText>
      {href ? (
        <SvgImage
          clipPath={`url(#${clipId})`}
          height={radius * 2}
          href={href}
          preserveAspectRatio="xMidYMid slice"
          width={radius * 2}
          x={x - radius}
          y={y - radius}
        />
      ) : null}
      <Circle
        cx={x}
        cy={y}
        fill="none"
        r={radius}
        stroke={focused ? accent : ring}
        strokeDasharray={degree === 0 ? "3 4" : undefined}
        strokeOpacity={degree === 0 ? 0.7 : 1}
        strokeWidth={focused ? 3 : 2}
      />
      <SvgText
        fill={ink}
        fontSize={11}
        fontWeight={focused ? "700" : "600"}
        stroke={halo}
        strokeWidth={3}
        textAnchor="middle"
        x={x}
        y={labelY}
      >
        {name}
      </SvgText>
      <SvgText
        fill={ink}
        fontSize={11}
        fontWeight={focused ? "700" : "600"}
        textAnchor="middle"
        x={x}
        y={labelY}
      >
        {name}
      </SvgText>
    </G>
  );
});

const styles = StyleSheet.create({
  board: { position: "absolute" },
  stage: { borderRadius: radius.lg, flex: 1, overflow: "hidden" },
  wrap: { flex: 1 },
  zoom: {
    gap: space.xs,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
});
