import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { Friend } from "@nw/types";
import { mainVerseMuses } from "@nw/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useMemo } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import {
  type Connection,
  type ConnectionActionName,
  useConnectionAction,
} from "@/hooks/use-connection";
import {
  accentFromPalette,
  border,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";
import { fullName } from "@/lib/names";
import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { useGlobalState } from "@nw/store";

/**
 * One novelist, as a row.
 *
 * Everything web's `NovelistPreviewCard` carries — face, name, handle, crests,
 * their characters, mutual friends, and the button that changes the friendship
 * — at the density of a list rather than the shape of a card. A screen of
 * cards is two novelists per phone screen and a lot of scrolling to compare
 * them; the same facts as rows are five or six, which is what a list of people
 * is for.
 *
 * ## What went, and what took its place
 *
 * Level went: it is the one number nobody adds a friend over. Muses stayed, but
 * as *faces* with the count beside them rather than a block of their own — a
 * row of small portraits says "characters" faster than the word does.
 *
 * ## The banner is the row
 *
 * Their banner is not a strip above the row, it *is* the row — washed back
 * behind a scrim so the names stay readable. A novelist with no banner gets a
 * gradient of their own accent instead of a grey box, which is the same rule
 * the profile follows when it blurs the avatar into the banner slot: every
 * novelist has a colour, so no row has to be blank.
 *
 * ## The button is on the right, where a list's controls live
 *
 * `connection` decides it, exactly as on the profile:
 *
 * | State | Control |
 * | --- | --- |
 * | none | Add (icon) |
 * | `FRIEND_REQUEST_SENT` | Pending (icon; tap to cancel) |
 * | `FRIEND_REQUEST_RECEIVED` | ✓ and ✕, side by side |
 * | `FRIEND` | Message (icon) |
 *
 * Read straight off the prop, which comes straight out of the query cache.
 * `useConnectionAction` patches every cached friends page this novelist appears
 * in, so the button changes without a refetch and without this component owning
 * a single piece of state.
 *
 * ## Built to be recycled
 *
 * This is a `FlashList` cell, which means the same mounted component is re-bound
 * to a different novelist as the list scrolls, and every cost in it is paid at
 * 60Hz:
 *
 * - **No local state.** A recycled cell keeps whatever state it had and binds
 *   it to the next person — which is how "Pending" ends up on a stranger. Every
 *   mutable fact here lives in the query cache instead.
 * - **`memo`, and `onOpen` takes the username.** A callback built per item in
 *   the parent's `renderItem` is a new function on every parent render, which
 *   defeats `memo` entirely. Taking the username as an argument lets the parent
 *   hold one stable callback for the whole list.
 * - **One mutation, not nine.** `useConnectionAction` rather than
 *   `useConnectionActions` + `useOpenConversation`; see the note in
 *   `use-connection.ts`.
 * - **`expo-image`, not `Image`.** A decoded-bitmap cache that outlives the
 *   cell; see the note in `avatar.tsx`.
 * - **A native gradient, not an SVG one.** `GradientSurface` mounts a whole
 *   `<Svg>` canvas, which is the most expensive view class React Native has, on
 *   every row whose novelist has no banner. `expo-linear-gradient` is a shader.
 * - **A fixed height.** `ROW_HEIGHT` keeps the row's geometry known before its
 *   content arrives, so scrolling never waits on measurement.
 */

/** Enough faces to say what kind of writer this is, at this width. */
const MAX_MUSES = 3;

const MUSE_AVATAR = 22;
const AVATAR = 56;

/**
 * Fixed, so the list can compute offsets instead of measuring.
 *
 * The tallest content is the three-line identity block (name, handle, meta),
 * which is shorter than the avatar; the avatar plus the row's vertical padding
 * is what actually sets this number.
 */
export const ROW_HEIGHT = AVATAR + (space.md - 2) * 2;

const NovelistRowView = ({
  novelist,
  onOpen,
}: {
  novelist: Friend;
  /** Opening the profile; the row owns everything else. */
  onOpen: (username: string) => void;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const action = useConnectionAction();
  // The store's copy, not `useSession()`: that is two query observers per
  // row, and every one of them re-rendered when the session settled.
  const me = useGlobalState("novelist");

  const connection = (novelist.connection ?? null) as Connection;
  // You can be in a list of likers or of somebody's friends, and there is
  // nothing to add or message. Web puts a profile button there; the row is
  // already the way to the profile, so a label is enough.
  const isSelf = me?.id === novelist.id;

  // Their palette, not yours — the same rule the profile page follows.
  const accent = useMemo(
    () => accentFromPalette(novelist.palette),
    [novelist.palette],
  );
  const muses = useMemo(
    () => mainVerseMuses(novelist.muses ?? []),
    [novelist.muses],
  );
  const visibleMuses = useMemo(() => muses.slice(0, MAX_MUSES), [muses]);
  const mutual = novelist.mutualFriendCount ?? 0;

  const busy = action.isPending;
  /** Which button should be spinning, when one is. */
  const running = busy ? action.variables?.action : undefined;

  /**
   * `next` is not applied here — `useConnectionAction` writes it into every
   * cached friends page on success, and this row re-renders from that. One
   * copy, and it is the one that survives the cell being recycled.
   */
  const run = (name: ConnectionActionName, what: string) => {
    if (busy) return;
    action
      .mutateAsync({ action: name, novelist })
      .catch(() =>
        Alert.alert("Not saved", `${what} could not be completed. Try again.`),
      );
  };

  const message = () => {
    if (busy) return;
    action
      .mutateAsync({ action: "message", novelist })
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
      .catch(() =>
        Alert.alert("Not opened", "That conversation could not be opened."),
      );
  };

  return (
    <Pressable
      accessibilityLabel={fullName(novelist)}
      accessibilityRole="button"
      onPress={() => onOpen(novelist.username)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {novelist.banner?.src ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            // Keyed by the URL, so a recycled cell never shows the previous
            // novelist's banner behind this one's name.
            recyclingKey={novelist.banner.src}
            source={{ uri: novelist.banner.src }}
            style={styles.bannerImage}
            // Nothing cross-fades in a list that is already scrolling.
            transition={0}
          />
          {/*
            The scrim, in the card colour rather than black: it has to hold a
            row of theme-coloured text over an arbitrary photograph, and a black
            wash would make the light theme's rows read as dark ones.
          */}
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.scrim,
              { backgroundColor: theme.material.fill },
            ]}
          />
        </View>
      ) : (
        <LinearGradient
          colors={[accent.tint, theme.material.fill]}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
      )}

      <Avatar
        name={novelist.firstName}
        size={AVATAR}
        image={novelist.avatar}
        uri={novelist.avatar?.src ?? novelist.image}
        username={novelist.username}
      />

      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {fullName(novelist)}
          </Text>
          {novelist.isVerified ? (
            <Ionicons
              color={theme.accent.text}
              name="checkmark-circle"
              size={14}
            />
          ) : null}
        </View>

        <Text
          numberOfLines={1}
          style={[styles.handle, { color: theme.textGray }]}
        >
          @{novelist.username}
        </Text>

        {/*
          The third line carries whatever this person actually has: their
          characters as faces, the count beside them, and how many friends you
          share. A novelist with neither gets two lines rather than a row of
          zeroes.
        */}
        {muses.length > 0 || mutual > 0 ? (
          <View style={styles.meta}>
            {visibleMuses.length > 0 ? (
              <View style={styles.museStack}>
                {visibleMuses.map((muse) => (
                  <View
                    key={muse.id ?? muse.firstName}
                    style={[
                      styles.museFace,
                      { borderColor: theme.material.fill },
                    ]}
                  >
                    <Avatar
                      name={muse.firstName}
                      size={MUSE_AVATAR}
                      image={muse.avatar}
                      uri={muse.avatar?.src ?? muse.image}
                    />
                  </View>
                ))}
              </View>
            ) : null}

            {/*
              One line that gives way: the counts are the least important
              thing in the row, and written as separate labels they could not
              shorten — they ran on under the button instead.
            */}
            <Text
              numberOfLines={1}
              style={[styles.metaText, { color: theme.textGray }]}
            >
              {[
                muses.length > 0
                  ? `${muses.length} ${muses.length === 1 ? "character" : "characters"}`
                  : null,
                mutual > 0 ? `${mutual} mutual` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {isSelf ? (
          <Text style={[styles.self, { color: theme.textGray }]}>You</Text>
        ) : connection === "FRIEND" ? (
          <RowButton
            busy={running === "message"}
            icon="chatbubble-ellipses"
            iconOnly
            label="Message"
            onPress={message}
            tone="primary"
          />
        ) : connection === "FRIEND_REQUEST_SENT" ? (
          <RowButton
            busy={running === "cancel"}
            icon="time"
            iconOnly
            label="Cancel friend request"
            onPress={() => run("cancel", "Cancelling the request")}
            tone="quiet"
          />
        ) : connection === "FRIEND_REQUEST_RECEIVED" ? (
          // Round buttons, as every action in this row is: a labelled pill
          // took a third of the row and the line under the name ran beneath it.
          <>
            <RowButton
              busy={running === "accept"}
              icon="checkmark"
              onPress={() => run("accept", "Accepting")}
              tone="positive"
            />
            <RowButton
              busy={running === "reject"}
              icon="close"
              onPress={() => run("reject", "Declining")}
              tone="danger"
            />
          </>
        ) : (
          <RowButton
            busy={running === "send"}
            icon="person-add"
            iconOnly
            label="Add friend"
            onPress={() => run("send", "The friend request")}
            tone="primary"
          />
        )}
      </View>
    </Pressable>
  );
};

/**
 * `novelist` comes straight out of the query cache, so its identity is stable
 * between renders and this compares in one pointer check per row.
 */
export const NovelistRow = memo(NovelistRowView);

/** A pill with a label, or a circle without one. Shared with `NovelistCard`. */
export const RowButton = memo(
  ({
    busy,
    icon,
    iconOnly = false,
    label,
    onPress,
    tone,
  }: {
    busy: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    /** Draw the circle and keep `label` as what a screen reader says. */
    iconOnly?: boolean;
    label?: string;
    onPress: () => void;
    tone: "primary" | "positive" | "danger" | "quiet";
  }) =>
    label && !iconOnly ? (
      <Button
        busy={busy}
        hitSlop={space.xs}
        icon={icon}
        label={label}
        onPress={onPress}
        size="xs"
        variant={tone}
      />
    ) : (
      <IconButton
        accessibilityLabel={
          label ?? (tone === "positive" ? "Accept" : "Decline")
        }
        busy={busy}
        hitSlop={space.xs}
        icon={icon}
        iconSize={17}
        onPress={onPress}
        size={38}
        tone={tone}
      />
    ),
);

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.s },
  bannerImage: { height: "100%", width: "100%" },
  handle: { fontSize: fontSize.caption },
  identity: { flex: 1, gap: 1, minWidth: 0 },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    marginTop: 3,
    // The faces keep their size; the text beside them is what shortens.
    overflow: "hidden",
  },
  metaText: { flexShrink: 1, fontSize: fontSize.meta },
  museFace: {
    borderRadius: (MUSE_AVATAR + 3) / 2,
    borderWidth: 1.5,
    // Lapped, so three faces read as a group rather than three dots.
    marginRight: -7,
  },
  museStack: { flexDirection: "row", flexShrink: 0, paddingRight: 7 },
  name: { flexShrink: 1, fontSize: fontSize.body + 1, fontWeight: "700" },
  nameRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  row: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    height: ROW_HEIGHT,
    // Clipped, because the banner and the gradient behind it are square.
    overflow: "hidden",
    paddingHorizontal: space.md - 2,
  },
  scrim: { opacity: 0.86 },
  self: {
    fontSize: fontSize.label,
    fontWeight: "600",
    paddingHorizontal: space.sm,
  },
});
