import { updateMuse } from "@nw/api/endpoints/muse";
import { queryKeys, useApi } from "@nw/features";
import type { CreateUpdateMuse, Fandom, Muse } from "@nw/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Writing a character from inside the ice-breaker sheets.
 *
 * Both sheets ask "who is sending this?" and offer the novelist plus every muse
 * they have penned. A novelist with none has one answer to a question phrased
 * as a choice, and the whole point of an ice breaker — leaving a line as one of
 * your characters — is unreachable until they leave the sheet, find the muse
 * screen, and come back. Web solves that with a name field beside the faces
 * (`quick-add-muse.tsx`); this is the same, for the same reason.
 *
 * The muse is fandomless and otherwise empty: a name is all the flow asks for,
 * and everything else is editable later on the muse's own page.
 */
const emptyMuse = (firstName: string): CreateUpdateMuse => ({
  accent: null,
  cardBackground: null,
  connections: [],
  extraAttributes: null,
  // Web casts the same literal: the field is typed as the populated fandom
  // object the API returns, while creating one takes its name.
  fandom: "FANDOMLESS" as unknown as Fandom,
  firstName,
  image: null,
  lastName: "",
  nicknames: [],
  note: null,
  privacy: "PUBLIC",
  song: null,
  story: null,
  tags: null,
  useAccent: false,
  useExtraImages: false,
  video: null,
  wallpaper: null,
});

export const useQuickAddMuse = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<Muse> => {
      const result = await updateMuse(api, null, emptyMuse(name.trim()));

      /*
       * Success is "there is an id", not "there is no message".
       *
       * `updateMuse` returns the muse with `message: undefined` spread onto it,
       * so `"message" in result` is true either way — the key exists, holding
       * undefined. Web gets away with that check because its server action
       * serialises the result to JSON on the way back, which drops undefined
       * keys; there is no such boundary here, and the same check would report
       * every successful create as a failure.
       */
      if (!("id" in result) || !result.id) {
        throw new Error("The character could not be created.");
      }

      return result;
    },
    // The novelist — and so `novelist.muses`, which is what both sender
    // pickers read — comes from the session query.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
};
