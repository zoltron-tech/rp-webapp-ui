import { Ionicons } from "@expo/vector-icons";
import {
  BLOCK_BLACKLIST_COPY,
  type HiddenItemKind,
  type HiddenReason,
} from "@nw/types";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The stub row: "Comment from @ada hidden · Show". One look for every kind of
 * item, and for the one reveal over a blacklisted profile's sections.
 */
const StubRow = ({ label, onShow }: { label: string; onShow: () => void }) => {
  const theme = useAppTheme();
  return (
    <View
      accessibilityRole="text"
      style={[
        styles.stub,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.textGray} name="eye-off-outline" size={16} />
      <Text numberOfLines={1} style={[styles.label, { color: theme.textGray }]}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${BLOCK_BLACKLIST_COPY.show}: ${label}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onShow}
        style={({ pressed }) => [
          styles.show,
          {
            backgroundColor: pressed
              ? theme.material.fillPressed
              : "transparent",
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Text style={[styles.showLabel, { color: theme.text }]}>
          {BLOCK_BLACKLIST_COPY.show}
        </Text>
      </Pressable>
    </View>
  );
};

/**
 * A stub in place of something written by a novelist the viewer blacklisted,
 * or, inside a shared story, someone they blocked (BLOCK_BLACKLIST_PLAN.md
 * B11, B12, K4). The server sent the item whole, so Show swaps it in with no
 * fetch; the reveal lasts for this item while the screen is mounted.
 */
export const HiddenItem = ({
  reason,
  kind,
  handle,
  children,
}: {
  /** The server's flag; nothing to hide when absent. */
  reason: HiddenReason | null | undefined;
  /** Picks the noun: "Comment from @x hidden". */
  kind: HiddenItemKind;
  /** The author as shown: "@ada", or a muse's name. */
  handle: string;
  children: ReactNode;
}) => {
  const [shown, setShown] = useState(false);
  if (!reason || shown) return <>{children}</>;
  return (
    <StubRow
      label={BLOCK_BLACKLIST_COPY.stub(kind, handle)}
      onShow={() => setShown(true)}
    />
  );
};

/**
 * The one reveal over a blacklisted profile's posts and characters (B3). The
 * caller owns the state, so a single Show opens every section it gates.
 */
export const HiddenSectionStub = ({
  handle,
  onShow,
}: {
  handle: string;
  onShow: () => void;
}) => (
  <StubRow label={BLOCK_BLACKLIST_COPY.hiddenSection(handle)} onShow={onShow} />
);

const styles = StyleSheet.create({
  label: { flex: 1, fontSize: fontSize.label, minWidth: 0 },
  show: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.ms,
    paddingVertical: space.xs,
  },
  showLabel: { fontSize: fontSize.label, fontWeight: "600" },
  stub: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    marginVertical: space.xs,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
});
