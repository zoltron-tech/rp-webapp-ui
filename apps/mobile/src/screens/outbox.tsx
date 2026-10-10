import { Ionicons } from "@expo/vector-icons";
import { resolveConversationTarget } from "@nw/chat";
import { queryKeys, useSession } from "@nw/features";
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Conversation } from "@nw/types";
import { toChatDayLabel, toChatTime } from "@nw/utils";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Alert, Pressable, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { EmptyScene } from "@/components/empty-feed";
import { Text } from "@/components/text";
import { useOffline } from "@/lib/connectivity";
import {
  discardOutbox,
  getStore,
  isOutboxMessage,
  type OutboxEntry,
  type OutboxPost,
  useOutbox,
} from "@/lib/local-store";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The outbox: everything waiting for a connection, grouped by where it goes.
 *
 * Opened from the menu, and from the offline strip when it says something is
 * waiting. The thread, the feed and the comment list already show each
 * queued item in place; this is the view across the app — what is going to
 * go out, to whom or where, and the way to either open that place or decide
 * an item should not be sent after all. Removing one here is the same "Don't
 * send" the item itself offers, and just as final.
 *
 * Messages are grouped by conversation; posts by what they are — a new
 * prompt or post, a comment (under its prompt), a reply (in its thread).
 * Names and faces come from the inbox the local store hydrated, so the page
 * is complete offline — which is the only time it has anything to show.
 *
 * The header is declared on the route in `app/_layout.tsx`, not here. Turned
 * on from inside the screen (hidden → shown after the first commit), the
 * native header measured no status-bar inset when the first render was a
 * drawn scene, and sat under the clock; declared up front it never has to
 * re-measure.
 */

interface Section {
  data: OutboxEntry[];
  image: string | null;
  key: string;
  /** Where "Open" goes, when there is somewhere to go. */
  open: (() => void) | null;
  openLabel: string;
  title: string;
}

const plain = (text: string) => richTextToPlainText(parseRichText(text)).trim();

const POST_TITLE = {
  comment: "Comments",
  prompt: "New prompts & posts",
  reply: "Replies",
} as const;

export const OutboxScreen = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { novelist } = useSession();
  const offline = useOffline();
  const entries = useOutbox();

  const openChat = useCallback(
    (conversationId: string) => {
      router.navigate({
        params: { conversationId },
        pathname: "/(tabs)/(inbox)/[conversationId]",
      });
    },
    [router],
  );

  const sections = useMemo<Section[]>(() => {
    const inbox = queryClient
      .getQueryData<InfiniteData<Conversation[]>>(queryKeys.conversations())
      ?.pages.flat();

    const byConversation = new Map<string, OutboxEntry[]>();
    const posts: Record<OutboxPost["type"], OutboxPost[]> = {
      comment: [],
      prompt: [],
      reply: [],
    };
    for (const entry of entries) {
      if (isOutboxMessage(entry)) {
        const list = byConversation.get(entry.conversationId) ?? [];
        list.push(entry);
        byConversation.set(entry.conversationId, list);
      } else {
        posts[entry.type].push(entry);
      }
    }

    const out: Section[] = [...byConversation].map(([conversationId, data]) => {
      const conversation =
        queryClient.getQueryData<Conversation>(queryKeys.conversation(conversationId)) ??
        inbox?.find((item) => item.id === conversationId) ??
        null;
      const target = resolveConversationTarget(conversation, novelist?.username);
      return {
        data,
        image: target.image,
        key: `conversation-${conversationId}`,
        open: () => openChat(conversationId),
        openLabel: "Open chat",
        title: target.name || "Conversation",
      };
    });

    for (const type of ["prompt", "comment", "reply"] as const) {
      if (posts[type].length === 0) continue;
      out.push({
        data: posts[type],
        image: null,
        key: `posts-${type}`,
        open: null,
        openLabel: "",
        title: POST_TITLE[type],
      });
    }
    return out;
  }, [entries, novelist?.username, openChat, queryClient]);

  /** Where a post lands: the prompt page for a comment, the thread for a reply. */
  const openPostPlace = useCallback(
    (entry: OutboxPost) => {
      if (entry.type === "comment" && entry.payload.promptId) {
        router.navigate({
          params: { promptId: entry.payload.promptId },
          pathname: "/(tabs)/(home)/prompt/[promptId]",
        });
      } else if (entry.type === "reply" && entry.payload.commentId) {
        router.navigate({
          params: { threadId: entry.payload.commentId },
          pathname: "/(tabs)/(home)/threads/[threadId]",
        });
      } else if (entry.type === "prompt") {
        router.navigate("/(tabs)/(explore)");
      }
    },
    [router],
  );

  const discard = useCallback((entry: OutboxEntry) => {
    Alert.alert(
      "Don't send this?",
      "It will be removed from the outbox and never sent.",
      [
        { style: "cancel", text: "Keep" },
        {
          onPress: () => {
            const store = getStore();
            if (store) void discardOutbox(store, entry.id).catch(() => undefined);
          },
          style: "destructive",
          text: "Don't send",
        },
      ],
    );
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) =>
      section.open ? (
        <Pressable
          accessibilityLabel={`${section.title}. ${section.openLabel}`}
          accessibilityRole="button"
          onPress={section.open}
          style={({ pressed }) => [styles.sectionHeader, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Avatar name={section.title} size={32} uri={section.image} />
          <Text numberOfLines={1} style={[styles.sectionTitle, { color: theme.text }]}>
            {section.title}
          </Text>
          <Text style={[styles.open, { color: theme.textLink }]}>{section.openLabel}</Text>
          <Ionicons color={theme.textLink} name="chevron-forward" size={16} />
        </Pressable>
      ) : (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionEyebrow, { color: theme.textGray }]}>
            {section.title.toUpperCase()}
          </Text>
        </View>
      ),
    [theme],
  );

  const renderItem = useCallback(
    ({ item }: { item: OutboxEntry }) => {
      const message = isOutboxMessage(item);
      const words = plain(message ? item.text : item.payload.text);
      const when = `${toChatDayLabel(item.createdAt)} · ${toChatTime(item.createdAt)}`;
      let detail = `Written ${when}`;
      if (message) {
        if (item.sender && item.sender.type === "MUSE") detail += ` · as ${item.sender.name}`;
        const pictures = item.attachments.length;
        if (pictures > 0) detail += ` · ${pictures} ${pictures === 1 ? "picture" : "pictures"}`;
      } else {
        detail += ` · as ${item.payload.source.name}`;
      }
      const context =
        !message && item.parent ? `${item.parent.author}: ${plain(item.parent.text)}` : null;
      const open = message ? () => openChat(item.conversationId) : () => openPostPlace(item);

      return (
        <View
          style={[
            styles.row,
            { backgroundColor: theme.material.fill, borderColor: theme.material.edge },
          ]}
        >
          <Pressable accessibilityRole="button" onPress={open} style={styles.rowBody}>
            {context ? (
              <Text numberOfLines={1} style={[styles.context, { color: theme.textGray }]}>
                {!message && item.type === "reply" ? "Replying to " : "On "}
                {context}
              </Text>
            ) : null}
            {words ? (
              <Text numberOfLines={3} style={[styles.message, { color: theme.text }]}>
                {words}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Ionicons color={theme.textGray} name="cloud-offline-outline" size={12} />
              <Text style={[styles.meta, { color: theme.textGray }]}>{detail}</Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityLabel="Don't send"
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={() => discard(item)}
            style={({ pressed }) => [styles.trash, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons color={theme.error} name="trash-outline" size={18} />
          </Pressable>
        </View>
      );
    },
    [discard, openChat, openPostPlace, theme],
  );

  return (
    <View style={styles.fill}>
      <SectionList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyScene
            scene="no-conversations"
            subtitle="Messages, posts, comments and replies you write without a signal wait here, and go out the moment you're back online."
            title="Nothing waiting"
          />
        }
        ListHeaderComponent={
          entries.length > 0 ? (
            <View
              style={[
                styles.note,
                { backgroundColor: theme.material.fill, borderColor: theme.material.edge },
              ]}
            >
              <Ionicons
                color={theme.textGray}
                name={offline ? "cloud-offline-outline" : "cloud-upload-outline"}
                size={14}
              />
              <Text style={[styles.noteText, { color: theme.textGray }]}>
                {offline
                  ? "Offline — these will send the moment you're back online."
                  : "Connected — sending now."}
              </Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm },
  context: { fontSize: fontSize.caption, fontStyle: "italic" },
  fill: { flex: 1 },
  message: { fontSize: fontSize.body, lineHeight: 21 },
  meta: { flex: 1, fontSize: fontSize.caption },
  metaRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  note: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  noteText: { flex: 1, fontSize: fontSize.caption, lineHeight: 17 },
  open: { fontSize: fontSize.caption, fontWeight: "600" },
  row: {
    alignItems: "center",
    borderRadius: radius.card,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.m,
  },
  rowBody: { flex: 1, gap: space.xs, minWidth: 0 },
  sectionEyebrow: { fontSize: fontSize.caption, fontWeight: "700", letterSpacing: 1 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingTop: space.md,
  },
  sectionTitle: { flex: 1, fontSize: fontSize.body, fontWeight: "700", minWidth: 0 },
  trash: { padding: space.xs },
});
