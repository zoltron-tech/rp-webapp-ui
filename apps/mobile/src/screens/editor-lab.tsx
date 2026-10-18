import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Text } from "@/components/text";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Editor lab. Dev builds only: `novelistworld://editor-lab`.
 *
 * The rich-text editor in its reply (compact) shape, prefilled with runs in
 * each kind of face — a system family, a loaded family, the default — so
 * wrapping, the spelling underlines and the suggestion strip can be looked
 * at without a thread to reply to. Names in `spellIgnore` match the text.
 */

const LONG =
  "She counted the lights the way her father had taught her, not the lamps " +
  "but the gaps between them, and lost count somewhere past the customs house.";

const SAMPLES: { label: string; html: string }[] = [
  {
    html: `<p><span style="font-family: Times New Roman">${LONG}</span></p>`,
    label: "Times New Roman (system serif)",
  },
  {
    html: `<p><span style="font-family: Savate">${LONG}</span></p>`,
    label: "Savate (loaded face)",
  },
  {
    html: `<p>${LONG} I recieve the leter from Elara Vance.</p>`,
    label: "Default (Arial) with typos",
  },
];

const IGNORE = ["elara", "vance"];

export const EditorLab = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + space.xl, paddingTop: insets.top },
      ]}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
    >
      {SAMPLES.map((sample) => (
        <View key={sample.label} style={styles.sample}>
          <Text style={[styles.label, { color: theme.textGray }]}>
            {sample.label}
          </Text>
          <RichTextEditor
            compact
            initialHtml={sample.html}
            placeholder="Type here…"
            spellIgnore={IGNORE}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { gap: space.lg },
  label: {
    fontSize: fontSize.caption,
    letterSpacing: 0.4,
    paddingHorizontal: space.md,
    textTransform: "uppercase",
  },
  sample: { gap: space.xs },
});
