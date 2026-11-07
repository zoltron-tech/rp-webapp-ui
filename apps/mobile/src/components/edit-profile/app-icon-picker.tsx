import { Ionicons } from "@expo/vector-icons";
import type { Accent } from "@nw/types/theme";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { Text } from "@/components/text";
import {
  APP_ICONS,
  appIconsSupported,
  setAppIcon,
  setMatchPalette,
  useAppIcon,
} from "@/lib/app-icon";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Appearance's "App icon" group: every palette's icon as a tile, plus "Match
 * theme color", which hands the choice to the theme swatches above it.
 *
 * Each tile is the real icon, small (`assets/app-icons/preview/`, rendered
 * with the icons by `scripts/generate-app-icons.mjs`). Picking one
 * by hand turns matching off — the two would otherwise fight on the next
 * colour change.
 *
 * Absent on a build without the native module (see `lib/app-icon.ts`).
 */

const TILE = 48;
/** An iOS icon's corner, as a share of its side. */
const TILE_RADIUS = Math.round(TILE * 0.225);

const confirmAndroid = (onConfirm: () => void) =>
  Alert.alert(
    "Change app icon?",
    "Your home screen icon updates in a few seconds. Some phones close the app while it switches — just open it again.",
    [
      { style: "cancel", text: "Cancel" },
      { onPress: onConfirm, text: "Change" },
    ],
  );

const IconTile = ({
  label,
  onPress,
  selected,
  preview,
  switching,
}: {
  label: string;
  onPress: () => void;
  preview: number;
  selected: boolean;
  switching: boolean;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${label} app icon`}
      accessibilityRole="radio"
      accessibilityState={{ busy: switching, selected }}
      onPress={onPress}
      style={styles.option}
    >
      <View
        style={[
          styles.ring,
          { borderColor: selected ? theme.accent.solid : "transparent" },
        ]}
      >
        <View style={styles.tile}>
          <Image source={preview} style={styles.art} />
          {switching ? (
            <View style={styles.veil}>
              <ActivityIndicator color="#ffffff" size="small" />
            </View>
          ) : null}
        </View>
        {selected && !switching ? (
          <View
            style={[
              styles.check,
              {
                backgroundColor: theme.accent.solid,
                borderColor: theme.background,
              },
            ]}
          >
            <Ionicons color={theme.accent.onSolid} name="checkmark" size={11} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: selected ? theme.text : theme.textGray,
            fontWeight: selected ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const AppIconPicker = ({ palette }: { palette: Accent }) => {
  const theme = useAppTheme();
  const { icon, match, switching } = useAppIcon();

  if (!appIconsSupported) return null;

  const change = async (next: Accent) => {
    const ok = await setAppIcon(next);
    if (!ok) Alert.alert("Not changed", "The app icon could not be changed.");
  };

  const pick = (next: Accent) => {
    if (switching !== null) return;
    if (next === icon) return;
    const run = () => {
      if (match && next !== palette) setMatchPalette(false);
      void change(next);
    };
    if (Platform.OS === "android") confirmAndroid(run);
    else run();
  };

  const toggleMatch = (on: boolean) => {
    if (!on || palette === icon) {
      setMatchPalette(on);
      return;
    }
    const run = () => {
      setMatchPalette(true);
      void change(palette);
    };
    if (Platform.OS === "android") confirmAndroid(run);
    else run();
  };

  return (
    <SettingsGroup
      footer={
        match
          ? "The icon changes with your theme color when you pick one here. Only on this device."
          : "The icon on your home screen. Only on this device."
      }
      title="App icon"
    >
      <SettingsRow
        accessory={
          <Switch
            accessibilityLabel="Match theme color"
            disabled={switching !== null}
            onValueChange={toggleMatch}
            thumbColor={theme.accent.fill}
            trackColor={{
              false: theme.material.fillPressed,
              true: theme.accent.surfaceHover,
            }}
            value={match}
          />
        }
        chevron={false}
        icon="color-wand-outline"
        label="Match theme color"
      />
      <View accessibilityRole="radiogroup" style={styles.grid}>
        {APP_ICONS.map((option) => (
          <IconTile
            key={option.palette}
            label={option.label}
            onPress={() => pick(option.palette)}
            selected={(switching ?? icon) === option.palette}
            preview={option.preview}
            switching={switching === option.palette}
          />
        ))}
      </View>
    </SettingsGroup>
  );
};

const styles = StyleSheet.create({
  art: { height: TILE, width: TILE },
  check: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    top: -4,
    width: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // The short last row sits in the middle rather than at the left.
    justifyContent: "center",
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    rowGap: space.md,
  },
  label: { fontSize: fontSize.meta, textTransform: "capitalize" },
  option: { alignItems: "center", gap: space.xs, minWidth: 0, width: "20%" },
  ring: {
    borderRadius: TILE_RADIUS + 4,
    borderWidth: 2,
    padding: space.xxs,
  },
  tile: {
    alignItems: "center",
    borderRadius: TILE_RADIUS,
    height: TILE,
    justifyContent: "center",
    overflow: "hidden",
    width: TILE,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
  },
});
