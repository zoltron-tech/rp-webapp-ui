import { Ionicons } from "@expo/vector-icons";
import { searchMentionMuses } from "@nw/api/endpoints/muse";
import {
  createMuseConnection,
  updateMuseConnection,
} from "@nw/api/endpoints/muse-connection";
import { useApi, useSession } from "@nw/features";
import type { MuseConnectionGroup } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { TextField } from "@/components/text-field";
import { MAX_IMAGE_BYTES, pickImage, uploadFile } from "@/lib/media-upload";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `MuseConnectionForm`: a titled, described bond between characters.
 *
 * The same three fields — a title (25 characters), a rich text description
 * with pictures allowed inline, and the characters involved: at least two,
 * at most ten. Your own come from the session; a friend's is found by the
 * same search the mention dropdown uses. A connection with a friend's
 * character is a *request* until they accept it, and the confirm button says
 * so, as web's does.
 *
 * Editing changes the title and the description only; membership is fixed
 * once the request has gone out, so the chips are shown but cannot be
 * removed — web draws them as bare avatars for the same reason.
 */

const MAX_TITLE = 25;
const MIN_MUSES = 2;
const MAX_MUSES = 10;
const FACE = 24;

export interface PickedMuse {
  displayName: string;
  image: string | null;
  museId: string;
  pennedBy?: { username: string; image: string | null } | null;
}

export const ConnectionEditor = ({
  connection,
  initialMuse,
  onClose,
  onSaved,
  visible,
}: {
  /** An existing connection to edit; omitted to create one. */
  connection: MuseConnectionGroup | null;
  /** Pre-selected when creating — the character whose page this is. */
  initialMuse: PickedMuse | null;
  onClose: () => void;
  onSaved: (connection: MuseConnectionGroup, created: boolean) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const session = useSession();
  const editor = useRef<RichTextEditorHandle>(null);

  const isEdit = Boolean(connection?.id);

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [selected, setSelected] = useState<PickedMuse[]>([]);
  const [tab, setTab] = useState<"own" | "friends">("own");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<ReadonlySet<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(search.trim(), 300);

  useEffect(() => {
    if (!visible) return;
    setTitle(connection?.title ?? "");
    setHtml(connection?.description ?? "");
    setSelected(
      connection?.muses.length
        ? connection.muses.map((m) => ({
            displayName: [m.firstName, m.lastName].filter(Boolean).join(" "),
            image: m.image,
            museId: m.museId,
          }))
        : initialMuse
          ? [initialMuse]
          : [],
    );
    setTab("own");
    setSearch("");
    setError(null);
  }, [connection, initialMuse, visible]);

  const ownIds = useMemo(
    () =>
      new Set(
        (session.novelist?.muses ?? [])
          .map((m) => m.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [session.novelist?.muses],
  );
  const isOwn = (museId: string) => ownIds.has(museId);

  const ownList = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (session.novelist?.muses ?? [])
      .filter((m) => m.id && !selected.some((s) => s.museId === m.id))
      .filter((m) => {
        const name = [m.firstName, m.lastName].filter(Boolean).join(" ");
        return !term || name.toLowerCase().includes(term);
      })
      .map<PickedMuse>((m) => ({
        // Alternative verses carry the main verse's name; the number tells
        // them apart, as web's picker does.
        displayName:
          [m.firstName, m.lastName].filter(Boolean).join(" ") +
          (m.originalVerseId ? ` (Verse ${m.verseNumber ?? 2})` : ""),
        image: m.image || null,
        museId: m.id as string,
      }));
  }, [search, selected, session.novelist?.muses]);

  const friends = useQuery({
    enabled: visible && !isEdit && tab === "friends" && debounced.length > 0,
    queryFn: async (): Promise<PickedMuse[]> =>
      (await searchMentionMuses(api, encodeURIComponent(debounced)))
        .filter((r) => r.type === "MUSE" && !ownIds.has(r.id))
        .map((r) => ({
          displayName: r.displayName,
          image: r.image || null,
          museId: r.id,
          pennedBy: r.pennedBy ?? null,
        })),
    queryKey: ["muses", "mention-search", debounced],
    staleTime: 60_000,
  });

  const add = (muse: PickedMuse) => {
    if (selected.some((m) => m.museId === muse.museId)) return;
    if (selected.length >= MAX_MUSES) {
      setError(`Maximum ${MAX_MUSES} characters per connection`);
      return;
    }
    setError(null);
    setSelected((current) => [...current, muse]);
    setSearch("");
  };

  const remove = (museId: string) =>
    setSelected((current) => current.filter((m) => m.museId !== museId));

  const attachImage = async () => {
    const file = await pickImage();
    if (!file) return;
    if (file.fileSize > MAX_IMAGE_BYTES) {
      Alert.alert("Picture is too large", "Maximum file size is 10 MB.");
      return;
    }
    const local = file.uri;
    setUploading((current) => new Set(current).add(local));
    editor.current?.insertImage(local);
    const url = await uploadFile(api, file, "muse-connection");
    setUploading((current) => {
      const next = new Set(current);
      next.delete(local);
      return next;
    });
    if (!url) {
      editor.current?.removeImageBySrc(local);
      Alert.alert("Upload failed", "Please try again.");
      return;
    }
    editor.current?.replaceImageSrc(local, url);
  };

  const involvesFriend = selected.some((m) => !isOwn(m.museId));
  const canConfirm =
    title.trim().length > 0 &&
    (isEdit || selected.length >= MIN_MUSES) &&
    uploading.size === 0;

  const save = async () => {
    if (!canConfirm || busy) return;
    setBusy(true);
    setError(null);
    const response =
      isEdit && connection
        ? await updateMuseConnection(api, connection.id, title.trim(), html)
        : await createMuseConnection(
            api,
            title.trim(),
            html,
            selected.map((m) => m.museId),
          );
    setBusy(false);
    if (!response || "message" in response) {
      setError("Could not save the connection. Try again.");
      return;
    }
    onSaved(response as MuseConnectionGroup, !isEdit);
    onClose();
  };

  const confirmLabel = isEdit ? "Save" : involvesFriend ? "Request" : "Create";

  return (
    <EditorModal
      busy={busy}
      canConfirm={canConfirm}
      confirmLabel={confirmLabel}
      error={error}
      onClose={onClose}
      onConfirm={() => void save()}
      title={isEdit ? "Edit connection" : "New character connection"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
      >
        <TextField
          autoCapitalize="sentences"
          counterMax={MAX_TITLE}
          label="Title"
          maxLength={MAX_TITLE}
          onChangeText={(next) => {
            setTitle(next);
            if (next.trim()) setError(null);
          }}
          placeholder="Name this connection…"
          value={title}
        />

        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.textGray }]}>
            Characters{isEdit ? "" : ` (${selected.length}/${MAX_MUSES})`}
          </Text>
          <View style={styles.chips}>
            {selected.map((muse) => {
              const own = isOwn(muse.museId);
              const pinned = muse.museId === initialMuse?.museId;
              return (
                <View
                  key={muse.museId}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: own
                        ? theme.accent.surface
                        : theme.material.fill,
                      borderColor: own
                        ? theme.accent.surfaceHover
                        : theme.material.edge,
                    },
                  ]}
                >
                  <Avatar
                    name={muse.displayName}
                    size={FACE}
                    uri={wsrvImage(muse.image, {
                      fit: "cover",
                      h: FACE * 3,
                      w: FACE * 3,
                    })}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.chipLabel, { color: theme.text }]}
                  >
                    {muse.displayName.split(" ")[0]}
                  </Text>
                  <Text style={[styles.chipTag, { color: theme.textGray }]}>
                    {own ? "yours" : "friend's"}
                  </Text>
                  {!isEdit && !pinned ? (
                    <Pressable
                      accessibilityLabel={`Remove ${muse.displayName}`}
                      accessibilityRole="button"
                      hitSlop={space.xs}
                      onPress={() => remove(muse.museId)}
                    >
                      <Ionicons color={theme.textGray} name="close" size={14} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
            {selected.length === 0 ? (
              <Text style={[styles.hint, { color: theme.textGray }]}>
                Pick at least {MIN_MUSES} characters.
              </Text>
            ) : null}
          </View>
        </View>

        {!isEdit ? (
          <View style={styles.block}>
            <View style={styles.tabs}>
              {(
                [
                  { id: "own", label: "My characters" },
                  { id: "friends", label: "Friends' characters" },
                ] as const
              ).map((entry) => {
                const active = tab === entry.id;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    key={entry.id}
                    onPress={() => setTab(entry.id)}
                    style={[
                      styles.tab,
                      {
                        backgroundColor: active
                          ? theme.accent.surface
                          : theme.material.fill,
                        borderColor: active
                          ? theme.accent.solid
                          : theme.material.edge,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: active ? theme.accent.textStrong : theme.text,
                        },
                      ]}
                    >
                      {entry.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.search,
                { backgroundColor: theme.glass.field },
              ]}
            >
              <Ionicons color={theme.textGray} name="search" size={16} />
              <TextInput
                autoCorrect={false}
                onChangeText={setSearch}
                placeholder={
                  tab === "own"
                    ? "Filter your characters…"
                    : "Search a friend's character…"
                }
                placeholderTextColor={theme.textGray}
                style={[styles.searchInput, { color: theme.text }]}
                value={search}
              />
            </View>

            <View style={styles.results}>
              {tab === "own" ? (
                ownList.length === 0 ? (
                  <Text style={[styles.hint, { color: theme.textGray }]}>
                    {search
                      ? "No character of yours matches."
                      : "All your characters are already in."}
                  </Text>
                ) : (
                  ownList.map((muse) => (
                    <ResultRow key={muse.museId} muse={muse} onPress={add} />
                  ))
                )
              ) : friends.isFetching && !friends.data ? (
                <ActivityIndicator color={theme.primary} />
              ) : !debounced ? (
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  Type a name to search your friends' characters.
                </Text>
              ) : (friends.data?.length ?? 0) === 0 ? (
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  No friend's character matches “{debounced}”.
                </Text>
              ) : (
                friends.data
                  ?.filter((m) => !selected.some((s) => s.museId === m.museId))
                  .map((muse) => (
                    <ResultRow key={muse.museId} muse={muse} onPress={add} />
                  ))
              )}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textGray }]}>
              Description
            </Text>
            <Pressable
              accessibilityLabel="Add a picture"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => void attachImage()}
              style={({ pressed }) => [
                styles.attach,
                {
                  backgroundColor: pressed
                    ? theme.material.fillPressed
                    : theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <Ionicons color={theme.text} name="image-outline" size={16} />
            </Pressable>
          </View>
          <View
            style={[
              styles.editor,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <RichTextEditor
              compact
              initialHtml={connection?.description ?? ""}
              key={connection?.id ?? "new"}
              onChange={(next) => setHtml(next)}
              placeholder="How are these characters bound?"
              ref={editor}
              uploadingSources={uploading}
            />
          </View>
        </View>
      </ScrollView>
    </EditorModal>
  );
};

const ResultRow = ({
  muse,
  onPress,
}: {
  muse: PickedMuse;
  onPress: (muse: PickedMuse) => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`Add ${muse.displayName}`}
      accessibilityRole="button"
      onPress={() => onPress(muse)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.material.fillPressed : "transparent",
          borderBottomColor: theme.material.edge,
        },
      ]}
    >
      <Avatar
        name={muse.displayName}
        size={32}
        uri={wsrvImage(muse.image, { fit: "cover", h: 96, w: 96 })}
      />
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.rowName, { color: theme.text }]}>
          {muse.displayName}
        </Text>
        {muse.pennedBy?.username ? (
          <Text
            numberOfLines={1}
            style={[styles.rowBy, { color: theme.textGray }]}
          >
            by @{muse.pennedBy.username}
          </Text>
        ) : null}
      </View>
      <Ionicons color={theme.accent.text} name="add-circle-outline" size={20} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  attach: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  block: { gap: space.sm },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    paddingLeft: 3,
    paddingRight: space.sm + 2,
    paddingVertical: 3,
  },
  chipLabel: { fontSize: fontSize.label, fontWeight: "600", maxWidth: 110 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chipTag: { fontSize: 10, fontStyle: "italic" },
  content: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  editor: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 160,
    overflow: "hidden",
  },
  hint: { fontSize: fontSize.caption, fontStyle: "italic" },
  label: { fontSize: fontSize.caption, fontWeight: "600" },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  results: { gap: 2 },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    paddingVertical: space.sm,
  },
  rowBy: { fontSize: fontSize.caption },
  rowName: { fontSize: fontSize.body, fontWeight: "500" },
  rowText: { flex: 1, minWidth: 0 },
  scroll: { flex: 1 },
  search: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm + 4,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.body,
    paddingVertical: space.sm + 2,
  },
  tab: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    paddingVertical: 7,
  },
  tabLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  tabs: { flexDirection: "row", gap: space.sm },
});
