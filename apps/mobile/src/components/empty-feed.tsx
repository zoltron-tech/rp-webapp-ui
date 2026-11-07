import { useIsFocused } from "@react-navigation/native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SceneArt, type SceneName } from "@/components/scene-art";
import { Text } from "@/components/text";
import { useScrollIdle } from "@/context/scroll-activity";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * A novelist's activity, posts or prompts, when there are none.
 *
 * Web's `EmptyFeed` on the profile page: the open book with a quill over its
 * first line, a title, and a sentence that names whose page this is. The phone
 * said "Nothing here yet." in grey, which is what a failed fetch looks like.
 *
 * ## Whose colour
 *
 * The book is painted from `useAppTheme`, and every screen that draws this
 * already sits inside the `AccentProvider` of the novelist being read — see
 * `screens/novelist-routes.tsx`. So it is their accent on their pages and the
 * reader's own on the Profile tab, with nothing passed in.
 *
 * ## When it moves
 *
 * The scene's clocks are JS-driven (see `motion-kit.native`), so it holds
 * still while the list is being dragged and while another screen is in front —
 * the same gate `EndOfList` uses.
 */

/**
 * The frame every drawn empty state shares: a scene, a title, a sentence.
 *
 * The scene's clocks are JS-driven, so it moves only while the list is still
 * and this screen is the one in front.
 */
export const EmptyScene = ({
  action,
  aside,
  scene,
  subtitle,
  title,
}: {
  /** A way out of the empty state, under the words. */
  action?: ReactNode;
  /** A quieter second sentence: web's "(Or the link is wrong…)". */
  aside?: string;
  scene: SceneName;
  subtitle: string;
  title: string;
}) => {
  const theme = useAppTheme();
  const idle = useScrollIdle();
  const focused = useIsFocused();

  return (
    <View style={styles.root}>
      <SceneArt motion={idle && focused} scene={scene} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textGray }]}>
        {subtitle}
      </Text>
      {aside ? (
        <Text style={[styles.aside, { color: theme.textGray }]}>{aside}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

export type EmptyFeedKind = "activities" | "posts" | "prompts";

const TITLE: Record<EmptyFeedKind, string> = {
  activities: "No recent activity",
  posts: "No posts yet",
  prompts: "No prompts yet",
};

/** Web's sentences, word for word, so the two clients say the same thing. */
const subtitle = (kind: EmptyFeedKind, username?: string): string => {
  if (kind === "activities") {
    return `${username ? `${username}'s` : "Their"} story is still unfolding. Check back soon.`;
  }
  if (kind === "prompts") {
    return `${username ? `${username}'s` : "Their"} characters haven't posted any prompts yet.`;
  }
  return `${username ?? "This novelist"} hasn't shared any posts yet. Their tale is yet to be written.`;
};

export const EmptyFeed = ({
  kind,
  username,
}: {
  kind: EmptyFeedKind;
  /** Whose feed this is. Without it the sentence falls back to "their". */
  username?: string;
}) => (
  <EmptyScene
    scene="open-book"
    subtitle={subtitle(kind, username)}
    title={TITLE[kind]}
  />
);

const styles = StyleSheet.create({
  action: { marginTop: space.md },
  aside: {
    fontSize: fontSize.caption,
    fontStyle: "italic",
    lineHeight: 18,
    maxWidth: 270,
    opacity: 0.8,
    textAlign: "center",
  },
  root: {
    alignItems: "center",
    gap: space.sm,
    paddingBottom: space.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    width: "100%",
  },
  subtitle: {
    fontSize: fontSize.label,
    lineHeight: 20,
    maxWidth: 270,
    textAlign: "center",
  },
  title: { fontSize: fontSize.body, fontWeight: "700", textAlign: "center" },
});
