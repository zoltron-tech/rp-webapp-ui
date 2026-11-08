import { Ionicons } from "@expo/vector-icons";
import { isSupportNovelist } from "@nw/chat";
import { useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { BLOCK_BLACKLIST_COPY } from "@nw/types";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { memo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { ShareProfileSheet } from "@/components/share/share-profile-sheet";
import {
  type Connection,
  useConnectionActions,
  useOpenConversation,
} from "@/hooks/use-connection";
import { alertReportSent } from "@/lib/report";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The two buttons on a profile's identity row.
 *
 * Web puts them in the banner's top-right corner; they started there here
 * too, and moved: the banner stretches under an over-scroll, and two buttons
 * riding a stretching picture looked like part of it. They sit at the end of
 * the handle row now, beside the crests, where they stay put and read as
 * actions on the person rather than on the picture. A connection button whose
 * icon *is* the state — add, sent, received, friends — and a `⋯` for
 * everything that is not about the connection. Both open menus rather than
 * acting on a single tap, which is web's shape too and the right one here:
 * every item behind them is a write, and several cannot be undone.
 *
 * ## The connection button is a state machine
 *
 * One field, `novelist.connection`, decides both the icon and the menu:
 *
 * | State | Icon | Menu |
 * | --- | --- | --- |
 * | none | person-add | Add |
 * | `FRIEND_REQUEST_SENT` | arrow up | Cancel request |
 * | `FRIEND_REQUEST_RECEIVED` | person-add + dot | Accept, Reject |
 * | `FRIEND` | person-check | Message, Unfriend |
 * | `BLACKLISTED` | eye-off | Remove from blacklist |
 *
 * The received state carries an unread dot, as web does — it is the only one
 * where the other person is waiting on you, and a profile you opened for
 * another reason is where you find out.
 *
 * ## What is missing, and why
 *
 * **Export novelist card** is deliberately absent for now. **Edit profile** is
 * a screen this client does not have yet, so its row would be a dead end.
 * **Invite to a story** is `handleNotImplemented` on web — a toast saying
 * "coming soon" — and an item that exists only to apologise is worse on a phone
 * than an item that is not there.
 */

/** Rows that cannot be undone ask first, with the verb in the button. */
const confirm = (
  title: string,
  message: string,
  verb: string,
  run: () => void,
) =>
  Alert.alert(
    title,
    message,
    [
      { style: "cancel", text: "Cancel" },
      { onPress: run, style: "destructive", text: verb },
    ],
    { cancelable: true },
  );

export const ProfileActions = memo(function ProfileActions({
  novelist,
}: {
  novelist: Novelist;
}) {
  const theme = useAppTheme();
  const router = useRouter();
  const session = useSession();
  const actions = useConnectionActions(novelist);
  const openConversation = useOpenConversation();

  const [menu, setMenu] = useState<"none" | "connection" | "more">("none");
  const [sharing, setSharing] = useState(false);

  const isSelf = session.novelist?.username === novelist.username;
  const isSupport = isSupportNovelist(novelist.username);
  const connection = (novelist.connection ?? null) as Connection;
  const close = () => setMenu("none");

  // Signed out: there is nothing here anyone can do.
  if (session.status !== "signed-in") return null;

  const failed = (what: string) => () =>
    Alert.alert("Not saved", `${what} could not be completed. Try again.`);

  const run = (
    mutation: { mutateAsync: () => Promise<unknown> },
    what: string,
    onDone?: () => void,
  ) => {
    close();
    mutation
      .mutateAsync()
      .then(() => onDone?.())
      .catch(failed(what));
  };

  const message = () => {
    close();
    openConversation
      .mutateAsync(novelist)
      .then((conversationId) => {
        if (!conversationId) {
          Alert.alert(
            "No conversation",
            "That conversation could not be opened. Try again.",
          );
          return;
        }
        router.push({
          params: { conversationId },
          pathname: "/(tabs)/(inbox)/[conversationId]",
        });
      })
      .catch(failed("The conversation"));
  };

  const copyUsername = () => {
    close();
    void Clipboard.setStringAsync(novelist.username);
  };

  // Web's `ShareProfileDialog`: the community tray, with the platform sheet
  // behind "More options". Opened through `onSelect` so the menu has really
  // gone before the tray is presented (iOS shows one modal at a time).
  const shareProfile = () => setSharing(true);

  const unblacklistItem: ActionItem = {
    busy: actions.unblacklist.isPending,
    icon: "eye-outline",
    label: BLOCK_BLACKLIST_COPY.removeFromBlacklist,
    onPress: () => run(actions.unblacklist, "Removing from your blacklist"),
  };

  const connectionMenu: ActionItem[] =
    // A friend you blacklisted reads BLACKLISTED (the friendship is kept,
    // B2); the one thing to do from here is undo it.
    connection === "BLACKLISTED"
      ? [unblacklistItem]
      : connection === "FRIEND"
        ? [
            {
              icon: "chatbubbles-outline",
              label: `Message ${novelist.firstName}`,
              onPress: message,
            },
            { separator: true },
            {
              busy: actions.unfriend.isPending,
              icon: "person-remove-outline",
              label: `Unfriend ${novelist.firstName}`,
              onPress: () =>
                confirm(
                  `Unfriend ${novelist.firstName}?`,
                  "You can send another request later.",
                  "Unfriend",
                  () => run(actions.unfriend, "Unfriending"),
                ),
              variant: "danger",
            },
          ]
        : connection === "FRIEND_REQUEST_SENT"
          ? [
              {
                busy: actions.cancel.isPending,
                icon: "close-circle-outline",
                label: "Cancel friend request",
                onPress: () => run(actions.cancel, "Cancelling the request"),
                variant: "danger",
              },
            ]
          : connection === "FRIEND_REQUEST_RECEIVED"
            ? [
                {
                  busy: actions.accept.isPending,
                  icon: "checkmark-circle-outline",
                  label: `Accept request from ${novelist.firstName}`,
                  onPress: () => run(actions.accept, "Accepting the request"),
                  variant: "positive",
                },
                {
                  busy: actions.reject.isPending,
                  icon: "close-circle-outline",
                  label: `Reject request from ${novelist.firstName}`,
                  onPress: () => run(actions.reject, "Rejecting the request"),
                  variant: "danger",
                },
              ]
            : [
                {
                  busy: actions.send.isPending,
                  icon: "person-add-outline",
                  label: `Add ${novelist.firstName}`,
                  onPress: () => run(actions.send, "The friend request"),
                  variant: "positive",
                },
              ];

  const moreMenu: ActionItem[] = [
    { icon: "at-outline", label: "Copy username", onPress: copyUsername },
    {
      icon: "share-social-outline",
      label: "Share profile",
      onSelect: shareProfile,
    },

    ...(isSupport
      ? ([
          {
            icon: "chatbubbles-outline",
            label: "Send message",
            onPress: message,
          },
          { separator: true },
          {
            busy: actions.report.isPending,
            icon: "flag-outline",
            label: `Report ${novelist.username}`,
            onPress: () =>
              confirm(
                `Report ${novelist.username}?`,
                "A moderator will review this profile.",
                "Report",
                () => run(actions.report, "The report", alertReportSent),
              ),
            variant: "danger",
          },
        ] satisfies ActionItem[])
      : isSelf
        ? []
        : ([
            { separator: true },
            {
              busy: actions.report.isPending,
              icon: "flag-outline",
              label: `Report ${novelist.username}`,
              onPress: () =>
                confirm(
                  `Report ${novelist.username}?`,
                  "A moderator will review this profile.",
                  "Report",
                  () => run(actions.report, "The report", alertReportSent),
                ),
              variant: "danger",
            },
            connection === "BLACKLISTED"
              ? unblacklistItem
              : {
                  busy: actions.blacklist.isPending,
                  icon: "eye-off-outline",
                  label: `Blacklist ${novelist.username}`,
                  onPress: () =>
                    confirm(
                      BLOCK_BLACKLIST_COPY.blacklistConfirm.heading(
                        `@${novelist.username}`,
                      ),
                      BLOCK_BLACKLIST_COPY.blacklistConfirm.text(
                        `@${novelist.username}`,
                      ),
                      BLOCK_BLACKLIST_COPY.blacklistConfirm.action,
                      // Stays on the profile: the banner and its undo show (B3).
                      () => run(actions.blacklist, "Blacklisting"),
                    ),
                  variant: "danger",
                },
            {
              busy: actions.block.isPending,
              icon: "ban-outline",
              label: `Block ${novelist.username}`,
              onPress: () =>
                confirm(
                  `Block ${novelist.username}?`,
                  "Neither of you will be able to reach the other.",
                  "Block",
                  () => run(actions.block, "Blocking"),
                ),
              variant: "danger",
            },
          ] satisfies ActionItem[])),
  ];

  const connectionIcon: keyof typeof Ionicons.glyphMap =
    connection === "BLACKLISTED"
      ? "eye-off-outline"
      : connection === "FRIEND"
        ? "person"
        : connection === "FRIEND_REQUEST_SENT"
          ? "person-add"
          : "person-add-outline";

  // Their own profile has no connection to itself, and support is not a
  // friendship — web hides the button on both.
  const showConnection = !isSelf && !isSupport;

  return (
    <>
      <View style={styles.row}>
        {showConnection ? (
          <Pressable
            accessibilityLabel={
              connection === "BLACKLISTED"
                ? BLOCK_BLACKLIST_COPY.profileBanner(`@${novelist.username}`)
                : connection === "FRIEND"
                  ? `Friends with ${novelist.firstName}`
                  : connection === "FRIEND_REQUEST_RECEIVED"
                    ? `${novelist.firstName} sent you a friend request`
                    : connection === "FRIEND_REQUEST_SENT"
                      ? "Friend request sent"
                      : `Add ${novelist.firstName}`
            }
            accessibilityRole="button"
            hitSlop={space.xs}
            onPress={() => setMenu("connection")}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor:
                  connection === "FRIEND"
                    ? theme.accent.tint
                    : pressed
                      ? theme.material.fillPressed
                      : theme.material.fill,
                borderColor:
                  connection === "FRIEND"
                    ? theme.accent.surfaceHover
                    : theme.material.edge,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              color={
                connection === "FRIEND" ? theme.accent.textStrong : theme.text
              }
              name={connectionIcon}
              size={17}
            />

            {/* The only state where somebody is waiting on you. */}
            {connection === "FRIEND_REQUEST_RECEIVED" ? (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: theme.unreadBadge,
                    borderColor: theme.background,
                  },
                ]}
              />
            ) : null}
          </Pressable>
        ) : null}

        <Pressable
          accessibilityLabel="More"
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => setMenu("more")}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Ionicons color={theme.text} name="ellipsis-horizontal" size={17} />
        </Pressable>
      </View>

      <ShareProfileSheet
        novelist={novelist}
        onClose={() => setSharing(false)}
        visible={sharing}
      />

      <ActionMenu
        items={connectionMenu}
        onClose={close}
        subtitle={`@${novelist.username}`}
        title={
          connection === "FRIEND"
            ? "Friends"
            : connection === "FRIEND_REQUEST_RECEIVED"
              ? "Friend request"
              : connection === "FRIEND_REQUEST_SENT"
                ? "Request sent"
                : "Add friend"
        }
        visible={menu === "connection"}
      />

      <ActionMenu
        items={moreMenu}
        onClose={close}
        subtitle={`@${novelist.username}`}
        title={novelist.firstName}
        visible={menu === "more"}
      />
    </>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  dot: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 10,
    position: "absolute",
    right: 0,
    top: 0,
    width: 10,
  },
  // In the flow of the handle row, pushed to its far end.
  row: {
    flexDirection: "row",
    gap: space.sm,
    marginLeft: "auto",
  },
});

/**
 * "You've blacklisted @ada · Remove from blacklist", under a blacklisted
 * profile's identity (BLOCK_BLACKLIST_PLAN.md B3). Only the viewer sees it.
 */
export const BlacklistBanner = memo(function BlacklistBanner({
  novelist,
}: {
  novelist: Novelist;
}) {
  const theme = useAppTheme();
  const actions = useConnectionActions(novelist);
  const handle = `@${novelist.username}`;

  return (
    <View
      accessibilityRole="summary"
      style={[
        bannerStyles.root,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.textGray} name="eye-off-outline" size={18} />
      <Text
        numberOfLines={2}
        style={[bannerStyles.text, { color: theme.text }]}
      >
        {BLOCK_BLACKLIST_COPY.profileBanner(handle)}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={actions.unblacklist.isPending}
        hitSlop={space.xs}
        onPress={() =>
          actions.unblacklist
            .mutateAsync()
            .catch(() =>
              Alert.alert(
                "Not saved",
                "Removing from your blacklist could not be completed. Try again.",
              ),
            )
        }
        style={({ pressed }) => [
          bannerStyles.button,
          {
            backgroundColor: pressed
              ? theme.material.fillPressed
              : "transparent",
            borderColor: theme.material.edge,
            opacity: actions.unblacklist.isPending ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[bannerStyles.buttonLabel, { color: theme.text }]}>
          {BLOCK_BLACKLIST_COPY.removeFromBlacklist}
        </Text>
      </Pressable>
    </View>
  );
});

const bannerStyles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  buttonLabel: { fontSize: fontSize.label, fontWeight: "600" },
  root: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.sm,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
  text: { flex: 1, fontSize: fontSize.label, fontWeight: "600", minWidth: 160 },
});
