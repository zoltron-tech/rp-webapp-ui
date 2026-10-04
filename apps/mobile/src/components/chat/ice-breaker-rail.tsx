import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { IceBreaker } from "@nw/types";
import { truncate } from "@nw/utils";
import type { ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import {
  IceBreakerTrail,
  useIceBreakerPaint,
} from "@/components/chat/ice-breaker-paint";
import { GradientSurface } from "@/components/gradient-surface";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The ice breakers, above the inbox's filters.
 *
 * A rail of short prompts people have left for anyone to answer — the one place
 * in the app where a conversation can start without already knowing who you
 * want to talk to. It sits under the search field and above the
 * All / Unread / Groups row, because those filters are about the list below
 * them: putting the rail between a filter and the thing it filters reads as if
 * the pills apply to the prompts.
 *
 * ## It is drawn as a thought bubble
 *
 * The previous version was a card: a rectangle with the message inside it and a
 * face along the bottom — the same shape as the conversation rows underneath,
 * so it said nothing about what it was. Now each one is a bubble trailing two
 * shrinking circles down toward the person it belongs to, and the rail reads as
 * "these people left something" at a glance, without a heading doing that work
 * in words.
 *
 * The trail rather than a pointed tail is web's motif, not a preference:
 * `IceBreakerBubble` there draws exactly these two circles, and drawing a
 * speech tail here would make one feature look like two.
 *
 * Moving the face out from under the bubble also buys the message the whole
 * bubble: three lines of it, rather than the two-and-an-ellipsis the card fit.
 *
 * ## Every tile is the same tile
 *
 * The add control is a bubble too — yours, unwritten: your face where the
 * speaker goes, a plus over it, and the invitation where a message would be. A
 * narrow dashed button beside content-filled cards looked like a control that
 * had wandered in from another screen.
 *
 * ## Colour, and depth
 *
 * Authors pick a bubble colour, and `useIceBreakerPaint` turns it into a
 * shallow top-to-bottom gradient rather than a flat fill — eight dark flats in
 * a row read as swatches, eight lit ones read as objects. The trailing circles
 * take the gradient's bottom stop, which is why the gradient runs vertically:
 * at any other angle they are visibly a different colour from the bubble they
 * fell out of.
 */

/**
 * How much of a prompt a tile carries.
 *
 * Cut to what three lines of the tile actually hold — roughly sixteen
 * characters a line at this width and size. Trimming here rather than leaving
 * it to `numberOfLines` means a prompt that does not fit ends on an ellipsis of
 * our own instead of being sliced mid-word at whatever point the line broke.
 */
const PREVIEW_LENGTH = 52;

/**
 * One tile. Fixed, so the rail is a rhythm rather than a ragged row.
 *
 * Smaller than it was: the rail is the *third* thing on the inbox screen, above
 * the filters and the conversations people actually came for, and at 150×86 it
 * was taking a fifth of a 375×667 screen to show two prompts. At this size two
 * and a half fit, which also makes it obvious the row scrolls.
 */
const CARD_WIDTH = 128;
const BUBBLE_HEIGHT = 68;

/**
 * The whole tile: a bubble, its trail, and the person it belongs to.
 *
 * Extracted rather than duplicated because the point of the design is that the
 * add tile and a real ice breaker are the same object in two states, and two
 * copies of the shape would drift apart the first time either changed. The
 * press target is the tile rather than the bubble — the face is part of what
 * you are tapping, and a 24dp avatar that does nothing next to a bubble that
 * does is the kind of dead spot people notice without being able to name.
 */
const Tile = ({
  accessibilityHint,
  accessibilityLabel,
  badge,
  border,
  children,
  dashed,
  from,
  image,
  name,
  onPress,
  speaker,
  to,
}: {
  accessibilityHint: string;
  accessibilityLabel: string;
  /** Drawn over the avatar, for the add tile's plus. */
  badge?: ReactNode;
  border: string;
  children: ReactNode;
  dashed?: boolean;
  from: string;
  image?: string | null;
  /** Whose face this is — the initial when there is no image. */
  name: string;
  onPress: () => void;
  /** What is written beside the face. */
  speaker: string;
  to: string;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.72 : 1 }]}
    >
      <GradientSurface
        from={from}
        style={[
          styles.bubble,
          {
            borderColor: border,
            borderStyle: dashed ? "dashed" : "solid",
            borderWidth: dashed ? 1 : StyleSheet.hairlineWidth,
          },
        ]}
        to={to}
      >
        {children}
      </GradientSurface>

      <IceBreakerTrail
        border={border}
        color={to}
        direction="down"
        style={styles.trail}
      />

      <View style={styles.speaker}>
        <View>
          <Avatar name={name} size={20} uri={image} />
          {badge}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.speakerName, { color: theme.textGray }]}
        >
          {speaker}
        </Text>
      </View>
    </Pressable>
  );
};

/** One tile's worth of nothing, while the first fetch is in flight. */
const Skeleton = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.tile}>
      <View
        style={[
          styles.bubble,
          styles.skeleton,
          { backgroundColor: theme.material.fill },
        ]}
      />
      <View style={styles.speaker}>
        <View
          style={[
            styles.skeletonFace,
            { backgroundColor: theme.material.fill },
          ]}
        />
        <View
          style={[
            styles.skeletonName,
            { backgroundColor: theme.material.fill },
          ]}
        />
      </View>
    </View>
  );
};

const IceBreakerTile = ({
  iceBreaker,
  onOpen,
}: {
  iceBreaker: IceBreaker;
  onOpen: (iceBreaker: IceBreaker) => void;
}) => {
  const paint = useIceBreakerPaint(iceBreaker.color);

  return (
    <Tile
      accessibilityHint="Opens this ice breaker"
      accessibilityLabel={`${iceBreaker.source.name}: ${iceBreaker.message}`}
      border={paint.border}
      from={paint.from}
      image={iceBreaker.source.image}
      name={iceBreaker.source.name}
      onPress={() => onOpen(iceBreaker)}
      speaker={iceBreaker.source.name.split(" ")[0] ?? iceBreaker.source.name}
      to={paint.to}
    >
      {/* A watermark rather than punctuation in the string: it marks the tile
          as a quotation without eating two of its characters. */}
      <Ionicons
        color={paint.watermark}
        name="chatbubble-ellipses"
        size={20}
        style={styles.watermark}
      />

      <Text numberOfLines={3} style={[styles.message, { color: paint.ink }]}>
        {truncate(iceBreaker.message, PREVIEW_LENGTH)}
      </Text>
    </Tile>
  );
};

export const IceBreakerRail = ({
  iceBreakers,
  isPending,
  onCreate,
  onOpen,
}: {
  iceBreakers: IceBreaker[];
  isPending: boolean;
  onCreate: () => void;
  onOpen: (iceBreaker: IceBreaker) => void;
}) => {
  const theme = useAppTheme();
  const { novelist } = useSession();

  return (
    <FlatList
      contentContainerStyle={styles.row}
      data={isPending ? [] : iceBreakers}
      horizontal
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.sourceId}
      ListEmptyComponent={
        isPending ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          // Not a tile: an empty rail should not look like it contains
          // something. A line of italic text beside the add tile reads as the
          // absence it is.
          <View style={styles.empty}>
            <Text style={[styles.emptyLabel, { color: theme.textGray }]}>
              Nobody has broken the ice yet.
            </Text>
          </View>
        )
      }
      /*
       * The add tile is the header rather than a row of the data.
       *
       * It is not an ice breaker, and it must never scroll out of reach — a
       * rail whose "new" control is only findable by scrolling back to the
       * start is one people stop using once they have a few.
       */
      ListHeaderComponent={
        <Tile
          accessibilityHint="Writes a prompt anyone can answer"
          accessibilityLabel="Add your ice breaker"
          badge={
            <View
              style={[
                styles.plusBadge,
                {
                  backgroundColor: theme.accent.solid,
                  borderColor: theme.background,
                },
              ]}
            >
              <Ionicons color="#ffffff" name="add" size={8} />
            </View>
          }
          border={theme.accent.surfaceHover}
          dashed
          from={theme.accent.tint}
          image={novelist?.image}
          name={novelist?.firstName ?? "You"}
          onPress={onCreate}
          speaker="Add yours"
          to={theme.accent.surface}
        >
          <Ionicons
            color={theme.accent.surfaceHover}
            name="add-circle"
            size={16}
            style={styles.watermark}
          />

          <Text style={[styles.message, { color: theme.accent.text }]}>
            Say something to break the ice…
          </Text>
        </Tile>
      }
      renderItem={({ item }) => (
        <IceBreakerTile iceBreaker={item} onOpen={onOpen} />
      )}
      showsHorizontalScrollIndicator={false}
      // A horizontal list is a `ScrollView`, whose container grows into
      // whatever column it sits in unless it is stopped.
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  bubble: {
    borderRadius: radius.md + 4,
    height: BUBBLE_HEIGHT,
    justifyContent: "flex-start",
    padding: space.sm,
    width: CARD_WIDTH,
  },
  empty: { justifyContent: "center", paddingHorizontal: space.sm },
  emptyLabel: { fontSize: fontSize.caption, fontStyle: "italic" },
  list: { flexGrow: 0 },
  message: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    lineHeight: 16,
    // The watermark sits in the top-right corner; without this the first line
    // runs underneath it.
    paddingRight: space.m,
  },
  plusBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1.5,
    bottom: -2,
    height: 12,
    justifyContent: "center",
    position: "absolute",
    right: -3,
    width: 12,
  },
  row: { gap: space.sm, paddingBottom: space.xxs },
  skeleton: { opacity: 0.6 },
  skeletonFace: { borderRadius: radius.full, height: 20, width: 20 },
  skeletonName: { borderRadius: radius.sm, height: 8, width: 44 },
  speaker: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    // Lines the face up under the trail, which the dots drift toward.
    paddingLeft: space.s,
    paddingTop: space.xs,
  },
  speakerName: { flexShrink: 1, fontSize: fontSize.meta, fontWeight: "700" },
  tile: { width: CARD_WIDTH },
  trail: { paddingTop: space.xs },
  watermark: { position: "absolute", right: space.s, top: space.s },
});
