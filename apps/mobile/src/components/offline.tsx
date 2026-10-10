import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { EmptyScene } from "@/components/empty-feed";
import { Text } from "@/components/text";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * What a screen shows where the network should have been.
 *
 * Offline is not an error — nothing went wrong, the phone is just somewhere
 * the signal does not reach — so this is drawn as one of the product's paper
 * scenes rather than as the grey "That did not load" line: a lighthouse
 * whose lamp is out, searching. The sentence names what is missing
 * (`what`), says the rest is still here, and offers to look again.
 *
 * Two sizes. The **scene** fills a list that has nothing to show. The
 * **line** sits inside something that is already on screen — a rail in the
 * feed, the comments under a card — where a full scene would shout.
 *
 * `ListStatus` draws this for every list that goes through it; the handful
 * of screens with their own skeletons call it directly. The copy lives here
 * and nowhere else.
 */

export type OfflineWhat =
  | "comments"
  | "feed"
  | "generic"
  | "page"
  | "rail"
  | "thread";

const COPY: Record<OfflineWhat, { line: string; subtitle: string; title: string }> = {
  comments: {
    line: "Threads need a signal. They'll come in when you're back online.",
    subtitle: "The replies under this one haven't been kept for offline reading.",
    title: "Threads need a signal",
  },
  feed: {
    line: "The feed needs a signal to go further.",
    subtitle:
      "You're offline, and nothing from this feed has been saved yet. What you've read before stays on the shelf; the rest comes in with the signal.",
    title: "The tide's out",
  },
  generic: {
    line: "Needs a signal. Back when you're connected.",
    subtitle:
      "You're offline. This part needs a connection; what you've already read is still here.",
    title: "No light from the shore",
  },
  page: {
    line: "This page needs a signal.",
    subtitle:
      "You're offline and this page hasn't been opened while connected, so there's nothing saved to show. It'll be here once the signal is.",
    title: "Beyond the signal",
  },
  rail: {
    line: "Needs a signal — back when you're connected.",
    subtitle: "You're offline, and this row hasn't been saved yet.",
    title: "Needs a signal",
  },
  thread: {
    line: "This thread needs a signal.",
    subtitle:
      "You're offline and this thread hasn't been kept for offline reading. Open it again once you're connected.",
    title: "Beyond the signal",
  },
};

export const OfflineNotice = ({
  compact = false,
  onRetry,
  what = "generic",
}: {
  /** The one-line form, for inside something already on screen. */
  compact?: boolean;
  onRetry?: () => void;
  what?: OfflineWhat;
}) => {
  const theme = useAppTheme();
  const copy = COPY[what];

  if (compact) {
    return (
      <View
        accessibilityRole="text"
        style={[styles.line, { borderColor: theme.material.edge }]}
      >
        <Ionicons
          color={theme.textGray}
          name="cloud-offline-outline"
          size={16}
        />
        <Text style={[styles.lineText, { color: theme.textGray }]}>
          {copy.line}
        </Text>
        {onRetry ? (
          <Pressable accessibilityRole="button" hitSlop={space.xs} onPress={onRetry}>
            <Text style={[styles.lineRetry, { color: theme.textLink }]}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.scene}>
      <EmptyScene
        scene="dark-lighthouse"
        subtitle={copy.subtitle}
        title={copy.title}
      />
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.retryLabel, { color: theme.textLink }]}>
            Look again
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    marginHorizontal: space.md,
    paddingVertical: space.m,
  },
  lineRetry: { fontSize: fontSize.caption, fontWeight: "600" },
  lineText: { flex: 1, fontSize: fontSize.caption, lineHeight: 17 },
  // The scene carries its own vertical air; the retry tucks under it.
  retry: { marginTop: -space.md, padding: space.sm },
  retryLabel: { fontSize: fontSize.body, fontWeight: "600" },
  scene: { alignItems: "center", width: "100%" },
});
