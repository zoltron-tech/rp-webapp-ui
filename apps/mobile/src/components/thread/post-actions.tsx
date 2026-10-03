import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/sheet";
import type { PostVariant } from "@/components/thread/post";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * What the three dots on a thread post offer.
 *
 * Web puts these in a `AppDropdownMenuResponsive` — a popover on a desktop and
 * a tray on a phone. There is only the phone here, so it is the tray, built on
 * the same `BottomSheet` the chat's long-press menu uses. Reaching for the
 * project's one sheet rather than a second popover primitive is the whole
 * reason that component exists.
 *
 * ## Who sees what
 *
 * The same rule web applies, because it is the one the server enforces: your
 * own post offers **Edit** and **Delete**, anyone else's offers **Report**.
 * Showing all three to everyone would mean drawing a Delete that answers 403,
 * which is a worse answer than not offering it.
 *
 * Ownership is "the source is you, or one of your muses" — a post written in
 * character is still yours, and web resolves it exactly this way
 * (`novelist.muses.some(...) || sourceId === novelist.id`).
 *
 * ## Edit and Share
 *
 * Both are the caller's to provide. A screen that can open the composer in
 * edit mode passes `onEdit` and the row does that; one that cannot gets the
 * honest fallback — the row says editing is not available *here* rather than
 * being a control that silently does nothing. `onShare` adds web's first row,
 * the share sheet, above the rest; it is only offered for a prompt, since
 * web's `ROUTES.Prompt.View` is the only thing the share links to.
 */

interface Action {
  destructive?: boolean;
  hint?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}

/**
 * What each kind of post is called in the menu's own words.
 *
 * `post` is a standalone prompt in a profile feed, which is a prompt in every
 * way the API and this menu care about — the only difference is where it was
 * drawn.
 */
const NOUN: Record<PostVariant, string> = {
  comment: "reply",
  post: "prompt",
  prompt: "prompt",
  reply: "reply",
};

/**
 * Web's confirmation copy, verbatim — including the warning that deleting one
 * post takes everything hanging off it. That consequence is the whole reason
 * the dialog exists, and rewording it here would mean two clients warning about
 * the same irreversible act in different terms.
 */
const DELETE_WARNING: Record<PostVariant, string> = {
  comment:
    "Deleting this will remove all of the subsequent replies. Are you sure you want to delete this reply?",
  post: "Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this prompt?",
  prompt:
    "Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this prompt?",
  reply:
    "This action is permanent. Are you sure you want to delete this reply?",
};

const REPORT_TEXT =
  "We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.";

/** The post the sheet is open for. `null` closes it. */
export interface PostActionsTarget {
  /** Whether this viewer wrote it — decides which two items are offered. */
  owned: boolean;
  variant: PostVariant;
}

export const PostActions = ({
  onClose,
  onDelete,
  onEdit,
  onReport,
  onShare,
  target,
}: {
  onClose: () => void;
  onDelete: () => void;
  /** Opens the composer on this post. Omitted, the row says it cannot. */
  onEdit?: () => void;
  onReport: () => void;
  /** Opens the share sheet. Omitted, there is no share row. */
  onShare?: () => void;
  target: PostActionsTarget | null;
}) => {
  const theme = useAppTheme();

  const noun = target ? NOUN[target.variant] : "post";

  const confirmDelete = () => {
    if (!target) return;
    Alert.alert(`Delete this ${noun}?`, DELETE_WARNING[target.variant], [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          onClose();
          onDelete();
        },
        style: "destructive",
        text: "Delete",
      },
    ]);
  };

  const confirmReport = () => {
    Alert.alert(`Report this ${noun}?`, REPORT_TEXT, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          onClose();
          onReport();
        },
        style: "destructive",
        text: "Report",
      },
    ]);
  };

  const share: Action[] = onShare
    ? [
        {
          icon: "share-social-outline",
          label: `Share ${noun}`,
          onPress: () => {
            onClose();
            onShare();
          },
        },
      ]
    : [];

  const actions: Action[] = !target
    ? []
    : target.owned
      ? [
          ...share,
          {
            hint: onEdit ? undefined : "Not available here yet",
            icon: "create-outline",
            label: `Edit ${noun}`,
            onPress: onEdit
              ? () => {
                  onClose();
                  onEdit();
                }
              : () =>
                  Alert.alert(
                    "Editing is not available here yet",
                    `Editing a ${noun} from this screen is still to come. You can edit it from the Explore feed or the thread.`,
                  ),
          },
          {
            destructive: true,
            icon: "trash-outline",
            label: `Delete this ${noun}`,
            onPress: confirmDelete,
          },
        ]
      : [
          ...share,
          {
            destructive: true,
            icon: "flag-outline",
            label: `Report this ${noun}`,
            onPress: confirmReport,
          },
        ];

  return (
    <BottomSheet
      maxHeightRatio={0.45}
      onClose={onClose}
      title={target ? `This ${noun}` : "Options"}
      visible={target !== null}
    >
      <View style={styles.body}>
        {actions.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: pressed
                  ? theme.glass.fillPressed
                  : theme.material.fillTranslucent,
                borderColor: theme.material.edgeTranslucent,
              },
            ]}
          >
            <Ionicons
              color={action.destructive ? theme.error : theme.text}
              name={action.icon}
              size={20}
            />

            <View style={styles.actionText}>
              <Text
                style={[
                  styles.actionLabel,
                  { color: action.destructive ? theme.error : theme.text },
                ]}
              >
                {action.label}
              </Text>

              {action.hint ? (
                <Text style={[styles.actionHint, { color: theme.textGray }]}>
                  {action.hint}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    minHeight: 52,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  actionHint: { fontSize: fontSize.caption },
  actionLabel: { fontSize: fontSize.body, fontWeight: "600" },
  actionText: { flex: 1, gap: 1 },
  body: { gap: space.sm },
});
