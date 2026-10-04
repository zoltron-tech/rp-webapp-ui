import { Ionicons } from "@expo/vector-icons";
import type { GlassVariant } from "@nw/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GlassSurface,
  type GlassTier,
  getGlassTier,
} from "@/components/glass-surface";
import { FallbackArt } from "@/components/fallback-art";
import { GradientSurface } from "@/components/gradient-surface";
import { ScrollEdge } from "@/components/scroll-edge";
import {
  type A11ySettings,
  setA11yOverride,
  useA11ySettings,
} from "@/lib/a11y-settings";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Glass lab. Dev builds only: `novelistworld://glass-lab`.
 *
 * Every glass variant over the backgrounds that break glass — pure white,
 * saturated colour, the accent, a picture, dense text — with the accessibility
 * settings forceable from here, a nested surface to show why nesting is
 * banned, and a sheet in an RN `Modal` to check that its blur samples the
 * screen behind it rather than an empty window.
 */
const VARIANTS: GlassVariant[] = ["bar", "panel", "sheet", "clear"];
const TIERS: (GlassTier | "device")[] = [
  "device",
  "liquid",
  "blur",
  "fill",
  "opaque",
];

const STRIPES = ["#ffffff", "#ffd60a", "#ff375f", "#30d158", "#0a84ff", "#000"];

const PROSE =
  "The lamps along the harbour came on one by one, and the ferry's wake " +
  "caught each of them in turn. She counted the lights the way her father " +
  "had taught her — not the lamps, but the gaps between them — and lost " +
  "count somewhere past the customs house, where the dark was longest.";

const SETTINGS: { key: keyof A11ySettings; label: string }[] = [
  { key: "reduceTransparency", label: "Reduce Transparency" },
  { key: "increaseContrast", label: "Increase Contrast" },
  { key: "reduceMotion", label: "Reduce Motion" },
];

export function GlassLab() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useA11ySettings();
  const [variant, setVariant] = useState<GlassVariant>("bar");
  const [tier, setTier] = useState<GlassTier | "device">("device");
  const [forced, setForced] = useState<Partial<A11ySettings>>({});
  const [nested, setNested] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Hand the settings back to the system on the way out.
  useEffect(() => () => setA11yOverride(null), []);

  const force = (key: keyof A11ySettings, value: boolean) => {
    const next = { ...forced, [key]: value };
    setForced(next);
    setA11yOverride(next);
  };

  const forceTier = tier === "device" ? undefined : tier;
  const ink = { color: theme.text };
  const quiet = { color: theme.textGray };

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 360 + insets.bottom,
          paddingTop: insets.top + 72,
        }}
      >
        <View style={styles.stripes}>
          {STRIPES.map((color) => (
            <View
              key={color}
              style={[styles.stripe, { backgroundColor: color }]}
            />
          ))}
        </View>
        <GradientSurface
          from={theme.accent.solid}
          style={styles.band}
          to={theme.background}
        >
          <Text style={[styles.bandText, ink]}>Accent gradient</Text>
        </GradientSurface>
        <View style={[styles.pictureRow, { backgroundColor: "#f5f5f5" }]}>
          <Image
            resizeMode="contain"
            source={require("../../assets/logo-mark.png")}
            style={styles.picture}
          />
        </View>
        {/* Fallback art for cards with no picture: character, story, chapter. */}
        <View style={styles.artRow}>
          <FallbackArt kind="character" seed="Avery" style={styles.artCharacter} />
          <FallbackArt kind="story" seed="Tides" style={styles.artStory} />
          <FallbackArt kind="chapter" seed="chapter-3" style={styles.artChapter} />
        </View>
        {[0, 1, 2, 3].map((index) => (
          <Text key={index} style={[styles.prose, ink]}>
            {PROSE}
          </Text>
        ))}
        <View style={styles.stripes}>
          {[...STRIPES].reverse().map((color) => (
            <View
              key={color}
              style={[styles.stripe, { backgroundColor: color }]}
            />
          ))}
        </View>
      </ScrollView>

      <ScrollEdge edge="top" height={space.xl} offset={insets.top + 60} />

      {/* Top bar: a glass header with a clear back button over it. */}
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <GlassSurface
          forceTier={forceTier}
          radius={radius.full}
          style={styles.iconButton}
          variant="clear"
        >
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            hitSlop={space.xs}
            onPress={() => router.back()}
            style={styles.iconPress}
          >
            <Ionicons color={theme.text} name="chevron-back" size={22} />
          </Pressable>
        </GlassSurface>
        <GlassSurface
          forceTier={forceTier}
          radius={radius.full}
          style={styles.titleChip}
          variant="bar"
        >
          <Text style={[styles.title, ink]}>Glass lab</Text>
          <Text style={[styles.caption, quiet]}>
            {Platform.OS} {String(Platform.Version)} · device tier{" "}
            {getGlassTier()}
          </Text>
        </GlassSurface>
      </View>

      {/* The surface under test, holding its own controls. */}
      <View
        style={[styles.bottom, { paddingBottom: insets.bottom + space.sm }]}
      >
        <GlassSurface
          forceTier={forceTier}
          radius={22}
          style={styles.panel}
          variant={variant}
        >
          <Segmented
            onChange={setVariant}
            options={VARIANTS}
            value={variant}
          />
          <Segmented onChange={setTier} options={TIERS} value={tier} />
          {SETTINGS.map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <Text style={[styles.label, ink]}>{label}</Text>
              <Switch
                accessibilityLabel={label}
                onValueChange={(value) => force(key, value)}
                value={settings[key]}
              />
            </View>
          ))}
          <View style={styles.row}>
            <Text style={[styles.label, ink]}>Nest a surface</Text>
            <Switch
              accessibilityLabel="Nest a surface"
              onValueChange={setNested}
              value={nested}
            />
          </View>
          {nested ? (
            <GlassSurface radius={radius.lg} style={styles.nested}>
              <Text style={[styles.caption, ink]}>
                Nested: drawn without blur
              </Text>
            </GlassSurface>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: theme.accent.solid, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.primaryLabel}>Open sheet in a Modal</Text>
          </Pressable>
        </GlassSurface>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
        statusBarTranslucent
        transparent
        visible={sheetOpen}
      >
        <Pressable
          accessibilityLabel="Close sheet"
          onPress={() => setSheetOpen(false)}
          style={[styles.scrim, { backgroundColor: theme.glass.scrim }]}
        />
        <GlassSurface
          forceTier={forceTier}
          radius={22}
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + space.md },
          ]}
          variant="sheet"
        >
          <View
            style={[styles.grip, { backgroundColor: theme.glass.fillPressed }]}
          />
          <Text style={[styles.title, ink]}>Sheet</Text>
          <Text style={[styles.prose, ink, styles.flushProse]}>{PROSE}</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.glass.field,
                borderColor: theme.glass.fieldEdge,
              },
            ]}
          >
            <Text style={quiet}>A field well on the sheet</Text>
          </View>
        </GlassSurface>
      </Modal>
    </View>
  );
}

function Segmented<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (next: T) => void;
  options: T[];
  value: T;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              {
                backgroundColor: selected
                  ? theme.glass.fillPressed
                  : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.caption,
                { color: selected ? theme.text : theme.textGray },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  artChapter: { borderRadius: radius.md, height: 100, overflow: "hidden", width: 100 },
  artCharacter: { borderRadius: radius.md, height: 175, overflow: "hidden", width: 100 },
  artRow: { alignItems: "flex-end", flexDirection: "row", gap: space.sm, padding: space.md },
  artStory: { borderRadius: radius.md, height: 143, overflow: "hidden", width: 100 },
  band: { height: 140, justifyContent: "flex-end", padding: space.md },
  bandText: { fontSize: fontSize.title, fontWeight: "700" },
  bottom: {
    bottom: 0,
    left: 0,
    paddingHorizontal: space.md,
    position: "absolute",
    right: 0,
  },
  caption: { fontSize: fontSize.caption },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: space.md,
    padding: space.md,
  },
  fill: { flex: 1 },
  flushProse: { paddingHorizontal: 0 },
  grip: {
    alignSelf: "center",
    borderRadius: radius.full,
    height: 5,
    marginBottom: space.sm,
    width: 36,
  },
  iconButton: { height: 44, width: 44 },
  iconPress: { alignItems: "center", flex: 1, justifyContent: "center" },
  label: { fontSize: fontSize.body },
  nested: { marginTop: space.xs, padding: space.sm },
  panel: { gap: space.xs, padding: space.md },
  picture: { height: 160, width: 160 },
  pictureRow: { alignItems: "center", paddingVertical: space.lg },
  primary: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    marginTop: space.sm,
    minHeight: 44,
  },
  primaryLabel: { color: "#ffffff", fontSize: fontSize.body, fontWeight: "600" },
  prose: {
    fontSize: fontSize.body,
    lineHeight: 22,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
  },
  scrim: { flex: 1 },
  segment: {
    alignItems: "center",
    borderRadius: radius.full,
    flex: 1,
    justifyContent: "center",
    minHeight: 32,
  },
  segmented: { flexDirection: "row", gap: 2 },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    bottom: 0,
    left: 0,
    padding: space.md,
    position: "absolute",
    right: 0,
  },
  stripe: { flex: 1 },
  stripes: { flexDirection: "row", height: 120 },
  title: { fontSize: fontSize.label, fontWeight: "600" },
  titleChip: {
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: space.md,
  },
  top: {
    flexDirection: "row",
    gap: space.sm,
    left: 0,
    paddingHorizontal: space.md,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
