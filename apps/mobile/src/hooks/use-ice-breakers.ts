import {
  createConversationIfNotExist,
  createIceBreaker,
  deleteIceBreaker,
  getIceBreakers,
} from "@nw/api/endpoints/conversations";
import { useApi, useChatCrypto, useSession } from "@nw/features";
import type { IceBreaker, PromptSource } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useChatSocket } from "@/context/socket";

/**
 * Reading, writing and answering ice breakers.
 *
 * Kept in the app rather than `@nw/features` for the reason that package states
 * about itself: a hook there needs a real consumer in both clients, and web
 * reaches these endpoints through its own server actions.
 */

/** Not in `queryKeys` for the same reason `groupCount` is not: nothing in the
 *  conversation cache should invalidate this, and vice versa. */
const ICE_BREAKERS_KEY = ["ice-breakers"] as const;

export const useIceBreakers = () => {
  const api = useApi();

  const query = useQuery({
    queryFn: async (): Promise<IceBreaker[]> => {
      const result = await getIceBreakers(api);
      if (!result || "message" in result) return [];
      return result;
    },
    queryKey: ICE_BREAKERS_KEY,
    // A rail of other people's prompts is not something anyone watches change.
    staleTime: 2 * 60_000,
  });

  return {
    iceBreakers: query.data ?? [],
    isPending: query.isPending,
    refetch: () => {
      void query.refetch();
    },
  };
};

export const useCreateIceBreaker = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      color: string | null;
      message: string;
      source: PromptSource;
    }) => {
      const result = await createIceBreaker(
        api,
        input.source.sourceId,
        input.source.sourceType,
        input.message.trim(),
        input.color,
      );
      if (result.message !== API_MESSAGE.Success) {
        throw new Error("Ice breaker could not be created.");
      }
    },
    // Refetched rather than appended: the server assigns `createdOn` and echoes
    // the source back in full, and inventing either here is how the rail ends
    // up showing a card that differs from the one everyone else sees.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ICE_BREAKERS_KEY });
    },
  });
};

export const useDeleteIceBreaker = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    // The *source* id, not an ice breaker id: a source has at most one, which
    // is also why creating a second one replaces the first.
    mutationFn: async (sourceId: string) => {
      const result = await deleteIceBreaker(api, sourceId);
      if (result.message !== API_MESSAGE.Success) {
        throw new Error("Ice breaker could not be deleted.");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ICE_BREAKERS_KEY });
    },
  });
};

/**
 * Answering someone's ice breaker.
 *
 * Three steps that have to happen in order, which is why they are one hook
 * rather than three calls at a call site:
 *
 *  1. **Resolve the conversation.** `createIfNotExist` against the ice
 *     breaker's *owner* — not its source. A muse's ice breaker is answered to
 *     the novelist who penned them, because a muse has no inbox.
 *  2. **Encrypt.** The same `encryptMessageText` every other outgoing message
 *     goes through, so a reply is not the one plaintext row in the table.
 *  3. **Send it tagged.** `repliedTo: { type: "ICE_BREAKER" }`, which is what
 *     makes the conversation open with the prompt quoted above the answer
 *     rather than as a message out of nowhere.
 *
 * Socket-only, and deliberately: the REST send takes a body and nothing else,
 * so a fallback would drop the tag and post the reply as an unexplained opener.
 * Returns the conversation id so the caller can navigate to it.
 */
export const useReplyToIceBreaker = () => {
  const api = useApi();
  const crypto = useChatCrypto();
  const queryClient = useQueryClient();
  const { novelist } = useSession();
  const { isConnected, sendMessage } = useChatSocket();

  return useCallback(
    async (input: {
      iceBreaker: IceBreaker;
      message: string;
      source: PromptSource;
    }): Promise<string | null> => {
      const text = input.message.trim();
      if (!text || !isConnected) return null;

      const conversation = await createConversationIfNotExist(
        api,
        input.iceBreaker.ownerNovelistId,
      ).catch(() => null);

      if (!conversation || "message" in conversation) return null;

      const wire = await crypto.encryptMessageText(conversation.id, text);
      const accepted = sendMessage({
        attachments: null,
        conversationId: conversation.id,
        message: wire,
        repliedTo: { id: input.iceBreaker.sourceId, type: "ICE_BREAKER" },
        sender: {
          id: input.source.sourceId,
          image: input.source.image || null,
          messageSourceType: input.source.sourceType,
          name: input.source.name,
          // Overwritten by the server from the authenticated connection.
          username: novelist?.username ?? "",
        },
        type: "TEXT",
      });
      if (!accepted) return null;

      // The conversation is new to the list whenever this created it.
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return conversation.id;
    },
    [api, crypto, isConnected, novelist?.username, queryClient, sendMessage],
  );
};
