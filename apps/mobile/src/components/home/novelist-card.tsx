import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { NWImage } from "@nw/types";
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
import { useGlobalState } from "@nw/store";

/**
 * Web's `NovelistPreviewCard`, at phone width.
 *
 * The web card is read top to bottom as five bands: banner, face, identity,
 * what they bring, and the one control their connection to you calls for. This
 * is the same five, at the same order and the same proportions — a 5:2 banner,
 * the face lapping half over its edge, name and handle centred, a stat line,
 * their characters as faces inside a ruled block, and a button that spans the
 * card. What differs is only what a phone cannot spend: no hover lift, and no
 * badge crests (a crest is an `<Svg>` per badge, and `components/badges.tsx`
 * keeps those off list cells on purpose).
 *
 * ## Squarer than it was
 *
 * The card, the banner corners, the buttons: 8px and 5px, against web's 8px and
 * 4px. The old card was `radius.lg` with pill buttons, which read as a chip
 * rather than as a card of somebody — and a pill inside a rounded rectangle
 * repeats the same curve at two sizes, which is what made the old actions look
 * pasted on.
 *
 * ## One height for every card
 *
 * `CARD_HEIGHT` is fixed and the action block is pushed to the bottom with
 * `marginTop: "auto"`, web's `margin-top: auto` in the button container. A rail
 * of cards whose buttons sit at different heights is the single most obvious
 * thing wrong with a horizontal list, and the content above the button varies:
 * a novelist with no muses, a friend request built from a notification with no
 * banner and no stats at all.
 *
 * The button is `useConnectionAction`, so an "Add" tapped here becomes
 * "Requested" without a refetch and stays that way when the same person turns
 * up in a likers list.
 */

/** What a card needs to know. `Novelist` and `Friend` both satisfy it. */
export interface NovelistCardPerson {
  avatar?: NWImage | null;
  banner?: NWImage | null;
  connection: string | null;
  firstName: string;
  id: string;
  image: string;
  isVerified?: boolean;
  lastName: string | null;
  muses?:
    | {
        avatar?: NWImage | null;
        firstName?: string;
        id?: string | null;
        image?: string | null;
        originalVerseId?: string | null;
      }[]
    | null;
  mutualFriendCount?: number;
  palette?: number;
  username: string;
}

/** Wide enough for "Cancel Request" on one line, narrow enough for a peek. */
export const NOVELIST_CARD_WIDTH = 176;

/**
 * The card's floor, not its ceiling.
 *
 * A horizontal list stretches its cells to the tallest one, so this is what
 * every card is unless something in one of them (a two-line name) asks for
 * more, and the rules and buttons still line up across the rail. A hard
 * `height` was the first try and it clipped the button block by a few points
 * the moment a font scaled.
 */
export const NOVELIST_CARD_MIN_HEIGHT = 284;

/** Web's `aspect-ratio: 5 / 2`, resolved at this one width. */
const BANNER = Math.round(NOVELIST_CARD_WIDTH * 0.4);
const AVATAR = 56;
const RING = 3;
/** The accent hairline outside it — web's second box-shadow. */
const RING_OUT = 1.5;
/** Web's `MAX_MUSES`. Four faces and a "+N" are what this width holds. */
const MAX_MUSES = 4;
const MUSE_FACE = 26;
/** How far each face laps over the one before it. */
const MUSE_LAP = 8;

/**
 * The card's button: a rectangle that spans what it is given.
 *
 * Not `NovelistRow`'s `RowButton` — that is a pill, sized to its label, which
 * is right in a row where it sits beside text and wrong here, where it is the
 * card's base. Two of them (accept and decline) split the width evenly, which
 * is web's `ButtonContainer` with `gap: 8`.
 */
const CardButton = memo(
  ({
    accessibilityLabel,
    busy,
    icon,
    label,
    onPress,
    tone,
  }: {
    /** What an icon-only button is called. Defaults to "Open profile". */
    accessibilityLabel?: string;
    busy: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    /** Absent for the square icon-only button beside the labelled one. */
    label?: string;
    onPress: () => void;
    tone: "primary" | "positive" | "danger" | "quiet";
  }) => (
    <Button
      accessibilityLabel={label ?? accessibilityLabel ?? "Open profile"}
      busy={busy}
      icon={icon}
      label={label}
      onPress={onPress}
      shape="rect"
      size="xs"
      stretch={Boolean(label)}
      style={label ? styles.buttonWide : styles.buttonSquare}
      variant={tone}
    />
  ),
);

const NovelistCardView = ({
  onChanged,
  person,
}: {
  /**
   * Told the connection the server confirmed, for a caller whose copy of this
   * person is not in the query cache — a friend request read off a
   * notification, say — and would otherwise keep drawing the old button.
   */
  onChanged?: (id: string, connection: Connection) => void;
  person: NovelistCardPerson;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const action = useConnectionAction();
  // The store's copy, not `useSession()`: that is two query observers per
  // row, and every one of them re-rendered when the session settled.
  const me = useGlobalState("novelist");

  const connection = (person.connection ?? null) as Connection;
  const isSelf = me?.id === person.id;
  const accent = useMemo(
    () => accentFromPalette(person.palette),
    [person.palette],
  );
  const muses = useMemo(
    () => mainVerseMuses(person.muses ?? []),
    [person.muses],
  );
  const visibleMuses = useMemo(() => muses.slice(0, MAX_MUSES), [muses]);
  const extraMuses = muses.length - visibleMuses.length;
  const mutual = person.mutualFriendCount ?? 0;

  const busy = action.isPending;
  const running = busy ? action.variables?.action : undefined;

  const openProfile = () =>
    router.push({
      params: { username: person.username },
      pathname: "/novelist/[username]",
    });

  const run = (name: ConnectionActionName, next: Connection, what: string) => {
    if (busy) return;
    action
      .mutateAsync({ action: name, novelist: person })
      .then(() => onChanged?.(person.id, next))
      .catch(() =>
        Alert.alert("Not saved", `${what} could not be completed. Try again.`),
      );
  };

  const message = () => {
    if (busy) return;
    action
      .mutateAsync({ action: "message", novelist: person })
      .then((conversationId) => {
        if (!conversationId) {
          Alert.alert("No conversation", "It could not be opened. Try again.");
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
      accessibilityLabel={fullName(person)}
      accessibilityRole="button"
      onPress={openProfile}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.banner}>
        {person.banner?.src ? (
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            recyclingKey={person.banner.src}
            source={{ uri: person.banner.src }}
            style={styles.fill}
            transition={0}
          />
        ) : (
          // Web's banner falls back to a flat `--accent-6`; a two-stop gradient
          // between that step and the faintest tint reads as deliberate rather
          // than as a missing image, which matters here where the banner is 40%
          // of the card. Not the solid step: at this size a saturated block is
          // louder than any real banner and pulls the eye off the name.
          <LinearGradient
            colors={[accent.surface, accent.tint]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.fill}
          />
        )}
      </View>

      <View style={styles.body}>
        {/*
          Two rings, as web's two box-shadows: the card's own colour to punch
          the face out of the banner, and a hairline of their accent outside it.
          One ring alone either floats (accent only) or dissolves into the body
          (card colour only).
        */}
        <View style={[styles.ring, { borderColor: accent.surface }]}>
          <View
            style={[
              styles.face,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.fill,
              },
            ]}
          >
            <Avatar
              image={person.avatar}
              name={person.firstName}
              size={AVATAR}
              uri={person.avatar?.src ?? person.image}
              username={person.username}
            />
            {person.isVerified ? (
              <View
                style={[
                  styles.verified,
                  { backgroundColor: theme.material.fill },
                ]}
              >
                <Ionicons
                  color={accent.text}
                  name="checkmark-circle"
                  size={15}
                />
              </View>
            ) : null}
          </View>
        </View>

        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {fullName(person)}
        </Text>
        <Text numberOfLines={1} style={[styles.handle, { color: accent.text }]}>
          @{person.username}
        </Text>

        {/*
          Web's `StatsRow`: the counts spelled out with their icons, the number
          in the text colour and the word in the secondary one. Fixed height, so
          a novelist with neither stat does not shorten the card above the rule.
        */}
        <View style={styles.stats}>
          {muses.length > 0 ? (
            <View style={styles.stat}>
              <Ionicons
                color={theme.textGray}
                name="pencil-outline"
                size={11}
              />
              <Text
                numberOfLines={1}
                style={[styles.statText, { color: theme.textGray }]}
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {muses.length}
                </Text>{" "}
                {muses.length === 1 ? "character" : "characters"}
              </Text>
            </View>
          ) : null}
          {mutual > 0 ? (
            <View style={styles.stat}>
              <Ionicons
                color={theme.textGray}
                name="people-outline"
                size={11}
              />
              <Text
                numberOfLines={1}
                style={[styles.statText, { color: theme.textGray }]}
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {mutual}
                </Text>{" "}
                mutual
              </Text>
            </View>
          ) : null}
        </View>

        {/*
          Web's `MuseBlock`: ruled top and bottom, its label in small caps, the
          faces lapped into one group. The faces are not tappable the way web's
          are — the whole card is one target for the profile, and a second
          target inside it at 26pt is below what a thumb can aim at.
        */}
        <View
          style={[styles.museBlock, { borderColor: theme.material.edge }]}
        >
          <Text style={[styles.museLabel, { color: theme.textGray }]}>
            CHARACTERS
          </Text>
          {visibleMuses.length > 0 ? (
            <View style={styles.museRow}>
              {visibleMuses.map((muse, index) => (
                <View
                  key={muse.id ?? `${muse.firstName}-${index}`}
                  style={[
                    styles.museFace,
                    index > 0 && styles.museLapped,
                    { borderColor: theme.material.fill },
                  ]}
                >
                  <Avatar
                    image={muse.avatar}
                    name={muse.firstName}
                    size={MUSE_FACE}
                    uri={muse.avatar?.src ?? muse.image}
                  />
                </View>
              ))}
              {extraMuses > 0 ? (
                <View
                  style={[
                    styles.museFace,
                    styles.museLapped,
                    styles.museOverflow,
                    {
                      backgroundColor: accent.tintStrong,
                      borderColor: theme.material.fill,
                    },
                  ]}
                >
                  <Text style={[styles.museMore, { color: accent.text }]}>
                    +{extraMuses}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.museEmpty, { color: theme.textGray }]}>
              No characters yet
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {isSelf ? (
            <CardButton
              busy={false}
              icon="person-outline"
              label="Open Profile"
              onPress={openProfile}
              tone="quiet"
            />
          ) : connection === "FRIEND" ? (
            // Web pairs Message with a square button to the profile; the card
            // itself already opens the profile, so the square one is what keeps
            // the friend state from being a lone wide button unlike every other.
            <>
              <CardButton
                busy={running === "message"}
                icon="chatbubble-ellipses"
                label="Message"
                onPress={message}
                tone="primary"
              />
              <CardButton
                busy={false}
                icon="person-outline"
                onPress={openProfile}
                tone="quiet"
              />
            </>
          ) : connection === "FRIEND_REQUEST_SENT" ? (
            <CardButton
              busy={running === "cancel"}
              icon="time-outline"
              label="Cancel Request"
              onPress={() => run("cancel", null, "Cancelling the request")}
              tone="quiet"
            />
          ) : connection === "FRIEND_REQUEST_RECEIVED" ? (
            <>
              <CardButton
                busy={running === "accept"}
                icon="checkmark"
                label="Accept"
                onPress={() => run("accept", "FRIEND", "Accepting")}
                tone="positive"
              />
              {/* A square, as the profile button beside Message is: two
                  labelled halves of a 176pt card had room for neither word,
                  and the one you are being asked for is Accept. */}
              <CardButton
                accessibilityLabel="Decline"
                busy={running === "reject"}
                icon="close"
                onPress={() => run("reject", null, "Declining")}
                tone="danger"
              />
            </>
          ) : (
            <CardButton
              busy={running === "send"}
              icon="person-add"
              label="Add Friend"
              onPress={() =>
                run("send", "FRIEND_REQUEST_SENT", "The friend request")
              }
              tone="primary"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const NovelistCard = memo(NovelistCardView);

/**
 * The card's shape before its people arrive: the same bands, blank. A single
 * grey box of the right height is the same cost and says less about what is
 * coming.
 */
export const NovelistCardShimmer = () => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View
        style={[styles.banner, { backgroundColor: theme.material.fillPressed }]}
      />
      <View style={styles.body}>
        <View
          style={[
            styles.ring,
            styles.ghost,
            {
              backgroundColor: theme.material.fillPressed,
              borderColor: theme.material.fill,
            },
          ]}
        />
        <View
          style={[
            styles.ghostLine,
            styles.ghostName,
            { backgroundColor: theme.material.fillPressed },
          ]}
        />
        <View
          style={[
            styles.ghostLine,
            styles.ghostHandle,
            { backgroundColor: theme.material.fillPressed },
          ]}
        />
        <View
          style={[styles.museBlock, { borderColor: theme.material.edge }]}
        >
          <View
            style={[
              styles.ghostLine,
              styles.ghostFaces,
              { backgroundColor: theme.material.fillPressed },
            ]}
          />
        </View>
        <View style={styles.actions}>
          <View
            style={[
              styles.button,
              styles.buttonWide,
              {
                backgroundColor: theme.material.fillPressed,
                borderColor: "transparent",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.s,
    // Web's `margin-top: auto`: the buttons sit on the card's floor whatever
    // the content above them came to.
    marginTop: "auto",
    paddingTop: space.sm,
    width: "100%",
  },
  banner: { height: BANNER, width: "100%" },
  body: {
    alignItems: "center",
    flex: 1,
    paddingBottom: space.ms,
    paddingHorizontal: space.ms,
    width: "100%",
  },
  button: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 5,
    height: 34,
    justifyContent: "center",
  },
  /** The icon-only button: square, so a pair of them cannot look like a pill. */
  buttonSquare: { height: 34, paddingHorizontal: 0, width: 36 },
  buttonWide: { height: 34, paddingHorizontal: space.s },
  card: {
    borderRadius: radius.cardSm,
    borderWidth: border.edge,
    minHeight: NOVELIST_CARD_MIN_HEIGHT,
    // Clipped: the banner is square and the card's corners are not.
    overflow: "hidden",
    width: NOVELIST_CARD_WIDTH,
  },
  face: {
    borderRadius: (AVATAR + RING * 2) / 2,
    borderWidth: RING,
  },
  fill: { height: "100%", width: "100%" },
  ghost: {
    height: AVATAR + (RING + RING_OUT) * 2,
    width: AVATAR + (RING + RING_OUT) * 2,
  },
  ghostFaces: { height: MUSE_FACE, width: 96 },
  ghostHandle: { height: 10, marginTop: space.s, width: "45%" },
  ghostLine: { borderRadius: radius.sm },
  ghostName: { height: 12, marginTop: space.xxs, width: "70%" },
  handle: { fontSize: fontSize.caption, marginTop: 1, opacity: 0.9 },
  museBlock: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
    marginTop: space.sm,
    paddingBottom: space.sm,
    paddingTop: space.sm - 1,
    width: "100%",
  },
  museEmpty: {
    fontSize: fontSize.caption,
    fontStyle: "italic",
    height: MUSE_FACE + 2,
    lineHeight: MUSE_FACE + 2,
    opacity: 0.7,
  },
  museFace: {
    borderRadius: (MUSE_FACE + 4) / 2,
    borderWidth: 2,
  },
  museLabel: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 1.3,
    opacity: 0.7,
  },
  museLapped: { marginLeft: -MUSE_LAP },
  museMore: { fontSize: fontSize.meta, fontWeight: "700" },
  museOverflow: {
    alignItems: "center",
    height: MUSE_FACE + 4,
    justifyContent: "center",
    width: MUSE_FACE + 4,
  },
  museRow: { alignItems: "center", flexDirection: "row" },
  name: {
    fontSize: fontSize.body,
    fontWeight: "700",
    letterSpacing: -0.2,
    maxWidth: "100%",
  },
  ring: {
    borderRadius: (AVATAR + (RING + RING_OUT) * 2) / 2,
    borderWidth: RING_OUT,
    marginBottom: space.s,
    // Half over the banner, as web's `margin-top: -26px` on a 52px avatar.
    marginTop: -(AVATAR / 2 + RING + RING_OUT),
  },
  // Shrinks: two counts on a 176pt card are a tight fit, and a word that
  // shortens is better than a row that runs to the card's edges.
  stat: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 3,
    minWidth: 0,
  },
  stats: {
    alignItems: "center",
    flexDirection: "row",
    // The gap is the separator: a dot between the two cost the eleven points
    // that decided whether both counts fit.
    gap: space.sm,
    height: 16,
    justifyContent: "center",
    maxWidth: "100%",
    marginTop: space.xs + 1,
  },
  statText: { flexShrink: 1, fontSize: fontSize.meta },
  statValue: { fontWeight: "700" },
  verified: {
    borderRadius: radius.full,
    bottom: 0,
    position: "absolute",
    right: -1,
  },
});
