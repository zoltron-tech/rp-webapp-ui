import { queryKeys, useSession } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { forgetSession } from "@/lib/auth";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * What the app shows while it does not yet know who is using it.
 *
 * It used to show nothing: the tab shell returned `null` while the session was
 * unknown, which is right for the few hundred milliseconds that normally
 * takes and a blank, silent screen for as long as it takes when something has
 * gone wrong — a session the server refused, a request that never answers, a
 * build pointed at the wrong API. There was nothing to read and nothing to
 * press.
 *
 * So: a spinner at once, and after [STALLED_AFTER_MS] a sentence and two ways
 * out. "Try again" asks the server once more. "Start over" forgets whatever
 * session is stored and goes to the public page, which needs none — the way
 * out of a session that will never be accepted.
 */

/** Long enough that a slow network never sees it; short enough to be found. */
const STALLED_AFTER_MS = 8000;

export const StartupFallback = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetch } = useSession();
  const [stalled, setStalled] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStalled(true), STALLED_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setStalled(false);
    refetch();
    // Ask again later, in case this attempt hangs too.
    setTimeout(() => setStalled(true), STALLED_AFTER_MS);
  };

  const startOver = async () => {
    setLeaving(true);
    await forgetSession().catch(() => undefined);
    // Settled as "nobody", so every screen that waits on the session moves on.
    queryClient.setQueryData(queryKeys.session(), null);
    router.replace("/welcome");
  };

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.primary} />
      {stalled ? (
        <View style={styles.stalled}>
          <Text style={[styles.title, { color: theme.text }]}>
            This is taking longer than it should
          </Text>
          <Text style={[styles.body, { color: theme.textGray }]}>
            Check your connection and try again. If it keeps happening, start
            over and sign in again.
          </Text>
          <View style={styles.actions}>
            <Button
              icon="refresh"
              label="Try again"
              onPress={retry}
              variant="primary"
            />
            <Button
              busy={leaving}
              label="Start over"
              onPress={() => void startOver()}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: space.sm, marginTop: space.sm },
  body: {
    fontSize: fontSize.body,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: "center",
  },
  fill: {
    alignItems: "center",
    flex: 1,
    gap: space.lg,
    justifyContent: "center",
    padding: space.lg,
  },
  stalled: { alignItems: "center", gap: space.sm },
  title: { fontSize: fontSize.lead, fontWeight: "700", textAlign: "center" },
});
