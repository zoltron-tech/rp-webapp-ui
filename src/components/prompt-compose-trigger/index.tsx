"use client";

import { useEffect, useState } from "react";
import { AvatarNew } from "@/components/common/avatar-new";
import type { NWImage } from "@/types";
import * as S from "./styled";

const DEFAULT_PLACEHOLDERS = [
  "💬 What's on your mind? IC or OOC!",
  "🎭 Got a starter? Drop it here!",
  "✍️ Say something — in character or not!",
  "📝 Share a thought or start a scene!",
  "🎬 What's your character up to?",
  "💡 Got something to say? IC or OOC!",
  "👋 Jump in! IC, OOC, anything goes!",
  "🌟 Start a story or just chat!",
];

export const COMMENT_PLACEHOLDERS = [
  "💬 Add a comment...",
  "✍️ Reply to this prompt...",
  "🎭 Jump into the scene...",
  "📝 Leave a comment...",
  "👋 Share your thoughts...",
  "💡 React to this prompt...",
  "🌟 Write a reply...",
  "🎬 Respond in character or OOC...",
];

export const COMMENT_OOC_PLACEHOLDERS = [
  "💬 Add an OOC comment...",
  "✍️ Share your OOC thoughts...",
  "💬 Chat about this post...",
  "💡 Leave a note OOC...",
  "👋 Weigh in out of character...",
  "📝 Reply out of character...",
  "🌟 Say something OOC...",
  "🤔 Any OOC thoughts?",
];

interface PromptComposeTriggerProps {
  avatarSrc?: string | null;
  avatarAlt?: string;
  /** When provided (with valid crop data), positions the avatar using the
   *  stored crop. Falls back to `avatarSrc` when null/absent. */
  avatarNwImage?: NWImage | null;
  onClick: () => void;
  className?: string;
  placeholders?: string[];
}

export const PromptComposeTrigger = ({
  avatarSrc,
  avatarAlt = "You",
  avatarNwImage,
  onClick,
  className,
  placeholders = DEFAULT_PLACEHOLDERS,
}: PromptComposeTriggerProps) => {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * placeholders.length),
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % placeholders.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, [placeholders]);

  return (
    <S.Root type="button" className={className} onClick={onClick}>
      <AvatarNew
        className="trigger-avatar"
        src={avatarSrc ?? null}
        alt={avatarAlt}
        nwImage={avatarNwImage}
      />
      <S.FakeInput>
        <S.Placeholder $visible={visible}>{placeholders[index]}</S.Placeholder>
      </S.FakeInput>
    </S.Root>
  );
};
