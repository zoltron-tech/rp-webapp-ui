import {
  getSessions,
  logoutOtherDevices,
  revokeSession,
} from "@nw/api/endpoints/account";
import { useApi } from "@nw/features";
import { API_MESSAGE, type AuthSession } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { DevicesSkeleton } from "@/components/sheet-skeletons";
import {
  Chip,
  Notice,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useSignOut } from "@/hooks/use-sign-out";
import { space, useAppTheme } from "@/theme";

/**
 * Web's `DevicesSection`: every device signed in to this account.
 *
 * Three actions, deliberately distinct, because they answer different fears:
 * revoking one row ("that tablet is my old one"), signing out the others ("I
 * left myself logged in somewhere"), and signing out everywhere ("someone
 * else is in my account"). The current device has no revoke button — ending
 * your own session from a list reads as a mistake.
 */

const SESSIONS_KEY = ["account", "sessions"] as const;

/** user-service sends epoch seconds; anything under 1e12 is seconds. */
const toMillis = (value: string | number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (
    typeof value === "number" ||
    (value.trim() !== "" && !Number.isNaN(numeric))
  ) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  return new Date(value).getTime();
};

const relativeTime = (value: string | number): string => {
  const then = toMillis(value);
  if (Number.isNaN(then)) return "unknown";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 90) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "yesterday" : `${days} days ago`;
  return new Date(then).toLocaleDateString();
};

const deviceIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("iphone") || lower.includes("android"))
    return "phone-portrait-outline" as const;
  if (lower.includes("ipad") || lower.includes("tablet"))
    return "tablet-portrait-outline" as const;
  return "laptop-outline" as const;
};

export default function DevicesScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { signOutEverywhere } = useSignOut();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"others" | "everywhere" | null>(null);

  const sessions = useQuery({
    queryFn: async () => {
      const result = await getSessions(api);
      if ("message" in result) throw new Error(result.message);
      return result;
    },
    queryKey: SESSIONS_KEY,
  });

  const list = sessions.data ?? [];
  const others = list.filter((it) => !it.isCurrent).length;

  const revoke = async (session: AuthSession) => {
    setRevokingId(session.id);
    const result = await revokeSession(api, session.id).catch(() => null);
    setRevokingId(null);
    if (result?.message !== API_MESSAGE.Success) {
      Alert.alert("Not signed out", "Could not sign that device out. Try again.");
      return;
    }
    queryClient.setQueryData<AuthSession[]>(SESSIONS_KEY, (current) =>
      (current ?? []).filter((it) => it.id !== session.id),
    );
  };

  const confirmOthers = () =>
    Alert.alert(
      "Sign out your other devices?",
      `This ends ${others === 1 ? "1 other session" : `${others} other sessions`}. You will stay signed in here.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("others");
            const result = await logoutOtherDevices(api).catch(() => null);
            setBusy(null);
            if (result?.message !== API_MESSAGE.Success) {
              Alert.alert("Not signed out", "Could not sign your other devices out.");
              return;
            }
            queryClient.setQueryData<AuthSession[]>(SESSIONS_KEY, (current) =>
              (current ?? []).filter((it) => it.isCurrent),
            );
          },
          style: "destructive",
          text: "Sign out others",
        },
      ],
    );

  const confirmEverywhere = () =>
    Alert.alert(
      "Sign out everywhere?",
      "This ends every session on your account, including this one. You will need to sign in again.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("everywhere");
            const ok = await signOutEverywhere();
            setBusy(null);
            if (!ok) Alert.alert("Not signed out", "Could not sign all devices out.");
          },
          style: "destructive",
          text: "Sign out everywhere",
        },
      ],
    );

  const pull = usePullToRefresh(sessions.refetch);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.body,
        { paddingBottom: insets.bottom + space.xl },
      ]}
      refreshControl={
        <RefreshControl
          onRefresh={pull.onRefresh}
          refreshing={pull.refreshing}
          tintColor={theme.textGray}
        />
      }
    >
      {sessions.isPending || sessions.error ? (
        <ListStatus
          error={sessions.error}
          loading={sessions.isPending}
          onRetry={() => void sessions.refetch()}
          skeleton={<DevicesSkeleton />}
        />
      ) : (
        <>
          <SettingsGroup title="Where you are signed in">
            {list.map((session) => (
              <SettingsRow
                accessory={
                  session.isCurrent ? (
                    <Chip label="This device" tone="accent" />
                  ) : (
                    <PillButton
                      busy={revokingId === session.id}
                      icon="log-out-outline"
                      label="Sign out"
                      onPress={() => void revoke(session)}
                    />
                  )
                }
                icon={deviceIcon(session.deviceLabel)}
                key={session.id}
                label={session.deviceLabel}
                subtitle={`Active ${relativeTime(session.lastUsedAt)} · Signed in ${relativeTime(session.createdAt)}`}
                tone={session.isCurrent ? "accent" : "neutral"}
              />
            ))}
          </SettingsGroup>

          {others === 0 ? (
            <Notice>This is the only device signed in to your account.</Notice>
          ) : null}

          <SettingsGroup
            footer="Use “Sign out everywhere” if you think someone else has access to your account."
            title="Account-wide"
          >
            <SettingsRow
              busy={busy === "others"}
              chevron={false}
              disabled={others === 0}
              icon="exit-outline"
              label="Sign out everywhere else"
              onPress={confirmOthers}
              subtitle="Ends every session except this one."
              tone="neutral"
            />
            <SettingsRow
              busy={busy === "everywhere"}
              chevron={false}
              icon="shield-outline"
              label="Sign out of everything"
              onPress={confirmEverywhere}
              subtitle="Ends every session, including this one."
              tone="danger"
            />
          </SettingsGroup>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, padding: space.sm + 4 },
});
