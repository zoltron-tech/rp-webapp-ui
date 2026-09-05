"use client";

import { prefersReducedMotion } from "@nw/utils/platform";
import {
  type FC,
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaHeart } from "react-icons/fa";
import {
  FiChevronsRight,
  FiEdit3,
  FiFeather,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import * as S from "./three-moves.styles";

/* ─────────────────────────────────────────────────────────────────────────────
   The core loop, told in three beats — the animated replacement for the old
   novelist and muse carousels. Still no fetch and no images beyond three local
   avatars: each beat plays its move as its own object rather than as one more
   screenshot — a character card being struck, a storyboard opening like a
   book, and the turns knotted onto a running thread.

   Navigation, on purpose, has several ways in:
     · the beat rail auto-advances on a ring countdown,
     · clicking / tapping a beat jumps to it,
     · ← → Home End move between beats when the rail has focus,
     · dragging or swiping the stage flicks to the next / previous beat.
   The reel pauses on hover, on focus, when the tab is hidden and when it
   scrolls out of view, and stops auto-advancing entirely once the reader picks
   a beat themselves — so nothing is animating that nobody is looking at.
   ──────────────────────────────────────────────────────────────────────────── */

const BEAT_MS = 8000;
/** Past this much horizontal travel a drag counts as a flick to the next beat. */
const SWIPE_PX = 48;

type Move = {
  label: string;
  n: string;
  scene: ReactNode;
  text: string;
  title: string;
};

// ─── Scene 1 · create a character ─────────────────────────────────────────────

const CharacterScene: FC = () => (
  <S.Scene>
    <S.Card>
      {/* The card's own edge, inked on. `pathLength` normalises the dash so the
          draw reads the same however wide the card ends up. */}
      <S.CardEdge
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="96" height="96" rx="6" pathLength={1} />
      </S.CardEdge>
      <S.CardTick $at="tl" aria-hidden="true" />
      <S.CardTick $at="tr" aria-hidden="true" />
      <S.CardTick $at="bl" aria-hidden="true" />
      <S.CardTick $at="br" aria-hidden="true" />

      <S.CardKind>
        <span>Character sheet</span>
        <b>
          <FiMapPin />
          Ashfall Realm
        </b>
      </S.CardKind>

      <S.Portrait $img="/images/Dorian.png" />

      <S.CardName>
        <S.Typed $delay={620} $ms={1150}>
          Dorian Ashcroft
        </S.Typed>
      </S.CardName>
      <S.CardHandle $delay={1600}>played by @vesper</S.CardHandle>

      <S.TagRow>
        <S.Tag $delay={1750}>Guarded</S.Tag>
        <S.Tag $delay={1880}>Ex-knight</S.Tag>
        <S.Tag $delay={2010}>Sharp tongue</S.Tag>
      </S.TagRow>

      <S.Voice $delay={2150}>
        &ldquo;Speaks in short, cold lines — and means every one of them.&rdquo;
      </S.Voice>

      <S.SealRow>
        <S.SealNote $delay={2800}>Character created</S.SealNote>
        <S.Seal $delay={2600}>
          <FiFeather />
        </S.Seal>
      </S.SealRow>
    </S.Card>
  </S.Scene>
);

// ─── Scene 2 · open a storyboard ──────────────────────────────────────────────

const StoryboardScene: FC = () => (
  <S.Scene>
    <S.Book>
      <S.Spine aria-hidden="true" />
      <S.Ribbon $delay={1700} aria-hidden="true" />

      <S.Leaf $side="left">
        <S.LeafLabel $delay={120}>New storyboard</S.LeafLabel>
        <S.BoardTitle>
          <S.Inked $delay={360} $ms={1300}>
            the ashes remember your name
          </S.Inked>
        </S.BoardTitle>
        <S.BoardMeta $delay={1600}>
          <li>
            <FiGlobe />
            Public
          </li>
          <li>
            <FiFeather />
            Enemies to lovers
          </li>
          <li>
            <FiMapPin />
            Ashfall Realm
          </li>
        </S.BoardMeta>
        <S.LeafFoot $delay={1800}>Chapter one</S.LeafFoot>
      </S.Leaf>

      <S.Leaf $side="right">
        <S.LeafLabel $delay={1400}>Opening scene</S.LeafLabel>
        <S.RuledText $delay={1520}>
          Rain on the ruined keep. Two people who should not be here, and one
          blade between them.
        </S.RuledText>

        <S.InviteRow $delay={2250}>
          <S.AvatarStack>
            <S.StackAvatar $delay={2350} $img="/images/Saraphine.png" />
            <S.StackAvatar $delay={2500} $img="/images/Rowan.png" />
            <S.StackAvatar $delay={2650} $img="/images/Casius.png" />
          </S.AvatarStack>
          <S.InviteText>
            <b>3 writers</b> invited
          </S.InviteText>
        </S.InviteRow>

        <S.Toast $delay={2900}>
          <FiUserPlus />
          <span>@inkwren joined</span>
        </S.Toast>
      </S.Leaf>
    </S.Book>
  </S.Scene>
);

// ─── Scene 3 · take your turn ─────────────────────────────────────────────────

const TurnScene: FC = () => (
  <S.Scene>
    <S.Thread>
      <S.ThreadInner>
        <S.Ply aria-hidden="true" />

        <S.Knot $delay={200}>
          <S.KnotAvatar $img="/images/Saraphine.png" />
          <div>
            <S.TurnWho>Seraphine Vale</S.TurnWho>
            <S.Line>
              She pressed the blade flat against his chest.{" "}
              <em>&ldquo;Give me one reason.&rdquo;</em>
            </S.Line>
          </div>
        </S.Knot>

        <S.Tying $delay={900} $until={1900}>
          <S.TypingDot $i={0} />
          <S.TypingDot $i={1} />
          <S.TypingDot $i={2} />
        </S.Tying>

        <S.Knot $delay={2000} $mine>
          <S.KnotAvatar $img="/images/Dorian.png" $mine />
          <div>
            <S.TurnWho>Dorian Ashcroft · you</S.TurnWho>
            <S.Line $mine>
              He smirked, eyes cold as ever.{" "}
              <em>&ldquo;Well what&rsquo;s stopping you?&rdquo;</em>
            </S.Line>
          </div>
        </S.Knot>

        <S.Tail $delay={2700}>
          <S.Reaction>
            <FiHeart />9
          </S.Reaction>
          <S.FloatingHeart $delay={2900}>
            <FaHeart />
          </S.FloatingHeart>
          <S.LivePill $delay={3000}>
            <S.LiveDot />
            @inkwren is writing back…
          </S.LivePill>
        </S.Tail>
      </S.ThreadInner>
    </S.Thread>
  </S.Scene>
);

const MOVES: Move[] = [
  {
    label: "Character",
    n: "01",
    scene: <CharacterScene />,
    text: "Give them a name, a voice, and a world worth belonging to. They are yours to write.",
    title: "Create a character",
  },
  {
    label: "Storyboard",
    n: "02",
    scene: <StoryboardScene />,
    text: "Set the opening scene, then invite the writers you want beside you in it.",
    title: "Open a storyboard",
  },
  {
    label: "Your turn",
    n: "03",
    scene: <TurnScene />,
    text: "Reply in character. Your partner answers as theirs. The story grows a turn at a time.",
    title: "Take your turn",
  },
];

const KICKERS = [
  { icon: <FiFeather />, text: "Move one" },
  { icon: <FiUsers />, text: "Move two" },
  { icon: <FiEdit3 />, text: "Move three" },
];

export const ThreeMoves: FC = () => {
  const [index, setIndex] = useState(0);
  // Direction the incoming scene should slide from: forward (1) or back (-1).
  const [dir, setDir] = useState(1);
  const [drag, setDrag] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  // Auto-advance is a hint, not a ride: the first manual pick hands the reel
  // over to the reader for good.
  const [taken, setTaken] = useState(false);
  const [reduce, setReduce] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragFrom = useRef<number | null>(null);
  // How much of the current beat's clock is left, so pausing freezes rather
  // than restarts it — the ring animation freezes with it.
  const remaining = useRef(BEAT_MS);

  const step = useCallback((delta: number, manual: boolean) => {
    setDir(delta >= 0 ? 1 : -1);
    setIndex((cur) => (cur + delta + MOVES.length) % MOVES.length);
    setDrag(0);
    if (manual) setTaken(true);
  }, []);

  const pick = useCallback(
    (next: number) => {
      setDir(next >= index ? 1 : -1);
      setIndex(next);
      setDrag(0);
      setTaken(true);
    },
    [index],
  );

  useEffect(() => {
    setReduce(prefersReducedMotion());
  }, []);

  // Only run while the section is actually on screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const paused = hovered || tabHidden || !visible;
  // The reel only runs itself until the reader takes the wheel.
  const auto = !taken && !reduce;
  const playing = auto && !paused;

  // A fresh clock for each beat. Declared before the timer effect so that on a
  // beat change it runs after the timer's cleanup (which banks the unspent
  // time) but before the timer re-arms.
  useEffect(() => {
    remaining.current = BEAT_MS;
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    const started = Date.now();
    const timer = setTimeout(() => step(1, false), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        400,
        remaining.current - (Date.now() - started),
      );
    };
  }, [playing, index, step]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const jump: Record<string, number | undefined> = {
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      End: MOVES.length - 1,
      Home: 0,
    };
    const next = jump[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const wrapped = (next + MOVES.length) % MOVES.length;
    pick(wrapped);
    beatRefs.current[wrapped]?.focus();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragFrom.current = event.clientX;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragFrom.current === null) return;
    const delta = event.clientX - dragFrom.current;
    // Rubber-banded so the panel gives a little without ever sliding away.
    setDrag(Math.max(-64, Math.min(64, delta * 0.4)));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragFrom.current === null) return;
    const delta = event.clientX - dragFrom.current;
    dragFrom.current = null;
    setDrag(0);
    if (Math.abs(delta) >= SWIPE_PX) step(delta < 0 ? 1 : -1, true);
  };

  const move = MOVES[index];
  const kicker = KICKERS[index];

  return (
    <S.Reel ref={rootRef}>
      <S.Rail
        role="tablist"
        aria-label="The three moves"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {MOVES.map((m, i) => (
          <Fragment key={m.n}>
            {i > 0 && <S.Rung $filled={index >= i} aria-hidden="true" />}
            <S.Beat
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`three-moves-tab-${m.n}`}
              aria-controls="three-moves-panel"
              aria-selected={index === i}
              tabIndex={index === i ? 0 : -1}
              $active={index === i}
              $done={index > i}
              onClick={() => pick(i)}
            >
              <S.BeatDisc $active={index === i} $done={index > i}>
                {m.n}
                {/* Mounted for the whole beat and merely paused, so pausing
                    freezes the sweep instead of restarting it. */}
                {index === i && auto && (
                  <S.Ring
                    viewBox="0 0 60 60"
                    $ms={BEAT_MS}
                    $paused={paused}
                    aria-hidden="true"
                  >
                    <circle cx="30" cy="30" r="26" />
                  </S.Ring>
                )}
              </S.BeatDisc>
              <S.BeatLabel $active={index === i}>{m.label}</S.BeatLabel>
            </S.Beat>
          </Fragment>
        ))}
      </S.Rail>

      <S.Stage
        id="three-moves-panel"
        role="tabpanel"
        aria-labelledby={`three-moves-tab-${move.n}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          dragFrom.current = null;
          setDrag(0);
        }}
      >
        <S.StageDrag key={move.n} $dir={dir} $drag={drag}>
          <S.Copy>
            <S.CopyKicker>
              {kicker.icon}
              {kicker.text}
            </S.CopyKicker>
            <S.CopyTitle>{move.title}</S.CopyTitle>
            <S.CopyText>{move.text}</S.CopyText>
            <S.CopyHint aria-hidden="true">
              <FiChevronsRight />
              Swipe, or use ← →, to walk the moves
            </S.CopyHint>
          </S.Copy>
          {move.scene}
        </S.StageDrag>
      </S.Stage>
    </S.Reel>
  );
};

export default ThreeMoves;
