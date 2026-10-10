import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { CodexEntry, CodexRelationship, StoryBoardEvent } from "@nw/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { CodexSkeleton } from "@/components/sheet-skeletons";
import { ChapterChips } from "@/components/story/chapter-chips";
import {
  CharacterSheet,
  FaceAvatar,
  type StoryFace,
  useStoryFaces,
} from "@/components/story/character-sheet";
import { EntryGlyph, EntrySheet } from "@/components/story/entry-sheet";
import { RelationshipRow, ToneLegend } from "@/components/story/relationship-bits";
import { RelationshipSheet } from "@/components/story/relationship-sheet";
import { PillButton } from "@/components/settings";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useStory, useStoryCodex } from "@/hooks/use-story";
import { useStoryCodexEdit } from "@/hooks/use-story-codex-edit";
import { asColor, withAlpha } from "@/lib/color";
import { codexIcon, isStoryMember, plainText } from "@/lib/story";
import { buildTonePalette, resolveTone } from "@/lib/story-mesh";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * The codex — web's `StoryCodexView`, read-only.
 *
 * A row of tabs, Characters first and then the story's own categories (Places,
 * Items, Lore and whatever its authors added). Characters shows both pools:
 * the cast, which is muses speaking in the prose, and the characters the story
 * owns. A category shows its entries as cards with a preview and the chapters
 * they are used in; a card opens the entry to be read in full.
 */

const CAST_TAB = "__cast";
/** Web's `MESH_TAB`: the relationships, listed here, drawn on their own screen. */
const MESH_TAB = "__mesh";

export default function CodexScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  const story = useStory(storyId);
  const codex = useStoryCodex(storyId);
  const [tab, setTab] = useState(CAST_TAB);
  const [openEntry, setOpenEntry] = useState<CodexEntry | null>(null);
  const [openFace, setOpenFace] = useState<StoryFace | null>(null);

  // Relationships: listed on their tab, edited in the sheet, drawn full
  // screen on `[storyId]/relationships`. Only a co-author writes.
  const { novelist, status } = useSession();
  const canEdit =
    status === "signed-in" && isStoryMember(story.data, novelist?.username);
  const edit = useStoryCodexEdit(storyId);
  const light = theme.name === "light";
  const tones = codex.data?.tones ?? [];
  const relationships = codex.data?.relationships ?? [];
  const palette = useMemo(() => buildTonePalette(tones, light), [tones, light]);
  const toneCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const relationship of relationships) {
      const key = resolveTone(relationship, palette, light).key;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [light, palette, relationships]);
  const [relationshipSheet, setRelationshipSheet] = useState<{
    relationship: CodexRelationship | null;
  } | null>(null);

  const chapters = useMemo(
    () =>
      [...(story.data?.events ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [story.data?.events],
  );
  const categories = useMemo(
    () =>
      [...(codex.data?.categories ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [codex.data?.categories],
  );
  const faces = useStoryFaces(story.data?.cast, codex.data?.characters);
  const muses = faces.filter((face) => face.refType === "MUSE");
  const ownCharacters = faces.filter((face) => face.refType === "CHARACTER");

  const entries = (codex.data?.entries ?? []).filter(
    (entry) => entry.categoryId === tab,
  );
  const active = categories.find((category) => category.id === tab);

  const openChapter = (eventId: string) => {
    setOpenEntry(null);
    router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" });
  };

  const pull = usePullToRefresh(codex.refetch);

  if (!codex.data) {
    return (
      <View style={styles.fill}>
        <ListStatus
          error={codex.error}
          loading={codex.isPending}
          onRetry={() => void codex.refetch()}
          skeleton={<CodexSkeleton />}
        />
      </View>
    );
  }

  const tabs = [
    { count: faces.length, icon: "account-group-outline", id: CAST_TAB, name: "Characters" },
    { count: relationships.length, icon: "graph-outline", id: MESH_TAB, name: "Relationships" },
    ...categories.map((category) => ({
      count: (codex.data?.entries ?? []).filter(
        (entry) => entry.categoryId === category.id,
      ).length,
      icon: codexIcon(category.icon),
      id: category.id ?? "",
      name: category.name,
    })),
  ];

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
        stickyHeaderIndices={[0]}
      >
        <View style={{ backgroundColor: theme.glass.opaque }}>
          <ScrollView
            contentContainerStyle={styles.tabs}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {tabs.map((candidate) => {
              const selected = candidate.id === tab;
              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  key={candidate.id}
                  onPress={() => setTab(candidate.id)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: selected
                        ? theme.accent.solid
                        : theme.material.fill,
                      borderColor: selected
                        ? theme.accent.solid
                        : theme.material.edge,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    color={selected ? "#fff" : theme.textGray}
                    name={
                      candidate.icon as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={15}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: selected ? "#fff" : theme.text },
                    ]}
                  >
                    {candidate.name}
                  </Text>
                  <Text
                    style={[
                      styles.tabCount,
                      { color: selected ? "#fff" : theme.textGray },
                    ]}
                  >
                    {candidate.count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.body}>
          {tab === CAST_TAB ? (
            <>
              {muses.length > 0 ? (
                <View style={styles.pool}>
                  <Text style={[styles.poolLabel, { color: theme.textGray }]}>
                    The cast
                  </Text>
                  <FaceGrid faces={muses} onOpen={setOpenFace} />
                  <Text style={[styles.note, { color: theme.textGray }]}>
                    These are characters — they join the cast when they speak in a
                    passage, and each is written by the novelist who penned it.
                  </Text>
                </View>
              ) : null}

              <View style={styles.pool}>
                <Text style={[styles.poolLabel, { color: theme.textGray }]}>
                  This story's characters
                </Text>
                {ownCharacters.length === 0 ? (
                  <Text style={[styles.note, { color: theme.textGray }]}>
                    Nobody yet — the story has no characters of its own.
                  </Text>
                ) : (
                  <FaceGrid faces={ownCharacters} onOpen={setOpenFace} />
                )}
              </View>

              {(codex.data.groups ?? []).length > 0 ? (
                <View style={styles.pool}>
                  <Text style={[styles.poolLabel, { color: theme.textGray }]}>
                    Groups
                  </Text>
                  {(codex.data.groups ?? []).map((group) => {
                    const color = asColor(group.color) ?? theme.accent.solid;
                    const members = group.members
                      .map((member) =>
                        faces.find(
                          (face) =>
                            face.id === member.id &&
                            face.refType === member.refType,
                        ),
                      )
                      .filter((face): face is StoryFace => Boolean(face));
                    return (
                      <View
                        key={group.id}
                        style={[
                          styles.groupCard,
                          {
                            backgroundColor: withAlpha(color, 0.1),
                            borderColor: withAlpha(color, 0.45),
                          },
                        ]}
                      >
                        <View style={styles.groupHead}>
                          <View
                            style={[styles.groupDot, { backgroundColor: color }]}
                          />
                          <Text style={[styles.groupName, { color: theme.text }]}>
                            {group.name}
                          </Text>
                          <Text style={[styles.tabCount, { color: theme.textGray }]}>
                            {members.length}
                          </Text>
                        </View>
                        <View style={styles.groupMembers}>
                          {members.map((face) => (
                            <Pressable
                              accessibilityLabel={face.name}
                              key={`${face.refType}-${face.id}`}
                              onPress={() => setOpenFace(face)}
                            >
                              <FaceAvatar face={face} size={30} />
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : tab === MESH_TAB ? (
            <View style={styles.pool}>
              <View style={styles.meshActions}>
                <PillButton
                  icon="git-network-outline"
                  label="Open mesh"
                  onPress={() =>
                    router.push({
                      params: { storyId },
                      pathname: "/story/[storyId]/relationships",
                    })
                  }
                />
                {canEdit && faces.length >= 2 ? (
                  <PillButton
                    icon="add"
                    label="New relationship"
                    onPress={() => setRelationshipSheet({ relationship: null })}
                    tone="accent"
                  />
                ) : null}
              </View>
              {faces.length < 2 ? (
                <Text style={[styles.note, { color: theme.textGray }]}>
                  Two characters are needed before they can stand toward each
                  other. A character joins the cast when its dialog appears in a
                  passage.
                </Text>
              ) : relationships.length === 0 ? (
                <Text style={[styles.note, { color: theme.textGray }]}>
                  {canEdit
                    ? "No relationships yet. Add the first one — who owes whom, who can't stand whom."
                    : "This story hasn't mapped its characters' relationships yet."}
                </Text>
              ) : (
                <>
                  <View style={styles.legendWrap}>
                    <ToneLegend counts={toneCounts} palette={palette} />
                  </View>
                  <View style={styles.relationshipList}>
                    {relationships.map((relationship) => (
                      <RelationshipRow
                        faces={faces}
                        key={relationship.id}
                        light={light}
                        onPress={() => setRelationshipSheet({ relationship })}
                        palette={palette}
                        relationship={relationship}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : entries.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textGray }]}>
              Nothing in {active?.name ?? "this category"} yet.
            </Text>
          ) : (
            entries.map((entry) => (
              <EntryCard
                chapters={chapters.filter(
                  (chapter) => chapter.id && entry.chapterIds.includes(chapter.id),
                )}
                entry={entry}
                key={entry.id}
                onOpen={() => setOpenEntry(entry)}
                onOpenChapter={openChapter}
              />
            ))
          )}
        </View>
      </ScrollView>

      <EntrySheet
        categoryName={
          categories.find((category) => category.id === openEntry?.categoryId)
            ?.name
        }
        chapters={chapters}
        entry={openEntry}
        onClose={() => setOpenEntry(null)}
        onOpenChapter={openChapter}
      />
      <CharacterSheet
        codex={codex.data}
        face={openFace}
        faces={faces}
        onClose={() => setOpenFace(null)}
        onOpenMuse={(museId) => {
          setOpenFace(null);
          router.push({ params: { museId }, pathname: "/muse/[museId]" });
        }}
      />
      <RelationshipSheet
        canEdit={canEdit}
        edit={edit}
        faces={faces}
        onClose={() => setRelationshipSheet(null)}
        relationship={relationshipSheet?.relationship ?? null}
        tones={tones}
        visible={relationshipSheet !== null}
      />
    </View>
  );
}

const FaceGrid = ({
  faces,
  onOpen,
}: {
  faces: StoryFace[];
  onOpen: (face: StoryFace) => void;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.faceGrid}>
      {faces.map((face) => (
        <Pressable
          accessibilityRole="button"
          key={`${face.refType}-${face.id}`}
          onPress={() => onOpen(face)}
          style={({ pressed }) => [
            styles.faceChip,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: asColor(face.accent)
                ? withAlpha(asColor(face.accent) as string, 0.5)
                : theme.material.edge,
            },
          ]}
        >
          <FaceAvatar face={face} size={28} />
          <Text
            numberOfLines={1}
            style={[styles.faceName, { color: theme.text }]}
          >
            {face.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const EntryCard = ({
  chapters,
  entry,
  onOpen,
  onOpenChapter,
}: {
  chapters: StoryBoardEvent[];
  entry: CodexEntry;
  onOpen: () => void;
  onOpenChapter: (eventId: string) => void;
}) => {
  const theme = useAppTheme();
  const preview = useMemo(() => plainText(entry.description), [entry]);
  const color = asColor(entry.color);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          borderTopColor: color ?? theme.material.edge,
          borderTopWidth: color ? 3 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={`Read ${entry.name}`}
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.cardOpen, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.cardHead}>
          <EntryGlyph entry={entry} size={36} />
          <Text
            numberOfLines={2}
            style={[styles.cardName, { color: theme.text }]}
          >
            {entry.name}
          </Text>
          <MaterialCommunityIcons
            color={theme.textGray}
            name="chevron-right"
            size={20}
          />
        </View>
        {preview ? (
          <Text
            numberOfLines={3}
            style={[styles.cardBody, { color: theme.textGray }]}
          >
            {preview}
          </Text>
        ) : null}
      </Pressable>
      <ChapterChips
        chapters={chapters}
        label="Used in"
        onOpen={onOpenChapter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, paddingHorizontal: space.m, paddingTop: space.sm },
  card: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    padding: space.md,
  },
  cardBody: { fontSize: fontSize.label, lineHeight: 19, marginTop: space.sm },
  cardHead: { alignItems: "center", flexDirection: "row", gap: space.m },
  cardName: { flex: 1, fontSize: fontSize.body, fontWeight: "700" },
  cardOpen: {},
  empty: { fontSize: fontSize.body, padding: space.md, textAlign: "center" },
  faceChip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    maxWidth: "100%",
    paddingLeft: 3,
    paddingRight: space.m,
    paddingVertical: 3,
  },
  faceGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  faceName: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  fill: { flex: 1 },
  groupCard: {
    borderRadius: radius.md + 4,
    borderWidth: 1,
    gap: space.sm,
    padding: space.m,
  },
  groupDot: { borderRadius: radius.sm, height: 10, width: 10 },
  groupHead: { alignItems: "center", flexDirection: "row", gap: space.sm },
  groupMembers: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  groupName: { flex: 1, fontSize: fontSize.body, fontWeight: "700" },
  legendWrap: { marginHorizontal: -space.m },
  meshActions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  note: { fontSize: fontSize.caption, lineHeight: 17 },
  pool: { gap: space.sm },
  relationshipList: { gap: space.s },
  poolLabel: type.eyebrow,
  tab: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: 7,
  },
  tabCount: { fontSize: fontSize.caption, fontWeight: "600" },
  tabLabel: { fontSize: fontSize.label, fontWeight: "600" },
  tabs: {
    gap: space.sm,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
});
