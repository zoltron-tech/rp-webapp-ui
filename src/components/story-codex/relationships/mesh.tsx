"use client";

import type { CodexGroup, CodexRelationship, StoryPerson } from "@nw/types";
import {
  type FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuRotateCcw, LuZoomIn, LuZoomOut } from "react-icons/lu";
import { CanvasWeave } from "@/components/common/canvas-weave";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { useGlobalState } from "@/context/store/stores";
import { buildClusterFields, buildClusterRegions, FIELD_RIM } from "./clusters";
import { buildEdges, collarArc } from "./layout";
import {
  ALPHA_DRAG,
  ALPHA_MIN,
  ALPHA_SETTLE,
  createSimulation,
  type SimNode,
} from "./simulation";
import * as S from "./styles";
import { type ResolvedTone, resolveTone, strengthWidth } from "./tones";

/** SVG design box; the stage scales it to whatever width it gets. */
const WIDTH = 900;
const HEIGHT = 620;
/** Past this many lines the labels would print over each other, so only what
 *  is spotlit keeps its name. */
const EDGE_LABEL_LIMIT = 40;
/** How far the view may be zoomed, either way. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.5;
/** Pointer travel past which a press counts as a drag and not a click. */
const DRAG_SLOP = 4;

/**
 * How strongly the group fields are washed over the board.
 *
 * Applied once, to the whole cluster layer, rather than per field. Inside that
 * layer every region is opaque and paints over the ones it overlaps, so a point
 * on the board ends up carrying one colour — the blend of exactly the groups it
 * belongs to. Stacking translucent fields instead would make the answer depend
 * on which group was created first, which is not something a reader can see.
 */
const CLUSTER_OPACITY = 0.22;

/** Keeps a group's name on the board when its field is hard against the top. */
const CLUSTER_LABEL_MIN_Y = 16;

/**
 * The hatch laid over a field, and the rim drawn around it.
 *
 * Both sit in layers of their own rather than inside the wash: a rim flattened
 * to the wash's opacity stops being an edge, and the hatch has to read as
 * texture over whatever colour the region underneath happens to be. Keeping
 * them apart also leaves the wash's overlap arithmetic exactly as it was —
 * neither of these layers paints a colour, they only dress the shape.
 */
const CLUSTER_HATCH_OPACITY = 0.16;
const CLUSTER_RIM_OPACITY = 0.42;

/** The hatch's pitch, in board units. Fine enough to read as texture rather
 *  than as stripes at any zoom the board allows. */
const HATCH_PITCH = 7;

type View = { x: number; y: number; k: number };

const IDENTITY: View = { k: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type Props = {
  /** Every character in the story, from both pools. */
  cast: StoryPerson[];
  relationships: CodexRelationship[];
  /** Every tone this story can draw — the built-in three, then its own. */
  palette: ResolvedTone[];
  /** Tone keys the reader has switched off from the legend. */
  hiddenTones: Set<string>;
  /** The story's groups, drawn as coloured fields around their members. */
  groups: CodexGroup[];
  /** Group ids the reader has switched off from the legend. */
  hiddenGroups: Set<string>;
  /** The character in focus; its relationships stay lit, the rest dim. */
  focusedId: string | null;
  onFocus: (museId: string | null) => void;
  onOpenRelationship: (relationship: CodexRelationship) => void;
};

/**
 * The relationship mesh: a node-link graph of who these characters are to
 * each other.
 *
 * Characters are discs, relationships are the labelled lines between them, and
 * a character nobody is tied to floats loose rather than being dressed into
 * the web — the picture should say at a glance who is in the story's tangle
 * and who is off to one side of it.
 *
 * The shape comes from a live force simulation (`simulation.ts`), not a fixed
 * ring: tightly-tied groups pull into knots and the outline that results is
 * lopsided because the story is. Because the simulation is live rather than
 * baked, dragging a character keeps every line attached and lets their
 * neighbours ease along behind them.
 *
 * Colour carries only a coarse tone, and past the built-in three hues it cannot
 * be trusted to separate on its own — which is why every tone, built-in or a
 * story's own, also carries a stroke pattern. The mesh reads with no colour
 * vision at all. What a relationship *means* is its label, which is on the
 * line, in the tooltip and in the table view.
 */
export const RelationshipMesh: FC<Props> = ({
  cast,
  relationships,
  palette,
  hiddenTones,
  groups,
  hiddenGroups,
  focusedId,
  onFocus,
  onOpenRelationship,
}) => {
  const theme = useGlobalState("theme");
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [view, setView] = useState<View>(IDENTITY);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [hoverEdgeId, setHoverEdgeId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{
    relationship: CodexRelationship;
    x: number;
    y: number;
  } | null>(null);

  /** Bumped once per simulation frame. The nodes themselves are mutable and
   *  live inside the simulation, so this is what tells React to look again —
   *  copying every node each frame would allocate for nothing. */
  const [, setFrame] = useState(0);

  /** Each line with the tone it is actually drawn in, resolved once. */
  const drawn = useMemo(
    () =>
      relationships.map((relationship) => ({
        relationship,
        tone: resolveTone(relationship, palette, theme),
      })),
    [relationships, palette, theme],
  );

  const toneByRelationship = useMemo(
    () => new Map(drawn.map((edge) => [edge.relationship.id, edge.tone])),
    [drawn],
  );

  const visible = useMemo(
    () =>
      drawn
        .filter((edge) => !hiddenTones.has(edge.tone.key))
        .map((edge) => edge.relationship),
    [drawn, hiddenTones],
  );

  /** What the simulation is built on: every relationship, hidden tones
   *  included. The *shape* is the story's, not the current filter's —
   *  switching a tone off should take lines off the board, never rearrange
   *  the cast underneath them. */
  const simLinks = useMemo(
    () =>
      relationships.map((relationship) => ({
        fromId: relationship.fromId,
        id: relationship.id,
        strength: relationship.strength,
        toId: relationship.toId,
      })),
    [relationships],
  );

  /** What is actually drawn. */
  const drawnLinks = useMemo(
    () =>
      visible.map((relationship) => ({
        fromId: relationship.fromId,
        id: relationship.id,
        toId: relationship.toId,
      })),
    [visible],
  );

  /** What the simulation gathers on, hidden groups included — for the same
   *  reason the springs use every relationship: the shape is the story's, not
   *  the current filter's. Switching a field off takes the paint off the board,
   *  it does not move the cast underneath it. */
  const simGroups = useMemo(
    () =>
      groups
        .filter((group) => group.id)
        .map((group) => ({
          id: group.id as string,
          memberIds: group.members.map((member) => member.id),
        })),
    [groups],
  );

  const simulation = useMemo(() => {
    const created = createSimulation({
      cast: cast.map((member) => ({
        id: member.id,
        image: member.image,
        name: member.name,
      })),
      groups: simGroups,
      height: HEIGHT,
      links: simLinks,
      width: WIDTH,
    });
    // Settle off-screen so the mesh opens on a finished shape rather than
    // animating itself together in front of the reader on every visit.
    created.settle();
    return created;
  }, [cast, simLinks, simGroups]);

  const simulationRef = useRef(simulation);
  simulationRef.current = simulation;

  const nodes = simulation.nodes;
  // Positions mutate inside the simulation, so this cannot be memoised on the
  // node array — it is rebuilt each frame, which at cast sizes is nothing, and
  // it is what keeps every line attached to its characters mid-drag.
  const edges = buildEdges(nodes, drawnLinks);

  const shownGroups = useMemo(
    () => groups.filter((group) => group.id && !hiddenGroups.has(group.id)),
    [groups, hiddenGroups],
  );

  // Like the edges, and for the same reason: the members move, so their field
  // has to be rebuilt from wherever they currently stand — which is what keeps
  // a house wrapped around its members mid-drag rather than left behind them.
  const clusterFields = buildClusterFields(nodes, shownGroups);
  const clusterRegions = buildClusterRegions(clusterFields);

  const byId = useMemo(
    () =>
      new Map(visible.map((relationship) => [relationship.id, relationship])),
    [visible],
  );
  const namesById = useMemo(
    () => new Map(cast.map((member) => [member.id, member.name])),
    [cast],
  );

  /**
   * The tones each character is tangled in, in draw order.
   *
   * Drawn as a collar of arc segments around their avatar, so a character's
   * mix of bonds and grudges reads at a glance without following a single
   * line out of them.
   */
  const collarsById = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const relationship of visible) {
      const colour = toneByRelationship.get(relationship.id)?.color;
      if (!colour) continue;
      for (const end of [relationship.fromId, relationship.toId]) {
        const list = map.get(end);
        if (list) list.push(colour);
        else map.set(end, [colour]);
      }
    }
    return map;
  }, [visible, toneByRelationship]);

  const showEdgeLabels = edges.length <= EDGE_LABEL_LIMIT;

  // ── The frame loop ───────────────────────────────────────────────────────

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /** Where the dragged character is being held, in simulation coordinates. */
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    /** Where the press landed, in client px — the slop is measured here, not
     *  in simulation units, which are a different size at every zoom level. */
    clientX: number;
    clientY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const step = useCallback(() => {
    const sim = simulationRef.current;
    const drag = dragRef.current;
    if (drag) sim.hold(drag.id, drag.x, drag.y);
    sim.tick();
    setFrame((frame) => frame + 1);

    if (sim.alpha > ALPHA_MIN || dragRef.current) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      runningRef.current = false;
      rafRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      runningRef.current = false;
      dragRef.current = null;
    },
    [],
  );

  // ── View: pan and zoom ───────────────────────────────────────────────────

  /** Client px → the SVG's own units, before the pan/zoom transform. */
  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const scale = WIDTH / rect.width;
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale,
    };
  }, []);

  /** Client px → simulation coordinates, i.e. back through the pan and zoom. */
  const toSimulation = useCallback(
    (clientX: number, clientY: number, current: View) => {
      const point = toSvg(clientX, clientY);
      if (!point) return null;
      return {
        x: (point.x - current.x) / current.k,
        y: (point.y - current.y) / current.k,
      };
    },
    [toSvg],
  );

  const zoomAbout = useCallback(
    (factor: number, at?: { x: number; y: number }) => {
      setView((current) => {
        const next = clamp(current.k * factor, ZOOM_MIN, ZOOM_MAX);
        const anchor = at ?? { x: WIDTH / 2, y: HEIGHT / 2 };
        return {
          k: next,
          x: anchor.x - ((anchor.x - current.x) / current.k) * next,
          y: anchor.y - ((anchor.y - current.y) / current.k) * next,
        };
      });
    },
    [],
  );

  // Zoom is on ctrl/⌘+wheel, not on a bare wheel. The mesh is a tall thing in
  // the middle of a scrolling page, and a board that swallowed the scroll
  // wheel would trap the reader every time they passed over it. A trackpad
  // pinch already arrives as ctrl+wheel, so pinch-to-zoom works untouched.
  //
  // Bound by hand rather than through onWheel: React registers wheel passively
  // at the root, where preventDefault is a no-op with a console warning.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const at = toSvg(e.clientX, e.clientY);
      zoomAbout(Math.exp(-e.deltaY * 0.0016), at ?? undefined);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toSvg, zoomAbout]);

  // ── Gestures on the board ────────────────────────────────────
  // One pointer pans, two pinch to zoom — written out by hand because the
  // canvas declares `touch-action: none`, which switches off the browser's own
  // panning and pinching inside it. That declaration is the whole reason
  // dragging works on touch at all: without it the browser decides a moment
  // into the gesture that a finger drag is a page scroll, cancels the pointer,
  // and the character stops dead under the finger.

  /** Every pointer currently down on the board, by id. */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());

  type Gesture =
    | {
        kind: "pan";
        pointerId: number;
        clientX: number;
        clientY: number;
        origin: View;
        moved: boolean;
      }
    | {
        kind: "pinch";
        pointers: [number, number];
        /** Finger separation when the pinch began, in client px. */
        distance: number;
        /** Point between the fingers when it began, in SVG units. */
        midpoint: { x: number; y: number };
        origin: View;
      };

  const gestureRef = useRef<Gesture | null>(null);

  /** A pan ends with a pointerup, which the browser then follows with a
   *  click. Without this, moving the board would also clear the focus. */
  const panSwallowsClick = useRef(false);

  /** The view as of the last render, for gestures that begin mid-frame. */
  const viewRef = useRef(view);
  viewRef.current = view;

  const beginPinch = (): Gesture | null => {
    const entries = [...pointersRef.current.entries()];
    if (entries.length < 2) return null;
    const [[idA, a], [idB, b]] = entries;
    const midpoint = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (!midpoint) return null;
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      kind: "pinch",
      midpoint,
      origin: viewRef.current,
      pointers: [idA, idB],
    };
  };

  const onBoardPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // A second finger landing on the board while a character is being dragged
    // must not also start moving the view underneath it.
    if (dragRef.current) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pointersRef.current.size >= 2) {
      gestureRef.current = beginPinch() ?? gestureRef.current;
      return;
    }
    gestureRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      kind: "pan",
      moved: false,
      origin: viewRef.current,
      pointerId: e.pointerId,
    };
  };

  const onBoardPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const gesture = gestureRef.current;
    const svg = svgRef.current;
    if (!gesture || !svg) return;
    const scale = WIDTH / (svg.getBoundingClientRect().width || WIDTH);

    if (gesture.kind === "pan") {
      if (gesture.pointerId !== e.pointerId) return;
      const deltaX = e.clientX - gesture.clientX;
      const deltaY = e.clientY - gesture.clientY;
      if (!gesture.moved && Math.hypot(deltaX, deltaY) < DRAG_SLOP) return;
      gesture.moved = true;
      setView({
        k: gesture.origin.k,
        x: gesture.origin.x + deltaX * scale,
        y: gesture.origin.y + deltaY * scale,
      });
      return;
    }

    const a = pointersRef.current.get(gesture.pointers[0]);
    const b = pointersRef.current.get(gesture.pointers[1]);
    if (!a || !b) return;
    const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const midpoint = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (!midpoint) return;

    const k = clamp(
      gesture.origin.k * (distance / gesture.distance),
      ZOOM_MIN,
      ZOOM_MAX,
    );
    // Whatever was between the fingers when the pinch began stays between them
    // now, so one gesture zooms and drags the board together.
    setView({
      k,
      x:
        midpoint.x -
        ((gesture.midpoint.x - gesture.origin.x) / gesture.origin.k) * k,
      y:
        midpoint.y -
        ((gesture.midpoint.y - gesture.origin.y) / gesture.origin.k) * k,
    });
  };

  const onBoardPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.kind === "pan") {
      if (gesture.pointerId !== e.pointerId) return;
      gestureRef.current = null;
      panSwallowsClick.current = gesture.moved;
      return;
    }

    // A finger lifted out of a pinch. Carry on panning with whatever is still
    // down rather than dropping the gesture, which would jump the board the
    // next time that finger moved.
    panSwallowsClick.current = true;
    const remaining = [...pointersRef.current.entries()][0];
    if (!remaining) {
      gestureRef.current = null;
      return;
    }
    gestureRef.current = {
      clientX: remaining[1].x,
      clientY: remaining[1].y,
      kind: "pan",
      moved: true,
      origin: viewRef.current,
      pointerId: remaining[0],
    };
  };

  /**
   * Stop the page scrolling out from under a touch drag.
   *
   * `touch-action: none` is declared on both the stage and the canvas and
   * *should* be the whole story, but it is honoured inconsistently over SVG
   * subtrees — the symptom being that a horizontal drag works while a vertical
   * one hands the gesture to the page, which is the browser falling back to
   * its own scrolling. Cancelling the touchmove is the one thing every engine
   * obeys.
   *
   * It has to be bound by hand: React registers touch events passively at the
   * root, where preventDefault is a no-op with a console warning. And it has
   * to catch the *first* move of the gesture — once a browser has committed to
   * a scroll, later preventDefaults are ignored — which it does, because
   * pointerdown has already recorded the drag or the gesture by then.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current && !gestureRef.current) return;
      e.preventDefault();
    };
    svg.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => svg.removeEventListener("touchmove", onTouchMove);
  }, []);

  // ── Dragging a character ─────────────────────────────────────────────────
  // The pointer only ever records *where* the character is being held; the
  // frame loop is what moves anything. That is what keeps the drag smooth
  // however fast the pointer events arrive, and what keeps every line
  // attached — the lines are rebuilt from wherever the simulation has its
  // characters that frame, never tacked on afterwards.

  const releaseDrag = useCallback(() => {
    const session = dragRef.current;
    if (!session) return null;
    dragRef.current = null;
    simulationRef.current.hold(session.id, null, null);
    simulationRef.current.reheat(0, ALPHA_SETTLE);
    run();
    return session;
  }, [run]);

  const beginNodeDrag = (e: React.PointerEvent, node: SimNode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      id: node.id,
      moved: false,
      pointerId: e.pointerId,
      x: node.x,
      y: node.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    simulation.hold(node.id, node.x, node.y);
    simulation.reheat(ALPHA_DRAG, ALPHA_DRAG);
    run();
  };

  const moveNodeDrag = (e: React.PointerEvent) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    const point = toSimulation(e.clientX, e.clientY, view);
    if (!point) return;
    if (
      !session.moved &&
      Math.hypot(e.clientX - session.clientX, e.clientY - session.clientY) <
        DRAG_SLOP
    ) {
      return;
    }
    session.moved = true;
    session.x = point.x;
    session.y = point.y;
    run();
  };

  const endNodeDrag = (e: React.PointerEvent, node: SimNode) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    releaseDrag();
    // A press that never travelled is a click, and a click follows that
    // character's relationships.
    if (!session.moved) onFocus(node.id === focusedId ? null : node.id);
  };

  // ── Spotlight ────────────────────────────────────────────────────────────
  // A click commits a character to focus; simply passing over one (or over a
  // line) lights the same neighbourhood without committing to anything.

  const spotlightNode = focusedId ?? hoverNodeId;
  const spotlightEdge = hoverEdgeId ? byId.get(hoverEdgeId) : null;

  const isEdgeLit = (fromId: string, toId: string, edgeId: string | null) => {
    if (spotlightEdge) return edgeId === spotlightEdge.id;
    if (!spotlightNode) return true;
    return fromId === spotlightNode || toId === spotlightNode;
  };

  const neighbours = useMemo(() => {
    if (!spotlightNode) return null;
    const set = new Set<string>([spotlightNode]);
    for (const link of drawnLinks) {
      if (link.fromId === spotlightNode) set.add(link.toId);
      if (link.toId === spotlightNode) set.add(link.fromId);
    }
    return set;
  }, [drawnLinks, spotlightNode]);

  const isNodeLit = (nodeId: string) => {
    if (spotlightEdge) {
      return nodeId === spotlightEdge.fromId || nodeId === spotlightEdge.toId;
    }
    return !neighbours || neighbours.has(nodeId);
  };

  /** Anything spotlit gets its lines animated, so the eye follows them. */
  const spotlit = Boolean(spotlightNode || spotlightEdge);

  const trackTooltip = (
    e: React.PointerEvent,
    relationship: CodexRelationship,
  ) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    setHovered({
      relationship,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const zoomed = view.k !== 1 || view.x !== 0 || view.y !== 0;

  return (
    <S.Stage ref={stageRef}>
      <S.Canvas
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Relationship mesh: ${cast.length} characters, ${
          visible.length
        } relationships${
          shownGroups.length > 0
            ? `, ${shownGroups.length} ${
                shownGroups.length === 1 ? "group" : "groups"
              } (${shownGroups.map((group) => group.name).join(", ")})`
            : ""
        }. A table view of the same data is available.`}
        onPointerLeave={() => {
          setHovered(null);
          setHoverNodeId(null);
          setHoverEdgeId(null);
        }}
      >
        <title>Relationship mesh</title>

        {/* The board's surface. Tiled through the view's own transform, so
            the texture slides and scales with the board — that parallax is
            what makes a pan feel like moving over something. */}
        <CanvasWeave
          transform={`translate(${view.x} ${view.y}) scale(${view.k})`}
        />

        {/* The board itself: what a pan grabs, and what a press clears the
            focus on. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the background
            is a pointer affordance only — every action it offers (clear the
            focus, move the view) has a keyboard-reachable control elsewhere. */}
        <rect
          className="board"
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={onBoardPointerDown}
          onPointerMove={onBoardPointerMove}
          onPointerUp={onBoardPointerUp}
          onPointerCancel={onBoardPointerUp}
          onClick={() => {
            if (panSwallowsClick.current) {
              panSwallowsClick.current = false;
              return;
            }
            onFocus(null);
          }}
        />

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* Each field, once, as a clipping region — an overlap is drawn by
              clipping one field to another, because a clip path *is* an
              intersection and SVG offers nothing else that is. */}
          <defs>
            {clusterFields.map((field) => (
              <Fragment key={field.key}>
                <clipPath id={`mesh-cluster-${field.key}`}>
                  <path d={field.path} />
                </clipPath>

                {/* Angled by the group's place in the legend, so two fields
                    crossing crosshatch — an overlap that reads as texture and
                    not by its blended colour alone. */}
                <pattern
                  id={`mesh-cluster-hatch-${field.key}`}
                  patternUnits="userSpaceOnUse"
                  patternTransform={`rotate(${field.hatchAngle})`}
                  width={HATCH_PITCH}
                  height={HATCH_PITCH}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={HATCH_PITCH}
                    stroke={field.color}
                    strokeWidth="1.2"
                  />
                </pattern>
              </Fragment>
            ))}
          </defs>

          {/* The group fields, under everything. Painted in order — each field,
              then every crossing pair, then every three-way — so a region ends
              up carrying the blend of exactly the groups it belongs to. */}
          {clusterRegions.length > 0 && (
            <g className="clusters" opacity={CLUSTER_OPACITY} aria-hidden>
              {clusterRegions.map((region) => {
                let painted = (
                  <path d={region.field.path} fill={region.color} />
                );
                // Wrapped once per field it is clipped by: two wraps is a
                // three-way overlap, which is where three houses meet.
                for (const clip of region.clippedBy) {
                  painted = (
                    <g clipPath={`url(#mesh-cluster-${clip.key})`}>{painted}</g>
                  );
                }
                return <g key={region.key}>{painted}</g>;
              })}
            </g>
          )}

          {/* The hatch, over the wash and clipped to the field. Its own layer:
              it has to read as texture over whatever colour the region beneath
              it came out as, rather than being folded into that colour. */}
          {clusterFields.length > 0 && (
            <g
              className="cluster-weave"
              opacity={CLUSTER_HATCH_OPACITY}
              aria-hidden
            >
              {clusterFields.map((field) => (
                <rect
                  key={`${field.key}-hatch`}
                  x={field.box.x}
                  y={field.box.y}
                  width={field.box.width}
                  height={field.box.height}
                  fill={`url(#mesh-cluster-hatch-${field.key})`}
                  clipPath={`url(#mesh-cluster-${field.key})`}
                />
              ))}
            </g>
          )}

          {/* The rim, last and at its own opacity — an edge flattened into the
              wash stops being an edge. Drawn over the other fields too, so a
              group's boundary stays followable straight through an overlap.

              A plain stroke, which only became honest once the field was a
              single traced outline: stroking the old union of discs and
              capsules would have drawn every seam inside it. */}
          {clusterFields.length > 0 && (
            <g
              className="cluster-rims"
              opacity={CLUSTER_RIM_OPACITY}
              aria-hidden
            >
              {clusterFields.map((field) => (
                <path
                  key={`${field.key}-rim`}
                  d={field.path}
                  fill="none"
                  stroke={field.color}
                  strokeWidth={FIELD_RIM}
                />
              ))}
            </g>
          )}

          {/* Every field says who it is in words. Colour is never the only
              thing carrying an identity, and a blended overlap is exactly where
              a reader most needs to be told which two names made it. */}
          {clusterFields.map((field) => (
            <text
              key={`${field.key}-label`}
              className="cluster-label"
              x={field.labelX}
              y={Math.max(CLUSTER_LABEL_MIN_Y, field.labelY)}
              fill={field.color}
            >
              {field.name}
            </text>
          ))}

          {/* Lines first, so the characters sit over their ends. */}
          {edges.map((edge) => {
            const relationship = byId.get(edge.id);
            if (!relationship) return null;
            const tone = toneByRelationship.get(relationship.id);
            const colour = tone?.color ?? "currentColor";
            const width = strengthWidth(relationship.strength);
            const lit = isEdgeLit(edge.fromId, edge.toId, edge.id);
            const active = spotlightEdge?.id === edge.id;

            return (
              <g
                key={edge.id}
                data-nw="mesh-edge"
                className={lit ? undefined : "dimmed"}
              >
                {/* Surface gap so crossing lines stay separable. */}
                <path
                  className="edge-halo"
                  d={edge.path}
                  strokeWidth={width + 5}
                />
                <path
                  className="edge"
                  d={edge.path}
                  stroke={colour}
                  strokeWidth={active ? width + 1 : width}
                  strokeDasharray={tone?.dash}
                />
                {/* A line only runs while something is spotlit: motion
                    everywhere at once is noise, motion on the one thing being
                    read is a direction. */}
                {spotlit && lit && (
                  <path
                    className="edge-flow"
                    d={edge.path}
                    stroke={colour}
                    strokeWidth={width + 1.5}
                  />
                )}
                {relationship.isDirected && (
                  <path
                    className="edge-tip"
                    d="M 0 0 L -10 -5 L -10 5 Z"
                    fill={colour}
                    transform={`translate(${edge.tipX} ${edge.tipY}) rotate(${edge.tipAngle})`}
                  />
                )}
                {(active || (showEdgeLabels && lit)) && (
                  <text
                    className={active ? "edge-label is-active" : "edge-label"}
                    x={edge.labelX}
                    y={edge.labelY}
                    transform={`rotate(${edge.labelAngle} ${edge.labelX} ${edge.labelY})`}
                  >
                    {relationship.label}
                  </text>
                )}
                {/* Hit target, wider than the mark — and the keyboard's way
                    into the mesh, so the graph is not pointer-only. */}
                {/* biome-ignore lint/a11y/useSemanticElements: an SVG line cannot
                    be a <button> without a foreignObject that would break the
                    geometry; role + tabIndex + Enter/Space + aria-label + a
                    focus ring give it the same affordances. */}
                <path
                  className="edge-hit"
                  d={edge.path}
                  role="button"
                  tabIndex={0}
                  aria-label={`${namesById.get(edge.fromId) ?? "Someone"} ${
                    relationship.isDirected ? "toward" : "with"
                  } ${namesById.get(edge.toId) ?? "someone"}: ${
                    relationship.label
                  }, ${tone?.label ?? ""}`}
                  onPointerEnter={() => setHoverEdgeId(edge.id)}
                  onPointerMove={(e) => trackTooltip(e, relationship)}
                  onPointerLeave={() => {
                    setHovered(null);
                    setHoverEdgeId(null);
                  }}
                  onFocus={() => setHoverEdgeId(edge.id)}
                  onBlur={() => setHoverEdgeId(null)}
                  onClick={() => onOpenRelationship(relationship)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    onOpenRelationship(relationship);
                  }}
                />
              </g>
            );
          })}

          {/* Characters. */}
          {nodes.map((node) => {
            const lit = isNodeLit(node.id);
            const isFocused = node.id === focusedId;
            const avatar =
              cast.find((member) => member.id === node.id)?.image ||
              museAvatarUrl(node.id);
            const collar = collarsById.get(node.id) ?? [];

            return (
              <g
                key={node.id}
                data-nw="mesh-node"
                className={lit ? undefined : "dimmed"}
              >
                {isFocused && (
                  <circle
                    className="node-glow"
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 9}
                  />
                )}

                {/* Backing disc, then the initial, then the avatar over both —
                    a missing or broken avatar reveals the initial underneath. */}
                <circle
                  className="node-bg"
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                />
                <text
                  className="node-initial"
                  x={node.x}
                  y={node.y}
                  fontSize={node.radius * 0.8}
                >
                  {node.name.charAt(0).toUpperCase()}
                </text>
                {avatar && (
                  <>
                    <clipPath id={`mesh-clip-${node.id}`}>
                      <circle cx={node.x} cy={node.y} r={node.radius - 2} />
                    </clipPath>
                    <image
                      href={avatar}
                      x={node.x - node.radius + 2}
                      y={node.y - node.radius + 2}
                      width={(node.radius - 2) * 2}
                      height={(node.radius - 2) * 2}
                      clipPath={`url(#mesh-clip-${node.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </>
                )}

                <circle
                  className={`node-ring${isFocused ? " is-active" : ""}${
                    node.degree === 0 ? " is-loose" : ""
                  }`}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                />

                {/* Focus, drawn as a ring beating out from the node — the
                    node-hit circle's own focus outline is a rectangle, so it
                    is suppressed in styles.ts and replaced by this. */}
                {isFocused && (
                  <circle
                    className="node-pulse"
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 7}
                  />
                )}

                {/* The tone collar: one arc per relationship this character is
                    in, so their mix reads before a line is followed. */}
                {collar.slice(0, 14).map((colour, index, all) => {
                  const stepAngle = (Math.PI * 2) / all.length;
                  const gap = Math.min(stepAngle * 0.28, 0.16);
                  const from = -Math.PI / 2 + index * stepAngle + gap / 2;
                  return (
                    <path
                      // Arc position is the identity here: two relationships
                      // in the same tone are the same colour, told apart only
                      // by where on the collar they sit.
                      key={`${node.id}-collar-${index}`}
                      className="node-collar"
                      d={collarArc(
                        node.x,
                        node.y,
                        node.radius + 5,
                        from,
                        from + stepAngle - gap,
                      )}
                      stroke={colour}
                    />
                  );
                })}

                <text
                  className="node-label"
                  x={node.x}
                  y={node.y + node.radius + 20}
                  textAnchor="middle"
                >
                  {node.name}
                </text>

                {/* biome-ignore lint/a11y/useSemanticElements: see the edge hit
                    target above — an SVG circle cannot be a <button>. */}
                <circle
                  className="node-hit"
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 8}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isFocused}
                  aria-label={`${node.name}, ${
                    node.degree === 0
                      ? "no relationships"
                      : `${node.degree} ${
                          node.degree === 1 ? "relationship" : "relationships"
                        }`
                  }. ${
                    isFocused ? "Stop following theirs." : "Follow only theirs."
                  }`}
                  onPointerEnter={() => setHoverNodeId(node.id)}
                  onPointerLeave={() => setHoverNodeId(null)}
                  onPointerDown={(e) => beginNodeDrag(e, node)}
                  onPointerMove={moveNodeDrag}
                  onPointerUp={(e) => endNodeDrag(e, node)}
                  onPointerCancel={releaseDrag}
                  onFocus={() => setHoverNodeId(node.id)}
                  onBlur={() => setHoverNodeId(null)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    onFocus(isFocused ? null : node.id);
                  }}
                />
              </g>
            );
          })}
        </g>
      </S.Canvas>

      <S.Controls aria-label="Mesh view">
        <S.ControlButton
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={view.k >= ZOOM_MAX}
          onClick={() => zoomAbout(1.25)}
        >
          <LuZoomIn size={14} />
        </S.ControlButton>
        <S.ControlButton
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={view.k <= ZOOM_MIN}
          onClick={() => zoomAbout(0.8)}
        >
          <LuZoomOut size={14} />
        </S.ControlButton>
        <S.ControlButton
          type="button"
          aria-label="Reset the view and let the mesh settle again"
          title="Reset the view and let the mesh settle again"
          disabled={!zoomed}
          onClick={() => {
            setView(IDENTITY);
            simulation.reheat(0, ALPHA_SETTLE);
            run();
          }}
        >
          <LuRotateCcw size={14} />
        </S.ControlButton>
      </S.Controls>

      {hovered && (
        <S.Tooltip
          style={{
            left: Math.min(
              hovered.x + 12,
              (stageRef.current?.clientWidth ?? 0) - 232,
            ),
            top: Math.max(8, hovered.y - 12),
          }}
        >
          <div>{hovered.relationship.label}</div>
          <div className="pair">
            {namesById.get(hovered.relationship.fromId) ?? "Someone"}
            {hovered.relationship.isDirected ? " → " : " · "}
            {namesById.get(hovered.relationship.toId) ?? "someone"}
          </div>
          <span className="tone">
            <span
              className="swatch"
              style={{
                background: resolveTone(hovered.relationship, palette, theme)
                  .color,
              }}
            />
            {resolveTone(hovered.relationship, palette, theme).label}
          </span>
        </S.Tooltip>
      )}
    </S.Stage>
  );
};
