import { useFocusEffect } from "expo-router";
import { useCallback, useLayoutEffect, useRef } from "react";
import { useTabBarChrome } from "@/context/tab-bar";

/**
 * Hides the bottom tab bar while this screen is focused.
 *
 * A conversation is a full-screen surface: the tab bar under it costs a row of
 * messages, and it sits between the composer and the keyboard — the input lifts
 * by the keyboard's height while the bar keeps its own, leaving a gap the size
 * of the bar.
 *
 * ## While focused, not while mounted
 *
 * A screen pushed on top of this one — the novelist behind a character, from
 * the byline or the "Penned by" chip — leaves this one mounted underneath, so
 * a hide that lasted for the mount left the bar missing on a screen that
 * wanted it. The hide is tied to focus instead: it goes when this screen
 * blurs and comes back when it is returned to. A character opened from a
 * character hides it again on its own focus.
 *
 * ## Before the first paint
 *
 * The focus event arrives a beat after the screen mounts, and on a phone that
 * beat was visible: the conversation slid in with the tab bar still drawn
 * over its composer, then the bar vanished and the composer popped into view.
 * So the first hold is taken in a layout effect — before anything is painted
 * — and handed over to the focus hold when that arrives. `release()` lets the
 * screen give the bar back *early*, as it starts to slide away, rather than
 * after the pop; the bar then comes back under the departing page instead of
 * appearing on an already-empty list.
 *
 * ## Through the bar's own context, not `setOptions`
 *
 * The first version walked up to the tab navigator and wrote `display: "none"`
 * into `tabBarStyle`, then wrote the style back on blur. That stopped working
 * the day the conversation became a `transparentModal` with the stack's
 * animation off: the write-back from the closing screen's cleanup never
 * reached the bar. The bar already reads `TabBarChromeContext`, which sits
 * above `<Tabs>` and so above every screen; a hold on that is one store
 * update that commits synchronously (see the context for why that matters).
 * Counted, not toggled, so a hidden screen pushed over a hidden screen (a
 * conversation's details) keeps the bar away until both are gone.
 */
export const useHideTabBar = () => {
  const { hide } = useTabBarChrome();
  const hold = useRef<(() => void) | null>(null);

  const take = useCallback(() => {
    if (!hold.current) hold.current = hide();
  }, [hide]);

  const release = useCallback(() => {
    hold.current?.();
    hold.current = null;
  }, []);

  // Mount: gone before the first frame. Unmount: whatever is left goes.
  useLayoutEffect(() => {
    take();
    return release;
  }, [release, take]);

  // Focus: the hold that follows the screen in and out of view.
  useFocusEffect(
    useCallback(() => {
      take();
      return release;
    }, [release, take]),
  );

  return { release };
};
