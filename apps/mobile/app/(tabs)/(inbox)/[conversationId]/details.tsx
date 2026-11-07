import { Ionicons } from "@expo/vector-icons";
import {
  deleteGroup,
  leaveGroup,
  removeGroupMember,
} from "@nw/api/endpoints/conversation-detail";
import {
  isGroupAdmin,
  participantName,
  resolveConversationTarget,
} from "@nw/chat";
import {
  conversationMuteKey,
  describeMute,
  isMuted,
  MUTE_DURATIONS,
  muteUntil,
  useMuteActions,
  useNotificationMutes,
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
import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { AddMembersSheet, EditGroupSheet } from "@/components/chat/group-sheets";
import { VerifiedMark } from "@/components/chat/verified-mark";
import { ListStatus } from "@/components/list-status";
import { BottomSheet } from "@/components/sheet";
import { useChatSocket, useIsOnline, useTrackOnline } from "@/context/socket";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

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

const keyExtractor = (item: ConversationParticipant) =>
  item.novelistId || item.userName;

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

  /*
   * Mute: the push and the sound stop; messages still arrive and still count
   * as unread. Muted, one press unmutes; not muted, the sheet asks for how
   * long. The row's `mutedUntil` is patched in the cache by the hook, so the
   * inbox and this header agree at once.
   */
  const muteActions = useMuteActions();
  const [muteSheet, setMuteSheet] = useState(false);
  const [groupSheet, setGroupSheet] = useState<"add" | "edit" | null>(null);
  const muteKey = conversationMuteKey(conversationId ?? "");
  // The mutes list is the authority; the row's `mutedUntil` is the same fact
  // as the server last sent it, and covers a list that has not loaded yet.
  const { mutes } = useNotificationMutes();
  const muteRow = mutes.find((mute) => mute.key === muteKey);
  const mutedUntil =
    muteRow !== undefined
      ? (muteRow.until ?? "9999-12-31T00:00:00Z")
      : conversation?.mutedUntil;
  const muted = isMuted(mutedUntil);
  const pickMute = (ms: number | null) => {
    setMuteSheet(false);
    muteActions
      .mute(muteKey, muteUntil(ms))
      .catch(() => Alert.alert("Not saved", "Could not mute this conversation. Try again."));
  };
  const onMutePress = () => {
    if (muted) {
      muteActions
        .unmute(muteKey)
        .catch(() => Alert.alert("Not saved", "Could not unmute this conversation. Try again."));
    } else {
      setMuteSheet(true);
    }
  };

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

  /** Web's rule: an admin may remove anyone but themselves, after one check. */
  const confirmRemove = useCallback(
    (member: ConversationParticipant) => {
      const name = member.firstName || member.userName;
      Alert.alert(
        `Remove ${name}?`,
        "They will stop receiving this group's messages.",
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: async () => {
              const result = await removeGroupMember(
                api,
                conversationId ?? "",
                member.novelistId,
              ).catch(() => null);
              if (result !== true) {
                Alert.alert(
                  "Could not remove",
                  "That did not go through. Try again.",
                );
                return;
              }
              void queryClient.invalidateQueries({
                queryKey: queryKeys.conversationMembers(conversationId ?? ""),
              });
            },
            style: "destructive",
            text: "Remove",
          },
        ],
      );
    },
    [api, conversationId, queryClient],
  );

  const openProfile = useCallback(
    (username: string) => {
      if (!username) return;
      router.push({
        params: { username },
        pathname: "/(tabs)/(home)/novelist/[username]",
      });
    },
    [router],
  );

  const myUsername = novelist?.username;
  const renderMember = useCallback(
    ({ item }: { item: ConversationParticipant }) => (
      <MemberRow
        isMe={item.userName === myUsername}
        member={item}
        onOpen={openProfile}
        onRemove={amAdmin ? confirmRemove : undefined}
      />
    ),
    [amAdmin, confirmRemove, myUsername, openProfile],
  );

  const busy = leave.isPending || remove.isPending;

  return (
    <>
      <Stack.Screen options={{ title: "Details" }} />

      <FlatList
        contentContainerStyle={styles.content}
        data={members}
        keyExtractor={keyExtractor}
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

            <Pressable
              accessibilityLabel={muted ? "Unmute conversation" : "Mute conversation"}
              disabled={muteActions.pending || !conversation}
              onPress={onMutePress}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: pressed
                    ? theme.material.fillPressed
                    : muted
                      ? theme.accent.tint
                      : theme.material.fill,
                  borderColor: muted ? theme.accent.surface : theme.material.edge,
                },
              ]}
            >
              <Ionicons
                color={theme.accent.text}
                name={muted ? "notifications-off-outline" : "notifications-outline"}
                size={20}
              />
              <Text style={[styles.secondaryLabel, { color: theme.accent.text }]}>
                {muted ? (describeMute(mutedUntil) ?? "Muted") : "Mute"}
              </Text>
            </Pressable>

            {isGroup ? (
              <>
                {/* An admin deletes the group rather than walking out of it. */}
                {amAdmin ? null : (
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
                )}

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
              placeholder={Boolean(conversation?.isUnavailable)}
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
                      ? theme.accent.fillPressed
                      : theme.accent.fill,
                  },
                ]}
              >
                <Ionicons color="#ffffff" name="person-outline" size={18} />
                <Text style={styles.primaryLabel}>View profile</Text>
              </Pressable>
            ) : null}

            {isGroup && amAdmin ? (
              <View style={styles.adminRow}>
                <Button
                  icon="create-outline"
                  label="Edit group"
                  onPress={() => setGroupSheet("edit")}
                  size="sm"
                  stretch
                />
                <Button
                  icon="person-add-outline"
                  label="Add members"
                  onPress={() => setGroupSheet("add")}
                  size="sm"
                  stretch
                />
              </View>
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

      {conversation && isGroup && amAdmin ? (
        <>
          <EditGroupSheet
            conversation={conversation}
            onClose={() => setGroupSheet(null)}
            visible={groupSheet === "edit"}
          />
          <AddMembersSheet
            groupId={conversation.id}
            members={members}
            onClose={() => setGroupSheet(null)}
            visible={groupSheet === "add"}
          />
        </>
      ) : null}

      <BottomSheet
        ignoreKeyboard
        maxHeightRatio={0.6}
        onClose={() => setMuteSheet(false)}
        subtitle="Messages still arrive and still count as unread. Only the push and the sound stop."
        title="Mute for how long?"
        visible={muteSheet}
      >
        <View style={styles.muteOptions}>
          {MUTE_DURATIONS.map((duration) => (
            <Pressable
              accessibilityRole="button"
              key={duration.id}
              onPress={() => pickMute(duration.ms)}
              style={({ pressed }) => [
                styles.muteOption,
                {
                  backgroundColor: pressed
                    ? theme.material.fillPressed
                    : theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <Text style={[styles.muteOptionLabel, { color: theme.text }]}>
                {duration.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

/**
 * One member. Memoised, with a callback that takes the username, so the
 * screen's own state — the mute sheet opening, a mutation settling — redraws
 * the footer and not every face in the list.
 */
const MemberRow = memo(function MemberRow({
  isMe,
  member,
  onOpen,
  onRemove,
}: {
  isMe: boolean;
  member: ConversationParticipant;
  onOpen: (username: string) => void;
  /** Present for a group admin. */
  onRemove?: (member: ConversationParticipant) => void;
}) {
  const theme = useAppTheme();
  const name = participantName(member);
  const role = member.role?.toUpperCase();
  // A member who disabled their account: the placeholder, no handle, no
  // profile, nothing to remove (ACCOUNT_DISABLE_PLAN.md D9).
  const gone = member.isDisabled === true;

  return (
    <Pressable
      disabled={isMe || gone}
      onPress={() => onOpen(member.userName)}
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
        placeholder={gone}
        size={ROW_AVATAR}
        uri={member.image}
        username={member.userName}
      />

      <View style={styles.memberText}>
        <View style={styles.memberNameRow}>
          <Text
            numberOfLines={1}
            style={[styles.memberName, { color: theme.text }]}
          >
            {name}
          </Text>
          {member.isVerified ? (
            <VerifiedMark username={member.userName} />
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
        {member.userName ? (
          <Text
            numberOfLines={1}
            style={[styles.memberHandle, { color: theme.textGray }]}
          >
            @{member.userName}
            {isMe ? " · you" : ""}
          </Text>
        ) : null}
      </View>

      {!isMe && !gone && onRemove ? (
        <Pressable
          accessibilityLabel={`Remove ${name}`}
          accessibilityRole="button"
          hitSlop={space.sm}
          onPress={() => onRemove(member)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons
            color={theme.error}
            name="person-remove-outline"
            size={20}
          />
        </Pressable>
      ) : null}
      {!isMe && !gone ? (
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  content: { gap: space.sm, padding: space.md },
  created: { fontSize: fontSize.caption },
  dangerButton: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    paddingVertical: space.md,
  },
  dangerLabel: { fontSize: fontSize.body, fontWeight: "600" },
  adminRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.sm,
  },
  footer: { gap: space.sm, paddingTop: space.sm },
  header: { alignItems: "center", gap: space.xs, paddingBottom: space.sm },
  memberHandle: { fontSize: fontSize.caption },
  memberName: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  memberNameRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  memberRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  memberText: { flex: 1, gap: space.xxs },
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
    borderWidth: border.edge,
    paddingHorizontal: space.xs,
    paddingVertical: 1,
  },
  roleLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    paddingVertical: space.md,
  },
  secondaryLabel: { fontSize: fontSize.body, fontWeight: "600" },
  muteOption: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    paddingHorizontal: space.md,
    paddingVertical: space.m,
  },
  muteOptionLabel: { fontSize: fontSize.body, fontWeight: "600" },
  muteOptions: { gap: space.sm, padding: space.md },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: fontSize.title,
    fontWeight: "700",
    paddingTop: space.md,
  },
  status: { fontSize: fontSize.body, fontWeight: "600" },
  title: { fontSize: fontSize.h2, fontWeight: "700", textAlign: "center" },
});
