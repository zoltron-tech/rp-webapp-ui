import { Ionicons } from "@expo/vector-icons";
import type { Muse, PromptSource } from "@nw/types";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import {
  QuickAddMuseError,
  QuickAddMuseRow,
} from "@/components/chat/quick-add-muse-row";
import { BottomSheet } from "@/components/sheet";
import { useQuickAddMuse } from "@/hooks/use-quick-add-muse";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "Who's posting?" — web's `NovelistConfirm`, which is already a sheet on a
 * phone.
 *
 * Shown once, at the moment of posting, when the composer offered both kinds
 * of sender and the novelist is about to post as *themselves*. That is the
 * one choice worth interrupting for: an out-of-character post cannot be
 * replied to in character, so a starter posted as yourself by accident is a
 * starter no muse can pick up. Two options, in web's words, and the second
 * one grows a name field when there is no character yet to post as.
 */
export const NovelistConfirmSheet = ({
  hasMuseOptions,
  novelistSource,
  onCharacterCreated,
  onClose,
  onPostAsNovelist,
  onSelectCharacter,
  visible,
}: {
  hasMuseOptions: boolean;
  novelistSource: PromptSource | undefined;
  onCharacterCreated: (muse: Muse) => void;
  onClose: () => void;
  onPostAsNovelist: () => void;
  onSelectCharacter: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const quickAdd = useQuickAddMuse();

  useEffect(() => {
    if (!visible) {
      setAdding(false);
      setName("");
      quickAdd.reset();
    }
    // `reset` is stable; listing the mutation object would re-run this on
    // every state change of the create.
  }, [visible]);

  const create = () => {
    if (!name.trim()) return;
    quickAdd.mutate(name, {
      onSuccess: (muse) => {
        onCharacterCreated(muse);
        onClose();
      },
    });
  };

  return (
    <BottomSheet
      maxHeightRatio={0.6}
      onClose={onClose}
      title={adding ? "Name your character" : "Who's posting?"}
      visible={visible}
    >
      <View style={styles.body}>
        {adding ? (
          <>
            <Text style={[styles.desc, { color: theme.textGray }]}>
              Give your character a name to post as them. You can flesh out the
              rest of their profile later.
            </Text>
            <QuickAddMuseRow
              busy={quickAdd.isPending}
              onCancel={() => setAdding(false)}
              onChange={setName}
              onConfirm={create}
              value={name}
            />
            {quickAdd.error ? (
              <QuickAddMuseError message={quickAdd.error.message} />
            ) : null}
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onClose();
                onPostAsNovelist();
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.material.fillTranslucent,
                  borderColor: theme.material.edgeTranslucent,
                },
              ]}
            >
              <Avatar
                name={novelistSource?.name}
                size={40}
                image={novelistSource?.avatar}
                uri={novelistSource?.avatar?.src ?? novelistSource?.image}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Post as yourself
                </Text>
                <Text style={[styles.desc, { color: theme.textGray }]}>
                  Out of character (OOC) — this post comes from you, not one of
                  your characters. Characters can't reply or comment on it.
                </Text>
              </View>
              <Ionicons
                color={theme.textGray}
                name="chevron-forward"
                size={16}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (hasMuseOptions) {
                  onClose();
                  onSelectCharacter();
                } else {
                  setAdding(true);
                }
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.material.fillTranslucent,
                  borderColor: theme.material.edgeTranslucent,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: theme.accent.tint,
                    borderColor: theme.accent.surfaceHover,
                  },
                ]}
              >
                <Ionicons
                  color={theme.accent.text}
                  name="sparkles-outline"
                  size={20}
                />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Post as a Character
                </Text>
                <Text style={[styles.desc, { color: theme.textGray }]}>
                  {hasMuseOptions
                    ? "Stay in character — other characters can reply and comment on this post."
                    : "You don't have a character yet — create one now to post as them."}
                </Text>
              </View>
              <Ionicons
                color={theme.textGray}
                name={hasMuseOptions ? "chevron-forward" : "add"}
                size={18}
              />
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  desc: { fontSize: fontSize.caption, lineHeight: 17 },
  option: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    padding: space.sm + 4,
  },
  optionIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: fontSize.body, fontWeight: "700" },
});
