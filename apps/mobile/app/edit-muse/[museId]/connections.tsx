import {
  deleteMuseConnection,
  reactToMuseConnection,
  reRequestMuseConnection,
} from "@nw/api/endpoints/muse-connection";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE, type Muse, type MuseConnectionGroup } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MuseGate, useOwnedMuse } from "@/components/edit-muse/shared";
import {
  ConnectionEditor,
  type PickedMuse,
} from "@/components/muse/edit/connection-editor";
import { ConnectionCard } from "@/components/muse/sections/peers";
import { Notice, PillButton } from "@/components/settings";
import { useMuseConnections } from "@/hooks/use-muse";
import { museLook, museName } from "@/lib/muse-appearance";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Web's `ConnectionsSection`: titled bonds between this character and yours or
 * your friends' characters, live once everyone involved has accepted.
 *
 * The cards are the profile's own (`ConnectionCard`), with the same rules for
 * who may accept, edit, delete and re-send. They are drawn for the muse page's
 * dark glass, so they sit on a dark surface here, tinted by the character's
 * colour the way its profile is.
 */

export default function EditMuseConnections() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Connections muse={muse} />}
    </MuseGate>
  );
}

const Connections = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const id = muse.id ?? "";
  const look = useMemo(() => museLook(muse), [muse]);
  const query = useMuseConnections(id, true);
  const connections = query.data;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    connection: MuseConnectionGroup | null;
  } | null>(null);

  const setList = (
    update: (list: MuseConnectionGroup[]) => MuseConnectionGroup[],
  ) =>
    queryClient.setQueryData<MuseConnectionGroup[]>(
      queryKeys.museConnections(id),
      (list) => update(list ?? []),
    );

  const react = async (connection: MuseConnectionGroup, accepted: boolean) => {
    const response = await reactToMuseConnection(api, connection.id, accepted);
    if (response.message !== API_MESSAGE.Success) {
      Alert.alert("Not updated", "Could not update the connection. Try again.");
      return;
    }
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

  const remove = (connection: MuseConnectionGroup) =>
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

  const initialMuse: PickedMuse = {
    displayName: museName(muse),
    image: muse.image,
    museId: id,
    pennedBy: muse.pennedBy
      ? { image: muse.pennedBy.image, username: muse.pennedBy.username }
      : null,
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <Text style={[styles.intro, { color: theme.textGray }]}>
          Titled, multi-character bonds linking {muse.firstName} to your own or
          your friends' characters. Everyone involved must accept before a
          connection goes live.
        </Text>

        <View style={styles.head}>
          <Text style={[styles.groupTitle, { color: theme.textGray }]}>
            Connections{connections ? ` · ${connections.length}` : ""}
          </Text>
          <PillButton
            icon="add"
            label="Add connection"
            onPress={() => setEditor({ connection: null })}
            tone="accent"
          />
        </View>

        {!connections ? (
          <ActivityIndicator color={theme.primary} style={styles.spinner} />
        ) : connections.length === 0 ? (
          <Notice>No connections yet. Add one above.</Notice>
        ) : (
          <View
            style={[
              styles.surface,
              {
                backgroundColor: look.accent
                  ? `${look.accent}22`
                  : "rgba(17,19,24,1)",
              },
            ]}
          >
            <View style={styles.dark}>
              {connections.map((connection) => (
                <ConnectionCard
                  accent={look.accent}
                  connection={connection}
                  currentMuseId={id}
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
          </View>
        )}
      </ScrollView>

      <ConnectionEditor
        connection={editor?.connection ?? null}
        initialMuse={initialMuse}
        onClose={() => setEditor(null)}
        onSaved={(saved, created) => {
          setList((list) =>
            created
              ? [saved, ...list]
              : list.map((c) => (c.id === saved.id ? saved : c)),
          );
          setExpanded(saved.id);
        }}
        visible={editor !== null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, padding: space.m },
  dark: {
    backgroundColor: "rgba(10,11,14,0.82)",
    borderRadius: radius.md + 2,
    gap: space.ms,
    padding: space.ms,
  },
  groupTitle: type.eyebrow,
  head: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.xs,
  },
  intro: { fontSize: fontSize.label, lineHeight: 20, paddingHorizontal: space.xs },
  spinner: { paddingVertical: space.lg },
  surface: { borderRadius: radius.md + 4, padding: 3 },
});
