import { useApi, useChatCrypto } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import { getStore } from "@/lib/local-store";
import { hydrateThread } from "@/lib/local-store/chat";
import { reconcileInbox, reconcileThread } from "@/lib/local-store/sync-chat";

/**
 * Runs the inbox reconcile each time the screen is in front, and again when
 * the app returns to the foreground while it is. See `sync-chat.ts` for what
 * a reconcile is; with no local store open (a build without SQLCipher, a
 * failed open) there is nothing to reconcile and the hooks fetch as before.
 */
export const useReconcileInbox = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const run = useCallback(() => {
    const store = getStore();
    if (!store) return;
    void reconcileInbox(store, queryClient, api).catch(() => {});
  }, [api, queryClient]);

  useFocusEffect(
    useCallback(() => {
      run();
      const subscription = AppState.addEventListener("change", (next) => {
        if (next === "active") run();
      });
      return () => subscription.remove();
    }, [run]),
  );
};

/** The thread's reconcile, once per open and on each return to the foreground. */
export const useReconcileThread = (conversationId: string | undefined) => {
  const api = useApi();
  const crypto = useChatCrypto();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const run = () => {
      const store = getStore();
      if (!store) return;
      void reconcileThread(store, queryClient, api, crypto, conversationId).catch(
        () => {},
      );
    };
    // The file's copy first — a thread outside the recent few is not in the
    // cache yet — then what changed since.
    const store = getStore();
    if (store) {
      void hydrateThread(store, queryClient, conversationId)
        .catch(() => {})
        .finally(run);
    } else {
      run();
    }
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") run();
    });
    return () => subscription.remove();
  }, [api, conversationId, crypto, queryClient]);
};
