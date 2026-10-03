import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassSurface, getGlassTier } from "@/components/glass-surface";
import {
  BAR_GAP_TOP,
  BAR_HEIGHT,
  BAR_INSET_X,
  barMetrics,
  LABEL_LIFT,
  PILL_HEIGHT,
  PILL_WIDTH,
  SCRIM_RISE,
  tabWidth,
  useTabBarChrome,
} from "@/context/tab-bar";
import { useA11ySettings } from "@/lib/a11y-settings";
import { radius, useAppTheme } from "@/theme";

/**
 * The bottom bar.
 *
 * React Navigation's own bar is a strip of icons with labels under them and a
 * hairline along the top — the platform default, and it looked like one. This
 * replaces it with a floating capsule: a rounded bar clear of the screen edges,
 * with a single accent lozenge that *slides* to whichever tab you tapped.
 *
 * ## Why the highlight moves instead of appearing
 *
 * With a static highlight, switching tabs is two events — one thing turns off,
 * another turns on — and nothing connects them. A lozenge that travels is one
 * event, and it carries the eye to where the new screen is about to come from.
 * It also makes a mis-tap obvious mid-flight, which a blink cannot.
 *
 * ## It floats over the screens
 *
 * The bar is `position: "absolute"`, so it takes no space in the navigator's
 * column and the scene behind it is the full height of the display. Content
 * therefore passes *under* it rather than stopping above it, which is what the
 * shape was always claiming — a capsule lifted off the screen with a hard edge
 * of page directly beneath it is a capsule drawn on a strip, not one floating.
 *
 * Two things make that readable rather than messy:
 *
 *  - **The bar is glass.** `GlassSurface` draws the capsule: Liquid Glass on
 *    iOS 26, a system chrome material on earlier iOS, and on Android a
 *    near-opaque fill with no blur (`GLASS_FILL.unblurred.bar`, 0.9 — the
 *    number a white shirt in a photo set). Reduce Transparency and Increase
 *    Contrast make it solid. The iOS tiers have not been seen on a device yet.
 *  - **A scrim above it.** Content fades into the page colour on its way to the
 *    bar instead of sliding under a hard boundary. It reaches `SCRIM_RISE`
 *    above the bar's top edge, which is enough for a row of text to thin out
 *    across.
 *
 * What pays for that is `useTabBarInset`: every scrollable under the tabs pads
 * its foot by the bar's full height, so nothing is *stranded* behind the bar
 * even though everything passes behind it.
 *
 * ## Three layers, and only one of them is laid out
 *
 * The box (`styles.box`) is a constant: one height, one width, laid out once
 * and never again. Inside it, drawn back to front:
 *
 *  1. **the surface** — the capsule itself, an `absoluteFill` view carrying the
 *     fill, the border and the shadow. It is the only thing that changes shape
 *     between the bar's two sizes, and it does it with `scaleY`;
 *  2. **the lozenge**, in a slot that travels across the columns;
 *  3. **the icon row**, a flex row of equal columns.
 *
 * Nothing in that list animates a layout property. The earlier version animated
 * the bar's `height` and its side inset — both layout, both therefore on the JS
 * driver — while the lozenge and the icons moved on the native one. Two clocks
 * for one movement, and during a scroll (which is when the collapse happens)
 * the JS one was the slow one: film of it shows the lozenge floating inside a
 * bar still at its old height, the two catching up with each other at the end.
 * Everything now interpolates from a single native value — see the note in
 * `context/tab-bar.tsx`.
 *
 * ## The two sizes
 *
 * Scrolling down shrinks the bar, scrolling up or tapping a tab restores it.
 * Compact is shorter, sits nearer the bottom of the display, and carries a
 * smaller lozenge and smaller icons. `barMetrics` derives all of it — a scale
 * for the surface, one `drop` shared by the surface, the row and the lozenge,
 * and a scale each for the lozenge and the icons — from the same 0…1, so the
 * two states are one movement rather than four that happen to agree.
 *
 * Icons scale rather than resize because `size` is a number handed to a font
 * glyph and cannot be interpolated; 0.84 of an already-drawn glyph invents no
 * detail, which is the forgiving direction.
 *
 * ## Nothing is measured
 *
 * There is no `onLayout` here. The bar's width is the window less its inset on
 * each side, and both are known — `tabWidth` does the arithmetic — so the
 * lozenge is in the right place on the first frame rather than one frame later.
 *
 * ## What is animated, and what that costs
 *
 * One `Animated.Value` holds the *fractional* tab index and a spring drives it.
 * Everything about the lozenge's travel reads from it:
 *
 *  - the lozenge's `translateX`, as the index multiplied by a column's width;
 *  - each icon's scale, peaking at its own index;
 *  - the crossfade between the outline and filled icon, so the artwork fills as
 *    the lozenge arrives rather than switching under it.
 *
 * All of it is transforms and opacities, so all of it runs on the native
 * driver — no JS frame is involved, which is why it survives a tab whose screen
 * is doing real work on mount. Colour is deliberately not animated:
 * `useNativeDriver` cannot interpolate one, and driving a colour from JS while
 * a screen mounts is exactly when the frames are not there. The crossfade gets
 * the same effect out of two icons and an opacity.
 *
 * Every animated node either animation reads is built inside one `useMemo`.
 * `interpolate` constructs a node rather than reading a value, and each node
 * has a counterpart inside the native animated module — so building them inline
 * in the style arrays meant the bar's native graph was torn down and rebuilt
 * whenever this component happened to re-render, which is whenever the inbox
 * badge changes or the profile avatar loads. Both of those happen while the
 * reader is scrolling.
 *
 * ## Labels
 *
 * A one-word label under each icon, as the platform expects ("Include tab labels
 * to help with navigation" — HIG, Tab bars). Six tabs leave about 57pt a column
 * at the 375pt baseline, so the long titles get short labels (`tabBarLabel`:
 * Interactions → Threads, Notifications → Alerts) while `accessibilityLabel`
 * keeps the full title. Labels are capped at 1.2× text scaling — people who
 * enlarge text want the content bigger, not the tab titles (HIG, Typography).
 *
 * When the bar goes compact while reading, the labels fade and the icons settle
 * back to the centre, the same minimise-on-scroll the system tab bar does.
 */

/** How far the active icon swells. Enough to notice, not enough to jump. */
const ACTIVE_SCALE = 1.12;

/** Tab titles barely need to grow with text size; content does. */
const LABEL_MAX_SCALE = 1.2;

/** Vertical reach added to each tab: 24dp measured + 12 + 12 = 48dp. */
const TAB_HIT_SLOP = { bottom: 12, top: 12 } as const;

/** How far a tab gives under the thumb. The only feedback before the screen. */
const PRESS_SCALE = 0.88;
const PRESS_IN_MS = 90;
const PRESS_OUT_MS = 160;

/**
 * How much page colour the fade above the bar reaches.
 *
 * Where the bar does not blur (Android, or glass switched off by a setting) the
 * fade does all of the separating, so it goes nearly to the page. Where it does
 * blur, the blur thins content out on its own and a heavy fade on top would
 * hide what the glass is there to show — so it is lighter. The blurred number
 * is a starting value that has not been checked on an iPhone.
 */
const SCRIM_ALPHA = 0.9;
const SCRIM_ALPHA_BLURRED = 0.6;

/**
 * `#rrggbb` with an alpha channel.
 *
 * Both themes state every colour as a six-digit hex (`packages/theme`'s scales
 * and `THEME_LIGHT`/`THEME_DARK` alike), so this handles that one shape and
 * returns anything else untouched rather than producing a colour string the
 * platform will silently drop.
 */
const withAlpha = (hex: string, alpha: number): string => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${channel}`;
};

/**
 * One column: the two artworks crossfading, the badge, and the press.
 *
 * Its own component so that a press — which is state, and therefore a render —
 * re-renders one column rather than the bar. The bar's own re-renders are the
 * expensive ones: they rebuild every animated node in the `useMemo` below.
 */
const Tab = memo(
  ({
    badge,
    collapseScale,
    icon,
    iconLift,
    label,
    labelOpacity,
    nearness,
    onLongPress,
    onPress,
    selected,
    shortLabel,
    theme,
  }: {
    badge?: number | string;
    /** The icon scale that belongs to the bar's size. */
    collapseScale: Animated.AnimatedInterpolation<number>;
    icon: BottomTabBarProps["descriptors"][string]["options"]["tabBarIcon"];
    /** The icon's rise above centre, which makes room for the label. */
    iconLift: Animated.AnimatedInterpolation<number>;
    /** The full title, for screen readers. */
    label: string;
    /** 1 expanded, 0 compact. */
    labelOpacity: Animated.AnimatedInterpolation<number>;
    /** The word under the icon. */
    shortLabel: string;
    /** 1 on this tab, 0 on its neighbours, continuous in between. */
    nearness: Animated.AnimatedInterpolation<number>;
    onLongPress: () => void;
    onPress: () => void;
    selected: boolean;
    theme: ReturnType<typeof useAppTheme>;
  }) => {
    const press = useRef(new Animated.Value(0)).current;

    const anim = useMemo(
      () => ({
        press: press.interpolate({
          inputRange: [0, 1],
          outputRange: [1, PRESS_SCALE],
        }),
        swell: nearness.interpolate({
          inputRange: [0, 1],
          outputRange: [1, ACTIVE_SCALE],
        }),
      }),
      [nearness, press],
    );

    const to = (value: number, duration: number) => () => {
      Animated.timing(press, {
        duration,
        toValue: value,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onLongPress={onLongPress}
        onPress={onPress}
        onPressIn={to(1, PRESS_IN_MS)}
        onPressOut={to(0, PRESS_OUT_MS)}
        // The column is the target, but a UI dump measures it at the icon's
        // height (24dp) — slop takes it past 44 in both bar sizes.
        hitSlop={TAB_HIT_SLOP}
        style={styles.tab}
      >
        <Animated.View
          style={{
            /*
              Three scales, composed. Which tab you are on, how hard it is being
              pressed, and which size the bar is — separate so a tab can stay
              swollen while the bar shrinks under it, and so a press reads even
              mid-collapse. All three are native values.
            */
            transform: [
              { translateY: iconLift },
              { scale: anim.swell },
              { scale: anim.press },
              { scale: collapseScale },
            ],
          }}
        >
          {/*
            Both artworks, stacked, crossfading. The layout owns which icon a
            tab draws — this only decides how one becomes the other.
          */}
          <View>
            <Animated.View style={{ opacity: Animated.subtract(1, nearness) }}>
              {icon?.({ color: theme.textGray, focused: false, size: 24 })}
            </Animated.View>

            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: nearness }]}
            >
              {icon?.({
                // Step 12 rather than 11: the glyph sits on the lozenge's own
                // accent fill, and the brighter of the two accent texts is what
                // keeps it from reading as a smudge of the same colour.
                // `onSurface` is that step, or white where it is under 3:1.
                color: theme.accent.onSurface,
                focused: true,
                size: 24,
              })}
            </Animated.View>
          </View>

          {badge ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.unreadBadge,
                  // The glass base colour: rings the badge against the
                  // capsule it sits on, whichever tier drew the capsule.
                  borderColor: theme.glass.opaque,
                },
              ]}
            >
              <Text numberOfLines={1} style={styles.badgeLabel}>
                {typeof badge === "number" && badge > 9 ? "9+" : badge}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.Text
          maxFontSizeMultiplier={LABEL_MAX_SCALE}
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: selected ? theme.accent.onSurface : theme.textGray,
              opacity: labelOpacity,
            },
          ]}
        >
          {shortLabel}
        </Animated.Text>
      </Pressable>
    );
  },
);

export const TabBar = ({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const {
    collapse,
    hidden: held,
    setCollapsed,
    setVisible,
  } = useTabBarChrome();

  const { increaseContrast, reduceMotion, reduceTransparency } =
    useA11ySettings();
  const glassTier = getGlassTier();
  const scrimAlpha =
    (glassTier === "blur" || glassTier === "liquid") &&
    !reduceTransparency &&
    !increaseContrast
      ? SCRIM_ALPHA_BLURRED
      : SCRIM_ALPHA;

  // The fractional tab index. The lozenge and the icons derive from it.
  const progress = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    // Reduce Motion: the lozenge is simply at the new tab. The icon crossfade
    // reads the same value, so it lands with it.
    if (reduceMotion) {
      progress.setValue(state.index);
      return;
    }
    Animated.spring(progress, {
      // Little bounce and quick: six columns is a long way to travel, and an
      // overshoot at that distance reads as the bar missing the tab you asked
      // for and coming back for it.
      bounciness: 4,
      speed: 16,
      toValue: state.index,
      useNativeDriver: true,
    }).start();
  }, [progress, reduceMotion, state.index]);

  const focused = descriptors[state.routes[state.index].key];
  const barStyle = StyleSheet.flatten(focused?.options.tabBarStyle) as
    | ViewStyle
    | undefined;

  const tabCount = state.routes.length;
  const metrics = useMemo(() => barMetrics(insets.bottom), [insets.bottom]);
  const column = useMemo(
    () => tabWidth(windowWidth, tabCount),
    [tabCount, windowWidth],
  );

  /*
   * Every animated node the bar uses, built once.
   *
   * `interpolate` is a *node constructor*, not a lookup: writing
   * `collapse.interpolate(…)` inline in a style array builds a fresh node on
   * every render and tears down the one it replaces inside the native animated
   * module. This component re-renders whenever the inbox badge count changes or
   * the profile avatar loads, both of which happen while the reader is
   * scrolling — which is exactly when the bar is mid-collapse.
   */
  const anim = useMemo(() => {
    const between = (range: number[]) =>
      collapse.interpolate({ inputRange: [0, 1], outputRange: range });

    return {
      /** Shared by the surface, the icon row and the lozenge. */
      drop: between([0, metrics.drop]),
      iconLift: between([-LABEL_LIFT, 0]),
      iconScale: between(metrics.icon),
      labelOpacity: between([1, 0]),
      /**
       * Peaks at each tab's own index and falls away on either side, so a swipe
       * or a fast double-tap reads as one continuous movement rather than a
       * queue of steps.
       */
      nearness: state.routes.map((_, index) =>
        progress.interpolate({
          extrapolate: "clamp",
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
        }),
      ),
      pillScaleX: between(metrics.pillScaleX),
      pillScaleY: between(metrics.pillScaleY),
      /** The travel: a whole column per tab, from a fractional index. */
      pillTravel: Animated.multiply(progress, column),
      surfaceScaleY: between(metrics.surfaceScaleY),
    };
  }, [collapse, column, metrics, progress, state.routes]);

  /*
   * The host is given the scrim's height explicitly rather than left to wrap
   * the bar. The scrim is taller than the bar it sits behind, and a child that
   * overflows its parent is drawn on iOS and clipped on some Android versions —
   * a fade that exists on one platform and not the other is worse than no fade.
   */
  const scrimHeight = BAR_GAP_TOP + BAR_HEIGHT + SCRIM_RISE + metrics.ground;

  // `useHideTabBar` takes a hold on the bar through the chrome context for a
  // screen that wants the whole display. `display: "none"` on `tabBarStyle`
  // is honoured too — it is how the library's own bar is hidden, and a custom
  // bar that ignored it would surprise the next person to reach for it.
  const hidden = held || barStyle?.display === "none";

  /*
   * The screens cannot see `tabBarStyle` — it is a navigator option and they
   * are inside a stack inside a tab — so the bar is what tells the context
   * whether it is on screen. That is what makes `useTabBarInset` come back 0 in
   * a conversation instead of padding a message list for a bar that is not
   * there.
   *
   * In an effect rather than in render: `setVisible` is a `useState` setter on
   * an ancestor, and calling it while this component renders is a render-phase
   * update to a parent.
   */
  useEffect(() => {
    setVisible(!hidden);
    // A hidden bar must not stay small: it comes back on a screen that has its
    // own scroll position, and it would come back mid-collapse.
    if (hidden) setCollapsed(false);
  }, [hidden, setCollapsed, setVisible]);

  // Gone the frame the hold is taken and back the frame it is released. The
  // hold is taken before a conversation's first paint and released as it
  // starts to leave (see `useHideTabBar`), so neither edge is seen against a
  // finished screen.
  if (hidden) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { height: scrimHeight }]}
    >
      {/*
        The fade content passes through on its way behind the bar. `transparent`
        rather than the page colour at zero alpha: on Android an `#rrggbb00`
        stop interpolates through black and leaves a grey bloom across the top
        of the gradient.
      */}
      <LinearGradient
        colors={["transparent", withAlpha(theme.background, scrimAlpha)]}
        locations={[0, 0.7]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.ground,
          { paddingBottom: metrics.ground, paddingTop: BAR_GAP_TOP },
        ]}
      >
        {/* Constant. Everything that moves, moves inside it. */}
        <View pointerEvents="box-none" style={styles.box}>
          {/*
            The transform (and the iOS shadow) live on a plain wrapper, the
            glass inside it. `GlassSurface` clips to its radius, and a clipped
            view casts no iOS shadow. Android's `elevation` sits on the glass
            itself, which has the background elevation needs.

            Scaling a blur view is unverified on iOS: a `scaleY` of a
            `UIVisualEffectView` or Liquid Glass view may squash the corners
            or re-rasterise mid-collapse. Plan §5.3 lists the fallbacks.
          */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.surface,
              {
                shadowColor: "#000000",
                // Scale first, then drop: the capsule loses height about its
                // own centre and is then carried down so its lower edge sits
                // where it was, plus the clearance a compact bar gives up.
                transform: [
                  { translateY: anim.drop },
                  { scaleY: anim.surfaceScaleY },
                ],
              },
            ]}
          >
            <GlassSurface
              radius={radius.full}
              style={styles.surfaceGlass}
              variant="bar"
            />
          </Animated.View>

          {/*
            Drawn before the tabs so it sits behind them. The slot keeps a
            column's width and only its transform moves; the lozenge inside it
            carries the size change, so neither node needs a layout pass.
          */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pillSlot,
              {
                transform: [
                  { translateX: anim.pillTravel },
                  { translateY: anim.drop },
                ],
                width: column,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.pill,
                {
                  backgroundColor: theme.accent.surface,
                  borderColor: theme.accent.surfaceHover,
                  transform: [
                    { scaleX: anim.pillScaleX },
                    { scaleY: anim.pillScaleY },
                  ],
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            pointerEvents="box-none"
            style={[styles.row, { transform: [{ translateY: anim.drop }] }]}
          >
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];

              return (
                <Tab
                  badge={options.tabBarBadge}
                  collapseScale={anim.iconScale}
                  icon={options.tabBarIcon}
                  iconLift={anim.iconLift}
                  key={route.key}
                  label={options.title ?? route.name}
                  labelOpacity={anim.labelOpacity}
                  nearness={anim.nearness[index]}
                  onLongPress={() =>
                    navigation.emit({ target: route.key, type: "tabLongPress" })
                  }
                  onPress={() => {
                    // Touching the bar is a statement that you are navigating
                    // rather than reading, so it comes back to full size
                    // whether or not the tab actually changes — including the
                    // tap that takes the current tab back to its top.
                    setCollapsed(false);

                    const event = navigation.emit({
                      canPreventDefault: true,
                      target: route.key,
                      type: "tabPress",
                    });

                    if (state.index !== index && !event.defaultPrevented) {
                      navigation.navigate(route.name, route.params);
                    }
                  }}
                  selected={state.index === index}
                  shortLabel={
                    typeof options.tabBarLabel === "string"
                      ? options.tabBarLabel
                      : (options.title ?? route.name)
                  }
                  theme={theme}
                />
              );
            })}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: "center",
    minWidth: 16,
    paddingHorizontal: 3,
    position: "absolute",
    right: -8,
    top: -4,
  },
  badgeLabel: { color: "#ffffff", fontSize: 9, fontWeight: "700" },

  /** The bar's layout, and the only place its size is stated. */
  box: {
    height: BAR_HEIGHT,
    marginHorizontal: BAR_INSET_X,
  },

  ground: { justifyContent: "flex-end" },

  /*
   * Anchored to the foot of the navigator rather than laid out in it, which is
   * what puts the scene behind the bar. `box-none` so the gap either side of
   * the capsule still belongs to the list underneath — the bar catches taps,
   * the air around it does not, and neither does the scrim.
   *
   * `flex-end` because the host is sized for the scrim and the bar belongs at
   * its foot. Its height is passed in: it depends on the safe-area inset.
   */
  host: {
    bottom: 0,
    justifyContent: "flex-end",
    left: 0,
    position: "absolute",
    right: 0,
  },

  /**
   * Under the lifted icon: half the bar, less the lift, plus half the 24pt
   * glyph and a 2pt gap. Absolute, so the label never moves the icon.
   */
  label: {
    fontSize: 11,
    fontWeight: "600",
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
    top: BAR_HEIGHT / 2 - LABEL_LIFT + 12 + 2,
  },

  pill: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: PILL_HEIGHT,
    width: PILL_WIDTH,
  },
  pillSlot: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    top: 0,
  },

  row: { alignItems: "center", flex: 1, flexDirection: "row" },

  /**
   * The capsule's frame: the transform and the iOS shadow, and nothing else.
   * Separate from the box so it can change shape without anything being laid
   * out again.
   */
  surface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    // Lifted off the screen rather than ruled off from it. iOS takes the
    // shadow triplet here; Android's `elevation` is on the glass below.
    ...Platform.select({
      android: {},
      default: {
        shadowOffset: { height: 6, width: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
    }),
  },
  surfaceGlass: {
    ...StyleSheet.absoluteFillObject,
    ...Platform.select({ android: { elevation: 8 }, default: {} }),
  },

  tab: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
  },
});
