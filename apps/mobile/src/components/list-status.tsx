import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { OfflineNotice, type OfflineWhat } from "@/components/offline";
import { Text } from "@/components/text";
import { isNetworkError, useOffline } from "@/lib/connectivity";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * The three things that are not a list: loading, failed, and genuinely empty.
 *
 * One component because the distinction is the point — a list that renders
 * nothing while loading and nothing when empty is a screen nobody can debug,
 * and it is exactly what the web app's early pages did before they grew
 * separate states.
 *
 * Loading is a spinner unless the list says what its rows look like: given a
 * `skeleton`, the ghosts are drawn instead, in the rows' own geometry — see
 * `components/skeleton.tsx`.
 *
 * ## Offline
 *
 * A fourth thing, recognised here so no list has to: when the phone has no
 * network (`lib/connectivity.ts`) and the list has nothing — it is waiting on
 * a fetch that is paused, or it failed on the network — the offline scene is
 * drawn in place of the spinner or the error. `offlineWhat` picks the
 * sentence; `comments` draws the one-line form, for a list inside a card.
 */
export const ListStatus = ({
  empty,
  error,
  loading,
  offlineWhat = "generic",
  onRetry,
  skeleton,
}: {
  /** A sentence, or a drawn empty state of the list's own. */
  empty?: ReactNode;
  error?: unknown;
  loading?: boolean;
  /** What is missing, for the offline sentence. */
  offlineWhat?: OfflineWhat;
  onRetry?: () => void;
  /** Drawn in place of the spinner while loading. */
  skeleton?: ReactNode;
}) => {
  const theme = useAppTheme();
  const offline = useOffline();

  if ((loading || error) && (offline || isNetworkError(error))) {
    return (
      <OfflineNotice
        compact={offlineWhat === "comments"}
        onRetry={onRetry}
        what={offlineWhat}
      />
    );
  }

  if (loading && skeleton) return <>{skeleton}</>;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.message, { color: theme.textGray }]}>
          That did not load.
        </Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retry}>
            <Text style={[styles.retryLabel, { color: theme.textLink }]}>
              Try again
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!empty) return null;

  if (typeof empty !== "string") return <>{empty}</>;

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: theme.textGray }]}>{empty}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: space.sm, padding: space.xl },
  message: { fontSize: fontSize.body, textAlign: "center" },
  retry: { padding: space.sm },
  retryLabel: { fontSize: fontSize.body, fontWeight: "600" },
});
