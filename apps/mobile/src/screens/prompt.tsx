import { getPrompt } from "@nw/api/endpoints/prompt";
import { queryKeys, useApi } from "@nw/features";
import type { Prompt } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { PromptCard } from "@/components/feed/prompt-card";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { PromptCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePromptFeedActions } from "@/hooks/use-prompt-feed-actions";
import { findCached } from "@/lib/cache-seed";
import { space, useAppTheme } from "@/theme";

/** A prompt as the feeds hold it — a comment has `source` too, but no count of comments. */
const isPrompt = (value: Record<string, unknown>) =>
  "commentCount" in value && "source" in value && "privacy" in value;

/**
 * One prompt, on its own — web's `/rp/prompt/:id`.
 *
 * An activity about a prompt, a comment or a reply points at the *prompt's*
 * id (see `activity/box.tsx`), and until now nothing on this client could open
 * a prompt by its id: the thread screen takes a comment id. This is that
 * page: the same card the feeds draw, with its comments open, and every
 * action a feed card has — the heart, a reply, the menu — through the same
 * shared hook, so a heart given here is written into the feed caches too.
 *
 * Registered as a shared route in every tab that draws an activity card, so
 * the reader stays in the tab they came from.
 *
 * The card is drawn from any feed that already holds the prompt — Explore, a
 * novelist's or a character's prompts, the thread a comment belongs to — while
 * the page's own request confirms it. Opened cold, it is a ghost card rather
 * than a spinner. See `lib/cache-seed.ts`.
 */
export const PromptScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const { promptId } = useLocalSearchParams<{ promptId: string }>();

  const query = useQuery({
    enabled: Boolean(promptId),
    placeholderData: () =>
      promptId
        ? findCached(
            queryClient,
            [["explore"], ["novelist"], ["muse"], ["thread"]],
            (entity): Prompt | undefined => {
              if (entity.id === promptId && isPrompt(entity)) {
                return entity as unknown as Prompt;
              }
              // A thread's head carries the prompt it hangs off.
              const parent = entity.prompt as Record<string, unknown> | null;
              return parent && parent.id === promptId && isPrompt(parent)
                ? (parent as unknown as Prompt)
                : undefined;
            },
          )
        : undefined,
    queryFn: async (): Promise<Prompt | null> => {
      const result = await getPrompt(api, promptId ?? "");
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.prompt(promptId ?? ""),
  });

  const actions = usePromptFeedActions();
  const { cardProps, expandedIds, unfoldedIds } = actions;
  const prompt = query.data ?? null;

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  return (
    <View style={styles.fill}>
      <ScrollView {...tabBarScroll} contentContainerStyle={contentStyle}>
        {prompt ? (
          <PromptCard
            {...cardProps}
            // Open by default — the reader came for the conversation — and a
            // tap on the count folds it, which is the toggle inverted.
            expanded={!expandedIds.has(prompt.id)}
            prompt={prompt}
            unfolded={unfoldedIds.has(prompt.id)}
          />
        ) : (
          <ListStatus
            empty={
              <EmptyScene
                aside="(Or the link is wrong. Prompts rarely leave a forwarding address.)"
                scene="torn-thread"
                subtitle="It was meant to enter stage left. Instead it left the stage, the building, and quite possibly the genre."
                title="This prompt missed its cue"
              />
            }
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
            skeleton={<PromptCardSkeleton />}
          />
        )}
      </ScrollView>

      {actions.sheets}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: space.md },
  fill: { flex: 1 },
});
