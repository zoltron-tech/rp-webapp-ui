import {
  getProfilePrivacy,
  setProfilePrivacy,
} from "@nw/api/endpoints/books";
import { useApi } from "@nw/features";
import type { ProfilePrivacy, ProfilePrivacyLevel } from "@nw/types/books";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { type SegmentedTab, SegmentedTabs } from "@/components/segmented-tabs";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { Text } from "@/components/text";
import { SHELF_ROOT } from "@/hooks/use-shelf";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Web's `PrivacySection` (BOOKSHELF_PLAN.md §1.4, §4.4), in the same three
 * groups: who can see each part of the profile, whether what you do is
 * recorded as activity at all, and what the profile page itself shows. Saved
 * on change.
 *
 * The activity switch sits here, not under Account, because it is about what
 * other people see of you — the same question as the rows above it.
 *
 * The endpoint takes the whole object, so every change sends every field;
 * it is drawn at once and put back if the save fails.
 */

const PRIVACY_KEY = ["profile-privacy"] as const;

const LEVELS: readonly SegmentedTab<ProfilePrivacyLevel>[] = [
  { label: "Everyone", value: "PUBLIC" },
  { label: "Friends", value: "FRIENDS" },
  { label: "Only me", value: "ONLY_ME" },
];

/** The three "who can see" knobs, each a level. */
type LevelKey = Exclude<keyof ProfilePrivacy, SwitchKey>;
/** The two on/off knobs. */
type SwitchKey = Extract<keyof ProfilePrivacy, "shelfOnProfile" | "recordActivity">;

const ROWS: { hint: string; key: LevelKey; label: string }[] = [
  {
    hint: "The books you've read, are reading and want to read, and your favorites.",
    key: "shelf",
    label: "Bookshelf",
  },
  {
    hint: "Your character roster. Also hides characters that are individually public; characters you've set to Only me stay hidden either way.",
    key: "muses",
    label: "Characters",
  },
  {
    hint: "The About block on your profile. Your featured song stays visible.",
    key: "about",
    label: "About me",
  },
];

/** The platform switch in the app's colours, as every settings row draws it. */
const PrivacySwitch = ({
  disabled,
  label,
  onValueChange,
  value,
}: {
  disabled: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) => {
  const theme = useAppTheme();
  return (
    <Switch
      accessibilityLabel={label}
      disabled={disabled}
      onValueChange={onValueChange}
      thumbColor={theme.accent.fill}
      trackColor={{
        false: theme.material.fillPressed,
        true: theme.accent.surfaceHover,
      }}
      value={value}
    />
  );
};

export default function PrivacyScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryFn: async (): Promise<ProfilePrivacy> => {
      const result = await getProfilePrivacy(api);
      if (!result || "message" in result) {
        throw new Error("Couldn't load your privacy settings.");
      }
      return result;
    },
    queryKey: PRIVACY_KEY,
  });

  const privacy = query.data;

  const save = async (next: ProfilePrivacy) => {
    if (!privacy || saving) return;
    queryClient.setQueryData(PRIVACY_KEY, next);
    setSaving(true);
    const result = await setProfilePrivacy(api, next).catch(() => null);
    setSaving(false);
    if (!result || "message" in result) {
      queryClient.setQueryData(PRIVACY_KEY, privacy);
      Alert.alert("Not saved", "Couldn't save that. Try again.");
      return;
    }
    queryClient.setQueryData(PRIVACY_KEY, result);
    // The teaser and the owner's note both read it from the summary.
    void queryClient.invalidateQueries({ queryKey: SHELF_ROOT });
  };

  const change = (key: LevelKey, value: ProfilePrivacyLevel) => {
    if (privacy && privacy[key] !== value) {
      void save({ ...privacy, [key]: value });
    }
  };

  const toggle = (key: SwitchKey, value: boolean) => {
    if (privacy) void save({ ...privacy, [key]: value });
  };

  if (!privacy) {
    return (
      <ListStatus
        error={query.error}
        loading={query.isPending}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.body,
        { paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={[styles.title, { color: theme.textGray }]}>
        Who can see your profile
      </Text>

      {ROWS.map((row) => (
        <View key={row.key} style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>{row.label}</Text>
          <SegmentedTabs
            onChange={(value) => change(row.key, value)}
            options={LEVELS}
            value={privacy[row.key]}
          />
          <Text style={[styles.hint, { color: theme.textGray }]}>
            {row.hint}
          </Text>
        </View>
      ))}

      <SettingsGroup
        footer="On, what you do shows on your profile's Activity tab and in your friends' feeds. Off stops new entries; what is already there stays until you delete it from your Activity tab."
        title="Your activity"
      >
        <SettingsRow
          accessory={
            <PrivacySwitch
              disabled={saving}
              label="Record my activity"
              onValueChange={(value) => toggle("recordActivity", value)}
              value={privacy.recordActivity}
            />
          }
          chevron={false}
          icon="time-outline"
          label="Record my activity"
          subtitle="Posts, characters, stories, uploads, profile edits"
        />
      </SettingsGroup>

      <SettingsGroup
        footer="Off keeps the bookshelf out of your profile page. Who can open your Books tab stays as set above."
        title="Profile page"
      >
        <SettingsRow
          accessory={
            <PrivacySwitch
              disabled={saving}
              label="Show bookshelf on my profile"
              onValueChange={(value) => toggle("shelfOnProfile", value)}
              value={privacy.shelfOnProfile}
            />
          }
          chevron={false}
          icon="book-outline"
          label="Show bookshelf on my profile"
        />
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, padding: space.md },
  hint: { fontSize: fontSize.caption, lineHeight: 17 },
  label: { fontSize: fontSize.body, fontWeight: "600" },
  row: { gap: space.sm },
  title: { fontSize: fontSize.label, fontWeight: "600" },
});
