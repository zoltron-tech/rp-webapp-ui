import {
  type NavigationProp,
  type ParamListBase,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { type RefObject, useEffect } from "react";

/**
 * Tapping the tab you are already on takes it back to the top.
 *
 * The gesture every feed on a phone has — Instagram, X, Reddit — and the one
 * place a tab press means something other than "go there". The bar emits
 * `tabPress` on every tap, the focused tab included (see
 * `components/tab-bar.tsx`), so this is only a matter of listening.
 *
 * **It scrolls and nothing else.** It used to refetch on the way up as well,
 * which is what several of those apps do — and it is wrong here: the rows the
 * reader was just looking at are replaced under them by the time they arrive
 * at the top, and a feed whose order the server decides comes back different.
 * Pull-to-refresh is the gesture that asks for new rows, and it is right there
 * once this has arrived.
 *
 * React Navigation ships `useScrollToTop`, which is this; it is written out
 * here because its two guards are load-bearing and worth stating:
 *
 *  - **Focused only.** Every screen of every tab hears every tab's press.
 *  - **First route of the stack only.** A profile pushed over the feed is
 *    inside the tab, so it hears the press too — and answering it would scroll
 *    a list the reader cannot see, then hand them a feed that has moved when
 *    they come back.
 */

/** What this needs of a list. `FlatList` and `FlashList` both have it. */
interface Scrollable {
  scrollToOffset: (options: { animated?: boolean; offset: number }) => void;
}

export const useTabTop = (ref: RefObject<Scrollable | null>) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();

  useEffect(() => {
    const tabs: NavigationProp<ParamListBase>[] = [];
    let current: NavigationProp<ParamListBase> | undefined = navigation;
    while (current) {
      if (current.getState()?.type === "tab") tabs.push(current);
      current = current.getParent();
    }
    if (tabs.length === 0) return;

    const unsubscribe = tabs.map((tab) =>
      // `tabPress` is a bottom-tabs event; the base navigation type does not
      // know it, and importing the tab types here to say so would pull the
      // navigator into every screen that scrolls.
      // @ts-expect-error -- see above
      tab.addListener("tabPress", (event: { defaultPrevented: boolean }) => {
        // A frame later, as React Navigation's own hook does it: every other
        // listener has run by then, so `defaultPrevented` is final.
        requestAnimationFrame(() => {
          if (event.defaultPrevented) return;
          if (!navigation.isFocused()) return;
          const state = navigation.getState();
          const isFirst =
            tabs.includes(navigation) || state?.routes[0]?.key === route.key;
          if (!isFirst) return;

          ref.current?.scrollToOffset({ animated: true, offset: 0 });
        });
      }),
    );

    return () => {
      for (const off of unsubscribe) off();
    };
  }, [navigation, ref, route.key]);
};
