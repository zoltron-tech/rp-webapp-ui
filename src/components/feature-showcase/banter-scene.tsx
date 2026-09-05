"use client";

import { prefersReducedMotion } from "@nw/utils/platform";
import { type FC, useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import * as S from "./styles";
import { createSceneClock, useInViewOnce } from "./use-scene-loop";

/* A scripted mock of two writers trading a scene in character. The point it
 * makes visually is the one thing the app does that a chat app doesn't: each
 * turn is spoken by a *muse*, and credited to the novelist who penned it. */

type Turn = {
  initial: string;
  mine?: boolean;
  name: string;
  pennedBy: string;
  text: string;
  time: string;
  tone: string;
};

const TURNS: Turn[] = [
  {
    initial: "S",
    name: "Seraphine Vale",
    pennedBy: "penned by @inkwren",
    text: "You brought a blade to a library. Bold.",
    time: "12:04",
    tone: "linear-gradient(135deg,#c8a87c,#8e5b3a)",
  },
  {
    initial: "D",
    mine: true,
    name: "Dorian Ashcroft",
    pennedBy: "penned by @vesper",
    text: "The books started it.",
    time: "12:06",
    tone: "linear-gradient(135deg,#6fa0c1,#2a4a6b)",
  },
  {
    initial: "S",
    name: "Seraphine Vale",
    pennedBy: "penned by @inkwren",
    text: "Then I'd hate to see what the poetry section did to you.",
    time: "12:09",
    tone: "linear-gradient(135deg,#c8a87c,#8e5b3a)",
  },
];

export const BanterScene: FC = () => {
  const [ref, visible] = useInViewOnce<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (prefersReducedMotion()) {
      setShown(TURNS.length);
      setLiked(true);
      return;
    }

    const clock = createSceneClock();
    const { wait, isCancelled } = clock;

    const run = async () => {
      while (!isCancelled()) {
        setShown(0);
        setTyping(false);
        setLiked(false);
        await wait(800);

        for (let i = 0; i < TURNS.length; i += 1) {
          setTyping(true);
          await wait(900);
          if (isCancelled()) return;
          setTyping(false);
          setShown(i + 1);
          await wait(1000);
        }

        // The other writer reacts to the last line.
        setLiked(true);
        await wait(2400);
      }
    };
    run();

    return clock.stop;
  }, [visible]);

  return (
    <S.Frame ref={ref}>
      <S.FrameGlow />
      <S.TitleBar>
        <S.Dots>
          <i />
          <i />
          <i />
        </S.Dots>
        <S.TitleText>The Hollow Spire · shared scene</S.TitleText>
      </S.TitleBar>
      <S.Body>
        <S.SceneHead>
          <S.CastStack>
            <span
              style={{ background: "linear-gradient(135deg,#c8a87c,#8e5b3a)" }}
            >
              S
            </span>
            <span
              style={{ background: "linear-gradient(135deg,#6fa0c1,#2a4a6b)" }}
            >
              D
            </span>
          </S.CastStack>
          2 writers · chapter 3<S.ScenePill>Open scene</S.ScenePill>
        </S.SceneHead>
        <S.Thread>
          {TURNS.slice(0, shown).map((turn, i) => (
            <S.Turn key={turn.text} $mine={turn.mine}>
              <S.TurnAvatar $tone={turn.tone}>{turn.initial}</S.TurnAvatar>
              <S.Bubble $mine={turn.mine}>
                <S.TurnName>
                  {turn.name}
                  <S.TurnTime>{turn.time}</S.TurnTime>
                </S.TurnName>
                {turn.text}
                <S.PennedBy>{turn.pennedBy}</S.PennedBy>
                {liked && i === TURNS.length - 1 && (
                  <S.Reaction>
                    <FaHeart size={8} color="#e0566f" /> 3
                  </S.Reaction>
                )}
              </S.Bubble>
            </S.Turn>
          ))}

          {typing && (
            <S.Turn $mine={shown % 2 === 1}>
              <S.TurnAvatar $tone={TURNS[shown % TURNS.length].tone}>
                {TURNS[shown % TURNS.length].initial}
              </S.TurnAvatar>
              <S.Bubble $mine={shown % 2 === 1}>
                <S.TypingDots>
                  <i />
                  <i />
                  <i />
                </S.TypingDots>
              </S.Bubble>
            </S.Turn>
          )}
        </S.Thread>

        {/* The composer is the point of the scene: you pick which character
            speaks before you send, so the turn lands in their voice. */}
        <S.Composer>
          <S.ComposerMuse $tone="linear-gradient(135deg,#6fa0c1,#2a4a6b)">
            <i>D</i>
            Dorian
          </S.ComposerMuse>
          <S.ComposerField>
            <S.ComposerHint>Write the next turn</S.ComposerHint>
          </S.ComposerField>
          <S.SendButton $active={typing}>
            <FiSend size={11} />
          </S.SendButton>
        </S.Composer>
      </S.Body>
    </S.Frame>
  );
};
