import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { CodexRelationship } from "@nw/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { PillButton } from "@/components/settings";
import { CodexSkeleton } from "@/components/sheet-skeletons";
import {
  FaceAvatar,
  type StoryFace,
  useStoryFaces,
} from "@/components/story/character-sheet";
import { RelationshipRow, ToneLegend } from "@/components/story/relationship-bits";
import { MESH_HINT, RelationshipMesh } from "@/components/story/relationship-mesh";
import { RelationshipSheet } from "@/components/story/relationship-sheet";
import { Text } from "@/components/text";
import { useStory, useStoryCodex } from "@/hooks/use-story";
import { useStoryCodexEdit } from "@/hooks/use-story-codex-edit";
import { asColor, withAlpha } from "@/lib/color";
import { isStoryMember } from "@/lib/story";
import {
  buildTonePalette,
  nodeKey,
  relationshipEnds,
  resolveTone,
} from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The relationship mesh, full screen — web's Relationships tab in mesh mode.
 *
 * Its own screen rather than a tab in the codex, for the reason the map is:
 * it pans and pinches, and that gesture should not share a page with a
 * scroll. The codex keeps the list (web's table mode) and a way here.
 *
 * Top to bottom: the board, the legend (tap a tone to hide its edges), the
 * groups (tap one to hide its field), and, once a character is focused, a
 * panel of their relationships. Co-authors get "New relationship", and a
 * focused character pre-fills the sheet's first end.
 */
export default function RelationshipsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const { novelist, status } = useSession();

  const story = useStory(storyId);
  const codex = useStoryCodex(storyId);
  const edit = useStoryCodexEdit(storyId);
  const light = theme.name === "light";

  const canEdit = status === "signed-in" && isStoryMember(story.data, novelist?.username);
  const faces = useStoryFaces(story.data?.cast, codex.data?.characters);
  const relationships = codex.data?.relationships ?? [];
  const tones = codex.data?.tones ?? [];
  const groups = codex.data?.groups ?? [];
  const palette = useMemo(() => buildTonePalette(tones, light), [tones, light]);

  const [hiddenTones, setHiddenTones] = useState<ReadonlySet<string>>(() => new Set());
  const [hiddenGroups, setHiddenGroups] = useState<ReadonlySet<string>>(() => new Set());
  const [focused, setFocused] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{
    relationship: CodexRelationship | null;
    initial?: { from?: string };
  } | null>(null);

  const toneCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const relationship of relationships) {
      const key = resolveTone(relationship, palette, light).key;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [light, palette, relationships]);

  const toggle = (
    set: (next: ReadonlySet<string>) => void,
    current: ReadonlySet<string>,
    key: string,
  ) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    set(next);
  };

  const focusedFace: StoryFace | null = focused
    ? (faces.find((face) => nodeKey(face.id, face.refType) === focused) ?? null)
    : null;
  const focusedRelationships = focused
    ? relationships.filter((relationship) => {
        const ends = relationshipEnds(relationship);
        return ends.from === focused || ends.to === focused;
      })
    : [];
  const focusedGroups = focused
    ? groups.filter((group) =>
        group.members.some((member) => nodeKey(member.id, member.refType) === focused),
      )
    : [];

  if (!codex.data || !story.data) {
    return (
      <View style={styles.fill}>
        <ListStatus
          error={codex.error ?? story.error}
          loading={codex.isPending || story.isPending}
          onRetry={() => {
            void codex.refetch();
            void story.refetch();
          }}
          skeleton={<CodexSkeleton />}
        />
      </View>
    );
  }

  const tooFew = faces.length < 2;

  return (
    <View style={[styles.fill, { paddingBottom: insets.bottom }]}>
      {tooFew ? (
        <View style={styles.empty}>
          <Ionicons color={theme.textGray} name="people-outline" size={36} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Two characters are needed before they can stand toward each other.
          </Text>
          <Text style={[styles.emptyText, { color: theme.textGray }]}>
            A character joins the cast when its dialog appears in a passage; the
            story's own characters are made in the codex.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.boardWrap}>
            <RelationshipMesh
              faces={faces}
              focused={focused}
              groups={groups}
              hiddenGroups={hiddenGroups}
              hiddenTones={hiddenTones}
              onEdgePress={(relationship) => setSheet({ relationship })}
              onFocus={setFocused}
              relationships={relationships}
              tones={tones}
            />
          </View>

          {relationships.length === 0 ? (
            <Text style={[styles.note, { color: theme.textGray }]}>
              {canEdit
                ? "No relationships yet. Add the first one — who owes whom, who can't stand whom."
                : "This story hasn't mapped its characters' relationships yet."}
            </Text>
          ) : (
            <Text style={[styles.note, { color: theme.textGray }]}>{MESH_HINT}</Text>
          )}

          <ToneLegend
            counts={toneCounts}
            hidden={hiddenTones}
            onToggle={(key) => toggle(setHiddenTones, hiddenTones, key)}
            palette={palette}
          />

          {groups.length > 0 ? (
            <ScrollView
              contentContainerStyle={styles.groupRow}
              style={styles.groupScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {groups.map((group) => {
                if (!group.id) return null;
                const color = asColor(group.color) ?? theme.accent.solid;
                const off = hiddenGroups.has(group.id);
                const onBoard = group.members.filter((member) =>
                  faces.some(
                    (face) => face.id === member.id && face.refType === member.refType,
                  ),
                ).length;
                return (
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: !off }}
                    key={group.id}
                    onPress={() => toggle(setHiddenGroups, hiddenGroups, group.id as string)}
                    style={[
                      styles.groupChip,
                      {
                        backgroundColor: off ? theme.material.fill : withAlpha(color, 0.14),
                        borderColor: off ? theme.material.edge : withAlpha(color, 0.5),
                        opacity: off ? 0.5 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.groupDot, { backgroundColor: color }]} />
                    <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
                    <Text style={[styles.groupCount, { color: theme.textGray }]}>{onBoard}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {focusedFace ? (
            <View
              style={[
                styles.panel,
                { backgroundColor: theme.material.fill, borderColor: theme.material.edge },
              ]}
            >
              <View style={styles.panelHead}>
                <FaceAvatar face={focusedFace} size={34} />
                <View style={styles.panelText}>
                  <Text numberOfLines={1} style={[styles.panelName, { color: theme.text }]}>
                    {focusedFace.name}
                  </Text>
                  {focusedGroups.length > 0 ? (
                    <Text numberOfLines={1} style={[styles.panelIn, { color: theme.textGray }]}>
                      In {focusedGroups.map((group) => group.name).join(", ")}
                    </Text>
                  ) : null}
                </View>
                {focusedFace.refType === "MUSE" ? (
                  <PillButton
                    icon="person-outline"
                    label="Profile"
                    onPress={() =>
                      router.push({
                        params: { museId: focusedFace.id },
                        pathname: "/muse/[museId]",
                      })
                    }
                  />
                ) : null}
                <PillButton label="Clear" onPress={() => setFocused(null)} />
              </View>
              <ScrollView contentContainerStyle={styles.panelList} style={styles.panelScroll}>
                {focusedRelationships.length === 0 ? (
                  <Text style={[styles.note, { color: theme.textGray }]}>
                    Tied to nobody yet.
                  </Text>
                ) : (
                  focusedRelationships.map((relationship) => (
                    <RelationshipRow
                      faces={faces}
                      key={relationship.id}
                      light={light}
                      onPress={() => setSheet({ relationship })}
                      palette={palette}
                      relationship={relationship}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          ) : null}

          {canEdit ? (
            <View style={styles.fab}>
              <PillButton
                icon="add"
                label="New relationship"
                onPress={() =>
                  setSheet({
                    initial: focused ? { from: focused } : undefined,
                    relationship: null,
                  })
                }
                tone="accent"
              />
            </View>
          ) : null}
        </>
      )}

      <RelationshipSheet
        canEdit={canEdit}
        edit={edit}
        faces={faces}
        initial={sheet?.initial ?? null}
        onClose={() => setSheet(null)}
        relationship={sheet?.relationship ?? null}
        tones={tones}
        visible={sheet !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrap: { flex: 1, margin: space.m, marginBottom: 0, minHeight: 240 },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: space.sm,
    justifyContent: "center",
    padding: space.xl,
  },
  emptyText: { fontSize: fontSize.caption, textAlign: "center" },
  emptyTitle: { fontSize: fontSize.body, fontWeight: "600", textAlign: "center" },
  fab: { alignItems: "center", paddingVertical: space.sm },
  fill: { flex: 1 },
  groupChip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.ms,
    paddingVertical: 5,
  },
  groupCount: { fontSize: fontSize.meta, fontWeight: "600" },
  groupDot: { borderRadius: radius.full, height: 8, width: 8 },
  groupName: { fontSize: fontSize.caption, fontWeight: "600" },
  groupRow: {
    alignItems: "center",
    gap: space.s,
    paddingBottom: space.s,
    paddingHorizontal: space.m,
  },
  groupScroll: { flexGrow: 0 },
  note: {
    fontSize: fontSize.caption,
    paddingHorizontal: space.m,
    paddingTop: space.s,
    textAlign: "center",
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: border.edge,
    gap: space.sm,
    marginHorizontal: space.m,
    marginTop: space.xs,
    maxHeight: 260,
    padding: space.sm,
  },
  panelHead: { alignItems: "center", flexDirection: "row", gap: space.sm },
  panelIn: { fontSize: fontSize.caption },
  panelList: { gap: space.s },
  panelName: { fontSize: fontSize.body, fontWeight: "700" },
  panelScroll: { flexGrow: 0 },
  panelText: { flex: 1, minWidth: 0 },
});
