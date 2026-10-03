import { Ionicons } from "@expo/vector-icons";
import {
  deleteMuseConnection,
  reactToMuseConnection,
  reRequestMuseConnection,
} from "@nw/api/endpoints/muse-connection";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Muse, type MuseConnectionGroup } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import {
  ConnectionEditor,
  type PickedMuse,
} from "@/components/muse/edit/connection-editor";
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  glassCard,
  MusePanel,
  PANEL,
  SectionEmpty,
  SectionLabel,
  Shimmer,
} from "@/components/muse/panel";
import { AddButton } from "@/components/muse/sections/info";
import { RichText } from "@/components/rich-text";
import { useMuseConnections } from "@/hooks/use-muse";
import { withAlpha } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { museName } from "@/lib/muse-appearance";
import { fontSize, radius, space } from "@/theme";

/**
 * Web's `ConnectionsSection`: the bonds between this character and others.
 *
 * A connection is a titled, described group of muses — own and friends' —
 * that every novelist involved has to accept. Web draws each as a card with
 * the faces stacked, the title, and a chevron that opens the description, the
 * roster and, while pending, who has answered; so does this.
 *
 * ## The same actions, for the same people
 *
 * Web's rules, kept exactly: anyone signed in can start a connection from a
 * character's page (the owner's button says "Add", a visitor's "Request");
 * a novelist the request is waiting on sees accept and decline; whoever is
 * involved (`canEdit`) can edit the title and description or delete it; the
 * creator can re-send it after a decline. Accepting or declining changes
 * the status server-side, so the list is refetched rather than guessed.
 */

const STATUS: Record<
  MuseConnectionGroup["status"],
  { color: string; label: string }
> = {
  DONE: { color: "#4ade80", label: "Connected" },
  PENDING: { color: "#fbbf24", label: "Pending" },
  REJECTED: { color: "#f87171", label: "Declined" },
};

const FACE = 28;

export const MusePeersSection = ({
  active,
  isOwnMuse,
  look,
  motion,
  muse,
}: {
  active: boolean;
  isOwnMuse: boolean;
  look: MuseLook;
  motion: boolean;
  muse: Muse | null;
}) => {
  const { accent } = look;
  const api = useApi();
  const queryClient = useQueryClient();
  const session = useSession();
  const query = useMuseConnections(muse?.id ?? undefined, active);
  const connections = query.data;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    connection: MuseConnectionGroup | null;
  } | null>(null);

  const signedIn = Boolean(session.novelist);
  const museId = muse?.id ?? "";

  const setList = (
    update: (list: MuseConnectionGroup[]) => MuseConnectionGroup[],
  ) =>
    queryClient.setQueryData<MuseConnectionGroup[]>(
      queryKeys.museConnections(museId),
      (list) => update(list ?? []),
    );

  const onSaved = (saved: MuseConnectionGroup, created: boolean) => {
    setList((list) =>
      created
        ? [saved, ...list]
        : list.map((c) => (c.id === saved.id ? saved : c)),
    );
    setExpanded(saved.id);
  };

  const react = async (connection: MuseConnectionGroup, accepted: boolean) => {
    const response = await reactToMuseConnection(api, connection.id, accepted);
    if (response.message !== API_MESSAGE.Success) {
      Alert.alert("Not updated", "Could not update the connection. Try again.");
      return;
    }
    // The status may have moved to DONE or REJECTED on the server; ask.
    await query.refetch();
  };

  const rerequest = async (connection: MuseConnectionGroup) => {
    const response = await reRequestMuseConnection(api, connection.id);
    if (!response || "message" in response) {
      Alert.alert("Not sent", "Could not re-send the request. Try again.");
      return;
    }
    setList((list) => list.map((c) => (c.id === connection.id ? response : c)));
  };

  const remove = (connection: MuseConnectionGroup) => {
    Alert.alert(
      "Delete connection?",
      `"${connection.title}" will be permanently removed for every character and novelist involved. This cannot be undone.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const response = await deleteMuseConnection(api, connection.id);
            if (response.message !== API_MESSAGE.Success) {
              Alert.alert("Not deleted", "Try again in a moment.");
              return;
            }
            setList((list) => list.filter((c) => c.id !== connection.id));
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const initialMuse: PickedMuse | null = muse?.id
    ? {
        displayName: museName(muse),
        image: muse.image,
        museId: muse.id,
        pennedBy: muse.pennedBy
          ? { image: muse.pennedBy.image, username: muse.pennedBy.username }
          : null,
      }
    : null;

  const addLabel = isOwnMuse ? "Add connection" : "Request connection";

  return (
    <>
      <MusePanel accent={accent} hideBackground={look.hideExpandedBackground}>
        <MiniHeader look={look} muse={muse} />
        <Divider accent={accent} />
        <SectionLabel
          trailing={
            signedIn && muse && connections && connections.length > 0 ? (
              <AddButton
                label={isOwnMuse ? "Add" : "Request"}
                onPress={() => setEditor({ connection: null })}
              />
            ) : undefined
          }
        >
          Connections
        </SectionLabel>

        {!connections ? (
          <View style={styles.list}>
            <Shimmer height={64} />
            <Shimmer height={64} />
            <Shimmer height={64} />
          </View>
        ) : connections.length === 0 ? (
          <SectionEmpty
            accent={accent}
            label="No character connections yet."
            motion={motion}
            scene="muse-bond"
          >
            {signedIn && muse ? (
              <AddButton
                label={addLabel}
                onPress={() => setEditor({ connection: null })}
              />
            ) : null}
          </SectionEmpty>
        ) : (
          <View style={styles.list}>
            {connections.map((connection) => (
              <ConnectionCard
                accent={accent}
                connection={connection}
                currentMuseId={muse?.id ?? null}
                expanded={expanded === connection.id}
                key={connection.id}
                onDelete={() => remove(connection)}
                onEdit={() => setEditor({ connection })}
                onReact={(accepted) => void react(connection, accepted)}
                onRerequest={() => void rerequest(connection)}
                onToggle={() =>
                  setExpanded((open) =>
                    open === connection.id ? null : connection.id,
                  )
                }
              />
            ))}
          </View>
        )}
      </MusePanel>

      {signedIn && muse ? (
        <ConnectionEditor
          connection={editor?.connection ?? null}
          initialMuse={initialMuse}
          onClose={() => setEditor(null)}
          onSaved={onSaved}
          visible={editor !== null}
        />
      ) : null}
    </>
  );
};

/** Also the character settings' Connections screen, on a dark surface. */
export const ConnectionCard = ({
  accent,
  connection,
  currentMuseId,
  expanded,
  onDelete,
  onEdit,
  onReact,
  onRerequest,
  onToggle,
}: {
  accent?: string;
  connection: MuseConnectionGroup;
  currentMuseId: string | null;
  expanded: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onReact: (accepted: boolean) => void;
  onRerequest: () => void;
  onToggle: () => void;
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | "rerequest" | null>(
    null,
  );
  const status = STATUS[connection.status];
  const faces = connection.muses.slice(0, 3);
  const overflow = connection.muses.length - faces.length;

  const isPending = connection.status === "PENDING";
  const isRejected = connection.status === "REJECTED";
  const awaitingViewer = isPending && connection.viewerApproved === false;
  const canRerequest = isRejected && connection.viewerIsCreator;

  const act = async (
    kind: "accept" | "decline" | "rerequest",
    run: () => void,
  ) => {
    setBusy(kind);
    await Promise.resolve(run());
    setBusy(null);
  };

  return (
    <View style={[styles.card, glassCard(accent)]}>
      <Pressable
        accessibilityLabel={`${connection.title}, ${status.label}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.stack}>
          {faces.map((member, index) => (
            <View
              key={member.museId}
              style={[styles.face, { marginLeft: index === 0 ? 0 : -8 }]}
            >
              <Avatar
                name={member.firstName}
                size={FACE}
                uri={wsrvImage(member.image, {
                  fit: "cover",
                  h: FACE * 3,
                  w: FACE * 3,
                })}
              />
            </View>
          ))}
          {overflow > 0 ? (
            <View style={[styles.face, styles.overflow]}>
              <Text style={styles.overflowLabel}>+{overflow}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.titleWrap}>
          <Text numberOfLines={expanded ? undefined : 1} style={styles.title}>
            {connection.title}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.status, { color: status.color }]}>
              {status.label}
            </Text>
            {connection.createdByName ? (
              <Text numberOfLines={1} style={styles.meta}>
                · by {connection.createdByName}
              </Text>
            ) : null}
          </View>
        </View>

        {awaitingViewer ? (
          <View style={styles.reactRow}>
            <ReactButton
              busy={busy === "decline"}
              icon="close"
              label="Decline"
              onPress={() => void act("decline", () => onReact(false))}
              tone="rgba(229,72,77,0.85)"
            />
            <ReactButton
              busy={busy === "accept"}
              icon="checkmark"
              label="Accept"
              onPress={() => void act("accept", () => onReact(true))}
              tone="rgba(34,197,94,0.85)"
            />
          </View>
        ) : null}

        <Ionicons
          color={PANEL.muted}
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {connection.description ? (
            <RichText html={connection.description} />
          ) : null}

          <View style={styles.roster}>
            {connection.muses.map((member) => {
              const isCurrent = member.museId === currentMuseId;
              return (
                <Pressable
                  accessibilityLabel={`Open ${member.firstName}`}
                  accessibilityRole="button"
                  disabled={isCurrent}
                  key={member.museId}
                  onPress={() =>
                    router.push({
                      params: { museId: member.museId },
                      pathname: "/muse/[museId]",
                    })
                  }
                  style={({ pressed }) => [
                    styles.member,
                    {
                      backgroundColor: pressed
                        ? "rgba(255,255,255,0.1)"
                        : accent
                          ? withAlpha(accent, 0.1)
                          : "rgba(255,255,255,0.05)",
                    },
                  ]}
                >
                  <Avatar
                    name={member.firstName}
                    size={24}
                    uri={wsrvImage(member.image, {
                      fit: "cover",
                      h: 72,
                      w: 72,
                    })}
                  />
                  <View style={styles.memberText}>
                    <Text numberOfLines={1} style={styles.memberName}>
                      {[member.firstName, member.lastName]
                        .filter(Boolean)
                        .join(" ")}
                      {isCurrent ? "  ·  this character" : ""}
                    </Text>
                    {member.novelistName ? (
                      <Text numberOfLines={1} style={styles.memberBy}>
                        by {member.novelistName}
                      </Text>
                    ) : null}
                  </View>
                  {!isCurrent ? (
                    <Ionicons
                      color={PANEL.muted}
                      name="chevron-forward"
                      size={14}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {isPending ? (
            <View style={styles.approvals}>
              {connection.approvals.map((approval) => (
                <View key={approval.novelistId} style={styles.approval}>
                  <Ionicons
                    color={approval.approved ? "#4ade80" : PANEL.muted}
                    name={
                      approval.approved ? "checkmark-circle" : "time-outline"
                    }
                    size={13}
                  />
                  <Text style={styles.approvalLabel}>
                    {approval.novelistName || "A novelist"}
                    {approval.approved ? " accepted" : " hasn't responded yet"}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {isRejected ? (
            <Text style={styles.meta}>
              This connection request was declined.
              {connection.viewerIsCreator
                ? " You can send the same request again."
                : ""}
            </Text>
          ) : null}

          {connection.canEdit || canRerequest ? (
            <View style={styles.actions}>
              {canRerequest ? (
                <ActionPill
                  busy={busy === "rerequest"}
                  icon="refresh-outline"
                  label="Request again"
                  onPress={() => void act("rerequest", onRerequest)}
                />
              ) : null}
              {connection.canEdit ? (
                <ActionPill
                  icon="create-outline"
                  label="Edit"
                  onPress={onEdit}
                />
              ) : null}
              {connection.canEdit ? (
                <ActionPill
                  danger
                  icon="trash-outline"
                  label="Delete"
                  onPress={onDelete}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const ReactButton = ({
  busy,
  icon,
  label,
  onPress,
  tone,
}: {
  busy: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone: string;
}) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    disabled={busy}
    hitSlop={space.xs}
    onPress={(event) => {
      event.stopPropagation();
      onPress();
    }}
    style={({ pressed }) => [
      styles.react,
      { backgroundColor: tone, opacity: pressed ? 0.7 : 1 },
    ]}
  >
    {busy ? (
      <ActivityIndicator color="#ffffff" size="small" />
    ) : (
      <Ionicons color="#ffffff" name={icon} size={16} />
    )}
  </Pressable>
);

const ActionPill = ({
  busy,
  danger,
  icon,
  label,
  onPress,
}: {
  busy?: boolean;
  danger?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={busy}
    onPress={onPress}
    style={({ pressed }) => [
      styles.pill,
      danger ? styles.pillDanger : null,
      { opacity: pressed ? 0.7 : 1 },
    ]}
  >
    {busy ? (
      <ActivityIndicator color={PANEL.secondary} size="small" />
    ) : (
      <Ionicons
        color={danger ? "#f87171" : PANEL.secondary}
        name={icon}
        size={13}
      />
    )}
    <Text style={[styles.pillLabel, danger ? { color: "#f87171" } : null]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    paddingTop: space.xs,
  },
  approval: { alignItems: "center", flexDirection: "row", gap: 6 },
  approvalLabel: { color: PANEL.secondary, fontSize: fontSize.caption },
  approvals: { gap: 4 },
  body: {
    borderTopColor: PANEL.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.sm + 2,
  },
  card: {
    borderRadius: radius.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  face: {
    borderColor: "rgba(0,0,0,0.6)",
    borderRadius: (FACE + 4) / 2,
    borderWidth: 2,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 2,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.sm + 2,
  },
  list: { gap: space.sm + 2 },
  member: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  memberBy: { color: PANEL.muted, fontSize: fontSize.caption },
  memberName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: fontSize.label,
    fontWeight: "600",
  },
  memberText: { flex: 1, minWidth: 0 },
  meta: { color: PANEL.muted, flexShrink: 1, fontSize: fontSize.caption },
  overflow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    height: FACE,
    justifyContent: "center",
    marginLeft: -8,
    width: FACE,
  },
  overflowLabel: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  pill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: space.sm + 4,
    paddingVertical: 6,
  },
  pillDanger: {
    backgroundColor: "rgba(229,72,77,0.12)",
    borderColor: "rgba(229,72,77,0.4)",
  },
  pillLabel: { color: PANEL.secondary, fontSize: 12, fontWeight: "600" },
  react: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  reactRow: { flexDirection: "row", gap: 6 },
  roster: { gap: 4 },
  stack: { alignItems: "center", flexDirection: "row" },
  status: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
  statusDot: { borderRadius: 3, height: 6, width: 6 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  title: {
    color: "rgba(255,255,255,0.92)",
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  titleWrap: { flex: 1, gap: 3, minWidth: 0 },
});
