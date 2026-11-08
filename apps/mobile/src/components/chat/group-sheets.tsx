import { Ionicons } from "@expo/vector-icons";
import {
  addGroupMembers,
  updateGroup,
} from "@nw/api/endpoints/conversation-detail";
import { queryKeys, useApi } from "@nw/features";
import type { Conversation, ConversationParticipant, Friend } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { FriendPicker } from "@/components/chat/friend-picker";
import { IconButton } from "@/components/icon-button";
import { Image } from "@/components/image";
import { BottomSheet } from "@/components/sheet";
import { Text, TextInput } from "@/components/text";
import {
  alertMediaRejected,
  type PickedMedia,
  pickedOversizeMessage,
  pickImage,
  uploadFile,
} from "@/lib/media-upload";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A group admin's two trays — web's `EditGroupDialog` and `AddMembersDialog`.
 *
 * The server checks that the caller is an admin. The details screen only
 * offers these to one.
 */

const FACE = 96;

/** Cancel beside confirm, as the other form trays have it. */
const HeaderActions = ({
  busy,
  canConfirm,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  canConfirm: boolean;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <View style={styles.actions}>
    <IconButton
      accessibilityLabel="Cancel"
      disabled={busy}
      hitSlop={space.xs}
      icon="close"
      onPress={onCancel}
      tone="glass"
    />
    <IconButton
      accessibilityLabel={confirmLabel}
      busy={busy}
      disabled={!canConfirm}
      hitSlop={space.xs}
      icon="checkmark"
      onPress={onConfirm}
      tone="primary"
    />
  </View>
);

export const EditGroupSheet = ({
  conversation,
  onClose,
  visible,
}: {
  conversation: Conversation;
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const [name, setName] = useState(conversation.name ?? "");
  const [picture, setPicture] = useState<PickedMedia | null>(null);
  const [saving, setSaving] = useState(false);

  // Each opening starts from the group as it stands.
  useEffect(() => {
    if (visible) {
      setName(conversation.name ?? "");
      setPicture(null);
    }
  }, [conversation.name, visible]);

  const choose = async () => {
    const file = await pickImage();
    if (!file) return;
    const tooLarge = await pickedOversizeMessage(api, file);
    if (tooLarge) {
      Alert.alert("Picture is too large", tooLarge);
      return;
    }
    setPicture(file);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);

    const payload: { name?: string; image?: string } = {};
    if (trimmed !== (conversation.name ?? "")) payload.name = trimmed;
    if (picture) {
      const uploaded = await uploadFile(api, picture);
      if (!uploaded.url) {
        setSaving(false);
        if (uploaded.rejected) alertMediaRejected();
        else if (!uploaded.refused)
          Alert.alert(
            "Not saved",
            "The picture could not be uploaded. Try again.",
          );
        return;
      }
      payload.image = uploaded.url;
    }

    if (!payload.name && !payload.image) {
      setSaving(false);
      onClose();
      return;
    }

    const result = await updateGroup(api, conversation.id, payload).catch(
      () => null,
    );
    setSaving(false);
    if (!result || "message" in result) {
      Alert.alert("Not saved", "The group could not be updated. Try again.");
      return;
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    onClose();
  };

  return (
    <BottomSheet
      headerAction={
        <HeaderActions
          busy={saving}
          canConfirm={Boolean(name.trim())}
          confirmLabel="Save group"
          onCancel={onClose}
          onConfirm={() => void save()}
        />
      }
      onClose={onClose}
      title="Edit group"
      visible={visible}
    >
      <View style={styles.form}>
        <Pressable
          accessibilityLabel="Change group picture"
          accessibilityRole="button"
          disabled={saving}
          onPress={() => void choose()}
          style={styles.face}
        >
          {picture ? (
            <Image source={{ uri: picture.uri }} style={styles.preview} />
          ) : (
            <Avatar
              name={conversation.name}
              size={FACE}
              uri={conversation.image}
            />
          )}
          <View
            style={[
              styles.camera,
              {
                backgroundColor: theme.accent.solid,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color="#ffffff" name="camera" size={16} />
          </View>
        </Pressable>
        <Text style={[styles.label, { color: theme.textGray }]}>
          Group name
        </Text>
        <TextInput
          accessibilityLabel="Group name"
          maxLength={60}
          onChangeText={setName}
          placeholderTextColor={theme.textGray}
          returnKeyType="done"
          style={[
            styles.field,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edgeTranslucent,
              color: theme.text,
            },
          ]}
          value={name}
        />
      </View>
    </BottomSheet>
  );
};

export const AddMembersSheet = ({
  groupId,
  members,
  onClose,
  visible,
}: {
  groupId: string;
  /** Those already in the group, who are not offered. */
  members: ConversationParticipant[];
  onClose: () => void;
  visible: boolean;
}) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Friend[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!visible) setSelected([]);
  }, [visible]);

  const exclude = useMemo(
    () => new Set(members.map((member) => member.novelistId)),
    [members],
  );

  const toggle = useCallback((friend: Friend) => {
    setSelected((previous) =>
      previous.some((entry) => entry.id === friend.id)
        ? previous.filter((entry) => entry.id !== friend.id)
        : [...previous, friend],
    );
  }, []);

  const add = async () => {
    if (selected.length === 0 || adding) return;
    setAdding(true);
    const result = await addGroupMembers(
      api,
      groupId,
      selected.map((friend) => friend.id),
    ).catch(() => null);
    setAdding(false);
    if (result !== true) {
      Alert.alert("Not added", "The members could not be added. Try again.");
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: queryKeys.conversationMembers(groupId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    onClose();
  };

  return (
    <BottomSheet
      fill
      headerAction={
        <HeaderActions
          busy={adding}
          canConfirm={selected.length > 0}
          confirmLabel="Add members"
          onCancel={onClose}
          onConfirm={() => void add()}
        />
      }
      maxHeightRatio={0.88}
      onClose={onClose}
      title="Add members"
      visible={visible}
    >
      <View style={styles.picker}>
        <FriendPicker
          emptyText="All your friends are already in this group."
          exclude={exclude}
          onToggle={toggle}
          selected={selected}
          visible={visible}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  camera: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: border.edge,
    bottom: 0,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 32,
  },
  face: { alignSelf: "center", height: FACE, width: FACE },
  field: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    fontSize: fontSize.input,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  form: { gap: space.sm, paddingBottom: space.lg, paddingHorizontal: space.md },
  label: { fontSize: fontSize.caption, fontWeight: "600", marginTop: space.sm },
  picker: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
  preview: { borderRadius: FACE / 2, height: FACE, width: FACE },
});
