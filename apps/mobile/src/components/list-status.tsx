import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
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
 */
export const ListStatus = ({
  empty,
  error,
  loading,
  onRetry,
  skeleton,
}: {
  empty?: string;
  error?: unknown;
  loading?: boolean;
  onRetry?: () => void;
  /** Drawn in place of the spinner while loading. */
  skeleton?: ReactNode;
}) => {
  const theme = useAppTheme();

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
