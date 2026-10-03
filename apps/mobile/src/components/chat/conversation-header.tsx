import { Ionicons } from "@expo/vector-icons";
import { useUnreadConversations } from "@nw/features";
import type { Conversation } from "@nw/types";
import { pluralize } from "@nw/utils";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { GlassSurface } from "@/components/glass-surface";
import { useChatSocket, useIsOnline } from "@/context/socket";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The bar above a conversation.
 *
 * ## Why it is not the stack's header
 *
 * It used to be, passed in as `headerTitle`. A navigator header gives you a
 * slot between a back button and whatever is on the right, and it does not tell
 * you how wide that slot is — so the title carried a hardcoded `maxWidth: 240`
 * to stop it colliding with either side. That number is wrong on every screen
 * size but the one it was measured on: on a small phone it overlapped, and on a
 * large one it truncated names with half the bar empty beside them.
 *
 * Drawn here instead, the row is an ordinary flex layout: the back button and
 * the info button take what they need, the name takes the rest, and it is right
 * at every width without a magic number.
 *
 * ## What it says
 *
 * Three things, in the order they are looked for: who, whether they are there,
 * and the way into the details. Presence is a coloured dot *and* a word, never
 * colour alone — and while our own socket is down it says "Connecting…" rather
 * than claiming the other person is offline, which is a statement about them
 * made from no information at all.
 *
 * ## The badge on the back arrow
 *
 * How many *other* conversations are waiting. Opening a thread hides the inbox
 * and its tab badge with it, so without this the only way to learn that three
 * more people have written is to leave and look — and the whole point of the
 * badge is to make leaving worth it. The current conversation is excluded on
 * purpose: it is being read, and counting it would leave a badge that never
 * clears while you sit in the thread that caused it.
 */
export const ConversationHeader = ({
  conversation,
  conversationId,
  memberCount,
  onBack,
  onPress,
  target,
}: {
  conversation: Conversation | null;
  /** Excluded from the back arrow's badge — this is the one being read. */
  conversationId?: string;
  memberCount?: number;
  onBack: () => void;
  onPress: () => void;
  target: { name: string; image: string | null; username: string };
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useChatSocket();
  const { ids: unreadIds } = useUnreadConversations();
  const isOnline = useIsOnline(conversation?.isGroup ? null : target.username);

  const waiting = unreadIds.filter((id) => id !== conversationId).length;

  const count = memberCount ?? conversation?.members?.length ?? 0;
  const isGroup = Boolean(conversation?.isGroup);

  const subtitle = isGroup
    ? `${count} ${pluralize("member", count)}`
    : isOnline
      ? "Active now"
      : isConnected
        ? "Offline"
        : "Connecting…";

  const subtitleColor = isGroup
    ? theme.textGray
    : isOnline
      ? theme.success
      : theme.textGray;

  return (
    // Glass with an edge along its foot. It sits in the column rather than over
    // the thread, so what shows through it is the chat background, not the
    // messages; putting the thread under it is the chat pass (plan M3).
    <GlassSurface
      bordered="bottom"
      style={[
        styles.bar,
        // The bar owns the status bar area rather than sitting under it: the
        // screen is edge to edge, so nothing else reserves it.
        { paddingTop: insets.top },
      ]}
      variant="bar"
    >
      <Pressable
        accessibilityLabel={
          waiting > 0 ? `Back to inbox, ${waiting} unread` : "Back to inbox"
        }
        accessibilityRole="button"
        hitSlop={space.sm}
        onPress={onBack}
        style={({ pressed }) => [styles.icon, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Ionicons color={theme.text} name="chevron-back" size={26} />
        {waiting > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.accent.solid,
                // Ringed in the bar's own colour so it reads as sitting on top
                // of the arrow rather than merging into it.
                borderColor: theme.glass.opaque,
              },
            ]}
          >
            <Text style={styles.badgeLabel}>
              {waiting > 99 ? "99+" : waiting}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        accessibilityHint="Opens conversation details"
        accessibilityLabel={`${target.name || "Conversation"}, ${subtitle}`}
        accessibilityRole="button"
        onPress={onPress}
        // `flex: 1` on the tap target, not just the text: the whole middle of
        // the bar opens the details, which is where people already aim.
        style={({ pressed }) => [
          styles.identity,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        {isGroup ? (
          <View
            style={[
              styles.groupAvatar,
              {
                backgroundColor: theme.glass.fillHover,
                borderColor: theme.glass.edge,
              },
            ]}
          >
            <Ionicons color={theme.accent.text} name="people" size={18} />
          </View>
        ) : (
          <Avatar
            name={target.name}
            size={38}
            uri={target.image}
            username={target.username}
          />
        )}

        <View style={styles.text}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {target.name || "Conversation"}
          </Text>
          <View style={styles.subtitleRow}>
            {/* A dot as well as a word. Colour on its own is not a signal for
                everyone, and the word is what a screen reader announces. */}
            {!isGroup && isOnline ? (
              <View style={[styles.dot, { backgroundColor: theme.success }]} />
            ) : null}
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: subtitleColor }]}
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel="Conversation details"
        accessibilityRole="button"
        hitSlop={space.sm}
        onPress={onPress}
        style={({ pressed }) => [styles.icon, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Ionicons
          color={theme.text}
          name="information-circle-outline"
          size={24}
        />
      </Pressable>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -2,
    top: -1,
  },
  badgeLabel: { color: "#ffffff", fontSize: 9, fontWeight: "800" },
  bar: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    paddingBottom: space.sm,
    paddingHorizontal: space.sm,
  },
  dot: { borderRadius: 3, height: 6, width: 6 },
  groupAvatar: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  icon: { padding: space.xs },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.sm,
    // Room to breathe from the two icons, without a fixed width that is wrong
    // on every screen but one.
    minWidth: 0,
    paddingVertical: space.xs,
  },
  name: { fontSize: fontSize.body, fontWeight: "700" },
  subtitle: { flexShrink: 1, fontSize: fontSize.caption },
  subtitleRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  text: { flex: 1, gap: 1, minWidth: 0 },
});
