import { Ionicons } from "@expo/vector-icons";
import { deleteGroup, leaveGroup } from "@nw/api/endpoints/conversation-detail";
import { isGroupAdmin, resolveConversationTarget } from "@nw/chat";
import {
  queryKeys,
  useApi,
  useConversation,
  useConversationMembers,
  useSession,
} from "@nw/features";
import type { ConversationParticipant } from "@nw/types";
import { pluralize, toFormattedDate } from "@nw/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { ListStatus } from "@/components/list-status";
import { useChatSocket, useIsOnline, useTrackOnline } from "@/context/socket";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Conversation details: who is in it, and the ways out of it.
 *
 * Members come from the paginated endpoint rather than `conversation.members`.
 * The embedded array is whatever the list response chose to include, which for
 * a large group is a prefix — a screen headed "42 members" above a list of
 * twenty is worse than one that takes a moment longer.
 *
 * Group mutations are declared here rather than in `@nw/features` on purpose:
 * that package's rule is that a hook has a real consumer in both apps, and the
 * web details page already has its own server actions for these. A shared hook
 * with one caller is a guess about the second one.
 */

const ROW_AVATAR = 40;

export default function ConversationDetailsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  // Part of the conversation, so the bar stays away here too — otherwise it
  // reappears the moment someone taps through to the details.
  useHideTabBar();

  const { novelist } = useSession();
  const { isConnected } = useChatSocket();
  const { conversation, isPending: conversationPending } =
    useConversation(conversationId);
  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    members,
    refetch,
  } = useConversationMembers(conversationId);

  const target = useMemo(
    () => resolveConversationTarget(conversation, novelist?.username),
    [conversation, novelist?.username],
  );

  useTrackOnline(
    useMemo(() => members.map((member) => member.userName), [members]),
  );

  const targetOnline = useIsOnline(
    conversation?.isGroup ? null : target.username,
  );
  const amAdmin = isGroupAdmin(members, novelist?.username);
  const isGroup = Boolean(conversation?.isGroup);

  /**
   * Leaving and deleting both end the conversation for this reader, so both
   * clear the caches and pop back to the inbox. Invalidating rather than
   * removing: the inbox is the authority on what is left.
   */
  const afterExit = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.unreadConversations(),
    });
    router.dismissAll();
    router.replace("/(tabs)/(inbox)");
  };

  const leave = useMutation({
    mutationFn: () => leaveGroup(api, conversationId ?? ""),
    onError: () =>
      Alert.alert("Could not leave", "That did not go through. Try again."),
    onSuccess: afterExit,
  });

  const remove = useMutation({
    mutationFn: () => deleteGroup(api, conversationId ?? ""),
    onError: () =>
      Alert.alert("Could not delete", "That did not go through. Try again."),
    onSuccess: afterExit,
  });

  const confirmLeave = () =>
    Alert.alert(
      "Leave this group?",
      "You will stop receiving its messages. Someone in the group has to add you back to rejoin.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => leave.mutate(),
          style: "destructive",
          text: "Leave",
        },
      ],
    );

  const confirmDelete = () =>
    Alert.alert(
      "Delete this group?",
      "The group and its messages are removed for everyone in it. This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => remove.mutate(),
          style: "destructive",
          text: "Delete",
        },
      ],
    );

  const openProfile = (username: string) => {
    if (!username) return;
    router.push({
      params: { username },
      pathname: "/(tabs)/(home)/novelist/[username]",
    });
  };

  const renderMember = ({ item }: { item: ConversationParticipant }) => {
    const name =
      `${item.firstName} ${item.lastName ?? ""}`.trim() || item.userName;
    const role = item.role?.toUpperCase();
    const isMe = item.userName === novelist?.username;

    return (
      <Pressable
        disabled={isMe}
        onPress={() => openProfile(item.userName)}
        style={({ pressed }) => [
          styles.memberRow,
          {
            backgroundColor:
              pressed && !isMe ? theme.material.fillPressed : theme.material.fill,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Avatar
          name={name}
          size={ROW_AVATAR}
          uri={item.image}
          username={item.userName}
        />

        <View style={styles.memberText}>
          <View style={styles.memberNameRow}>
            <Text
              numberOfLines={1}
              style={[styles.memberName, { color: theme.text }]}
            >
              {name}
            </Text>
            {item.isVerified ? (
              <Ionicons
                color={theme.accent.text}
                name="checkmark-circle"
                size={14}
              />
            ) : null}
            {role === "ADMIN" || role === "OWNER" ? (
              <View
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: theme.accent.tint,
                    borderColor: theme.accent.surfaceHover,
                  },
                ]}
              >
                <Text style={[styles.roleLabel, { color: theme.accent.text }]}>
                  {role === "OWNER" ? "Owner" : "Admin"}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            numberOfLines={1}
            style={[styles.memberHandle, { color: theme.textGray }]}
          >
            @{item.userName}
            {isMe ? " · you" : ""}
          </Text>
        </View>

        {!isMe ? (
          <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
        ) : null}
      </Pressable>
    );
  };

  const busy = leave.isPending || remove.isPending;

  return (
    <>
      <Stack.Screen options={{ title: "Details" }} />

      <FlatList
        contentContainerStyle={styles.content}
        data={members}
        keyExtractor={(item) => item.novelistId || item.userName}
        ListEmptyComponent={
          <ListStatus
            empty="No members to show."
            error={error}
            loading={isPending || conversationPending}
            onRetry={refetch}
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {hasNextPage ? (
              <Pressable
                disabled={isFetchingNextPage}
                onPress={() => void fetchNextPage()}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: pressed
                      ? theme.material.fillPressed
                      : theme.material.fill,
                    borderColor: theme.material.edge,
                  },
                ]}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator color={theme.accent.text} size="small" />
                ) : null}
                <Text
                  style={[styles.secondaryLabel, { color: theme.accent.text }]}
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </Text>
              </Pressable>
            ) : null}

            {isGroup ? (
              <>
                <Pressable
                  disabled={busy}
                  onPress={confirmLeave}
                  style={({ pressed }) => [
                    styles.dangerButton,
                    {
                      backgroundColor: pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                      borderColor: theme.material.edge,
                      opacity: busy ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons color={theme.error} name="exit-outline" size={20} />
                  <Text style={[styles.dangerLabel, { color: theme.error }]}>
                    {leave.isPending ? "Leaving..." : "Leave group"}
                  </Text>
                </Pressable>

                {amAdmin ? (
                  <Pressable
                    disabled={busy}
                    onPress={confirmDelete}
                    style={({ pressed }) => [
                      styles.dangerButton,
                      {
                        backgroundColor: pressed
                          ? theme.material.fillPressed
                          : theme.material.fill,
                        borderColor: theme.material.edge,
                        opacity: busy ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      color={theme.error}
                      name="trash-outline"
                      size={20}
                    />
                    <Text style={[styles.dangerLabel, { color: theme.error }]}>
                      {remove.isPending ? "Deleting..." : "Delete group"}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Avatar
              name={target.name}
              size={96}
              uri={target.image}
              username={isGroup ? null : target.username}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              {target.name || "Conversation"}
            </Text>
            <Text
              style={[
                styles.status,
                { color: targetOnline ? theme.success : theme.textGray },
              ]}
            >
              {isGroup
                ? `${members.length}${hasNextPage ? "+" : ""} ${pluralize(
                    "member",
                    members.length,
                  )}`
                : targetOnline
                  ? "Online"
                  : isConnected
                    ? "Offline"
                    : "Connecting..."}
            </Text>

            {conversation?.createdAt ? (
              <Text style={[styles.created, { color: theme.textGray }]}>
                Started {toFormattedDate(conversation.createdAt)}
              </Text>
            ) : null}

            {!isGroup && target.username ? (
              <Pressable
                onPress={() => openProfile(target.username)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: pressed
                      ? theme.accent.solidHover
                      : theme.accent.solid,
                  },
                ]}
              >
                <Ionicons color="#ffffff" name="person-outline" size={18} />
                <Text style={styles.primaryLabel}>View profile</Text>
              </Pressable>
            ) : null}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isGroup ? "Members" : "In this conversation"}
            </Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={renderMember}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.sm, padding: space.md },
  created: { fontSize: fontSize.caption },
  dangerButton: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    paddingVertical: space.md,
  },
  dangerLabel: { fontSize: fontSize.body, fontWeight: "600" },
  footer: { gap: space.sm, paddingTop: space.sm },
  header: { alignItems: "center", gap: space.xs, paddingBottom: space.sm },
  memberHandle: { fontSize: fontSize.caption },
  memberName: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  memberNameRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  memberRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  memberText: { flex: 1, gap: 2 },
  primaryButton: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  primaryLabel: { color: "#ffffff", fontSize: fontSize.body, fontWeight: "600" },
  roleChip: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.xs,
    paddingVertical: 1,
  },
  roleLabel: { fontSize: 10, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    paddingVertical: space.md,
  },
  secondaryLabel: { fontSize: fontSize.body, fontWeight: "600" },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: fontSize.title,
    fontWeight: "700",
    paddingTop: space.md,
  },
  status: { fontSize: fontSize.body, fontWeight: "600" },
  title: { fontSize: fontSize.h2, fontWeight: "700", textAlign: "center" },
});
