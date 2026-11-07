import { useChatCrypto, useSession } from "@nw/features";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useChatSocket } from "@/context/socket";
import { useOpenConversation } from "@/hooks/use-connection";

/**
 * "Ask about this": opens the DM with the writer, drops the headcanon's link
 * in as the first message — the chat unfurls it — and takes the reader there
 * to say what they wanted to say. Web's `useAskAbout`.
 *
 * Sent the way every share is: encrypted for the conversation, over the
 * socket. DMs need no friendship, only no block; the server answers a block
 * with an error and nothing is sent.
 */
export const useAskAbout = () => {
  const router = useRouter();
  const crypto = useChatCrypto();
  const { novelist } = useSession();
  const { isConnected, sendMessage } = useChatSocket();
  const openConversation = useOpenConversation();
  const [asking, setAsking] = useState(false);

  const ask = async (
    writer: { id: string; username: string },
    url: string,
  ): Promise<boolean> => {
    if (asking) return false;
    if (!isConnected) {
      Alert.alert("Not connected", "Please wait a moment and try again.");
      return false;
    }
    setAsking(true);
    try {
      const conversationId = await openConversation.mutateAsync(writer);
      if (!conversationId) {
        Alert.alert("No conversation", "The chat could not be opened.");
        return false;
      }
      const wire = await crypto.encryptMessageText(conversationId, url);
      const accepted = sendMessage({
        attachments: null,
        conversationId,
        message: wire,
        repliedTo: null,
        sender: {
          id: novelist?.id ?? "",
          image: novelist?.image ?? null,
          messageSourceType: "NOVELIST",
          name:
            `${novelist?.firstName ?? ""} ${novelist?.lastName ?? ""}`.trim() ||
            novelist?.username ||
            "",
          // Overwritten by the server from the authenticated connection.
          username: novelist?.username ?? "",
        },
        type: "TEXT",
      });
      if (!accepted) {
        Alert.alert("Not sent", "Please try again.");
        return false;
      }
      router.push({
        params: { conversationId },
        pathname: "/(tabs)/(inbox)/[conversationId]",
      });
      return true;
    } catch {
      Alert.alert("Not sent", "Please try again.");
      return false;
    } finally {
      setAsking(false);
    }
  };

  return { ask, asking };
};
