import { Ionicons } from "@expo/vector-icons";
import { deleteMuse, getAllMusesByUsername } from "@nw/api/endpoints/muse";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Muse } from "@nw/types";
import { mainVerseMuses } from "@nw/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { EmptyScene } from "@/components/empty-feed";
import { MuseListRowSkeleton, SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { InFandomGroup, MuseListRow } from "@/components/muse-list-row";
import { closeOpenRevealRow } from "@/components/reveal-row";
import { PillButton } from "@/components/settings";
import { Text } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { asColor, asHex, withAlpha } from "@/lib/color";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Every character a novelist writes — web's `/rp/profile/[handle]/muses`.
 *
 * A component rather than a screen: the Home tab mounts it for another
 * novelist, the Profile tab for your own, so that opening your own characters
 * lights Profile rather than Home.
 *
 * `getAllMusesByUsername` returns the lot in one response — there is no paged
 * variant, and the web muses page does the same single fetch.
 *
 * ## Fandoms, as on web
 *
 * The fandoms are chips across the top, each with how many characters it
 * holds; tapping one filters to it, tapping more widens the filter, and "All"
 * clears it. "Group by fandom" gathers each fandom's characters into one
 * container washed in that fandom's colour — web's `FandomGroup` — in the
 * chips' order, fandomless last. Chips come from the whole roster rather than
 * the filtered one, so picking a fandom never hides the others.
 *
 * ## Grouping without a remount
 *
 * A group is *not* one list item wrapping its rows. That was the first cut,
 * and toggling it on a 50-character roster took the best part of two seconds:
 * every row mounted at once inside unvirtualised cards, and every row, and its
 * avatar, remounted again on the way back, because the element tree around it
 * had changed.
 *
 * Instead the list stays flat in both modes. A group is a header cell followed
 * by its characters' cells, each cell painting its own slice of the group's
 * border and wash (`SliceFrame`), so together they read as one container. A
 * character's cell has the same key and the same element tree grouped or not,
 * so toggling moves and restyles rows the list already has — and only the
 * rows on screen, since grouped mode is virtualised too.
 *
 * Whether a row sits in a group reaches it through `InFandomGroup`, so the
 * toggle redraws each row's chips rather than each row. The checkbox and chips
 * answer the tap at once; the list follows a frame later (`useTrailing`), with
 * a spinner beside the control until it has.
 *
 * ## Your own list
 *
 * On your own list every row slides left to Edit (the web editor, as the
 * character's own MORE menu does) or Delete (confirmed, the same endpoint and
 * cache clean-up as that menu). The list closes an open row as soon as it
 * starts to scroll.
 *
 * No `removeClippedSubviews`: on Android under Fabric it crashed this list when
 * its structure changed ("addViewAt: failed to insert view"). The windowing
 * props below bound the work instead.
 */

const FANDOMLESS_ID = "FANDOMLESS";

/** A main-verse character, with the size of its verse family. */
type ListedMuse = Muse & { verseCount?: number };

interface FandomOption {
  color: string | undefined;
  count: number;
  id: string;
  name: string;
}

/** Where a cell sits inside its fandom group, as shares of the group. */
interface Slice {
  color: string | undefined;
  /** Share of the group above this cell's top edge, 0–1. */
  from: number;
  first: boolean;
  last: boolean;
  /** Share of the group above this cell's bottom edge, 0–1. */
  to: number;
}

type ListItem =
  | { kind: "muse"; muse: ListedMuse; slice: Slice | null }
  | {
      count: number;
      id: string;
      kind: "header";
      name: string;
      slice: Slice;
    };

/**
 * Grouping is a reading preference rather than a property of one novelist's
 * list, so it carries across lists for the rest of the session.
 */
let groupPreference = false;

const NO_SELECTION: string[] = [];
/** One empty roster, so "no data yet" does not rebuild the chips each render. */
const NO_MUSES: ListedMuse[] = [];

const fandomIdOf = (muse: Muse) => muse.fandom?.id || FANDOMLESS_ID;

/** The fandomless bucket's stored name is a sentence — too long for a chip. */
const fandomNameOf = (muse: Muse) =>
  fandomIdOf(muse) === FANDOMLESS_ID
    ? "Fandomless"
    : muse.fandom?.name || "Fandomless";

// A character keeps its key grouped or not — that is what spares the remount.
const keyExtractor = (item: ListItem, index: number) =>
  item.kind === "header"
    ? `fandom-${item.id}`
    : (item.muse.id ?? `muse-${index}`);

/**
 * The group wash's strength at a point down the group: strongest under the
 * header, fading to a trace by the last character.
 */
const washAlpha = (at: number) =>
  at <= 0.45 ? 0.16 - (at / 0.45) * 0.1 : 0.06 - ((at - 0.45) / 0.55) * 0.04;

/**
 * `value`, caught up a frame late — so whatever shows a change (the checkbox,
 * the chip, a spinner) paints before the work the change causes.
 *
 * Not `useDeferredValue`: under Fabric in a dev build its interruptible render
 * kept restarting behind the list's own layout updates, and a toggle took six
 * seconds to land instead of one.
 */
const useTrailing = <T,>(value: T): T => {
  const [trailing, setTrailing] = useState(value);
  useEffect(() => {
    if (Object.is(trailing, value)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => setTrailing(value), 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [trailing, value]);
  return trailing;
};

/**
 * The main verses, alphabetical as on web, each carrying how many verses its
 * family has. The response lists alternates beside the characters they branch
 * from, so the count is one pass over data already here.
 */
const withVerseCounts = (muses: Muse[]): ListedMuse[] => {
  const alternates = new Map<string, number>();
  for (const muse of muses) {
    if (muse.originalVerseId) {
      alternates.set(
        muse.originalVerseId,
        (alternates.get(muse.originalVerseId) ?? 0) + 1,
      );
    }
  }
  return mainVerseMuses(muses)
    .map((muse) => ({
      ...muse,
      verseCount: 1 + (muse.id ? (alternates.get(muse.id) ?? 0) : 0),
    }))
    .sort((a, b) => (a.firstName ?? "").localeCompare(b.firstName ?? ""));
};

const FandomChip = ({
  active,
  color,
  count,
  label,
  onPress,
}: {
  active: boolean;
  color: string;
  count: number;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${label}, ${count} ${count === 1 ? "character" : "characters"}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active
          ? { backgroundColor: color, borderColor: color }
          : {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
      ]}
    >
      {active ? null : (
        <View style={[styles.chipDot, { backgroundColor: color }]} />
      )}
      <Text
        numberOfLines={1}
        style={[styles.chipLabel, { color: active ? "#ffffff" : theme.text }]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.chipCount,
          {
            backgroundColor: active
              ? "rgba(255,255,255,0.25)"
              : theme.material.fillPressed,
          },
        ]}
      >
        <Text
          style={[
            styles.chipCountLabel,
            { color: active ? "#ffffff" : theme.textGray },
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
};

const FandomBar = memo(function FandomBar({
  filtering,
  grouped,
  grouping,
  onClear,
  onToggle,
  onToggleGroup,
  options,
  own,
  selected,
  total,
}: {
  /** The list has not caught up with the chips yet. */
  filtering: boolean;
  grouped: boolean;
  /** The list has not caught up with the checkbox yet. */
  grouping: boolean;
  onClear: () => void;
  onToggle: (id: string) => void;
  onToggleGroup: () => void;
  options: FandomOption[];
  own: boolean;
  selected: string[];
  total: number;
}) {
  const theme = useAppTheme();
  const shown = selected.length
    ? options
        .filter((option) => selected.includes(option.id))
        .reduce((sum, option) => sum + option.count, 0)
    : total;
  const canFilter = options.length > 1;

  return (
    <View style={styles.bar}>
      <View style={styles.barTop}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summary, { color: theme.textGray }]}>
            {selected.length
              ? `${shown} of ${total} characters`
              : `${total} ${total === 1 ? "character" : "characters"}`}
            {canFilter ? ` · ${options.length} fandoms` : ""}
          </Text>
          {filtering && !grouping ? (
            <ActivityIndicator color={theme.accent.solid} size="small" />
          ) : null}
        </View>
        {selected.length ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={onClear}
          >
            <Text style={[styles.clear, { color: theme.textLink }]}>
              Clear filter
            </Text>
          </Pressable>
        ) : null}
      </View>

      {canFilter ? (
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroller}
        >
          <FandomChip
            active={selected.length === 0}
            color={theme.accent.solid}
            count={total}
            label="All"
            onPress={onClear}
          />
          {options.map((option) => (
            <FandomChip
              active={selected.includes(option.id)}
              color={option.color ?? theme.accent.solid}
              count={option.count}
              key={option.id}
              label={option.name}
              onPress={() => onToggle(option.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.barBottom}>
        {canFilter ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ busy: grouping, checked: grouped }}
            hitSlop={space.xs}
            onPress={onToggleGroup}
            style={styles.groupToggle}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: grouped ? theme.accent.solid : "transparent",
                  borderColor: grouped ? theme.accent.solid : theme.textGray,
                },
              ]}
            >
              {grouped ? (
                <Ionicons color="#ffffff" name="checkmark" size={14} />
              ) : null}
            </View>
            <Text style={[styles.groupLabel, { color: theme.text }]}>
              Group by fandom
            </Text>
            {grouping ? (
              <ActivityIndicator color={theme.accent.solid} size="small" />
            ) : null}
          </Pressable>
        ) : (
          <View />
        )}
        {own ? (
          <View style={styles.swipeTip}>
            <Ionicons
              color={theme.textGray}
              name="hand-left-outline"
              size={12}
            />
            <Text style={[styles.swipeTipLabel, { color: theme.textGray }]}>
              Swipe a character to edit
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
});

/**
 * Web's "Characters (3 / 50)" heading and its add button, on your own list
 * only: how much of the plan is used, and the way to a new character.
 */
const CreateBar = ({
  count,
  limit,
  onCreate,
}: {
  count: number;
  limit: number;
  onCreate: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.createBar}>
      <Text style={[styles.createCount, { color: theme.textGray }]}>
        {count} / {limit} characters
      </Text>
      <PillButton
        icon="add"
        label="New character"
        onPress={onCreate}
        tone="accent"
      />
    </View>
  );
};

/**
 * A cell's frame. Inside a fandom group it paints the cell's share of the
 * group container — its sides of the tinted border (the top on the header, the
 * bottom on the last character) and its band of the wash. Outside one it is a
 * plain spaced `View`. Either way the element tree is the same, so a row inside
 * it survives a toggle.
 */
const SliceFrame = ({
  children,
  slice,
}: {
  children: ReactNode;
  slice: Slice | null;
}) => {
  const theme = useAppTheme();
  if (!slice) {
    return (
      <View style={styles.cell}>
        {null}
        {children}
      </View>
    );
  }
  const color = asHex(slice.color) ?? theme.accent.solid;
  return (
    <View
      style={[
        styles.slice,
        slice.first && styles.sliceFirst,
        slice.last && styles.sliceLast,
        { borderColor: withAlpha(color, 0.3) },
      ]}
    >
      <LinearGradient
        colors={[
          withAlpha(color, washAlpha(slice.from)),
          withAlpha(color, washAlpha(slice.to)),
        ]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const GroupHeaderCell = memo(function GroupHeaderCell({
  count,
  name,
  slice,
}: {
  count: number;
  name: string;
  slice: Slice;
}) {
  const theme = useAppTheme();
  return (
    <SliceFrame slice={slice}>
      <View style={styles.groupHeader}>
        <View
          style={[
            styles.groupMark,
            { backgroundColor: asHex(slice.color) ?? theme.accent.solid },
          ]}
        />
        <Text
          numberOfLines={1}
          style={[styles.groupTitle, { color: theme.text }]}
        >
          {name}
        </Text>
        <Text style={[styles.groupCount, { color: theme.textGray }]}>
          {count}
        </Text>
      </View>
    </SliceFrame>
  );
});

const MuseCell = memo(function MuseCell({
  deleting,
  muse,
  onDelete,
  onEdit,
  onOpen,
  slice,
}: {
  deleting: boolean;
  muse: ListedMuse;
  onDelete?: (muse: Muse) => void;
  onEdit?: (muse: Muse) => void;
  onOpen: (museId: string) => void;
  slice: Slice | null;
}) {
  return (
    <SliceFrame slice={slice}>
      <MuseListRow
        deleting={deleting}
        muse={muse}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpen={onOpen}
        // A list cached before counts existed reads as a single verse.
        verseCount={muse.verseCount ?? 1}
      />
    </SliceFrame>
  );
});

export const MuseList = ({ username }: { username: string }) => {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const [selected, setSelected] = useState<string[]>(NO_SELECTION);
  const [grouped, setGrouped] = useState(groupPreference);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // The controls read these straight away; the list reads the trailing copies,
  // so a tap paints its checkbox or chip, and the spinner, before the list is
  // rebuilt.
  const listGrouped = useTrailing(grouped);
  const listSelected = useTrailing(selected);

  const own = Boolean(username) && session.novelist?.username === username;

  const query = useQuery({
    enabled: Boolean(username),
    queryFn: async (): Promise<ListedMuse[]> => {
      const result = await getAllMusesByUsername(api, username ?? "");
      // `null` is a 404 — this novelist has no characters, which is an empty
      // list rather than a failure. A `message` is a real error worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return withVerseCounts(result);
    },
    queryKey: queryKeys.novelistMuses(username ?? ""),
  });

  const muses = query.data ?? NO_MUSES;

  // Chips from the whole roster, fandomless last, the rest alphabetical.
  const options = useMemo<FandomOption[]>(() => {
    const byId = new Map<string, FandomOption>();
    for (const muse of muses) {
      const id = fandomIdOf(muse);
      const existing = byId.get(id);
      if (existing) {
        existing.count += 1;
        continue;
      }
      byId.set(id, {
        color: asColor(muse.fandom?.color),
        count: 1,
        id,
        name: fandomNameOf(muse),
      });
    }
    return Array.from(byId.values()).sort((a, b) => {
      if (a.id === FANDOMLESS_ID) return 1;
      if (b.id === FANDOMLESS_ID) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [muses]);

  const canGroup = options.length > 1;

  // A selection whose fandom is no longer on the roster is simply not applied.
  const activeSelection = useMemo(
    () => selected.filter((id) => options.some((option) => option.id === id)),
    [options, selected],
  );
  const listSelection = useMemo(
    () =>
      listSelected.filter((id) => options.some((option) => option.id === id)),
    [listSelected, options],
  );

  const isGrouped = listGrouped && canGroup;

  const items = useMemo<ListItem[]>(() => {
    const visible = listSelection.length
      ? muses.filter((muse) => listSelection.includes(fandomIdOf(muse)))
      : muses;
    if (!isGrouped) {
      return visible.map((muse) => ({ kind: "muse", muse, slice: null }));
    }

    const buckets = new Map<string, ListedMuse[]>();
    for (const muse of visible) {
      const id = fandomIdOf(muse);
      const bucket = buckets.get(id);
      if (bucket) bucket.push(muse);
      else buckets.set(id, [muse]);
    }
    const list: ListItem[] = [];
    for (const option of options) {
      const bucket = buckets.get(option.id);
      if (!bucket) continue;
      // The header is one share of the group's height, each character one.
      const shares = bucket.length + 1;
      list.push({
        count: bucket.length,
        id: option.id,
        kind: "header",
        name: option.name,
        slice: {
          color: option.color,
          first: true,
          from: 0,
          last: false,
          to: 1 / shares,
        },
      });
      bucket.forEach((muse, index) => {
        list.push({
          kind: "muse",
          muse,
          slice: {
            color: option.color,
            first: false,
            from: (index + 1) / shares,
            last: index === bucket.length - 1,
            to: (index + 2) / shares,
          },
        });
      });
    }
    return list;
  }, [isGrouped, listSelection, muses, options]);

  const toggleFandom = useCallback(
    (id: string) =>
      setSelected((current) =>
        current.includes(id)
          ? current.filter((each) => each !== id)
          : [...current, id],
      ),
    [],
  );
  const clearFandoms = useCallback(() => setSelected(NO_SELECTION), []);
  const toggleGroup = useCallback(() => {
    closeOpenRevealRow();
    setGrouped((current) => {
      groupPreference = !current;
      return !current;
    });
  }, []);

  // `/muse/:id` is registered in both the Home and the Profile stacks, so the
  // relative path lands in whichever tab this list is mounted in.
  const openMuse = useCallback(
    (museId: string) =>
      router.push({ params: { museId }, pathname: "/muse/[museId]" }),
    [router],
  );

  /** The character's settings — the same place MORE → Edit opens. */
  const editMuse = useCallback(
    (muse: Muse) => {
      if (muse.id) {
        router.push({
          params: { museId: muse.id },
          pathname: "/edit-muse/[museId]",
        });
      }
    },
    [router],
  );

  // Web's gate on "Add a new character": verses count toward the plan limit.
  const museLimit = session.novelist?.tier?.museLimit ?? 0;
  const museCount = session.novelist?.museCount ?? muses.length;
  const createMuse = useCallback(() => {
    if (museCount >= museLimit) {
      Alert.alert(
        "Character limit reached",
        `You've reached your plan's limit of ${museLimit} characters (alternate verses count toward this too). Upgrade your tier or remove a character to add a new one.`,
      );
      return;
    }
    router.push("/edit-muse/new");
  }, [museCount, museLimit, router]);

  const confirmDelete = useCallback(
    (muse: Muse) => {
      const id = muse.id;
      if (!id) return;
      Alert.alert(
        `Delete ${muse.firstName}?`,
        "This action is permanent and cannot be undone. The character and all associated data will be removed.",
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: async () => {
              setDeletingId(id);
              const response = await deleteMuse(api, id).catch(() => null);
              setDeletingId(null);
              if (
                !response ||
                ("message" in response &&
                  response.message !== API_MESSAGE.Success)
              ) {
                Alert.alert(
                  "Not deleted",
                  "The character could not be deleted. Try again.",
                );
                return;
              }
              // Out of this list at once; then everything that counted it.
              queryClient.setQueryData<ListedMuse[]>(
                queryKeys.novelistMuses(username),
                (current) => current?.filter((each) => each.id !== id),
              );
              void queryClient.invalidateQueries({
                queryKey: queryKeys.novelistMuses(username),
              });
              void queryClient.invalidateQueries({
                queryKey: queryKeys.profile(username),
              });
              void queryClient.invalidateQueries({
                queryKey: queryKeys.session(),
              });
              queryClient.removeQueries({ queryKey: queryKeys.muse(id) });
            },
            style: "destructive",
            text: "Delete",
          },
        ],
      );
    },
    [api, queryClient, username],
  );

  const onEdit = own ? editMuse : undefined;
  const onDelete = own ? confirmDelete : undefined;

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) =>
      item.kind === "header" ? (
        <GroupHeaderCell
          count={item.count}
          name={item.name}
          slice={item.slice}
        />
      ) : (
        <MuseCell
          deleting={deletingId === item.muse.id}
          muse={item.muse}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpen={openMuse}
          slice={item.slice}
        />
      ),
    [deletingId, onDelete, onEdit, openMuse],
  );

  return (
    <InFandomGroup.Provider value={isGrouped}>
      <FlatList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={items}
        initialNumToRender={10}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              // The drawn blank card, breathing while the screen is still
              // (`EmptyScene` rests it under a scroll or another screen). On
              // your own page it comes with the way to fill it: the bar's
              // "New character" is above, but an empty page is asking the
              // question right here.
              <View style={styles.emptyState}>
                <EmptyScene
                  scene="blank-card"
                  subtitle={
                    own
                      ? "Characters are who you write as. Give one a name and a face, and the stories can begin."
                      : `@${username} hasn't created any characters yet.`
                  }
                  title="No characters yet"
                />
                {own ? (
                  <PillButton
                    icon="sparkles"
                    label="Create my first character"
                    onPress={createMuse}
                    tone="accent"
                  />
                ) : null}
              </View>
            }
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
            skeleton={
              <SkeletonRows count={6} render={() => <MuseListRowSkeleton />} />
            }
          />
        }
        ListHeaderComponent={
          own || muses.length > 0 ? (
            <View>
              {own ? (
                <CreateBar
                  count={museCount}
                  limit={museLimit}
                  onCreate={createMuse}
                />
              ) : null}
              {muses.length > 0 ? (
                <FandomBar
                  filtering={selected !== listSelected}
                  grouped={grouped && canGroup}
                  grouping={grouped !== listGrouped}
                  onClear={clearFandoms}
                  onToggle={toggleFandom}
                  onToggleGroup={toggleGroup}
                  options={options}
                  own={own}
                  selected={activeSelection}
                  total={muses.length}
                />
              ) : null}
            </View>
          ) : null
        }
        maxToRenderPerBatch={10}
        onScrollBeginDrag={closeOpenRevealRow}
        renderItem={renderItem}
        windowSize={5}
      />
    </InFandomGroup.Provider>
  );
};

const GROUP_PADDING = space.sm + 2;
const GROUP_GAP = space.sm + 4;

const styles = StyleSheet.create({
  bar: {
    gap: space.ms,
    marginBottom: GROUP_GAP,
    paddingBottom: space.xs,
  },
  barBottom: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  /** An ungrouped character. */
  cell: { marginBottom: GROUP_GAP },
  checkbox: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1.5,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    maxWidth: 220,
    paddingLeft: space.ms,
    paddingRight: 5,
    paddingVertical: 5,
  },
  chipCount: {
    alignItems: "center",
    borderRadius: radius.full,
    minWidth: 20,
    paddingHorizontal: space.s,
    paddingVertical: 1,
  },
  chipCountLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  chipDot: { borderRadius: radius.xs, height: 8, width: 8 },
  chipLabel: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  chipScroller: { marginHorizontal: -space.md },
  chips: { gap: space.sm, paddingHorizontal: space.md },
  clear: { fontSize: fontSize.label, fontWeight: "600" },
  content: { padding: space.md },
  createBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  createCount: { fontSize: fontSize.caption, fontWeight: "600" },
  emptyState: { alignItems: "center", gap: space.md, paddingBottom: space.xl },
  groupCount: { fontSize: fontSize.caption, fontWeight: "700" },
  groupHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
  groupLabel: { fontSize: fontSize.label, fontWeight: "600" },
  groupMark: { borderRadius: 2, height: 16, width: 4 },
  groupTitle: {
    ...type.eyebrow,
    flexShrink: 1,
  },
  groupToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
  },
  /** One band of a fandom group: its side borders and inner padding. */
  slice: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: "hidden",
    paddingBottom: space.sm,
    paddingHorizontal: GROUP_PADDING,
  },
  sliceFirst: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    paddingTop: GROUP_PADDING,
  },
  sliceLast: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomWidth: 1,
    marginBottom: GROUP_GAP,
    paddingBottom: GROUP_PADDING,
  },
  summary: { fontSize: fontSize.caption, fontWeight: "600" },
  summaryRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  swipeTip: { alignItems: "center", flexDirection: "row", gap: space.xs },
  swipeTipLabel: { fontSize: fontSize.caption },
});
