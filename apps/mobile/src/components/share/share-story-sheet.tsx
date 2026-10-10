import {
  shareChapterToDiscord,
  shareStoryToDiscord,
} from "@nw/api/endpoints/community";
import { useApi, useSession } from "@nw/features";
import type { StoryBoard, StoryBoardEvent } from "@nw/types";
import { wsrvImage } from "@nw/utils/image";
import { StyleSheet, View } from "react-native";
import { FallbackArt } from "@/components/fallback-art";
import { Image } from "@/components/image";
import { PreviewText, ShareSheet } from "@/components/share/share-sheet";
import { env } from "@/lib/env";
import { radius, useAppTheme } from "@/theme";

/**
 * Web's `ShareStoryDialog` and `ShareChapterDialog`, as trays.
 *
 * The two are one component because web's two dialogs are the same dialog
 * with a cover and a different endpoint; what a chapter adds is the story it
 * belongs to, which the embed names.
 */

/** A story cover is 2:3; the preview's is 40pt wide. */
const COVER = { fit: "inside" as const, h: 180, w: 120 };

/** Web's `ROUTES.Story.View` and `ROUTES.Story.Event.View`. */
const storyUrl = (storyId: string) => `${env.WEB_URL}/rp/story/${storyId}`;
const chapterUrl = (eventId: string) =>
  `${env.WEB_URL}/rp/story/event/${eventId}`;

const Cover = ({
  name,
  src,
}: {
  name: string;
  src: string | null | undefined;
}) => {
  const theme = useAppTheme();
  const uri = src ? wsrvImage(src, COVER) : null;
  return (
    <View
      style={[
        styles.cover,
        {
          backgroundColor: theme.material.fillPressed,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {uri ? (
        <Image
          contentFit="cover"
          source={{ uri }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <FallbackArt kind="story" seed={name} style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
};

/** The fandom's display name, or nothing for a fandomless story — web's rule. */
const fandomName = (story: StoryBoard): string | null =>
  story.fandom?.id && story.fandom.id !== "FANDOMLESS"
    ? story.fandom.name || story.fandom.id.replaceAll("_", " ")
    : null;

export const ShareStorySheet = ({
  onClose,
  story,
  visible,
}: {
  onClose: () => void;
  story: StoryBoard;
  visible: boolean;
}) => {
  const api = useApi();
  const { novelist } = useSession();

  const url = story.id ? storyUrl(story.id) : "";
  const fandom = fandomName(story);
  const genres = (story.genres ?? []).map((genre) => genre.label);

  const share = () =>
    shareStoryToDiscord(api, {
      novelistUsername: novelist?.username ?? "",
      story: {
        coverSrc: story.avatar?.src ?? null,
        createdBy: story.createdBy
          ? {
              firstName: story.createdBy.firstName,
              id: story.createdBy.id,
              image: story.createdBy.image,
              lastName: story.createdBy.lastName,
              username: story.createdBy.username,
            }
          : null,
        description: story.description ?? null,
        fandomName: fandom,
        genres,
        image: story.image,
        isPublic: story.isPublic,
        name: story.name,
      },
      storyUrl: url,
    });

  return (
    <ShareSheet
      copyLabel="Copy story link"
      nativeTitle={story.name}
      onClose={onClose}
      preview={
        <>
          <Cover name={story.name} src={story.avatar?.src || story.image} />
          <PreviewText
            line={[fandom, ...genres].filter(Boolean).join(" · ") || null}
            name={story.name}
          />
        </>
      }
      share={share}
      subtitle="Post this story to the NW Discord community."
      successBody={`${story.name} is now live in the NW Community channel.`}
      title="Share story"
      url={url}
      visible={visible}
    />
  );
};

export const ShareChapterSheet = ({
  chapter,
  onClose,
  story,
  visible,
}: {
  chapter: StoryBoardEvent;
  onClose: () => void;
  /** The story the chapter belongs to, when it has loaded. */
  story: StoryBoard | null | undefined;
  visible: boolean;
}) => {
  const api = useApi();
  const { novelist } = useSession();

  const url = chapter.id ? chapterUrl(chapter.id) : "";
  const storyName = story?.name ?? "";

  const share = () =>
    shareChapterToDiscord(api, {
      chapter: {
        coverSrc: chapter.avatar?.src ?? null,
        description: chapter.description,
        image: chapter.image,
        name: chapter.name,
        storyBoardId: chapter.storyBoardId,
        storyBoardName: storyName,
      },
      chapterUrl: url,
      novelistUsername: novelist?.username ?? "",
    });

  return (
    <ShareSheet
      copyLabel="Copy chapter link"
      nativeTitle={chapter.name}
      onClose={onClose}
      preview={
        <>
          <Cover
            name={chapter.name}
            src={chapter.avatar?.src || chapter.image || story?.image}
          />
          <PreviewText line={storyName || null} name={chapter.name} />
        </>
      }
      share={share}
      subtitle="Post this chapter to the NW Discord community."
      successBody={`${chapter.name} is now live in the NW Community channel.`}
      title="Share chapter"
      url={url}
      visible={visible}
    />
  );
};

const styles = StyleSheet.create({
  cover: {
    aspectRatio: 2 / 3,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    width: 40,
  },
});
