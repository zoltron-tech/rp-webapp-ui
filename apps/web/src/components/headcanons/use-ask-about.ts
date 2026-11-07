"use client";

import { useState } from "react";
import { createConversationIfNotExistAction } from "@/app/rp/conversations/actions";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { ROUTES } from "@/utils/constants/routes";
import { encryptMessageText } from "@/utils/e2e-crypto";

/**
 * "Ask about this": opens the DM with the writer, drops the headcanon's link
 * in as the first message — the chat unfurls it into the card — and takes
 * the reader there to say what they wanted to say.
 *
 * Sent the way every share is: encrypted for the conversation, over the
 * socket the app already holds. DMs need no friendship, only no block; the
 * server answers a block with an error and nothing is sent.
 */
export const useAskAbout = () => {
  const { isConnected, socket } = useSocket();
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const { routeToPage } = usePageRouter();
  const { errorToast } = useUIContext();
  const [asking, setAsking] = useState(false);

  const ask = async (
    ownerNovelistId: string,
    url: string,
  ): Promise<boolean> => {
    if (asking) return false;
    if (!socket || !isConnected) {
      errorToast("Not connected to chat. Wait a moment and try again.");
      return false;
    }
    setAsking(true);
    try {
      const conversation =
        await createConversationIfNotExistAction(ownerNovelistId);
      if (!conversation || "message" in conversation) {
        errorToast("Couldn't open the chat. Please try again.");
        return false;
      }
      socket.send(
        JSON.stringify({
          payload: {
            attachments: null,
            conversationId: conversation.id,
            message: await encryptMessageText(conversation.id, url),
            repliedTo: null,
            sender: {
              id: novelist?.id ?? "",
              image: novelist?.image ?? null,
              messageSourceType: "NOVELIST",
              name:
                `${novelist?.firstName ?? ""} ${novelist?.lastName ?? ""}`.trim() ||
                user?.username ||
                "",
              username: user?.username ?? "",
            },
            type: "TEXT",
          },
          type: "message",
        }),
      );
      routeToPage(ROUTES.Conversation.View(conversation.id));
      return true;
    } catch {
      errorToast("Couldn't send it. Please try again.");
      return false;
    } finally {
      setAsking(false);
    }
  };

  return { ask, asking };
};
