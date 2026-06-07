"use client";

import { useState } from "react";
import { Input } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { FriendSelectionDropdown } from "@/components/friends-selection-dropdown";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Conversation, Friend } from "@/types";
import { createGroupAction } from "./actions";

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current number of groups the novelist is in. */
  groupCount: number;
  /** Maximum groups allowed by the novelist's tier. */
  groupLimit: number;
  /** Called with the freshly created conversation after a successful create. */
  onCreated: (conversation: Conversation) => void;
};

export function CreateGroupDialog({
  open,
  onOpenChange,
  groupCount,
  groupLimit,
  onCreated,
}: CreateGroupDialogProps) {
  const { errorToast } = useUIContext();
  const [name, setName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setSelectedFriends([]);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      errorToast("Group name must not be blank.");
      return;
    }
    if (selectedFriends.length === 0) {
      errorToast("Select at least one participant.");
      return;
    }

    setLoading(true);
    const result = await createGroupAction(
      trimmedName,
      selectedFriends.map((friend) => friend.id),
    );
    setLoading(false);

    if (!result || "message" in result) {
      errorToast("Failed to create group. Please try again.");
      return;
    }

    reset();
    onOpenChange(false);
    onCreated(result);
  };

  return (
    <AppAlertDialog
      heading="Create a group"
      text="Create a group"
      body={
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              alignSelf: "flex-end",
              color:
                groupCount >= groupLimit
                  ? "var(--error, #e53e3e)"
                  : "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {groupCount} / {groupLimit} groups
          </div>
          <Input
            label="Group name"
            name="groupName"
            placeholder=""
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FriendSelectionDropdown
            selectedFriends={selectedFriends}
            setSelectedFriends={setSelectedFriends}
          />
        </div>
      }
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      actionButtonLabel={loading ? "Creating..." : "Create"}
      actionColor="neutral"
      closeButtonText="Cancel"
      isConfirmDisabled={
        loading || !name.trim() || selectedFriends.length === 0
      }
    />
  );
}
