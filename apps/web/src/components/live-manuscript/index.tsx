"use client";

import { prefersReducedMotion } from "@nw/utils/platform";
import { type FC, useEffect, useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import {
  FiCheck,
  FiEdit3,
  FiEye,
  FiGlobe,
  FiHeart,
  FiImage,
  FiMusic,
  FiSend,
  FiShare2,
  FiUser,
} from "react-icons/fi";
import * as S from "./styles";

/* ─────────────────────────────────────────────────────────────────────────────
   A scripted, self-contained demo of Novelist World's core move: writing a turn
   *as one of your muses*. On a loop it plays out —
     1. @vesper types a reply into the composer,
     2. clicks the avatar button at the left of the input,
     3. a picker pops up over the input and a muse (Dorian) is chosen,
     4. clicks send,
     5. the reply slides up into the shared thread as that muse.
   Purely presentational — no data or network.
   ──────────────────────────────────────────────────────────────────────────── */

// The settled turn already in the thread, for context. The muse is the sender;
// the person who penned it is credited at the bottom of the message.
const OPENING = {
  from: "#C8A87C",
  img: "/images/Saraphine.png",
  initial: "S",
  name: "Seraphine Vale",
  time: "24m",
  to: "#8E5B3A",
  user: { from: "#C87A9A", handle: "@inkwren", to: "#6B2E45" },
};

// The writer composing the new turn, and the muses they can send it as.
const WRITER = { from: "#9A8AC8", handle: "@vesper", to: "#3E3564" };
const MUSES = [
  {
    from: "#6FA0C1",
    img: "/images/Dorian.png",
    initial: "D",
    meta: "Ashfall Realm",
    name: "Dorian Ashcroft",
    role: "Dorian",
    to: "#2A4A6B",
  },
  {
    from: "#B58BD6",
    img: "/images/Casius.png",
    initial: "C",
    meta: "Original",
    name: "Cassius Vale",
    role: "Cassius",
    to: "#4A2E63",
  },
  {
    from: "#7FB58A",
    img: "/images/Rowan.png",
    initial: "R",
    meta: "Nightvale",
    name: "Rowan Blackwood",
    role: "Rowan",
    to: "#2E4A38",
  },
];
const CHOSEN = 0; // Dorian

const COMPOSED = 'He smirked, eyes cold as ever. "Well what\'s stopping you?"';

// Classic arrow-cursor glyph for the demo pointer.
const CursorIcon: FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 2 L4 18 L8.5 13.6 L11.4 20 L14 18.9 L11.2 12.7 L18 12.4 Z"
      fill="currentColor"
      stroke="#0b0a0d"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

export const LiveManuscript: FC = () => {
  const [typed, setTyped] = useState("");
  const [museIdx, setMuseIdx] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState<"hide" | "avatar" | "send">(
    "hide",
  );
  const [pressAvatar, setPressAvatar] = useState(false);
  const [pressSend, setPressSend] = useState(false);
  const [ripple, setRipple] = useState<{
    target: "avatar" | "send";
    key: number;
  } | null>(null);
  const [sent, setSent] = useState(false);
  const [dorianLiked, setDorianLiked] = useState(false);
  const [heartFloat, setHeartFloat] = useState<number | null>(null);
  const rippleKey = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  // Start the scripted animation the first time the panel is actually on
  // screen, independent of the page's data/auth loading. It begins from frame 0
  // when the hero becomes visible instead of being tied to any fetch.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const reduce = prefersReducedMotion();

    if (reduce) {
      setTyped("");
      setMuseIdx(CHOSEN);
      setSent(true);
      setDorianLiked(true);
      return;
    }

    let cancelled = false;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        timeouts.add(t);
      });

    const typeOut = async (text: string) => {
      for (let i = 0; i <= text.length; i += 1) {
        if (cancelled) return;
        setTyped(text.slice(0, i));
        await wait(34 + Math.random() * 34);
      }
    };

    const fireRipple = (target: "avatar" | "send") => {
      rippleKey.current += 1;
      setRipple({ key: rippleKey.current, target });
    };

    const run = async () => {
      while (!cancelled) {
        // Reset to a blank composer.
        setSent(false);
        setMuseIdx(null);
        setPickerOpen(false);
        setCursorPos("hide");
        setRipple(null);
        setTyped("");
        setDorianLiked(false);
        setHeartFloat(null);
        await wait(700);

        // 1 — type the reply
        await typeOut(COMPOSED);
        if (cancelled) return;
        await wait(650);

        // 2 — move to the avatar button and click it
        setCursorPos("avatar");
        await wait(600);
        setPressAvatar(true);
        fireRipple("avatar");
        await wait(180);
        setPressAvatar(false);

        // 3 — picker opens, a muse is chosen
        setPickerOpen(true);
        await wait(850);
        setMuseIdx(CHOSEN);
        await wait(750);
        setPickerOpen(false);
        await wait(400);

        // 4 — move to send and click it
        setCursorPos("send");
        await wait(600);
        setPressSend(true);
        fireRipple("send");
        await wait(180);
        setPressSend(false);

        // 5 — the reply slides up into the thread
        setSent(true);
        setTyped("");
        setCursorPos("hide");

        // 6 — a few seconds later, a reader likes Dorian's turn: a heart
        //     floats up and a heart reaction settles under his message.
        await wait(1600);
        if (cancelled) return;
        setHeartFloat(Date.now());
        setDorianLiked(true);
        await wait(2600);
      }
    };

    run();
    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    };
  }, [visible]);

  const chosenMuse = museIdx !== null ? MUSES[museIdx] : null;
  const composing = typed.length > 0 && !sent;
  const placeholder = typed.length === 0;

  return (
    <S.Wrapper ref={rootRef}>
      <S.Floaty $pos="tl" aria-hidden="true">
        <FiEdit3 style={{ color: "var(--accent)" }} />
        <b>@vesper</b> is writing back…
      </S.Floaty>
      <S.Floaty $pos="br" aria-hidden="true">
        <S.Sheen />
        <FiHeart style={{ color: "var(--accent)" }} />
        <b>9</b> readers loved this scene
      </S.Floaty>

      <S.Panel aria-label="A live collaborative story in progress">
        <S.Bar>
          <S.Dot />
          <S.Dot />
          <S.Dot />
          <S.BarTitle>
            <FiEdit3 />
            <span>
              the ashes remember your name · <b>ch.4</b>
            </span>
          </S.BarTitle>
          <S.BarVis>
            <FiGlobe />
            Public
          </S.BarVis>
        </S.Bar>

        <S.MetaRow>
          <S.Tag $accent>Ashfall Realm</S.Tag>
          <S.Tag>Enemies to lovers</S.Tag>
          <S.Tag>Haunting of Saraphine</S.Tag>
          <S.WordCount>3,120 words</S.WordCount>
        </S.MetaRow>

        <S.Body>
          {/* Settled turn */}
          <S.Turn $delay={0.2}>
            <S.Avatar $from={OPENING.from} $img={OPENING.img} $to={OPENING.to}>
              {OPENING.initial}
            </S.Avatar>
            <S.TurnBody>
              <S.TurnHead>
                <S.TurnName>{OPENING.name}</S.TurnName>
                <S.TurnTime>{OPENING.time}</S.TurnTime>
              </S.TurnHead>
              <S.TurnText>
                She pressed the blade flat against his chest.{" "}
                <em>&ldquo;Give me one reason,&rdquo;</em> she breathed,{" "}
                <em>&ldquo;and I swear it will be your last.&rdquo;</em>
              </S.TurnText>
              <S.ReactionRow>
                <S.Reaction $accent>
                  <FiHeart />
                  12
                </S.Reaction>
                <S.ShareButton type="button" aria-label="Share this turn">
                  <FiShare2 />
                </S.ShareButton>
              </S.ReactionRow>
              <S.PennedBy>
                <S.PennedByAvatar
                  $from={OPENING.user.from}
                  $to={OPENING.user.to}
                />
                penned by <b>{OPENING.user.handle}</b>
              </S.PennedBy>
            </S.TurnBody>
          </S.Turn>

          {/* The just-sent turn, rising into the thread as the chosen muse.
              Always mounted so the panel keeps a constant height; it is only
              made visible once the demo actually sends it. The muse is a
              constant (CHOSEN), so the reserved layout matches the real one
              exactly. */}
          {(() => {
            const turnMuse = chosenMuse ?? MUSES[CHOSEN];
            const pending = !sent || !chosenMuse;
            return (
              <S.Turn $delay={0} $reserved={pending} $slide={!pending}>
                <S.Avatar
                  $from={turnMuse.from}
                  $img={turnMuse.img}
                  $to={turnMuse.to}
                >
                  {turnMuse.initial}
                </S.Avatar>
                <S.TurnBody>
                  <S.TurnHead>
                    <S.TurnName>{turnMuse.name}</S.TurnName>
                    <S.TurnTime>now</S.TurnTime>
                  </S.TurnHead>
                  <S.TurnText>
                    He smirked, eyes cold as ever.{" "}
                    <em>&ldquo;Well what&rsquo;s stopping you?&rdquo;</em>
                  </S.TurnText>
                  <S.ReactionRow $reserved={!dorianLiked}>
                    <S.Reaction $accent $bump>
                      <FiHeart />1
                    </S.Reaction>
                    {heartFloat !== null && (
                      <S.FloatingHeart key={heartFloat} aria-hidden="true">
                        <FaHeart style={{ color: "#e0245e" }} />
                      </S.FloatingHeart>
                    )}
                  </S.ReactionRow>
                  <S.PennedBy>
                    <S.PennedByAvatar $from={WRITER.from} $to={WRITER.to} />
                    penned by <b>{WRITER.handle}</b>
                  </S.PennedBy>
                </S.TurnBody>
              </S.Turn>
            );
          })()}
        </S.Body>

        {/* Composer + character picker + demo cursor */}
        <S.ComposerArea>
          <S.Picker $open={pickerOpen} aria-hidden="true">
            <S.PickerHead>
              <FiUser />
              Write this turn as…
            </S.PickerHead>
            {MUSES.map((m, i) => (
              <S.PickerItem key={m.name} $selected={museIdx === i}>
                <S.Avatar $from={m.from} $img={m.img} $to={m.to}>
                  {m.initial}
                </S.Avatar>
                <S.PickerName>{m.name}</S.PickerName>
                {museIdx === i ? (
                  <S.PickerCheck>
                    <FiCheck />
                  </S.PickerCheck>
                ) : (
                  <S.PickerMeta>{m.meta}</S.PickerMeta>
                )}
              </S.PickerItem>
            ))}
          </S.Picker>

          <S.ComposerTools aria-hidden="true">
            <S.ToolButton>
              <FiImage />
              Image
            </S.ToolButton>
            <S.ToolButton>GIF</S.ToolButton>
            <S.ToolButton>
              <FiMusic />
              Music
            </S.ToolButton>
          </S.ComposerTools>

          <S.Composer data-active={pickerOpen || chosenMuse !== null}>
            <S.MuseButton
              type="button"
              data-pressed={pressAvatar}
              aria-hidden="true"
              $from={chosenMuse?.from}
              $img={chosenMuse?.img}
              $to={chosenMuse?.to}
            >
              {chosenMuse ? chosenMuse.initial : <FiUser />}
            </S.MuseButton>

            <S.ComposerText $placeholder={placeholder}>
              {placeholder ? "Reply to the scene…" : typed}
              {composing && <S.Caret />}
            </S.ComposerText>

            <S.SendButton
              data-pressed={pressSend}
              $active={chosenMuse !== null}
            >
              <FiSend />
            </S.SendButton>

            <S.Cursor $pos={cursorPos}>
              <CursorIcon />
            </S.Cursor>
            {ripple && <S.Ripple key={ripple.key} $target={ripple.target} />}
          </S.Composer>
        </S.ComposerArea>

        <S.Foot>
          <S.Writers>
            <S.AvatarStack>
              <S.Avatar
                $from={OPENING.from}
                $img={OPENING.img}
                $to={OPENING.to}
              >
                {OPENING.initial}
              </S.Avatar>
              <S.Avatar
                $from={MUSES[CHOSEN].from}
                $img={MUSES[CHOSEN].img}
                $to={MUSES[CHOSEN].to}
              >
                {MUSES[CHOSEN].initial}
              </S.Avatar>
            </S.AvatarStack>
            2 writing now
          </S.Writers>
          <S.Viewers>
            <FiEye />
            14 reading
          </S.Viewers>
          <S.LivePill>
            <S.LiveDot />
            Live
          </S.LivePill>
        </S.Foot>
      </S.Panel>
    </S.Wrapper>
  );
};

export default LiveManuscript;
