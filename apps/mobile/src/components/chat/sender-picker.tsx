import { Ionicons } from "@expo/vector-icons";
import type { MessageSenderChoice } from "@nw/chat";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { BottomSheet } from "@/components/sheet";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Who am I speaking as?
 *
 * A novelist can post as themselves or as any muse they have penned, and that
 * choice is the product — a client that can only send as the novelist cannot
 * say the thing the user meant to say. Web puts this behind an avatar button at
 * the left of the composer that opens a dialog; on a phone it is a bottom
 * sheet, per `AGENTS.md`.
 *
 * ## What the redesign changed
 *
 * The tray used to be a hand-rolled `Modal` with a list of full-width rows,
 * which meant a scroll of near-identical cards and a lot of thumb travel to
 * reach a muse near the bottom. Now:
 *
 *  - It is a real sheet — dimmed backdrop, grip, drag to dismiss — through the
 *    shared `BottomSheet`, so it behaves like every other tray in the app.
 *  - The novelist is a distinct card at the top rather than the first row of a
 *    list, because "speak as myself" is a different kind of choice from "speak
 *    as this character" and it is the one people reach for under pressure.
 *  - The muses are a two-column grid of faces. A muse is recognised by their
 *    portrait long before their name is read, and a grid puts twice as many on
 *    screen within the 375 × 667 budget.
 *  - The current choice carries a check and an accent ring, so the answer to
 *    "who am I about to be?" is visible without reading.
 *
 * The search box still only appears once there are enough muses to need it: a
 * search field over three faces is furniture, and it costs a row.
 */

const SEARCH_THRESHOLD = 6;

const SenderCard = ({
  active,
  onSelect,
  sender,
}: {
  active: boolean;
  onSelect: (sender: MessageSenderChoice) => void;
  sender: MessageSenderChoice;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Send as ${sender.name}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => onSelect(sender)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: active
            ? theme.accent.tint
            : pressed
              ? theme.glass.fillPressed
              : theme.material.fillTranslucent,
          borderColor: active ? theme.accent.solid : theme.material.edgeTranslucent,
          borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Avatar name={sender.name} size={52} uri={sender.image} />
      <Text
        numberOfLines={1}
        style={[
          styles.cardName,
          { color: active ? theme.accent.text : theme.text },
        ]}
      >
        {sender.name}
      </Text>
      {active ? (
        <View style={[styles.check, { backgroundColor: theme.accent.solid }]}>
          <Ionicons color="#ffffff" name="checkmark" size={12} />
        </View>
      ) : null}
    </Pressable>
  );
};

export const SenderPicker = ({
  onClose,
  onSelect,
  selected,
  senders,
  visible,
}: {
  onClose: () => void;
  onSelect: (sender: MessageSenderChoice) => void;
  selected: MessageSenderChoice | null;
  senders: MessageSenderChoice[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [search, setSearch] = useState("");

  const novelist = senders.find((sender) => sender.type === "NOVELIST") ?? null;
  const muses = useMemo(
    () => senders.filter((sender) => sender.type === "MUSE"),
    [senders],
  );

  /*
   * Who was chosen when the sheet opened, which is what orders the grid.
   *
   * Not the live choice: picking a muse closes the sheet with a slide, and a
   * grid ordered by the live choice reshuffled under the finger as it left —
   * the face just tapped leapt to the first cell mid-slide.
   */
  const [openedWith, setOpenedWith] = useState(selected);
  useEffect(() => {
    if (visible) setOpenedWith(selected);
  }, [visible]);

  const visibleMuses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = query
      ? muses.filter((muse) => muse.name.toLowerCase().includes(query))
      : muses;
    if (!openedWith || openedWith.type !== "MUSE") return matched;
    // The chosen muse to the top, so the current choice is never scrolled off.
    const chosen = matched.find((muse) => muse.id === openedWith.id);
    if (!chosen) return matched;
    return [chosen, ...matched.filter((muse) => muse.id !== openedWith.id)];
  }, [muses, openedWith, search]);

  const pick = (sender: MessageSenderChoice) => {
    onSelect(sender);
    setSearch("");
    onClose();
  };

  return (
    <BottomSheet
      // Filled and near-full-height: this tray has a search field in it, and a
      // sheet that resizes itself around the results moves that field under the
      // thumb typing into it. See `BottomSheet`'s `fill`.
      fill
      maxHeightRatio={0.88}
      onClose={onClose}
      subtitle="Every message until you change it"
      title="Send as"
      visible={visible}
    >
      <View style={styles.body}>
        {/* The novelist is pinned and never filtered out by the search: it is
            the way back to speaking as yourself, and it should not disappear
            because of what is in the box. */}
        {novelist ? (
          <Pressable
            accessibilityLabel={`Send as ${novelist.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected?.id === novelist.id }}
            onPress={() => pick(novelist)}
            style={({ pressed }) => [
              styles.selfRow,
              {
                backgroundColor:
                  selected?.id === novelist.id
                    ? theme.accent.tint
                    : pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillTranslucent,
                borderColor:
                  selected?.id === novelist.id
                    ? theme.accent.solid
                    : theme.material.edgeTranslucent,
              },
            ]}
          >
            <Avatar name={novelist.name} size={44} uri={novelist.image} />
            <View style={styles.selfText}>
              <Text
                numberOfLines={1}
                style={[styles.selfName, { color: theme.text }]}
              >
                {novelist.name}
              </Text>
              <Text style={[styles.kind, { color: theme.textGray }]}>
                Yourself
              </Text>
            </View>
            {selected?.id === novelist.id ? (
              <Ionicons
                color={theme.accent.text}
                name="checkmark-circle"
                size={22}
              />
            ) : null}
          </Pressable>
        ) : null}

        {muses.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.section, { color: theme.textGray }]}>
                Characters
              </Text>
              <Text style={[styles.count, { color: theme.textGray }]}>
                {muses.length}
              </Text>
            </View>

            {muses.length >= SEARCH_THRESHOLD ? (
              <View
                style={[
                  styles.search,
                  {
                    backgroundColor: theme.glass.field,
                    borderColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Ionicons color={theme.textGray} name="search" size={16} />
                <TextInput
                  autoCorrect={false}
                  onChangeText={setSearch}
                  placeholder="Search characters"
                  placeholderTextColor={theme.textGray}
                  style={[styles.searchInput, { color: theme.text }]}
                  value={search}
                />
              </View>
            ) : null}

            <FlatList
              columnWrapperStyle={styles.column}
              contentContainerStyle={styles.grid}
              // The grid owns whatever height is left under the header, the
              // pinned novelist and the search field, and scrolls inside it.
              style={styles.gridBox}
              data={visibleMuses}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: theme.textGray }]}>
                  No character by that name.
                </Text>
              }
              numColumns={2}
              renderItem={({ item }) => (
                <SenderCard
                  active={selected?.id === item.id}
                  onSelect={pick}
                  sender={item}
                />
              )}
            />
          </>
        ) : (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            Create a character and you can speak as them here.
          </Text>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
  card: {
    alignItems: "center",
    borderRadius: radius.md,
    flex: 1,
    gap: space.xs,
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
  },
  cardName: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    textAlign: "center",
  },
  check: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: space.xs,
    top: space.xs,
    width: 20,
  },
  column: { gap: space.sm },
  count: { fontSize: fontSize.caption },
  empty: {
    fontSize: fontSize.caption,
    paddingVertical: space.md,
    textAlign: "center",
  },
  grid: { gap: space.sm, paddingBottom: space.md },
  gridBox: { flex: 1 },
  kind: { fontSize: fontSize.caption },
  search: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
  section: { flex: 1, fontSize: fontSize.caption, fontWeight: "700" },
  sectionRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingTop: space.xs,
  },
  selfName: { fontSize: fontSize.body, fontWeight: "700" },
  selfRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  selfText: { flex: 1, gap: 1 },
});
