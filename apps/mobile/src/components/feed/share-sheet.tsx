import { sharePromptToDiscord } from "@nw/api/endpoints/community";
import { useApi, useSession } from "@nw/features";
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Prompt } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import { useMemo } from "react";
import { View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Image } from "@/components/image";
import {
  PreviewText,
  ShareSheet as ShareTray,
  shareStyles,
} from "@/components/share/share-sheet";
import { Text } from "@/components/text";
import { env } from "@/lib/env";
import { useAppTheme } from "@/theme";

/**
 * Web's `SharePromptDialog` — already a tray on a phone there, and a tray
 * here, on the shared `ShareSheet` base that the profile, muse and story
 * trays also stand on.
 *
 * The link is the web one — a prompt opens in a browser, not in this app,
 * until there is a route for it to land on.
 *
 * The excerpt is `richTextToPlainText` over the parsed body rather than web's
 * regex over the HTML: same words, and the one parser rather than a second
 * opinion about what a `<br>` is worth.
 */

/** Web's `ROUTES.Prompt.View`. */
const promptUrl = (promptId: string) => `${env.WEB_URL}/rp/prompt/${promptId}`;

export const ShareSheet = ({
  onClose,
  prompt,
}: {
  onClose: () => void;
  /** Null closes the sheet. */
  prompt: Prompt | null;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const { novelist } = useSession();

  const url = prompt ? promptUrl(prompt.id) : "";
  const excerpt = useMemo(
    () =>
      prompt
        ? richTextToPlainText(parseRichText(prompt.text)).slice(0, 200)
        : "",
    [prompt],
  );

  const share = () =>
    prompt
      ? sharePromptToDiscord(api, {
          novelistUsername: novelist?.username ?? "",
          prompt: {
            createdOn: prompt.createdOn,
            media: prompt.media,
            source: prompt.source,
            text: prompt.text,
          },
          promptUrl: url,
        })
      : Promise.resolve(null);

  return (
    <ShareTray
      copyLabel="Copy prompt link"
      nativeTitle={prompt ? `Prompt by ${prompt.source.name}` : "Prompt"}
      onClose={onClose}
      preview={
        prompt ? (
          <>
            <Avatar
              name={prompt.source.name}
              size={36}
              image={prompt.source.avatar}
              uri={prompt.source.avatar?.src ?? prompt.source.image}
            />
            <PreviewText name={prompt.source.name}>
              <View style={shareStyles.previewMeta}>
                <Text
                  style={[shareStyles.previewDate, { color: theme.textGray }]}
                >
                  {toFormattedDate(prompt.createdOn)}
                </Text>
              </View>
              {excerpt ? (
                <Text
                  numberOfLines={3}
                  style={[shareStyles.previewBody, { color: theme.textGray }]}
                >
                  {excerpt}
                </Text>
              ) : null}
            </PreviewText>
            {prompt.media && !prompt.media.toLowerCase().endsWith("mp4") ? (
              <Image
                contentFit="cover"
                source={{ uri: prompt.media }}
                style={shareStyles.thumb}
              />
            ) : null}
          </>
        ) : null
      }
      share={share}
      subtitle="Send it to a chat or Discord, or copy its link."
      successBody="The prompt is now live in the NW Community channel."
      title="Share prompt"
      url={url}
      visible={prompt !== null}
    />
  );
};
