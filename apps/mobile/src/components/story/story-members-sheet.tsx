import { Ionicons } from "@expo/vector-icons";
import {
  addStoryBoardMember,
  removeStoryBoardMember,
  setStoryBoardMemberAdmin,
} from "@nw/api/endpoints/story-members";
import { useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Friend, type StoryBoardMember } from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { SearchField } from "@/components/search-field";
import { Chip } from "@/components/settings";
import { Text } from "@/components/text";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Who writes a story — web's `StoryboardMembersDialog`.
 *
 * The same rules, because the server enforces them: members edit chapters
 * and passages; admins also add and remove members; only the creator makes
 * or unmakes an admin, and the creator's own row is fixed. New members come
 * from the viewer's friends, as on web: a search over the list the session
 * already holds, not a request.
 *
 * Every change is written at once — these are web's three endpoints, each
 * its own call — and handed back through `onMembersChange` so the editor
 * and the story page show the new roster without a refetch. A row's actions
 * open the client's one menu rather than sitting as icons on the row: at
 * 375pt a face, a handle, a role chip and two icon buttons did not fit.
 */
export const StoryMembersSheet = ({
  creatorUsername,
  members,
  onClose,
  onMembersChange,
  storyId,
  visible,
}: {
  /** Fixed role: cannot be changed or removed. */
  creatorUsername: string | null | undefined;
  members: StoryBoardMember[];
  onClose: () => void;
  onMembersChange: (members: StoryBoardMember[]) => void;
  storyId: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const { novelist } = useSession();
  const me = novelist?.username;

  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<StoryBoardMember | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearch("");
      setError(null);
    }
  }, [visible]);

  const viewerIsCreator = Boolean(me) && creatorUsername === me;
  const viewerIsAdmin =
    viewerIsCreator ||
    members.some((member) => member.username === me && member.isAdmin);

  const candidates: Friend[] = useMemo(() => {
    const taken = new Set(members.map((member) => member.username));
    if (creatorUsername) taken.add(creatorUsername);
    const needle = search.trim().toLowerCase();
    return (novelist?.friends ?? []).filter(
      (friend) =>
        !taken.has(friend.username) &&
        (needle.length === 0 ||
          friend.username.toLowerCase().includes(needle) ||
          `${friend.firstName} ${friend.lastName ?? ""}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [creatorUsername, members, novelist?.friends, search]);

  /** The creator first, then admins, then the rest — web's order. */
  const roster = useMemo(() => {
    const creator = members.find(
      (member) => member.username === creatorUsername,
    );
    const rest = members.filter(
      (member) => member.username !== creatorUsername,
    );
    return [
      ...(creator ? [creator] : []),
      ...rest.filter((member) => member.isAdmin),
      ...rest.filter((member) => !member.isAdmin),
    ];
  }, [creatorUsername, members]);

  const add = async (friend: Friend) => {
    if (pending) return;
    setPending(friend.username);
    setError(null);
    const member: StoryBoardMember = {
      image: friend.image,
      isAdmin: false,
      storyBoardId: storyId,
      username: friend.username,
    };
    const response = await addStoryBoardMember(api, member).catch(() => null);
    setPending(null);
    if (response?.message !== API_MESSAGE.Success) {
      setError(`Could not add @${friend.username}. Try again.`);
      return;
    }
    setSearch("");
    onMembersChange([...members, member]);
  };

  const remove = async (member: StoryBoardMember) => {
    setPending(member.username);
    setError(null);
    const response = await removeStoryBoardMember(api, {
      ...member,
      storyBoardId: storyId,
    }).catch(() => null);
    setPending(null);
    if (response?.message !== API_MESSAGE.Success) {
      setError(`Could not remove @${member.username}. Try again.`);
      return;
    }
    onMembersChange(members.filter((m) => m.username !== member.username));
  };

  const setAdmin = async (member: StoryBoardMember, isAdmin: boolean) => {
    setPending(member.username);
    setError(null);
    const response = await setStoryBoardMemberAdmin(api, {
      ...member,
      isAdmin,
      storyBoardId: storyId,
    }).catch(() => ({ message: API_MESSAGE.Error }));
    setPending(null);
    if (response.message !== API_MESSAGE.Success) {
      setError("Could not change the role. Try again.");
      return;
    }
    onMembersChange(
      members.map((m) =>
        m.username === member.username ? { ...m, isAdmin } : m,
      ),
    );
  };

  const confirmRemove = (member: StoryBoardMember) =>
    Alert.alert(
      `Remove @${member.username}?`,
      "They will no longer be able to read or write this story unless it is public.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => void remove(member),
          style: "destructive",
          text: "Remove",
        },
      ],
    );

  const menuItems: ActionItem[] = !menuFor
    ? []
    : [
        ...(viewerIsCreator
          ? [
              menuFor.isAdmin
                ? {
                    hint: "They keep writing, but stop managing members.",
                    icon: "star-outline" as const,
                    label: "Remove as admin",
                    onSelect: () => void setAdmin(menuFor, false),
                  }
                : {
                    hint: "Admins can add and remove members.",
                    icon: "star" as const,
                    label: "Make admin",
                    onSelect: () => void setAdmin(menuFor, true),
                  },
              { separator: true },
            ]
          : []),
        {
          icon: "person-remove-outline" as const,
          label: "Remove from story",
          onSelect: () => confirmRemove(menuFor),
          variant: "danger" as const,
        },
      ];

  const roleOf = (member: StoryBoardMember) =>
    member.username === creatorUsername
      ? "Author"
      : member.isAdmin
        ? "Admin"
        : "Co-author";

  return (
    <>
      <FormSheet
        error={error}
        fill
        maxHeightRatio={0.85}
        onClose={onClose}
        subtitle={`${members.length} ${members.length === 1 ? "member" : "members"}`}
        title="Members"
        visible={visible}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
        >
          <Text style={[styles.lead, { color: theme.textGray }]}>
            Members can edit chapters and passages. Admins can also add or
            remove members. Only the author can make someone an admin.
          </Text>

          {viewerIsAdmin ? (
            <View style={styles.add}>
              <Text style={[styles.eyebrow, { color: theme.textGray }]}>
                Add a friend
              </Text>
              <SearchField
                onChangeText={setSearch}
                placeholder="Search your friends…"
                value={search}
              />
              {search.trim().length > 0 ? (
                candidates.length === 0 ? (
                  <Text style={[styles.hint, { color: theme.textGray }]}>
                    No friend matches “{search.trim()}”, or they are already in.
                  </Text>
                ) : (
                  candidates.slice(0, 8).map((friend) => (
                    <Pressable
                      accessibilityLabel={`Add @${friend.username}`}
                      accessibilityRole="button"
                      disabled={pending !== null}
                      key={friend.username}
                      onPress={() => void add(friend)}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: pressed
                            ? theme.glass.fillPressed
                            : "transparent",
                          borderBottomColor: theme.material.edgeTranslucent,
                        },
                      ]}
                    >
                      <Avatar
                        name={friend.username}
                        size={36}
                        uri={friend.image}
                        username={friend.username}
                      />
                      <View style={styles.text}>
                        <Text
                          numberOfLines={1}
                          style={[styles.name, { color: theme.text }]}
                        >
                          @{friend.username}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={[styles.hint, { color: theme.textGray }]}
                        >
                          {friend.firstName} {friend.lastName ?? ""}
                        </Text>
                      </View>
                      {pending === friend.username ? (
                        <ActivityIndicator
                          color={theme.accent.text}
                          size="small"
                        />
                      ) : (
                        <Ionicons
                          color={theme.accent.text}
                          name="add-circle-outline"
                          size={22}
                        />
                      )}
                    </Pressable>
                  ))
                )
              ) : null}
            </View>
          ) : null}

          <Text style={[styles.eyebrow, { color: theme.textGray }]}>
            Writing this story
          </Text>
          {roster.length === 0 ? (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              Nobody yet.
            </Text>
          ) : (
            roster.map((member) => {
              const fixed = member.username === creatorUsername;
              const canAct = viewerIsAdmin && !fixed;
              return (
                <Pressable
                  accessibilityHint={canAct ? "Opens role options" : undefined}
                  accessibilityLabel={`@${member.username}, ${roleOf(member)}`}
                  accessibilityRole={canAct ? "button" : "text"}
                  disabled={!canAct || pending !== null}
                  key={member.username}
                  onPress={() => {
                    setMenuFor(member);
                    setMenuVisible(true);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: pressed
                        ? theme.glass.fillPressed
                        : "transparent",
                      borderBottomColor: theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <Avatar
                    name={member.username}
                    size={36}
                    uri={member.image}
                    username={member.username}
                  />
                  <View style={styles.text}>
                    <Text
                      numberOfLines={1}
                      style={[styles.name, { color: theme.text }]}
                    >
                      @{member.username}
                      {member.username === me ? " (you)" : ""}
                    </Text>
                  </View>
                  <Chip
                    icon={
                      fixed
                        ? "create-outline"
                        : member.isAdmin
                          ? "star"
                          : undefined
                    }
                    label={roleOf(member)}
                    tone={fixed ? "accent" : "neutral"}
                  />
                  {pending === member.username ? (
                    <ActivityIndicator color={theme.accent.text} size="small" />
                  ) : canAct ? (
                    <Ionicons
                      color={theme.textGray}
                      name="ellipsis-horizontal"
                      size={18}
                    />
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </FormSheet>

      <ActionMenu
        items={menuItems}
        onClose={() => setMenuVisible(false)}
        subtitle={menuFor ? roleOf(menuFor) : undefined}
        title={menuFor ? `@${menuFor.username}` : "Member"}
        visible={menuVisible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  add: { gap: space.sm },
  body: { gap: space.sm, paddingBottom: space.xl },
  eyebrow: { ...type.eyebrow, marginTop: space.xs },
  hint: { fontSize: fontSize.caption },
  lead: { fontSize: fontSize.caption, lineHeight: 18 },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
  },
  scroll: { flex: 1 },
  text: { flex: 1, gap: 1, minWidth: 0 },
});
