import { Ionicons } from "@expo/vector-icons";
import type {
  CharacterRefType,
  Codex,
  NWImage,
  StoryCastMember,
  StoryCharacter,
} from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { Chip, PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import { StoryProse } from "@/components/story/story-prose";
import { asColor } from "@/lib/color";
import {
  characterName,
  RELATIONSHIP_TONES,
  speakerAvatarUrl,
} from "@/lib/story";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * One face in a story, whichever pool it came from — web's `StoryFace`.
 * Muses first (they are the ones speaking in the prose), then the story's own.
 */
export interface StoryFace {
  accent: string | null;
  avatar: NWImage | null;
  id: string;
  image: string | null;
  name: string;
  refType: CharacterRefType;
}

export const useStoryFaces = (
  cast: StoryCastMember[] | undefined,
  characters: StoryCharacter[] | undefined,
) =>
  useMemo<StoryFace[]>(
    () => [
      ...(cast ?? []).map((member) => ({
        accent: member.accent,
        avatar: member.avatar,
        id: member.id,
        image: member.image,
        name: member.name,
        refType: "MUSE" as const,
      })),
      ...(characters ?? [])
        .filter((character) => character.id)
        .map((character) => ({
          accent: character.useAccent ? (character.accent ?? null) : null,
          avatar: character.avatar ?? null,
          id: character.id as string,
          image: character.image ?? null,
          name: characterName(character),
          refType: "CHARACTER" as const,
        })),
    ],
    [cast, characters],
  );

/** A face as a round avatar, from whichever source it has. */
export const FaceAvatar = ({
  face,
  size,
}: {
  face: StoryFace;
  size: number;
}) => (
  <Avatar
    image={face.avatar}
    name={face.name}
    size={size}
    uri={
      face.avatar?.src ?? face.image ?? speakerAvatarUrl(face.id, face.refType)
    }
  />
);

/**
 * A character at a glance — web's `CharacterMiniProfile`, plus what the codex
 * mesh says about them.
 *
 * A muse reaches a story only as a name and a face, so its sheet is that and a
 * way through to its own page. A story character belongs to the storyboard, so
 * everything its authors wrote is here: facts, about, the groups it is in, and
 * how it stands toward the rest of the cast.
 */
export const CharacterSheet = ({
  codex,
  face,
  faces,
  onClose,
  onOpenMuse,
}: {
  codex: Codex | null | undefined;
  face: StoryFace | null;
  /** Every face in the story, to name the other end of a relationship. */
  faces: StoryFace[];
  onClose: () => void;
  onOpenMuse: (museId: string) => void;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState(face);
  useEffect(() => {
    if (face) setShown(face);
  }, [face]);

  const character =
    shown?.refType === "CHARACTER"
      ? (codex?.characters.find((candidate) => candidate.id === shown.id) ??
        null)
      : null;

  const isMe = (id: string, type: CharacterRefType) =>
    Boolean(shown) && id === shown?.id && type === shown?.refType;

  const relationships = (codex?.relationships ?? []).filter(
    (relationship) =>
      isMe(relationship.fromId, relationship.fromType) ||
      isMe(relationship.toId, relationship.toType),
  );
  const groups = (codex?.groups ?? []).filter((group) =>
    group.members.some((member) => isMe(member.id, member.refType)),
  );

  const nicknames = character?.nicknames?.filter(Boolean) ?? [];
  const attributes = Object.entries(character?.extraAttributes ?? {}).filter(
    ([key, value]) => key.trim() && value.trim(),
  );
  const light = theme.name === "light";

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      title="Character"
      visible={Boolean(face)}
    >
      {shown ? (
        <ScrollView
          contentContainerStyle={[
            styles.body,
            { paddingBottom: insets.bottom + space.lg },
          ]}
        >
          <View style={styles.head}>
            <View
              style={[
                styles.ring,
                {
                  borderColor: asColor(shown.accent) ?? theme.accent.solid,
                },
              ]}
            >
              <FaceAvatar face={shown} size={72} />
            </View>
            <View style={styles.headText}>
              <Text style={[styles.name, { color: theme.text }]}>
                {shown.name}
              </Text>
              <View style={styles.chips}>
                <Chip
                  label={shown.refType === "MUSE" ? "Character" : "Story character"}
                  tone={shown.refType === "MUSE" ? "accent" : "neutral"}
                />
                {character?.gender ? (
                  <Chip label={character.gender} tone="neutral" />
                ) : null}
              </View>
            </View>
          </View>

          {groups.length > 0 ? (
            <View style={styles.chips}>
              {groups.map((group) => (
                <View
                  key={group.id}
                  style={[
                    styles.group,
                    {
                      borderColor:
                        asColor(group.color) ?? theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: asColor(group.color) ?? theme.textGray,
                      },
                    ]}
                  />
                  <Text style={[styles.groupLabel, { color: theme.text }]}>
                    {group.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {nicknames.length > 0 || attributes.length > 0 ? (
            <View
              style={[
                styles.facts,
                {
                  backgroundColor: theme.material.fillTranslucent,
                  borderColor: theme.material.edgeTranslucent,
                },
              ]}
            >
              {nicknames.length > 0 ? (
                <Fact label="Known as" value={nicknames.join(", ")} />
              ) : null}
              {attributes.map(([key, value]) => (
                <Fact key={key} label={key} value={value} />
              ))}
            </View>
          ) : null}

          {character?.about ? <StoryProse html={character.about} /> : null}

          {relationships.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textGray }]}>
                Relationships
              </Text>
              {relationships.map((relationship) => {
                const outgoing = isMe(
                  relationship.fromId,
                  relationship.fromType,
                );
                const otherId = outgoing
                  ? relationship.toId
                  : relationship.fromId;
                const otherType = outgoing
                  ? relationship.toType
                  : relationship.fromType;
                const other = faces.find(
                  (candidate) =>
                    candidate.id === otherId && candidate.refType === otherType,
                );
                const custom = codex?.tones.find(
                  (tone) => tone.id === relationship.toneId,
                );
                const builtIn =
                  RELATIONSHIP_TONES[relationship.tone] ??
                  RELATIONSHIP_TONES.NEUTRAL;
                const color =
                  asColor(custom?.color) ??
                  (light ? builtIn.light : builtIn.dark);
                return (
                  <View
                    key={relationship.id}
                    style={[
                      styles.relationship,
                      {
                        backgroundColor: theme.material.fillTranslucent,
                        borderLeftColor: color,
                      },
                    ]}
                  >
                    {other ? <FaceAvatar face={other} size={32} /> : null}
                    <View style={styles.relationshipText}>
                      <Text
                        numberOfLines={1}
                        style={[styles.relationshipName, { color: theme.text }]}
                      >
                        <Ionicons
                          color={theme.textGray}
                          name={
                            !relationship.isDirected
                              ? "swap-horizontal"
                              : outgoing
                                ? "arrow-forward"
                                : "arrow-back"
                          }
                          size={13}
                        />{" "}
                        {other?.name ?? "Someone"}
                      </Text>
                      <Text
                        style={[
                          styles.relationshipLabel,
                          { color: theme.textGray },
                        ]}
                      >
                        {relationship.label}
                      </Text>
                    </View>
                    <View style={styles.toneColumn}>
                      <Text style={[styles.toneLabel, { color }]}>
                        {custom?.label ?? builtIn.label}
                      </Text>
                      <View style={styles.strength}>
                        {[1, 2, 3].map((step) => (
                          <View
                            key={step}
                            style={[
                              styles.strengthDot,
                              {
                                backgroundColor:
                                  step <= relationship.strength
                                    ? color
                                    : theme.material.edgeTranslucent,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {shown.refType === "MUSE" ? (
            <PillButton
              icon="open-outline"
              label="View full profile"
              onPress={() => onOpenMuse(shown.id)}
              tone="accent"
            />
          ) : !character?.about &&
            nicknames.length === 0 &&
            attributes.length === 0 &&
            relationships.length === 0 ? (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              Nothing written about this character yet.
            </Text>
          ) : null}
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.fact}>
      <Text style={[styles.factLabel, { color: theme.textGray }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, paddingHorizontal: space.md, paddingTop: space.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  dot: { borderRadius: radius.xs, height: 8, width: 8 },
  fact: { gap: space.xxs },
  factLabel: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  facts: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.md,
  },
  factValue: { fontSize: fontSize.body },
  group: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.ms,
    paddingVertical: space.xs,
  },
  groupLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  head: { alignItems: "center", flexDirection: "row", gap: space.md },
  headText: { flex: 1, gap: space.s },
  hint: { fontSize: fontSize.body },
  name: { fontSize: fontSize.title, fontWeight: "700" },
  relationship: {
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.ms,
    padding: space.ms,
  },
  relationshipLabel: { fontSize: fontSize.caption },
  relationshipName: { fontSize: fontSize.label + 1, fontWeight: "600" },
  relationshipText: { flex: 1, gap: space.xxs, minWidth: 0 },
  ring: { borderRadius: radius.full, borderWidth: 2, padding: space.xxs },
  section: { gap: space.sm },
  sectionTitle: type.eyebrow,
  strength: { flexDirection: "row", gap: 3 },
  strengthDot: { borderRadius: 3, height: 6, width: 6 },
  toneColumn: { alignItems: "flex-end", gap: space.xs },
  toneLabel: { fontSize: fontSize.caption, fontWeight: "700" },
});
