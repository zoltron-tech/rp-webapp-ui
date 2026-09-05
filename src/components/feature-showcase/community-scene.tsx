"use client";

import { prefersReducedMotion } from "@nw/utils/platform";
import { type FC, useEffect, useState } from "react";
import * as S from "./styles";
import { createSceneClock, useInViewOnce } from "./use-scene-loop";

/* A scripted mock of the Novelist World Discord: messages arrive in
 * #looking-for-rp while the online count ticks. Deliberately a *stylised*
 * likeness rather than a copy of Discord's chrome — it stands in for "there is
 * a community over here", and is built from this app's own tokens. */

const CHANNELS = ["welcome", "looking-for-rp", "writing-help", "showcase"];
const ACTIVE_CHANNEL = 1;

const MESSAGES = [
  {
    author: "inkwren",
    initial: "I",
    reacts: ["✍️ 4", "🔥 2"],
    text: "Anyone up for a slow-burn court intrigue? Two muses free.",
    tone: "linear-gradient(135deg,#c87a9a,#6b2e45)",
  },
  {
    author: "vesper",
    initial: "V",
    text: "I have a disgraced knight who'd fit that perfectly.",
    tone: "linear-gradient(135deg,#9a8ac8,#3e3564)",
  },
  {
    author: "mothlight",
    initial: "M",
    text: "Starting a thread now. Jump in, both of you.",
    tone: "linear-gradient(135deg,#7fb58a,#2e4a38)",
  },
];

const MEMBERS = [
  {
    away: false,
    initial: "I",
    name: "inkwren",
    tone: "linear-gradient(135deg,#c87a9a,#6b2e45)",
  },
  {
    away: false,
    initial: "V",
    name: "vesper",
    tone: "linear-gradient(135deg,#9a8ac8,#3e3564)",
  },
  {
    away: false,
    initial: "M",
    name: "mothlight",
    tone: "linear-gradient(135deg,#7fb58a,#2e4a38)",
  },
  {
    away: true,
    initial: "R",
    name: "rookery",
    tone: "linear-gradient(135deg,#c8a87c,#8e5b3a)",
  },
];

const ONLINE_FROM = 212;

export const CommunityScene: FC = () => {
  const [ref, visible] = useInViewOnce<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const [online, setOnline] = useState(ONLINE_FROM);

  useEffect(() => {
    if (!visible) return;

    if (prefersReducedMotion()) {
      setShown(MESSAGES.length);
      setOnline(ONLINE_FROM + MESSAGES.length);
      return;
    }

    const clock = createSceneClock();
    const { wait, isCancelled } = clock;

    const run = async () => {
      while (!isCancelled()) {
        setShown(0);
        setOnline(ONLINE_FROM);
        await wait(900);

        for (let i = 0; i < MESSAGES.length; i += 1) {
          if (isCancelled()) return;
          setShown(i + 1);
          setOnline((n) => n + 1);
          await wait(1500);
        }

        await wait(2200);
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
        <S.TitleText>Novelist World · community</S.TitleText>
      </S.TitleBar>
      <S.Body>
        <S.Discord>
          <S.ServerRail>
            <S.ServerPip $active>NW</S.ServerPip>
            <S.ServerPip>A</S.ServerPip>
            <S.ServerPip>R</S.ServerPip>
          </S.ServerRail>

          <S.ChannelList>
            <S.ServerName>Novelist World</S.ServerName>
            {CHANNELS.map((name, i) => (
              <S.Channel key={name} $active={i === ACTIVE_CHANNEL}>
                # {name}
              </S.Channel>
            ))}
          </S.ChannelList>

          <S.ChatPane>
            <S.ChatHead>
              # {CHANNELS[ACTIVE_CHANNEL]}
              <S.OnlinePill>
                <i />
                {online} online
              </S.OnlinePill>
            </S.ChatHead>

            {MESSAGES.slice(0, shown).map((message) => (
              <S.ChatLine key={message.author}>
                <S.ChatAvatar $tone={message.tone}>
                  {message.initial}
                </S.ChatAvatar>
                <S.ChatBody>
                  <S.ChatAuthor>@{message.author}</S.ChatAuthor>
                  <S.ChatText>{message.text}</S.ChatText>
                  {message.reacts && (
                    <S.ChatReacts>
                      {message.reacts.map((react) => (
                        <S.ChatReact key={react}>{react}</S.ChatReact>
                      ))}
                    </S.ChatReacts>
                  )}
                </S.ChatBody>
              </S.ChatLine>
            ))}

            {shown > 0 && shown < MESSAGES.length && (
              <S.ChatTyping>
                <S.TypingDots>
                  <i />
                  <i />
                  <i />
                </S.TypingDots>
                someone is typing
              </S.ChatTyping>
            )}
          </S.ChatPane>

          <S.MemberList>
            <S.MemberGroup>Online</S.MemberGroup>
            {MEMBERS.filter((m) => !m.away).map((member) => (
              <S.Member key={member.name}>
                <S.MemberDot $tone={member.tone}>{member.initial}</S.MemberDot>
                {member.name}
              </S.Member>
            ))}
            <S.MemberGroup>Away</S.MemberGroup>
            {MEMBERS.filter((m) => m.away).map((member) => (
              <S.Member key={member.name}>
                <S.MemberDot $tone={member.tone} $away>
                  {member.initial}
                </S.MemberDot>
                {member.name}
              </S.Member>
            ))}
          </S.MemberList>
        </S.Discord>
      </S.Body>
    </S.Frame>
  );
};
