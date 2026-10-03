import {
  createGroup,
  getConversationByUsername,
  getGroupCount,
} from "@nw/api/endpoints/conversations";
import { SUPPORT_USERNAME } from "@nw/chat";
import { queryKeys, useApi } from "@nw/features";
import type { Conversation } from "@nw/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * The two things the inbox can do besides open a conversation.
 *
 * Called directly against `@nw/api` rather than through a hook in
 * `@nw/features`, which is the rule that package sets for itself: every hook
 * there has to have a real consumer in *both* clients, and web reaches these
 * endpoints through its own server actions. A hook there with one caller would
 * be a guess about what web needs rather than a contract.
 */

/**
 * How many groups this novelist is already in.
 *
 * Fetched rather than derived from the conversation list: the list is paged, so
 * counting groups in it would undercount for anyone past page one — and the
 * number gates a create, so undercounting means offering a button the server
 * will refuse.
 */
export const useGroupCount = () => {
  const api = useApi();

  const query = useQuery({
    queryFn: async (): Promise<number | null> => {
      const result = await getGroupCount(api);
      return typeof result === "number" ? result : null;
    },
    queryKey: queryKeys.groupCount(),
    // The count only moves when this person creates or leaves a group, both of
    // which invalidate it explicitly. Re-asking on every focus is a request per
    // visit for a number that has not changed.
    staleTime: 5 * 60_000,
  });

  return { count: query.data ?? null, isPending: query.isPending };
};

export const useCreateGroup = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      participantIds: string[];
    }): Promise<Conversation> => {
      const result = await createGroup(
        api,
        input.name.trim(),
        input.participantIds,
      );
      if (!result || "message" in result) {
        throw new Error("Group could not be created.");
      }
      return result;
    },
    onSuccess: () => {
      // Both, and for different reasons: the list has a new row in it, and the
      // count that gates the next create is now one higher.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupCount() });
    },
  });
};

/**
 * Opens the conversation with the support account, creating nothing.
 *
 * Support is an ordinary novelist, so this is the same `byUsername` lookup any
 * other profile would use. It can come back empty — the account may not exist
 * in a given environment — and the caller has to say so rather than navigating
 * to an id it does not have.
 */
export const useSupportConversation = () => {
  const api = useApi();

  return useMutation({
    mutationFn: async (): Promise<Conversation | null> => {
      const result = await getConversationByUsername(api, SUPPORT_USERNAME);
      if (!result || "message" in result) return null;
      return result;
    },
  });
};
