import {
  CHAT_MUTE_KEY,
  MUTE_KINDS,
  useMuteActions,
  useNotificationMutes,
} from "@nw/features";
import { Alert, ScrollView, StyleSheet, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { space, useAppTheme } from "@/theme";

/**
 * Web's `NotificationsSection`: which notifications may interrupt.
 *
 * Each switch is a kind of notification; "Messages" is every conversation at
 * once (one conversation is muted from its own details screen). Off means the
 * push and the sound stop — what happened is still written, listed and
 * counted, so turning something off hides nothing.
 *
 * The phone's own notification settings can also silence each channel; these
 * switches are the ones that work on every device at once.
 */
export default function NotificationsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { has, isPending } = useNotificationMutes();
  const { mute, unmute, pending } = useMuteActions();

  const switchColors = {
    thumbColor: "#ffffff",
    trackColor: { false: theme.material.fillPressed, true: theme.accent.solid },
  };

  const toggle = (key: string, on: boolean) => {
    // On means "notify me": no mute row.
    const change = on ? unmute(key) : mute(key, null);
    change.catch(() =>
      Alert.alert("Not saved", "That setting could not be saved. Try again."),
    );
  };

  const row = (key: string, label: string, description: string) => (
    <SettingsRow
      accessory={
        <Switch
          {...switchColors}
          accessibilityLabel={`${label} notifications`}
          disabled={isPending || pending}
          onValueChange={(on) => toggle(key, on)}
          value={!has(key)}
        />
      }
      chevron={false}
      key={key}
      label={label}
      subtitle={description}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.body,
        { paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <SettingsGroup
        footer="Off stops the push and the sound. What happened still shows in Alerts."
        title="Notify me about"
      >
        {MUTE_KINDS.map((kind) => row(kind.key, kind.label, kind.description))}
      </SettingsGroup>

      <SettingsGroup
        footer="One conversation can be muted from its own details screen."
        title="Messages"
      >
        {row(CHAT_MUTE_KEY, "Messages", "New messages in any conversation.")}
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, paddingHorizontal: space.md, paddingTop: space.md },
});
