import type { PrivacyLevel } from "@nw/types/prompt";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { Muse } from "@nw/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { PillButton } from "@/components/settings";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { useMuse } from "@/hooks/use-muse";
import type { MuseForm } from "@/hooks/use-muse-form";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/** Who can see a character, in the order the picker lists them. */
export const PRIVACY_CHOICES: PrivacyLevel[] = ["PUBLIC", "FRIENDS", "ONLY_ME"];

/**
 * What every character-settings screen shares: loading the character from the
 * route and checking it is yours, the framed name fields, and the save bar
 * that rises over the keyboard while a typed change is unsaved.
 */

export const NAME_MAX = 50;
export const SAVE_BAR_HEIGHT = 64;

/**
 * The character in the route, from the same cache entry its profile reads —
 * so an edit here is already on the profile underneath when you go back.
 */
export const useOwnedMuse = () => {
  const { museId } = useLocalSearchParams<{ museId: string }>();
  const query = useMuse(museId);
  const session = useSession();
  const muse = query.data ?? null;
  const owned = Boolean(
    muse &&
      session.novelist?.username &&
      muse.pennedBy?.username === session.novelist.username,
  );
  return { muse, museId: museId ?? "", owned, query };
};

/** Loading, a failure, or someone else's character — otherwise the screen. */
export const MuseGate = ({
  children,
  owned,
  query,
}: {
  children: (muse: Muse) => ReactNode;
  owned: boolean;
  query: ReturnType<typeof useMuse>;
}) => {
  const theme = useAppTheme();
  const muse = query.data ?? null;

  if (query.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  if (!muse) {
    return (
      <ListStatus
        empty="This character could not be found."
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!owned) {
    return <ListStatus empty="Only the character's author can edit it." />;
  }
  return <>{children(muse)}</>;
};

/** A name field that looks like one: framed, labelled, with a pencil. */
export const NameInput = ({
  inputRef,
  label,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  value,
}: {
  inputRef?: React.RefObject<TextInput | null>;
  label: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  returnKeyType: "next" | "done";
  value: string;
}) => {
  const theme = useAppTheme();
  const own = useRef<TextInput>(null);
  const input = inputRef ?? own;
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityHint="Double tap to edit"
      onPress={() => input.current?.focus()}
      style={styles.nameField}
    >
      <Text style={[styles.nameLabel, { color: theme.textGray }]}>{label}</Text>
      <View
        style={[
          styles.nameFrame,
          {
            backgroundColor: theme.glass.field,
            borderColor: focused ? theme.accent.solid : theme.material.edge,
          },
        ]}
      >
        <TextInput
          autoCapitalize="words"
          maxLength={NAME_MAX}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={theme.textGray}
          ref={input}
          returnKeyType={returnKeyType}
          selectionColor={theme.accent.solid}
          style={[styles.nameInput, { color: theme.text }]}
          value={value}
        />
        <Ionicons
          color={focused ? theme.accent.text : theme.textGray}
          name={focused ? "create" : "pencil"}
          size={16}
        />
      </View>
    </Pressable>
  );
};

/**
 * The character's name as two fields, with web's explicit save: typed changes
 * are a draft until saved or reset, and leaving with a draft asks first.
 */
export const useNameDraft = (muse: Muse | null, form: MuseForm) => {
  const [firstName, setFirstName] = useState(muse?.firstName ?? "");
  const [lastName, setLastName] = useState(muse?.lastName ?? "");
  const [saving, setSaving] = useState(false);

  // A save landing (here or on another screen) re-seeds the fields.
  useEffect(() => {
    setFirstName(muse?.firstName ?? "");
    setLastName(muse?.lastName ?? "");
  }, [muse?.firstName, muse?.lastName]);

  const dirty =
    Boolean(muse) &&
    (firstName.trim() !== (muse?.firstName ?? "") ||
      lastName.trim() !== (muse?.lastName ?? ""));
  const missing = firstName.trim().length === 0;
  const canSave = dirty && !missing && !saving;

  const save = async () => {
    if (!canSave) return false;
    setSaving(true);
    const ok = await form.save({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    setSaving(false);
    if (!ok)
      Alert.alert("Not saved", "The name could not be saved. Try again.");
    return ok;
  };

  const reset = () => {
    setFirstName(muse?.firstName ?? "");
    setLastName(muse?.lastName ?? "");
  };

  useLeaveGuard(dirty, reset);

  return {
    canSave,
    dirty,
    firstName,
    lastName,
    missing,
    reset,
    save,
    saving,
    setFirstName,
    setLastName,
  };
};

/** Web's "Unsaved changes" dialog, on the way out of a screen with a draft. */
export const useLeaveGuard = (dirty: boolean, discard: () => void) => {
  const navigation = useNavigation();
  const state = useRef({ dirty, discard });
  state.current = { dirty, discard };

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (event) => {
        if (!state.current.dirty) return;
        event.preventDefault();
        Alert.alert(
          "Unsaved changes",
          "The name has unsaved changes that will be lost if you leave.",
          [
            { style: "cancel", text: "Keep editing" },
            {
              onPress: () => {
                state.current.discard();
                navigation.dispatch(event.data.action);
              },
              style: "destructive",
              text: "Discard",
            },
          ],
        );
      }),
    [navigation],
  );
};

/** The bar over the keyboard while the name is a draft. */
export const SaveBar = ({
  busy,
  canSave,
  label,
  onReset,
  onSave,
  visible,
}: {
  busy: boolean;
  canSave: boolean;
  label: string;
  onReset: () => void;
  onSave: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.saveBar,
        {
          backgroundColor: theme.material.fill,
          borderTopColor: theme.material.edge,
          bottom: keyboardOffset,
          paddingBottom:
            keyboardOffset > 0 ? space.sm : insets.bottom + space.sm,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.saveBarLabel, { color: theme.textGray }]}
      >
        {label}
      </Text>
      <PillButton disabled={busy} label="Reset" onPress={onReset} />
      <PillButton
        busy={busy}
        disabled={!canSave}
        icon="checkmark"
        label="Save"
        onPress={onSave}
        tone="accent"
      />
    </View>
  );
};

/** The scroll padding a screen needs under its content for the save bar. */
export const useBottomPadding = (withBar: boolean) => {
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);
  return (
    insets.bottom + space.xl + keyboardOffset + (withBar ? SAVE_BAR_HEIGHT : 0)
  );
};

const styles = StyleSheet.create({
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  nameField: { gap: 5 },
  nameFrame: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.m,
  },
  nameInput: {
    flex: 1,
    fontSize: fontSize.body,
    minHeight: 44,
    paddingVertical: space.sm,
  },
  nameLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  saveBar: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    left: 0,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    position: "absolute",
    right: 0,
  },
  saveBarLabel: { flex: 1, fontSize: fontSize.label },
});
