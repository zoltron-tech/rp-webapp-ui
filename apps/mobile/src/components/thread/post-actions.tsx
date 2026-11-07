import { Alert } from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import type { PostVariant } from "@/components/thread/post";

/**
 * What the three dots on a thread post offer.
 *
 * Web puts these in a `AppDropdownMenuResponsive` — a popover on a desktop and
 * a tray on a phone. There is only the phone here, so it is the tray: the
 * same `ActionMenu` every other `⋯` on this client opens, so a prompt's menu
 * and a profile's are the same rows at the same size in the same place.
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
 *
 * Share and Edit open another sheet or the composer, so they go through
 * `onSelect`: the menu leaves first, and the next modal is presented once it
 * has gone. Delete and Report confirm in a system alert, which may sit over
 * the open menu.
 */

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
  concluded,
  onConclude,
  onDelete,
  onEdit,
  onReport,
  onShare,
  target,
}: {
  onClose: () => void;
  /** Whether the thread is closed, for what `onConclude` is called. */
  concluded?: boolean;
  /** Present for the opening comment, to its author and the prompt's owner. */
  onConclude?: () => void;
  onDelete: () => void;
  /** Opens the composer on this post. Omitted, the row says it cannot. */
  onEdit?: () => void;
  onReport: () => void;
  /** Opens the share sheet. Omitted, there is no share row. */
  onShare?: () => void;
  target: PostActionsTarget | null;
}) => {
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

  const share: ActionItem[] = onShare
    ? [
        {
          icon: "share-social-outline",
          label: `Share ${noun}`,
          onSelect: onShare,
        },
      ]
    : [];

  const conclude: ActionItem[] = onConclude
    ? [
        {
          icon: concluded ? "arrow-undo-outline" : "checkbox-outline",
          label: concluded ? "Reopen thread" : "Mark as concluded",
          onPress: () => {
            onClose();
            onConclude();
          },
        },
      ]
    : [];

  const items: ActionItem[] = !target
    ? []
    : target.owned
      ? [
          ...share,
          onEdit
            ? {
                icon: "create-outline",
                label: `Edit ${noun}`,
                onSelect: onEdit,
              }
            : {
                hint: "Not available here yet. Edit it from the Explore feed or the thread.",
                icon: "create-outline",
                label: `Edit ${noun}`,
                onPress: () =>
                  Alert.alert(
                    "Editing is not available here yet",
                    `Editing a ${noun} from this screen is still to come. You can edit it from the Explore feed or the thread.`,
                  ),
              },
          { separator: true },
          {
            icon: "trash-outline",
            label: `Delete ${noun}`,
            onPress: confirmDelete,
            variant: "danger",
          },
        ]
      : [
          ...share,
          ...(share.length > 0 ? [{ separator: true }] : []),
          {
            icon: "flag-outline",
            label: `Report ${noun}`,
            onPress: confirmReport,
            variant: "danger",
          },
        ];

  return (
    <ActionMenu
      items={[...conclude, ...items]}
      onClose={onClose}
      title={target ? `This ${noun}` : "Options"}
      visible={target !== null}
    />
  );
};
