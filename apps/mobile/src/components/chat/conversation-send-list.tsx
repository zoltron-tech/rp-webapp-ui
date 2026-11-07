import { messagePreview, resolveConversationTarget } from "@nw/chat";
import { useChatCrypto, useConversations, useSession } from "@nw/features";
import type { Conversation } from "@nw/types";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { SearchField } from "@/components/search-field";
import { Text } from "@/components/text";
import { useChatSocket } from "@/context/socket";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Your conversations, each with a Send button that sends `text` into it as
 * you — the body of the forward sheet and of "Send in a chat" in the share
 * trays (web's `ForwardMessageDialog` and `SendToChatPanel`).
 *
 * Each send is encrypted for its own conversation, because each has its own
 * key, and goes over the socket, as on web. Each row is its own send, so a
 * press can be seen to have worked, and a row that has sent stays sent while
 * the list is mounted — key it by what is being sent to start over.
 *
 * The search covers the pages already loaded, as the inbox's does; there is
 * no conversation search on the server. "Load more" stays under the results
 * so an older chat can still be reached.
 */

const keyExtractor = (conversation: Conversation) => conversation.id;

export const ConversationSendList = ({
  detail,
  excludeId,
  failTitle,
  text,
}: {
  /**
   * The line under each name: the last message ("preview"), or who it is —
   * "@handle", "Group · 5 members" ("who").
   */
  detail: "preview" | "who";
  /** A conversation not to offer, e.g. the one a message is forwarded from. */
  excludeId?: string;
  /** The alert's title when a send is refused: "Not forwarded", "Not sent". */
  failTitle: string;
  /** What each Send sends. Empty is refused with an alert. */
  text: string;
}) => {
  const theme = useAppTheme();
  const crypto = useChatCrypto();
  const { novelist } = useSession();
  const { isConnected, sendMessage } = useChatSocket();
  const {
    conversations,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useConversations();

  const [search, setSearch] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<ReadonlySet<string>>(new Set());

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations
      .filter((conversation) => conversation.id !== excludeId)
      .filter((conversation) => {
        if (!query) return true;
        const target = resolveConversationTarget(
          conversation,
          novelist?.username,
        );
        return (
          (target.name ?? "").toLowerCase().includes(query) ||
          target.username.toLowerCase().includes(query)
        );
      });
  }, [conversations, excludeId, novelist?.username, search]);

  const send = useCallback(
    async (conversationId: string) => {
      if (!text) {
        Alert.alert(failTitle, "There is nothing to send.");
        return;
      }
      if (!isConnected) {
        Alert.alert("Not connected", "Please wait a moment and try again.");
        return;
      }
      setSendingTo(conversationId);
      const wire = await crypto
        .encryptMessageText(conversationId, text)
        .catch(() => null);
      const accepted =
        wire !== null &&
        sendMessage({
          attachments: null,
          conversationId,
          message: wire,
          repliedTo: null,
          sender: {
            id: novelist?.id ?? "",
            image: novelist?.image ?? null,
            messageSourceType: "NOVELIST",
            name:
              `${novelist?.firstName ?? ""} ${novelist?.lastName ?? ""}`.trim() ||
              novelist?.username ||
              "",
            // Overwritten by the server from the authenticated connection.
            username: novelist?.username ?? "",
          },
          type: "TEXT",
        });
      setSendingTo(null);
      if (accepted) {
        setSentTo((current) => new Set(current).add(conversationId));
      } else {
        Alert.alert(failTitle, "Please try again.");
      }
    },
    [crypto, failTitle, isConnected, novelist, sendMessage, text],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const target = resolveConversationTarget(item, novelist?.username);
      const members = item.memberCount ?? item.members?.length;
      const line =
        detail === "preview"
          ? messagePreview(item.lastMessage ?? null, "noun").text
          : item.isGroup
            ? members
              ? `Group · ${members} members`
              : "Group"
            : target.username
              ? `@${target.username}`
              : "";
      const sent = sentTo.has(item.id);
      return (
        <View style={styles.row}>
          <Avatar
            name={target.name}
            size={40}
            uri={target.image}
            username={item.isGroup ? null : target.username}
          />
          <View style={styles.names}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {target.name || "Conversation"}
            </Text>
            {line ? (
              <Text
                numberOfLines={1}
                style={[styles.line, { color: theme.textGray }]}
              >
                {line}
              </Text>
            ) : null}
          </View>
          <Button
            accessibilityLabel={
              sent ? `Sent to ${target.name}` : `Send to ${target.name}`
            }
            busy={sendingTo === item.id}
            disabled={sent || sendingTo !== null}
            icon={sent ? "checkmark" : undefined}
            label={sent ? "Sent" : "Send"}
            onPress={() => void send(item.id)}
            size="xs"
            variant={sent ? undefined : "primary"}
          />
        </View>
      );
    },
    [detail, novelist?.username, send, sendingTo, sentTo, theme],
  );

  return (
    <View style={styles.body}>
      <SearchField
        onChangeText={setSearch}
        placeholder={
          detail === "who" ? "Search friends and groups" : "Search conversations"
        }
        value={search}
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={rows}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              search.trim()
                ? "No conversation by that name."
                : "No conversations yet."
            }
            error={error}
            loading={isPending}
            onRetry={() => void refetch()}
          />
        }
        ListFooterComponent={
          hasNextPage ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : null
        }
        renderItem={renderItem}
        style={styles.listBox}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
  line: { fontSize: fontSize.caption },
  list: { gap: space.sm, paddingBottom: space.md },
  listBox: { flex: 1 },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  names: { flex: 1, minWidth: 0 },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
