"use client";

import classNames from "classnames";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import styled, { keyframes } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

// ─── Styled components ────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.6);
  animation: ${fadeIn} 0.18s ease both;
`;

const Panel = styled.div`
  position: fixed;
  z-index: 501;
  background: var(--bg-2);
  border: 1px solid var(--bg-5);
  color: var(--text);
  font-family: var(--font);
  display: flex;
  flex-direction: column;

  /* Desktop — centered dialog */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95vw;
  max-width: 500px;
  max-height: 82vh;
  border-radius: 16px;
  animation: ${scaleIn} 0.18s ease both;

  /* Mobile — bottom sheet */
  @media (max-width: 800px) {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    max-height: 88vh;
    border-radius: 20px 20px 0 0;
    animation: ${slideUp} 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 36px;
  height: 4px;
  border-radius: 9999px;
  background: var(--bg-6);
  margin: 10px auto 0;
  flex-shrink: 0;

  @media (max-width: 800px) {
    display: block;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 10px;
  flex-shrink: 0;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.25;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--bg-4);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  margin-left: 12px;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }
`;

const Body = styled.div`
  overflow-y: auto;
  padding: 4px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Lead = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.6;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.85;
`;

const Section = styled.div``;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid var(--bg-4);
  overflow: hidden;
`;

const TableRow = styled.div<{ $header?: boolean }>`
  display: flex;
  align-items: center;
  padding: 7px 12px;
  background: ${({ $header }) => ($header ? "var(--bg-3)" : "var(--bg-2)")};
  border-bottom: 1px solid var(--bg-4);
  gap: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

const TableLabel = styled.span<{ $header?: boolean }>`
  flex: 1;
  font-size: 0.72rem;
  color: ${({ $header }) =>
    $header ? "var(--text-secondary)" : "var(--text)"};
  font-weight: ${({ $header }) => ($header ? 700 : 400)};
  letter-spacing: ${({ $header }) => ($header ? "0.07em" : 0)};
  text-transform: ${({ $header }) => ($header ? "uppercase" : "none")};
`;

const XPBadge = styled.span<{ $positive?: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ $positive }) =>
    $positive !== false ? "var(--accent)" : "var(--tomato-a9, #e05050)"};
  white-space: nowrap;
  min-width: 52px;
  text-align: right;
`;

const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
`;

const LevelCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-4);
`;

const LevelNum = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
`;

const LevelRange = styled.span`
  font-size: 0.7rem;
  color: var(--text);
  font-weight: 600;
`;

const Note = styled.p`
  margin: 0;
  font-size: 0.65rem;
  color: var(--text-secondary);
  opacity: 0.7;
  line-height: 1.5;
  font-style: italic;
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1, range: "0 – 99 XP" },
  { level: 2, range: "100 – 299 XP" },
  { level: 3, range: "300 – 599 XP" },
  { level: 4, range: "600 – 999 XP" },
  { level: 5, range: "1,000 – 1,499 XP" },
  { level: 6, range: "1,500 – 2,499 XP" },
  { level: 7, range: "2,500 – 3,999 XP" },
  { level: 8, range: "4,000 – 5,999 XP" },
  { level: 9, range: "6,000 – 9,999 XP" },
  { level: 10, range: "10,000+ XP" },
];

const NOVELIST_ACTIONS = [
  { label: "Add a character", xp: "+10" },
  { label: "Accept a friend request", xp: "+5" },
  { label: "Post public prompt (OOC)", xp: "+15" },
  { label: "Post friends-only prompt (OOC)", xp: "+8" },
  { label: "Comment on public prompt (OOC)", xp: "+20" },
  { label: "Comment on friends-only prompt (OOC)", xp: "+12" },
  { label: "Reply on public prompt (OOC)", xp: "+25" },
  { label: "Reply on friends-only prompt (OOC)", xp: "+15" },
  { label: "Character posts public prompt", xp: "+12" },
  { label: "Character comments on public prompt", xp: "+15" },
  { label: "Character replies on public prompt", xp: "+18" },
];

const MUSE_ACTIONS = [
  { label: "Add about section", xp: "+5" },
  { label: "Add character detail", xp: "+8" },
  { label: "Post public prompt", xp: "+20" },
  { label: "Post friends-only prompt", xp: "+10" },
  { label: "Comment on public prompt", xp: "+25" },
  { label: "Comment on friends-only prompt", xp: "+15" },
  { label: "Reply on public prompt", xp: "+30" },
  { label: "Reply on friends-only prompt", xp: "+20" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  type: "novelist" | "muse";
  open: boolean;
  onClose: () => void;
}

export function LeaderboardInfo({ type, open, onClose }: Props) {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  if (!open || typeof document === "undefined") return null;

  const isNovelist = type === "novelist";
  const actions = isNovelist ? NOVELIST_ACTIONS : MUSE_ACTIONS;
  const title = isNovelist
    ? "About the Novelist Leaderboard"
    : "About the Characters Leaderboard";
  const lead = isNovelist
    ? "Rankings are based on total XP earned through your writing activity. XP accumulates across everything you do on Novelist World — posting, engaging with others, and building your characters."
    : "Rankings are based on total XP your character earns through roleplay. Each character builds their own XP independently from the novelist.";

  return createPortal(
    <>
      <Overlay onClick={onClose} aria-hidden="true" />
      <Panel
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={classNames([accent, theme])}
      >
        <DragHandle />
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            <FiX size={16} />
          </CloseButton>
        </PanelHeader>

        <Body>
          <Lead>{lead}</Lead>

          <Section>
            <SectionTitle>How XP is earned</SectionTitle>
            <Table>
              <TableRow $header>
                <TableLabel $header>Action</TableLabel>
                <XPBadge>XP</XPBadge>
              </TableRow>
              {actions.map(({ label, xp }) => (
                <TableRow key={label}>
                  <TableLabel>{label}</TableLabel>
                  <XPBadge $positive>{xp}</XPBadge>
                </TableRow>
              ))}
            </Table>
            <Note style={{ marginTop: 8 }}>
              Deleting content reverses the XP earned for that action.
            </Note>
          </Section>

          <Section>
            <SectionTitle>Level progression</SectionTitle>
            <LevelGrid>
              {LEVELS.map(({ level, range }) => (
                <LevelCard key={level}>
                  <LevelNum>Level {level}</LevelNum>
                  <LevelRange>{range}</LevelRange>
                </LevelCard>
              ))}
            </LevelGrid>
          </Section>
        </Body>
      </Panel>
    </>,
    document.body,
  );
}
