"use client";

import {
  conversationMuteKey,
  describeMute,
  isMuted,
  MUTE_DURATIONS,
  muteUntil,
  useMuteActions,
} from "@nw/features";
import type { Conversation } from "@nw/types";
import { type FC, useState } from "react";
import { TbBell, TbBellOff } from "react-icons/tb";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as SheetS from "@/components/common/responsive-sheet/styles";
import { useUIContext } from "@/hooks/use-ui-context";
import * as S from "./styles";

/**
 * Mute or unmute this conversation, from its details page.
 *
 * Muted, the button says so and one click unmutes. Not muted, it opens the
 * duration picker — a dialog on desktop, a tray on a phone, like every other
 * choice the app asks for. Messages still arrive and still count as unread;
 * only the push and the sound stop.
 */
export const MuteControl: FC<{
  conversation: Conversation;
  /** The row as it now stands, for the page that holds it. */
  onChange: (mutedUntil: string | null) => void;
}> = ({ conversation, onChange }) => {
  const { mute, unmute, pending } = useMuteActions();
  const { errorToast, successToast } = useUIContext();
  const [open, setOpen] = useState(false);
  const key = conversationMuteKey(conversation.id);
  const muted = isMuted(conversation.mutedUntil);

  const pick = async (ms: number | null) => {
    setOpen(false);
    const until = muteUntil(ms);
    try {
      await mute(key, until);
      onChange(until ?? "9999-12-31T00:00:00Z");
      successToast("Conversation muted");
    } catch {
      errorToast("Could not mute this conversation. Please try again.");
    }
  };

  const clear = async () => {
    try {
      await unmute(key);
      onChange(null);
      successToast("Conversation unmuted");
    } catch {
      errorToast("Could not unmute this conversation. Please try again.");
    }
  };

  return (
    <>
      <S.MuteButton
        type="button"
        $muted={muted}
        disabled={pending}
        onClick={() => (muted ? void clear() : setOpen(true))}
        aria-label={muted ? "Unmute conversation" : "Mute conversation"}
        title={describeMute(conversation.mutedUntil) ?? "Mute"}
      >
        {muted ? <TbBellOff size={15} /> : <TbBell size={15} />}
        <span className="mute-label">{muted ? "Unmute" : "Mute"}</span>
      </S.MuteButton>

      <ResponsiveSheet
        open={open}
        title="Mute for how long?"
        onClose={() => setOpen(false)}
      >
        <S.MuteOptions>
          {MUTE_DURATIONS.map((duration) => (
            <SheetS.ToggleRow
              key={duration.id}
              type="button"
              onClick={() => void pick(duration.ms)}
            >
              {duration.label}
            </SheetS.ToggleRow>
          ))}
          <S.MuteHint>
            Messages still arrive and still count as unread. Only the push and
            the sound stop.
          </S.MuteHint>
        </S.MuteOptions>
      </ResponsiveSheet>
    </>
  );
};
