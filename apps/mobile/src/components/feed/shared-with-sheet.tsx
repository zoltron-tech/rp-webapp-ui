import { Ionicons } from "@expo/vector-icons";
import type { Friend } from "@nw/types";
import { pluralize } from "@nw/utils";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { fullName } from "@/lib/names";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Who a custom-privacy post was shared with — web's `SharedWithDialog`.
 *
 * Owned by the screen and given a list, like the likers tray: `friends` null is
 * closed. The names come in the payload, so there is nothing to fetch.
 */
export const SharedWithSheet = ({
  friends,
  onClose,
}: {
  /** The people it is shared with. `null` keeps the sheet closed. */
  friends: Friend[] | null;
  onClose: () => void;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const count = friends?.length ?? 0;

  const open = (username: string) => {
    // Closed first, so the profile is not pushed behind the modal.
    onClose();
    router.push({ params: { username }, pathname: "/novelist/[username]" });
  };

  return (
    <BottomSheet
      maxHeightRatio={0.7}
      onClose={onClose}
      subtitle={`Only ${count === 1 ? "this" : "these"} ${pluralize("friend", count)} can see this prompt.`}
      title="Shared with"
      visible={friends !== null}
    >
      <ScrollView contentContainerStyle={styles.list}>
        {(friends ?? []).map((friend) => (
          <Pressable
            accessibilityRole="link"
            key={friend.id}
            onPress={() => open(friend.username)}
            style={({ pressed }) => [
              styles.row,
              pressed && { backgroundColor: theme.material.fillPressed },
            ]}
          >
            <Avatar
              image={friend.avatar}
              name={friend.firstName}
              size={40}
              uri={friend.avatar?.src ?? friend.image}
            />
            <View style={styles.names}>
              <Text
                numberOfLines={1}
                style={[styles.name, { color: theme.text }]}
              >
                {fullName(friend)}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.handle, { color: theme.textGray }]}
              >
                @{friend.username}
              </Text>
            </View>
            <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  handle: { fontSize: fontSize.caption },
  list: { paddingBottom: space.md },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  names: { flex: 1, minWidth: 0 },
  row: {
    alignItems: "center",
    borderRadius: radius.field,
    flexDirection: "row",
    gap: space.m,
    padding: space.sm,
  },
});
