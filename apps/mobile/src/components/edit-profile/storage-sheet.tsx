import type { StorageUsage } from "@nw/utils";
import { storageExplainer } from "@nw/utils";
import { ScrollView, StyleSheet } from "react-native";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * What the Storage row means (AWS_COST_SECURITY_PLAN.md §2.2): what counts,
 * that deleting media frees space, when the daily limit resets. A tray, with
 * the tray header pattern — title left, one circular close right — and a body
 * that scrolls inside the sheet's own height cap on the 375 × 667 baseline.
 * The copy is `storageExplainer`, shared with web.
 */
export const StorageSheet = ({
  onClose,
  usage,
  visible,
}: {
  onClose: () => void;
  usage: StorageUsage;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const explainer = storageExplainer(usage);

  return (
    <BottomSheet
      headerAction={
        <IconButton
          accessibilityLabel="Close"
          hitSlop={space.xs}
          icon="close"
          onPress={onClose}
          tone="material"
        />
      }
      ignoreKeyboard
      onClose={onClose}
      title={explainer.title}
      visible={visible}
    >
      <ScrollView contentContainerStyle={styles.body}>
        {explainer.lines.map((line) => (
          <Text key={line} style={[styles.line, { color: theme.text }]}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: space.sm,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  line: { fontSize: fontSize.body, lineHeight: 21 },
});
