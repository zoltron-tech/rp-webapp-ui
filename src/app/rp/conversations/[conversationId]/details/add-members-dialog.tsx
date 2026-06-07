"use client";

import { useEffect, useMemo, useState } from "react";
import { AppAlertDialog } from "@/components/dialog";
import { FriendSelectionDropdown } from "@/components/friends-selection-dropdown";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import type { ConversationParticipant, Friend } from "@/types";
import { addGroupMembersAction } from "../actions";

type AddMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  /** Current members, used to hide novelists already in the group. */
  members: ConversationParticipant[];
  /** Called after members are successfully added. */
  onAdded: () => void;
};

export function AddMembersDialog({
  open,
  onOpenChange,
  groupId,
  members,
  onAdded,
}: AddMembersDialogProps) {
  const novelist = useGlobalState("novelist");
  const { errorToast } = useUIContext();
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setSelectedFriends([]);
  }, [open]);

  // Friends that are not already part of the group.
  const availableFriends = useMemo(() => {
    const existing = new Set(members.map((m) => m.novelistId));
    return (novelist?.friends ?? []).filter(
      (friend) => !existing.has(friend.id),
    );
  }, [members, novelist?.friends]);

  const reset = () => setSelectedFriends([]);

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (selectedFriends.length === 0) {
      errorToast("Select at least one member to add.");
      return;
    }

    setLoading(true);
    const result = await addGroupMembersAction(
      groupId,
      selectedFriends.map((friend) => friend.id),
    );
    setLoading(false);

    if (!result || (typeof result === "object" && "message" in result)) {
      errorToast("Failed to add members. Please try again.");
      return;
    }

    reset();
    onOpenChange(false);
    onAdded();
  };

  return (
    <AppAlertDialog
      heading="Add members"
      text="Add members"
      body={
        <FriendSelectionDropdown
          selectedFriends={selectedFriends}
          setSelectedFriends={setSelectedFriends}
          friends={availableFriends}
        />
      }
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      actionButtonLabel={loading ? "Adding..." : "Add"}
      actionColor="neutral"
      closeButtonText="Cancel"
      isConfirmDisabled={loading || selectedFriends.length === 0}
    />
  );
}
