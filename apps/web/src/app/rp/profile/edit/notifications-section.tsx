"use client";

import {
  CHAT_MUTE_KEY,
  MUTE_KINDS,
  useMuteActions,
  useNotificationMutes,
} from "@nw/features";
import { TbBellOff } from "react-icons/tb";
import { useUIContext } from "@/hooks/use-ui-context";
import * as S from "./styled";

/**
 * Which notifications may interrupt, inside the account settings.
 *
 * Each switch is a kind of notification; "Messages" is every conversation at
 * once (one conversation is muted from its own page). Off means the push and
 * the buzz stop — the notification is still written, listed and counted, so
 * turning something off hides nothing.
 */
export function NotificationsSection() {
  const { has, isPending } = useNotificationMutes();
  const { mute, unmute } = useMuteActions();
  const { errorToast } = useUIContext();

  const toggle = async (key: string, on: boolean) => {
    try {
      // On means "notify me": no mute row.
      if (on) await unmute(key);
      else await mute(key, null);
    } catch {
      errorToast("That setting could not be saved. Please try again.");
    }
  };

  const rows = [
    ...MUTE_KINDS,
    {
      description:
        "New messages in any conversation. One conversation can be muted from its own page.",
      key: CHAT_MUTE_KEY,
      label: "Messages",
    },
  ];

  return (
    <S.AccountGroup>
      <S.AccountGroupHeading>
        <TbBellOff />
        Notifications
      </S.AccountGroupHeading>

      {rows.map((row) => {
        const on = !has(row.key);
        return (
          <S.AccountRow key={row.key}>
            <S.AccountRowMain>
              <S.AccountRowLabel>{row.label}</S.AccountRowLabel>
              <S.AccountRowValue>{row.description}</S.AccountRowValue>
            </S.AccountRowMain>
            <S.AccountRowActions>
              <S.Switch
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${row.label} notifications`}
                disabled={isPending}
                onClick={() => void toggle(row.key, !on)}
              >
                <span />
              </S.Switch>
            </S.AccountRowActions>
          </S.AccountRow>
        );
      })}

      <S.AccountRowValue>
        Off stops the push and the sound. What happened still shows in your
        notifications.
      </S.AccountRowValue>
    </S.AccountGroup>
  );
}
