"use client";

import { prefersReducedMotion } from "@nw/utils/platform";
import { type FC, useEffect, useRef, useState } from "react";
import { FiCheck, FiLink2, FiMove, FiSearch } from "react-icons/fi";
import * as S from "./styles";
import { createSceneClock, useInViewOnce } from "./use-scene-loop";

/* A scripted mock of the storyboard Codex. The writer adds a place, then
 * switches to Relationships, where the cast is drawn as a mesh and one node is
 * dragged around while its edges follow. Purely presentational: no data, no
 * network, nothing here talks to the real Codex. */

const TABS = ["Characters", "Places", "Relationships"];
const PLACES_TAB = 1;
const MESH_TAB = 2;

const NAV = [
  { count: "12", label: "Chapters" },
  { count: "7", label: "Cast" },
  { active: true, count: "23", label: "Codex" },
  { count: "4", label: "Media" },
];

/* Five settled entries plus the one being added fills the grid to two rows,
   so the panel matches the height of the other two scenes' frames. */
const PLACES = [
  {
    links: "4",
    meta: "Region",
    name: "Ashfall Reach",
    tag: "Contested",
    tagTone: "#c58a4a",
    tone: "linear-gradient(135deg,#3d5a4a,#1e3329)",
  },
  {
    links: "6",
    meta: "Keep",
    name: "Hollow Spire",
    tag: "Ruling seat",
    tagTone: "#8b6fd0",
    tone: "linear-gradient(135deg,#4a4260,#241f33)",
  },
  {
    links: "3",
    meta: "City",
    name: "Grey Harbour",
    tag: "Trade",
    tagTone: "#5b93c4",
    tone: "linear-gradient(135deg,#3a4a5c,#1c2530)",
  },
  {
    links: "2",
    meta: "Wilds",
    name: "The Thornwood",
    tag: "Unmapped",
    tagTone: "#6faa5e",
    tone: "linear-gradient(135deg,#40543a,#1f2b1c)",
  },
  {
    links: "5",
    meta: "Ruin",
    name: "Sunken Vault",
    tag: "Sealed",
    tagTone: "#b06a4a",
    tone: "linear-gradient(135deg,#5c4a3a,#302418)",
  },
];

const NEW_ENTRY = "Emberfall Keep";

/* The Codex's three relationship tones, matching
   story-codex/relationships/tones.ts. Each carries a stroke pattern as well as
   a colour, so the mesh still reads with no colour vision at all. */
const TONES = {
  BOND: { colour: "#199e70", dash: "none", label: "Bond", legend: "solid" },
  NEUTRAL: {
    colour: "#3987e5",
    dash: "2 5",
    label: "Neutral",
    legend: "dotted",
  },
  STRAIN: { colour: "#d95926", dash: "7 5", label: "Strain", legend: "dashed" },
} as const;

const NODES = [
  { initial: "D", name: "Dorian", tone: "#6fa0c1", x: 52, y: 62 },
  { initial: "S", name: "Seraphine", tone: "#c8a87c", x: 148, y: 36 },
  { initial: "R", name: "Rowan", tone: "#7fb58a", x: 246, y: 74 },
  { initial: "C", name: "Cassius", tone: "#b58bd6", x: 92, y: 146 },
  { initial: "V", name: "Vale", tone: "#c87a9a", x: 212, y: 150 },
];

const EDGES = [
  { a: 0, b: 1, label: "sworn to", tone: "BOND" },
  { a: 1, b: 2, label: "rivals", tone: "STRAIN" },
  { a: 0, b: 3, label: "brother", tone: "BOND" },
  { a: 3, b: 4, label: "knows", tone: "NEUTRAL" },
  { a: 2, b: 4, label: "mentor", tone: "BOND" },
  { a: 1, b: 4, label: "knows", tone: "NEUTRAL" },
] as const;

/** The node the writer drags around; its edges follow it. */
const DRAGGED = 2;

export const CodexScene: FC = () => {
  const [ref, visible] = useInViewOnce<HTMLDivElement>();
  const [tab, setTab] = useState(PLACES_TAB);
  const [typed, setTyped] = useState("");
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    if (!visible) return;

    if (prefersReducedMotion()) {
      setTab(MESH_TAB);
      setTyped(NEW_ENTRY);
      setAdded(true);
      setSaved(true);
      return;
    }

    const clock = createSceneClock();
    const { wait, isCancelled } = clock;

    const run = async () => {
      while (!isCancelled()) {
        setTab(PLACES_TAB);
        setTyped("");
        setAdded(false);
        setSaved(false);
        await wait(1000);

        // A new place is added and its name typed in.
        setAdded(true);
        await wait(400);
        for (let i = 0; i <= NEW_ENTRY.length; i += 1) {
          if (isCancelled()) return;
          setTyped(NEW_ENTRY.slice(0, i));
          await wait(46);
        }
        await wait(460);
        setSaved(true);
        await wait(1200);

        // Then over to Relationships, where the cast is drawn as a mesh.
        setTab(MESH_TAB);
        await wait(5400);
      }
    };
    run();

    return clock.stop;
  }, [visible]);

  /* Drag one node on a slow ellipse. Positions live in state rather than in a
     CSS transform so the edges recompute from them and stay attached; moving
     the node alone would leave its lines behind. */
  useEffect(() => {
    if (tab !== MESH_TAB || prefersReducedMotion()) {
      setDrift({ x: 0, y: 0 });
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const angle = ((now - start) / 3400) * Math.PI * 2;
      setDrift({ x: Math.cos(angle) * 22, y: Math.sin(angle) * 13 });
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [tab]);

  const at = (i: number) =>
    i === DRAGGED
      ? { x: NODES[i].x + drift.x, y: NODES[i].y + drift.y }
      : NODES[i];

  return (
    <S.Frame ref={ref}>
      <S.FrameGlow />
      <S.TitleBar>
        <S.Dots>
          <i />
          <i />
          <i />
        </S.Dots>
        <S.TitleText>Ashfall Reach · Storyboard</S.TitleText>
      </S.TitleBar>
      <S.Body>
        <S.CodexHead>
          <S.CodexTitle>Codex</S.CodexTitle>
          {saved && (
            <S.CodexBadge>
              <FiCheck size={10} /> Saved
            </S.CodexBadge>
          )}
        </S.CodexHead>

        <S.CodexLayout>
          <S.CodexNav>
            {NAV.map((item) => (
              <S.NavItem key={item.label} $active={item.active}>
                {item.label}
                <b>{item.count}</b>
              </S.NavItem>
            ))}
          </S.CodexNav>

          <S.CodexMain>
            <S.CodexSearch>
              <FiSearch size={10} />
              Search this codex
            </S.CodexSearch>

            <S.TabRow>
              {TABS.map((label, i) => (
                <S.Tab key={label} $active={i === tab}>
                  {label}
                </S.Tab>
              ))}
            </S.TabRow>

            {tab === MESH_TAB ? (
              <>
                <S.MeshWrap>
                  <S.Mesh viewBox="0 0 300 190" aria-hidden="true">
                    {EDGES.map((edge) => {
                      const from = at(edge.a);
                      const to = at(edge.b);
                      const tone = TONES[edge.tone];
                      return (
                        <g key={`${edge.a}-${edge.b}`}>
                          <line
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={tone.colour}
                            strokeWidth="1.6"
                            strokeDasharray={tone.dash}
                            opacity="0.85"
                          />
                          <S.MeshLabel
                            x={(from.x + to.x) / 2}
                            y={(from.y + to.y) / 2 - 3}
                          >
                            {edge.label}
                          </S.MeshLabel>
                        </g>
                      );
                    })}

                    {NODES.map((node, i) => {
                      const p = at(i);
                      const dragging = i === DRAGGED;
                      return (
                        <g key={node.name}>
                          {dragging && (
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="17"
                              fill="none"
                              stroke="var(--accent-10)"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              opacity="0.7"
                            />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="12"
                            fill={node.tone}
                            stroke={
                              dragging ? "var(--accent-10)" : "rgba(0,0,0,0.35)"
                            }
                            strokeWidth={dragging ? 2 : 1}
                          />
                          <S.NodeInitial x={p.x} y={p.y}>
                            {node.initial}
                          </S.NodeInitial>
                          <S.NodeName x={p.x} y={p.y + 22}>
                            {node.name}
                          </S.NodeName>
                        </g>
                      );
                    })}
                  </S.Mesh>
                </S.MeshWrap>

                <S.Legend>
                  {(["BOND", "STRAIN", "NEUTRAL"] as const).map((key) => (
                    <S.LegendChip
                      key={key}
                      $tone={TONES[key].colour}
                      $dash={TONES[key].legend}
                    >
                      {TONES[key].label}
                    </S.LegendChip>
                  ))}
                  <S.MeshHint>
                    <FiMove size={9} />
                    Drag to rearrange
                  </S.MeshHint>
                </S.Legend>
              </>
            ) : (
              <S.CodexGrid>
                {PLACES.map((place) => (
                  <S.CodexCard key={place.name}>
                    <S.CardSwatch $tone={place.tone} />
                    <S.CardLabel>{place.name}</S.CardLabel>
                    <S.CardRow>
                      <S.CardMeta>{place.meta}</S.CardMeta>
                      <S.LinkCount>
                        <FiLink2 size={8} />
                        {place.links}
                      </S.LinkCount>
                    </S.CardRow>
                    <S.CardTag $tone={place.tagTone}>{place.tag}</S.CardTag>
                  </S.CodexCard>
                ))}
                {added && (
                  <S.CodexCard $new>
                    <S.CardSwatch />
                    <S.CardLabel>
                      {typed}
                      {!saved && <S.Caret />}
                    </S.CardLabel>
                    <S.CardRow>
                      <S.CardMeta>Keep</S.CardMeta>
                      <S.LinkCount>
                        <FiLink2 size={8} />0
                      </S.LinkCount>
                    </S.CardRow>
                    <S.CardTag>New entry</S.CardTag>
                  </S.CodexCard>
                )}
              </S.CodexGrid>
            )}
          </S.CodexMain>
        </S.CodexLayout>
      </S.Body>
    </S.Frame>
  );
};
