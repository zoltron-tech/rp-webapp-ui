import { useSession } from "@nw/features";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/text";
import {
  backgroundRefreshStatus,
  bindStore,
  getStore,
  type LocalStore,
  mediaStats,
  purgeMedia,
  readActiveUser,
  readAllMeta,
  refreshStore,
  SCHEMA_VERSION,
  triggerBackgroundRefreshForTesting,
  wipeCurrentStore,
} from "@/lib/local-store";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * What the local store knows about itself, printed.
 *
 * The one place the sync bookkeeping (`meta`), the row counts and the cipher
 * state are visible without a debugger. No row contents — this screen must be
 * safe to screenshot into a bug report.
 */

const TABLES = [
  "novelist",
  "conversation",
  "message",
  "notification",
  "ice_breaker",
  "feed_page",
  "outbox",
  "thread",
  "reply",
] as const;

type Report = {
  activeUser: string | null;
  background: { available: boolean; registered: boolean };
  cipher: string | null;
  counts: Record<string, number>;
  fileVersion: number | null;
  journal: string | null;
  media: { bytes: number; chat: number; general: number; queued: number } | null;
  meta: Record<string, string>;
  open: boolean;
  userId: string | null;
};

const inspect = async (store: LocalStore | null): Promise<Report> => {
  const activeUser = await readActiveUser();
  const background = await backgroundRefreshStatus();
  if (!store) {
    return {
      activeUser,
      background,
      cipher: null,
      counts: {},
      fileVersion: null,
      journal: null,
      media: null,
      meta: {},
      open: false,
      userId: null,
    };
  }
  const { db } = store;
  const cipher = await db.getFirstAsync<{ cipher_version: string }>(
    "PRAGMA cipher_version",
  );
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const journal = await db.getFirstAsync<{ journal_mode: string }>(
    "PRAGMA journal_mode",
  );
  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    const row = await db.getFirstAsync<{ n: number }>(
      `SELECT count(*) AS n FROM ${table}`,
    );
    counts[table] = row?.n ?? 0;
  }
  return {
    activeUser,
    background,
    cipher: cipher?.cipher_version ?? null,
    counts,
    fileVersion: version?.user_version ?? null,
    journal: journal?.journal_mode ?? null,
    media: await mediaStats(store),
    meta: await readAllMeta(store),
    open: true,
    userId: store.userId,
  };
};

export const LocalStoreLab = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { novelist } = useSession();
  const queryClient = useQueryClient();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setReport(await inspect(getStore()));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const act = (run: () => Promise<unknown>) => () => {
    void run()
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : String(cause)),
      )
      .finally(refresh);
  };

  const line = (label: string, value: unknown) => (
    <View key={label} style={styles.row}>
      <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>
      <Text selectable style={[styles.value, { color: theme.text }]}>
        {value === null || value === undefined ? "—" : String(value)}
      </Text>
    </View>
  );

  const button = (label: string, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Text style={[styles.buttonLabel, { color: theme.accent.text }]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + space.lg, paddingTop: insets.top + space.md },
      ]}
      style={{ backgroundColor: theme.background, flex: 1 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Local store</Text>
      {error ? (
        <Text style={[styles.error, { color: theme.tones.danger.ink }]}>{error}</Text>
      ) : null}

      <Text style={[styles.section, { color: theme.textGray }]}>State</Text>
      {line("open", report?.open)}
      {line("user id", report?.userId)}
      {line("active user marker", report?.activeUser)}
      {line("cipher", report?.cipher ?? (report?.open ? "NONE (plaintext!)" : null))}
      {line("journal", report?.journal)}
      {line("schema", `${report?.fileVersion ?? "—"} / ${SCHEMA_VERSION}`)}
      {line(
        "background task",
        report
          ? `${report.background.available ? "available" : "restricted"}, ${report.background.registered ? "registered" : "not registered"}`
          : null,
      )}

      <Text style={[styles.section, { color: theme.textGray }]}>Rows</Text>
      {TABLES.map((table) => line(table, report?.counts[table]))}
      {line(
        "media",
        report?.media
          ? `${report.media.general} general + ${report.media.chat} chat, ${(report.media.bytes / 1024 / 1024).toFixed(1)} MB, ${report.media.queued} queued`
          : null,
      )}

      <Text style={[styles.section, { color: theme.textGray }]}>Meta</Text>
      {Object.entries(report?.meta ?? {}).map(([key, value]) =>
        line(key, key.endsWith(".at") ? new Date(Number(value)).toLocaleString() : value),
      )}
      {Object.keys(report?.meta ?? {}).length === 0 ? line("(empty)", "") : null}

      <View style={styles.actions}>
        {button("Refresh", () => void refresh())}
        {novelist?.id
          ? button("Open for session", act(() => bindStore(novelist.id, queryClient)))
          : null}
        {button("Refresh now", act(async () => {
          const store = getStore();
          if (store) await refreshStore(store);
        }))}
        {button("Trigger worker", act(triggerBackgroundRefreshForTesting))}
        {novelist?.id
          ? button("Copy DB key", act(async () => {
              // Development only (this whole screen is): the raw hex key, for
              // opening the file in DB Browser for SQLite (SQLCipher build).
              const key = await SecureStore.getItemAsync(`nw.dbKey.${novelist.id}`);
              if (key) await Clipboard.setStringAsync(`x'${key}'`);
            }))
          : null}
        {button("Purge media", act(async () => {
          const store = getStore();
          if (store) await purgeMedia(store);
        }))}
        {button("Wipe current", act(wipeCurrentStore))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, paddingTop: space.lg },
  button: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  buttonLabel: { fontSize: fontSize.label, fontWeight: "600" },
  content: { gap: space.xs, paddingHorizontal: space.md },
  error: { fontSize: fontSize.label },
  label: { flex: 1, fontSize: fontSize.caption },
  row: { flexDirection: "row", gap: space.m, paddingVertical: 2 },
  section: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 1,
    paddingTop: space.md,
    textTransform: "uppercase",
  },
  title: { fontSize: fontSize.title, fontWeight: "700" },
  value: { flex: 2, fontFamily: "monospace", fontSize: fontSize.caption },
});
