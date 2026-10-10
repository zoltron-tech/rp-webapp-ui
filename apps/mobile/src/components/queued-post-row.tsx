import { Ionicons } from "@expo/vector-icons";
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Text } from "@/components/text";
import type { OutboxPost } from "@/lib/local-store";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * A post, comment or reply that is waiting in the outbox, drawn where it will
 * land — under the card for a comment, in the thread for a reply — so the
 * writer sees it in place rather than wondering where it went.
 *
 * Deliberately not the real row: it has no id to react to, open or share,
 * and pretending otherwise would be a tap that goes nowhere. What it has is
 * who wrote it, the words, the state, and the one thing that can be done
 * with it — not sending it after all.
 */
export const QueuedPostRow = ({
  entry,
  onDiscard,
}: {
  entry: OutboxPost;
  onDiscard: (id: string) => void;
}) => {
  const theme = useAppTheme();
  const { source } = entry.payload;
  const words = richTextToPlainText(parseRichText(entry.payload.text)).trim();

  const discard = () =>
    Alert.alert(
      "Don't send this?",
      "It will be removed from the outbox and never posted.",
      [
        { style: "cancel", text: "Keep" },
        { onPress: () => onDiscard(entry.id), style: "destructive", text: "Don't send" },
      ],
    );

  return (
    <View style={styles.row}>
      <Avatar name={source.name} size={28} uri={source.avatar?.src ?? source.image} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {source.name}
        </Text>
        {words ? (
          <Text numberOfLines={4} style={[styles.words, { color: theme.text }]}>
            {words}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Ionicons color={theme.textGray} name="cloud-offline-outline" size={12} />
          <Text style={[styles.metaText, { color: theme.textGray }]}>
            Waiting for connection
          </Text>
          <Pressable accessibilityRole="button" hitSlop={space.xs} onPress={discard}>
            <Text style={[styles.discard, { color: theme.error }]}>Don't send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, gap: 2, minWidth: 0 },
  discard: { fontSize: fontSize.caption, fontWeight: "600", marginLeft: space.sm },
  meta: { alignItems: "center", flexDirection: "row", gap: space.xs, paddingTop: 2 },
  metaText: { fontSize: fontSize.caption },
  name: { fontSize: fontSize.label, fontWeight: "700" },
  row: {
    flexDirection: "row",
    gap: space.sm,
    opacity: 0.85,
    paddingVertical: space.sm,
  },
  words: { fontSize: fontSize.body, lineHeight: 20 },
});
