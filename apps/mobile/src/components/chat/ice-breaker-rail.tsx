import { useIsFocused } from "@react-navigation/native";
import { SceneArt } from "@/components/scene-art";
import { Ionicons } from "@expo/vector-icons";
import { isOwnIceBreaker, parseIceBreakerTimestamp } from "@nw/chat";
import { useSession } from "@nw/features";
import type { IceBreaker, Novelist } from "@nw/types";
import { truncate } from "@nw/utils";
import { memo, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import {
  IceBreakerTrail,
  useIceBreakerPaint,
} from "@/components/chat/ice-breaker-paint";
import { GradientSurface } from "@/components/gradient-surface";
import { relativeTime } from "@/components/notification-row";
import { Text } from "@/components/text";
import { useTrackOnline } from "@/context/socket";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The ice breakers, at the head of the inbox.
 *
 * A rail of short prompts people have left for anyone to answer — the one place
 * in the app where a conversation can start without already knowing who you
 * want to talk to.
 *
 * ## A thought, and the person having it
 *
 * Each tile is a thought bubble trailing two shrinking circles down to a face
 * (web's motif; a pointed tail here would make one feature look like two).
 * What changed is the weight given to each half. The bubble used to carry the
 * tile and the person was a 20pt dot under it; but an ice breaker is answered
 * by starting a conversation with *someone*, so who it is and whether they are
 * around is half of the decision. The face is now a real one, with the
 * presence ring the inbox rows wear, and beside it the name and how long ago
 * the line was left — a prompt from this morning and one from last month are
 * not the same invitation.
 *
 * The message got the room that bought: the tile is wider, the type is a size
 * up, and the quotation watermark that cost the first line a fifth of its
 * width is gone.
 *
 * ## The add control is a control
 *
 * It used to be a full tile dressed as an unwritten bubble, which spent a third
 * of a 375pt screen on a button. It is now your own face with a plus on it —
 * narrow, first in the rail — so the first real prompt and most of the second
 * are on screen without scrolling, and the cut-off second tile is what says
 * the row scrolls.
 *
 * ## Colour, and depth
 *
 * Authors pick a bubble colour, and `useIceBreakerPaint` turns it into a
 * shallow top-to-bottom gradient rather than a flat fill — eight dark flats in
 * a row read as swatches, eight lit ones read as objects. The trailing circles
 * take the gradient's bottom stop, which is why the gradient runs vertically.
 */

/**
 * How much of a prompt a tile carries.
 *
 * Cut to what three lines of the tile actually hold. Trimming here rather than
 * leaving it to `numberOfLines` alone means a prompt that does not fit ends on
 * an ellipsis of our own instead of being sliced mid-word.
 */
const PREVIEW_LENGTH = 60;

/**
 * One tile. Fixed, so the rail is a rhythm rather than a ragged row. At this
 * width a 375pt screen shows the add control, one whole prompt and most of a
 * second.
 */
const CARD_WIDTH = 152;
const BUBBLE_HEIGHT = 76;
const FACE = 32;
const ADD_WIDTH = 68;
const ADD_FACE = 48;

/** A novelist can be online; a character is only ever its author's voice. */
const presenceName = (iceBreaker: IceBreaker): string | undefined =>
  iceBreaker.source.sourceType === "NOVELIST"
    ? iceBreaker.source.urlProp
    : undefined;

const IceBreakerTile = memo(function IceBreakerTile({
  iceBreaker,
  mine,
  onOpen,
}: {
  iceBreaker: IceBreaker;
  mine: boolean;
  onOpen: (iceBreaker: IceBreaker) => void;
}) {
  const theme = useAppTheme();
  const paint = useIceBreakerPaint(iceBreaker.color);
  const { source } = iceBreaker;
  const when = relativeTime(
    parseIceBreakerTimestamp(iceBreaker.createdOn) / 1000,
  );
  const who = mine
    ? "Yours"
    : source.sourceType === "MUSE"
      ? "Character"
      : null;

  return (
    <Pressable
      accessibilityHint={
        mine ? "Opens your ice breaker" : "Opens this ice breaker to reply"
      }
      accessibilityLabel={`${source.name}, ${when}: ${iceBreaker.message}`}
      accessibilityRole="button"
      onPress={() => onOpen(iceBreaker)}
      style={({ pressed }) => [
        styles.tile,
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
      ]}
    >
      <GradientSurface
        from={paint.from}
        style={[
          styles.bubble,
          {
            borderColor: mine ? theme.accent.solid : paint.border,
            borderWidth: mine ? border.edge : StyleSheet.hairlineWidth,
          },
        ]}
        to={paint.to}
      >
        <Text numberOfLines={3} style={[styles.message, { color: paint.ink }]}>
          {truncate(iceBreaker.message, PREVIEW_LENGTH)}
        </Text>
      </GradientSurface>

      <IceBreakerTrail
        border={paint.border}
        color={paint.to}
        direction="down"
        style={styles.trail}
      />

      <View style={styles.speaker}>
        <View style={styles.face}>
          <Avatar
            image={source.avatar}
            name={source.name}
            size={FACE}
            uri={source.avatar?.src ?? source.image}
            username={presenceName(iceBreaker)}
          />
        </View>
        <View style={styles.speakerText}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {source.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.meta,
              { color: mine ? theme.accent.text : theme.textGray },
            ]}
          >
            {who ? `${who} · ${when}` : when}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

/** One tile's worth of nothing, while the first fetch is in flight. */
const Skeleton = () => {
  const theme = useAppTheme();
  const tint = { backgroundColor: theme.material.fill };

  return (
    <View style={[styles.tile, styles.skeleton]}>
      <View style={[styles.bubble, tint]} />
      <View style={styles.skeletonGap} />
      <View style={styles.speaker}>
        <View style={[styles.skeletonFace, tint]} />
        <View style={styles.speakerText}>
          <View style={[styles.skeletonName, tint]} />
          <View style={[styles.skeletonMeta, tint]} />
        </View>
      </View>
    </View>
  );
};

/**
 * Your face with a plus on it: the first thing in the rail, and never an ice
 * breaker itself.
 */
const AddTile = ({
  novelist,
  onCreate,
}: {
  novelist: Novelist | null | undefined;
  onCreate: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityHint="Writes a prompt anyone can answer"
      accessibilityLabel="Add your ice breaker"
      accessibilityRole="button"
      onPress={onCreate}
      style={({ pressed }) => [
        styles.add,
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
      ]}
    >
      <View
        style={[styles.addRing, { borderColor: theme.accent.surfaceHover }]}
      >
        <Avatar
          image={novelist?.avatar}
          name={novelist?.firstName ?? "You"}
          size={ADD_FACE}
          uri={novelist?.avatar?.src ?? novelist?.image}
        />
        <View
          style={[
            styles.plus,
            {
              backgroundColor: theme.accent.solid,
              borderColor: theme.background,
            },
          ]}
        >
          <Ionicons color={theme.accent.onSolid} name="add" size={14} />
        </View>
      </View>
      <Text style={[styles.addLabel, { color: theme.accent.text }]}>
        Break the ice
      </Text>
    </Pressable>
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

  // So the rings on the faces mean something; the server only answers about
  // usernames it has been asked about.
  useTrackOnline(useMemo(() => iceBreakers.map(presenceName), [iceBreakers]));

  return (
    <FlatList
      contentContainerStyle={styles.row}
      data={isPending ? [] : iceBreakers}
      horizontal
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.sourceId}
      ListEmptyComponent={
        isPending ? (
          <View style={styles.skeletons}>
            <Skeleton />
            <Skeleton />
          </View>
        ) : (
          // Not a tile: an empty rail should not look like it contains
          // something. A few words beside the add control say what it is for.
          <View style={styles.empty}>
            <FrozenSilence />
            <View style={styles.emptyWords}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Nobody has broken the ice yet
              </Text>
              <Text style={[styles.emptyBody, { color: theme.textGray }]}>
                Leave a line anyone can answer, and see who writes back.
              </Text>
            </View>
          </View>
        )
      }
      /*
       * The add control is the header rather than a row of the data: it is
       * not an ice breaker, and it is always where the rail starts.
       */
      ListHeaderComponent={<AddTile novelist={novelist} onCreate={onCreate} />}
      renderItem={({ item }) => (
        <IceBreakerTile
          iceBreaker={item}
          mine={isOwnIceBreaker(item, novelist)}
          onOpen={onOpen}
        />
      )}
      showsHorizontalScrollIndicator={false}
      // A horizontal list is a `ScrollView`, whose container grows into
      // whatever column it sits in unless it is stopped.
      style={styles.list}
    />
  );
};

/**
 * Web's frozen speech bubble, beside the rail's empty words. Its own component
 * so the focus gate re-renders this and not the rail.
 */
const FrozenSilence = () => {
  const focused = useIsFocused();
  return <SceneArt motion={focused} scene="frozen-silence" />;
};

const styles = StyleSheet.create({
  // As tall as a tile's bubble, so the face sits level with the prompts.
  add: {
    alignItems: "center",
    gap: space.s,
    paddingTop: (BUBBLE_HEIGHT - ADD_FACE - 6) / 2,
    width: ADD_WIDTH,
  },
  addLabel: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    lineHeight: 14,
    textAlign: "center",
  },
  addRing: {
    alignItems: "center",
    borderRadius: radius.full,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: ADD_FACE + 8,
    justifyContent: "center",
    width: ADD_FACE + 8,
  },
  bubble: {
    borderRadius: radius.md + 6,
    height: BUBBLE_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
    width: CARD_WIDTH,
  },
  empty: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    height: BUBBLE_HEIGHT,
    paddingLeft: space.xs,
  },
  emptyWords: { gap: space.xxs, justifyContent: "center", maxWidth: 200 },
  emptyBody: { fontSize: fontSize.caption, lineHeight: 17 },
  emptyTitle: { fontSize: fontSize.label, fontWeight: "700" },
  // Centred, so the presence ring grows around the face rather than moving it.
  face: {
    alignItems: "center",
    height: FACE,
    justifyContent: "center",
    width: FACE,
  },
  /*
   * The rail bleeds to the screen's edges through the inbox head's gutter, so
   * tiles scroll off the glass rather than being cut at an invisible margin.
   */
  list: { flexGrow: 0, marginHorizontal: -space.md },
  message: { fontSize: fontSize.label, fontWeight: "600", lineHeight: 18 },
  meta: { fontSize: fontSize.meta, lineHeight: 14 },
  name: { fontSize: fontSize.caption, fontWeight: "700", lineHeight: 16 },
  plus: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -2,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 22,
  },
  row: {
    gap: space.sm,
    paddingBottom: space.xxs,
    paddingHorizontal: space.md,
  },
  skeleton: { opacity: 0.6 },
  skeletonFace: { borderRadius: radius.full, height: FACE, width: FACE },
  // Where the trail would be.
  skeletonGap: { height: 21 },
  skeletonMeta: { borderRadius: radius.sm, height: 8, width: 40 },
  skeletonName: { borderRadius: radius.sm, height: 10, width: 76 },
  skeletons: { flexDirection: "row", gap: space.sm },
  speaker: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    // Lines the face up under the trail, which the dots drift toward.
    paddingLeft: space.xs,
    paddingTop: space.xxs,
  },
  speakerText: { flex: 1, gap: 1, minWidth: 0 },
  tile: { width: CARD_WIDTH },
  trail: { paddingTop: 3 },
});
