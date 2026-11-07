import { Ionicons } from "@expo/vector-icons";
import { disableAccount } from "@nw/api/endpoints/novelists";
import { useApi } from "@nw/features";
import {
  API_MESSAGE,
  DISABLE_ACCOUNT_COPY as COPY,
  DISABLE_REASON_TEXT_MAX,
  DISABLE_REASONS,
  type DisableReason,
} from "@nw/types";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/** How long the goodbye stays up before the phone signs out. */
const FAREWELL_MS = 2200;

/**
 * "Disable my account" (ACCOUNT_DISABLE_PLAN.md §7.1): a tray, as every form
 * is on a phone, with the tray header pattern — title on the left, circular
 * cancel and confirm on the right — so nothing costs a footer row on the
 * 375 × 667 baseline. The body scrolls; the reason is optional.
 *
 * The server has signed every session out by the time it answers, this one
 * included, so the confirm only has to say goodbye and then run the local
 * half of signing out (`onDisabled`).
 */
export const DisableAccountSheet = ({
  onClose,
  onDisabled,
  visible,
}: {
  onClose: () => void;
  /** Runs after the goodbye: clear this phone's session and leave. */
  onDisabled: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [reason, setReason] = useState<DisableReason | null>(null);
  const [otherText, setOtherText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [farewell, setFarewell] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) return;
    setReason(null);
    setOtherText("");
    setError(null);
  }, [visible]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = () => {
    if (busy || farewell) return;
    onClose();
  };

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await disableAccount(api, {
      reason,
      reasonText: reason === "OTHER" ? otherText.trim() || null : null,
    }).catch(() => null);
    if (result?.message !== API_MESSAGE.Success) {
      setBusy(false);
      setError("We couldn't disable your account just now. Please try again.");
      return;
    }
    setBusy(false);
    setFarewell(true);
    timer.current = setTimeout(onDisabled, FAREWELL_MS);
  };

  return (
    <BottomSheet
      headerAction={
        farewell ? undefined : (
          <View style={styles.actions}>
            <IconButton
              accessibilityLabel={COPY.cancel}
              disabled={busy}
              hitSlop={space.xs}
              icon="close"
              onPress={close}
              tone="material"
            />
            <IconButton
              accessibilityLabel={COPY.confirm}
              busy={busy}
              disabled={busy}
              hitSlop={space.xs}
              icon="pause"
              onPress={() => void confirm()}
              tone="danger"
            />
          </View>
        )
      }
      maxHeightRatio={0.86}
      onClose={close}
      title={farewell ? "Until next time" : COPY.dialogTitle}
      visible={visible}
    >
      {farewell ? (
        <View accessibilityLiveRegion="polite" style={styles.farewell}>
          <Text style={[styles.lead, { color: theme.text }]}>
            {COPY.toastAfterDisable}
          </Text>
          <Text style={[styles.hint, { color: theme.textGray }]}>
            Signing you out…
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <Text style={[styles.hint, { color: theme.error }]}>{error}</Text>
          ) : null}
          <Text style={[styles.lead, { color: theme.text }]}>
            {COPY.dialogLead}
          </Text>
          <View style={styles.bullets}>
            {COPY.bullets.map((line) => (
              <View key={line} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: theme.textGray }]}>
                  •
                </Text>
                <Text style={[styles.bulletText, { color: theme.textGray }]}>
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.hint, { color: theme.textGray }]}>
            {COPY.reasonPrompt}
          </Text>
          <View accessibilityRole="radiogroup" style={styles.reasons}>
            {DISABLE_REASONS.map((option) => {
              const selected = reason === option.value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option.value}
                  onPress={() =>
                    setReason((current) =>
                      current === option.value ? null : option.value,
                    )
                  }
                  style={({ pressed }) => [
                    styles.reason,
                    {
                      backgroundColor: selected
                        ? theme.material.fillPressed
                        : theme.material.fillTranslucent,
                      borderColor: selected
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons
                    color={selected ? theme.accent.solid : theme.textGray}
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={18}
                  />
                  <Text
                    numberOfLines={2}
                    style={[styles.reasonLabel, { color: theme.text }]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {reason === "OTHER" ? (
            <TextField
              autoFocus
              counterMax={DISABLE_REASON_TEXT_MAX}
              label={COPY.reasonOtherPlaceholder}
              maxLength={DISABLE_REASON_TEXT_MAX}
              onChangeText={setOtherText}
              returnKeyType="done"
              value={otherText}
            />
          ) : null}
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: space.sm },
  body: {
    gap: space.sm,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  bulletDot: { fontSize: fontSize.label, lineHeight: 20 },
  bulletRow: { flexDirection: "row", gap: space.xs },
  bulletText: { flex: 1, fontSize: fontSize.label, lineHeight: 20 },
  bullets: { gap: space.xs },
  farewell: {
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.lg,
  },
  hint: { fontSize: fontSize.label },
  lead: { fontSize: fontSize.body, lineHeight: 22 },
  reason: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  reasonLabel: { flex: 1, fontSize: fontSize.label },
  reasons: { gap: space.xs },
});
