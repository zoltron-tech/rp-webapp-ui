"use client";

import { type FC, useMemo, useRef, useState } from "react";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { useGlobalState } from "@/context/store/stores";
import type {
  CodexRelationship,
  RelationshipTone,
  StoryCastMember,
} from "@/types";
import { buildMeshLayout } from "./layout";
import * as S from "./styles";
import { strengthWidth, toneColor, toneSpec } from "./tones";

/** SVG design box; the stage scales it to whatever width it gets. */
const SIZE = 620;
/** Room outside the ring for avatars and their names. The stage is capped
 *  narrow, so the ring is pulled in and the type scaled up to compensate. */
const INSET = 110;
const NODE_RADIUS = 21;
/** Past this many characters the ring gets busy, so names go on demand. */
const LABEL_LIMIT = 12;
/** Past this many edges the mesh stops labelling every one. */
const EDGE_LABEL_LIMIT = 14;

type Props = {
  cast: StoryCastMember[];
  relationships: CodexRelationship[];
  /** Tones the reader has switched off from the legend. */
  hiddenTones: Set<RelationshipTone>;
  /** The character in focus; its relationships stay lit, the rest dim. */
  focusedId: string | null;
  onFocus: (museId: string | null) => void;
  onOpenRelationship: (relationship: CodexRelationship) => void;
};

/**
 * The relationship mesh.
 *
 * The cast sits on a ring and every relationship arcs between two of them.
 * Colour carries only a coarse tone — three hues, the most that stay apart
 * under colour-vision deficiency when every edge is compared against every
 * other — and each tone also carries its own stroke pattern, so the mesh reads
 * with no colour vision at all. What a relationship *means* is its label,
 * which is on the arc, in the tooltip and in the table view.
 */
export const RelationshipMesh: FC<Props> = ({
  cast,
  relationships,
  hiddenTones,
  focusedId,
  onFocus,
  onOpenRelationship,
}) => {
  const theme = useGlobalState("theme");
  const stageRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<{
    relationship: CodexRelationship;
    x: number;
    y: number;
  } | null>(null);

  const visible = useMemo(
    () =>
      relationships.filter(
        (relationship) => !hiddenTones.has(relationship.tone),
      ),
    [relationships, hiddenTones],
  );

  const layout = useMemo(
    () =>
      buildMeshLayout({
        cast: cast.map((member) => ({
          id: member.id,
          image: member.image,
          name: member.name,
        })),
        inset: INSET,
        relationships: visible.map((relationship) => ({
          fromMuseId: relationship.fromMuseId,
          id: relationship.id,
          toMuseId: relationship.toMuseId,
        })),
        size: SIZE,
      }),
    [cast, visible],
  );

  const byId = useMemo(
    () =>
      new Map(visible.map((relationship) => [relationship.id, relationship])),
    [visible],
  );
  const namesById = useMemo(
    () => new Map(cast.map((member) => [member.id, member.name])),
    [cast],
  );

  const showNodeLabels = cast.length <= LABEL_LIMIT;
  const showEdgeLabels = layout.edges.length <= EDGE_LABEL_LIMIT;

  /** Dimming: with a character in focus, only what touches them stays lit. */
  const isEdgeLit = (fromId: string, toId: string) =>
    !focusedId || fromId === focusedId || toId === focusedId;
  const isNodeLit = (nodeId: string) => {
    if (!focusedId) return true;
    if (nodeId === focusedId) return true;
    return layout.edges.some(
      (edge) =>
        (edge.fromId === focusedId && edge.toId === nodeId) ||
        (edge.toId === focusedId && edge.fromId === nodeId),
    );
  };

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

  return (
    <S.Stage ref={stageRef}>
      <S.Canvas
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Relationship mesh: ${cast.length} characters, ${visible.length} relationships. A table view of the same data is available.`}
        onPointerLeave={() => setHovered(null)}
      >
        <title>Relationship mesh</title>

        {/* The ring the cast sits on — scaffolding, kept recessive. */}
        <circle
          className="ring"
          cx={layout.centre}
          cy={layout.centre}
          r={layout.radius}
        />

        {/* Edges first, so the avatars sit over their ends. */}
        {layout.edges.map((edge) => {
          const relationship = byId.get(edge.id);
          if (!relationship) return null;
          const spec = toneSpec(relationship.tone);
          const colour = toneColor(relationship.tone, theme);
          const width = strengthWidth(relationship.strength);
          const lit = isEdgeLit(edge.fromId, edge.toId);

          return (
            <g key={edge.id} className={lit ? undefined : "dimmed"}>
              {/* Surface gap so crossing arcs stay separable. */}
              <path
                className="edge-halo"
                d={edge.path}
                strokeWidth={width + 4}
              />
              <path
                className="edge"
                d={edge.path}
                stroke={colour}
                strokeWidth={width}
                strokeDasharray={spec.dash === "none" ? undefined : spec.dash}
              />
              {relationship.isDirected && (
                <path
                  d="M 0 0 L -9 -4.5 L -9 4.5 Z"
                  fill={colour}
                  transform={`translate(${edge.tipX} ${edge.tipY}) rotate(${edge.tipAngle})`}
                />
              )}
              {showEdgeLabels && lit && (
                <text className="edge-label" x={edge.labelX} y={edge.labelY}>
                  {relationship.label}
                </text>
              )}
              {/* Hit target, wider than the mark — and the keyboard's way
                  into the mesh, so the graph is not pointer-only. */}
              {/* biome-ignore lint/a11y/useSemanticElements: an SVG arc cannot
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
                }, ${toneSpec(relationship.tone).label}`}
                onPointerMove={(e) => trackTooltip(e, relationship)}
                onPointerLeave={() => setHovered(null)}
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
        {layout.nodes.map((node) => {
          const lit = isNodeLit(node.id);
          const avatar =
            cast.find((member) => member.id === node.id)?.image ||
            museAvatarUrl(node.id);
          // Labels sit outward from the ring, flipped on the left half so
          // they never run back over the mesh.
          const onLeft = Math.cos(node.angle) < -0.01;
          const labelOffset = NODE_RADIUS + 8;

          return (
            <g key={node.id} className={lit ? undefined : "dimmed"}>
              {/* Backing disc, then the initial, then the avatar over both —
                  a missing or broken avatar reveals the initial underneath. */}
              <circle
                className="node-bg"
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
              />
              <text className="node-initial" x={node.x} y={node.y}>
                {node.name.charAt(0).toUpperCase()}
              </text>
              {avatar && (
                <>
                  <clipPath id={`mesh-clip-${node.id}`}>
                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS - 2} />
                  </clipPath>
                  <image
                    href={avatar}
                    x={node.x - NODE_RADIUS + 2}
                    y={node.y - NODE_RADIUS + 2}
                    width={(NODE_RADIUS - 2) * 2}
                    height={(NODE_RADIUS - 2) * 2}
                    clipPath={`url(#mesh-clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </>
              )}
              <circle
                className={`node-ring${node.id === focusedId ? " is-active" : ""}`}
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
              />
              {(showNodeLabels || node.id === focusedId) && (
                <text
                  className="node-label"
                  x={node.x + (onLeft ? -labelOffset : labelOffset)}
                  y={node.y}
                  textAnchor={onLeft ? "end" : "start"}
                >
                  {node.name}
                </text>
              )}
              {/* biome-ignore lint/a11y/useSemanticElements: see the edge hit
                  target above — an SVG circle cannot be a <button>. */}
              <circle
                className="node-hit"
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS + 4}
                role="button"
                tabIndex={0}
                aria-pressed={node.id === focusedId}
                aria-label={`${node.name}, ${node.degree} ${
                  node.degree === 1 ? "relationship" : "relationships"
                }. ${
                  node.id === focusedId
                    ? "Stop following theirs."
                    : "Follow only theirs."
                }`}
                onClick={() => onFocus(node.id === focusedId ? null : node.id)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  onFocus(node.id === focusedId ? null : node.id);
                }}
              />
            </g>
          );
        })}
      </S.Canvas>

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
            {namesById.get(hovered.relationship.fromMuseId) ?? "Someone"}
            {hovered.relationship.isDirected ? " → " : " · "}
            {namesById.get(hovered.relationship.toMuseId) ?? "someone"}
          </div>
          <span className="tone">
            <span
              className="swatch"
              style={{
                background: toneColor(hovered.relationship.tone, theme),
              }}
            />
            {toneSpec(hovered.relationship.tone).label}
          </span>
        </S.Tooltip>
      )}
    </S.Stage>
  );
};
