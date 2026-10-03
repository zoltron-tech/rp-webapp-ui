import { SCRIM_ALPHA } from "@nw/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { MediaMetadata } from "@nw/types/activity";
import { wsrvImage } from "@nw/utils/image";
import { useEventListener } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, type VideoPlayer, VideoView } from "expo-video";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  type GestureResponderEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { HeartButton } from "@/components/heart-button";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The gallery's viewer — web's `AppImageViewer` / `VideoViewer` with
 * `MediaCaption` laid over it — built the way the photo viewers people use
 * every day are built.
 *
 * ## Two modes, as Facebook's viewer has them
 *
 * **Browse.** The viewer opens here. One finger sideways turns the page, one
 * finger down closes, a tap toggles the chrome (and plays or pauses a clip).
 * Nothing zooms, so a swipe can never be mistaken for a pan and a page can
 * never be lost.
 *
 * **Zoom.** Double-tap a picture (or start a pinch) and the viewer is *in* that
 * picture: pinch about the fingers, drag to the edges, and nothing pages —
 * a sideways drag moves the picture, not the gallery. Double-tap again, or
 * zoom back out to the fitted size, and the viewer is browsing again. The
 * header says which mode it is in.
 *
 * ## One gesture surface over everything
 *
 * Every touch lands on a transparent layer laid over the pages, never on a
 * page's own view. That is what makes a swipe work over a clip: a video view
 * with native controls, or a player wrapped in its own `Pressable` and
 * scrubber (`ClipPlayer`), claims the touch before the viewer sees a move,
 * and the gallery cannot be swiped past it. The clip here has no controls of
 * its own — the viewer's tap plays and pauses it, the header mutes it, and
 * the footer carries its progress — so pictures, GIFs and clips are one kind
 * of page under one gesture.
 *
 * ## What Instagram's carousel does that this does too
 *
 *  - The current clip plays in place, loops, and pauses the moment it is
 *    swiped off; neighbours are mounted but silent, so the next page is drawn
 *    before it arrives.
 *  - Pictures two pages ahead are prefetched into the memory cache.
 *  - The turn is a spring seeded with the finger's own velocity and clamped
 *    from overshooting, so a flick lands like a flick and a slow release
 *    settles rather than snaps.
 *  - No new gesture is taken while a turn is in flight — the one thing that
 *    makes fast opposite swipes on Android stutter.
 *  - GIFs animate: the proxy is asked for every frame (`n=-1`), not the first.
 *
 * ## Why the carousel is drawn by hand
 *
 * A horizontal `FlatList` would page for free, but it is a native scroll view
 * and it negotiates for touches against a JS gesture; pinch, pan, pull and
 * swipe all begin as the same first move and the two systems cannot share the
 * decision. Three pages in an `Animated` row under one responder can.
 *
 * ## Three fixed slots, pages keyed inside them, a row that never resets
 *
 * Learnt on device, and each worth keeping:
 *
 *  - Handing the centre slot's page a new URL made its `Image` crossfade from
 *    the old picture after the turn — a flash. Pages are keyed by URL, so a
 *    turn remounts from the memory cache with no transition.
 *  - Moving keyed pages *between* slots re-attached the zoom's animated nodes
 *    to a different view, which drew nothing until the next gesture. The
 *    slots are fixed; the centre one owns the zoom transform for good.
 *  - Resetting the row's offset to 0 in a layout effect after the turn never
 *    reached the native side: a native-driven `setValue` is batch-queued, and
 *    the one written during commit was not flushed. The offset accumulates
 *    instead — one width per turn — and the row's `left` is laid out from the
 *    turn count, so nothing about the animated value changes on commit.
 *
 * `PanResponder` and native-driven `Animated`, as in the crop editor; see
 * `edit/image-crop-editor.tsx` for why not the gesture library.
 */

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

const TAP_MS = 260;
const TAP_SLOP = 8;
const DOUBLE_TAP_MS = 320;

/** How far a first move must go before it is a swipe, a pan or a pull. */
const AXIS_SLOP = 6;

/** Swipe: past this share of the width, or this speed, the page turns. */
const PAGE_FRACTION = 0.28;
const PAGE_VELOCITY = 0.45;

/** Pull-down: past this distance, or this speed, the viewer closes. */
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.7;

/** How much of an over-scroll follows the finger. */
const RUBBER = 0.35;

/** The turn's spring: stiff, well damped, never overshooting — a page, not a ball. */
const TURN_SPRING = {
  damping: 32,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.4,
  restSpeedThreshold: 4,
  stiffness: 320,
  useNativeDriver: true,
};

/** Pictures are fetched bounded; nothing on a phone shows more than this. */
const DISPLAY = { fit: "inside" as const, h: 2048, q: 88, w: 2048 };

/** Dots stand in for the counter up to here; past it the dots would blur. */
const MAX_DOTS = 10;

export const isVideoUrl = (url: string) =>
  /\.(mp4|m4v|mov|quicktime|ogv|webm)$/i.test(url);
export const isGifUrl = (url: string) => /\.gif$/i.test(url);

/**
 * A smaller copy of a picture already on screen, by the picture's URL.
 *
 * A chat tile is a thumbnail; the viewer asks for a 2048px copy. Without a
 * stand-in the page it opens on is black with a spinner until that arrives —
 * the moment an impatient tap is least forgiving. The tile registers the copy
 * it drew (already decoded, in the memory cache), and the page paints that
 * first and sharpens when the full one lands.
 */
const PLACEHOLDERS = new Map<string, string>();

export const setViewerPlaceholder = (url: string, uri: string) => {
  PLACEHOLDERS.set(url, uri);
};

/** Starts the full-size copy on press-in, so a tap finds it on its way. */
export const prefetchForViewer = (url: string) => {
  if (isVideoUrl(url)) return;
  void Image.prefetch(displayUri(url)).catch(() => false);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const rubber = (value: number, min: number, max: number) => {
  if (value < min) return min - (min - value) * RUBBER;
  if (value > max) return max + (value - max) * RUBBER;
  return value;
};

const formatClock = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

type Touches = GestureResponderEvent["nativeEvent"]["touches"];

const midpoint = (touches: Touches) => ({
  x: (touches[0].pageX + touches[1].pageX) / 2,
  y: (touches[0].pageY + touches[1].pageY) / 2,
});

const distance = (touches: Touches) =>
  Math.hypot(
    touches[0].pageX - touches[1].pageX,
    touches[0].pageY - touches[1].pageY,
  );

/** The zoom pose of the picture on screen: scale and offset from centre. */
interface Zoom {
  s: number;
  tx: number;
  ty: number;
}

const FITTED: Zoom = { s: 1, tx: 0, ty: 0 };

type Mode = "browse" | "zoom";
type Gesture = "idle" | "pinch" | "pan" | "swipe" | "pull";

/** The bounded display copy; GIFs keep every frame. */
const displayUri = (url: string) =>
  wsrvImage(url, isGifUrl(url) ? { ...DISPLAY, animated: true } : DISPLAY);

export const MediaViewer = ({
  index,
  isOwner,
  media,
  metaByUrl,
  onCaption,
  onChange,
  onClose,
  onDelete,
  onReaction,
  subtitle,
  title,
}: {
  /** Whose media this is, beside the counter — a chat's sender. */
  title?: string;
  /** Under the title: when it was sent. */
  subtitle?: string;
  index: number | null;
  isOwner: boolean;
  media: string[];
  metaByUrl: Map<string, MediaMetadata>;
  onCaption: (url: string, description: string) => Promise<boolean>;
  onChange: (index: number) => void;
  onClose: () => void;
  onDelete: (url: string) => void;
  /**
   * Every value the heart settles on, so the caller can write it into the
   * metadata it owns — or the heart is forgotten when the viewer closes.
   */
  onReaction?: (
    url: string,
    next: { reacted: boolean; reactions: number },
  ) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { height: H, width: W } = useWindowDimensions();
  // A modal's window is not resized for the keyboard on Android, so the
  // footer lifts itself while the caption is being typed.
  const keyboard = useKeyboardHeight();

  const open = index !== null;
  const current = index !== null ? media[index] : undefined;
  const prev = index !== null && index > 0 ? media[index - 1] : undefined;
  const next =
    index !== null && index < media.length - 1 ? media[index + 1] : undefined;
  const currentIsVideo = current ? isVideoUrl(current) : false;

  // ── Animated state ──────────────────────────────────────────────────────
  const slideX = useRef(new Animated.Value(0)).current;
  const pullY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const chrome = useRef(new Animated.Value(1)).current;
  const [chromeShown, setChromeShown] = useState(true);
  const [mode, setMode] = useState<Mode>("browse");

  // ── Clips ───────────────────────────────────────────────────────────────
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState({ duration: 0, time: 0 });
  /** Who liked the current item — web's `ReactionLikersDialog`, as a tray. */
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );
  /** The current clip's player, so the gesture layer can play and pause it. */
  const players = useRef(new Map<string, VideoPlayer>());
  const registerPlayer = useCallback(
    (url: string, player: VideoPlayer | null) => {
      if (player) players.current.set(url, player);
      else players.current.delete(url);
    },
    [],
  );
  const onPlaying = useCallback(
    (isPlaying: boolean) => setPlaying(isPlaying),
    [],
  );
  const onClock = useCallback(
    (time: number, duration: number) => setClock({ duration, time }),
    [],
  );

  // ── Gesture bookkeeping (refs: the responder is created once) ───────────
  const zoom = useRef<Zoom>(FITTED);
  const live = useRef<Zoom>(FITTED);
  const gesture = useRef<Gesture>("idle");
  const modeRef = useRef<Mode>("browse");
  modeRef.current = mode;
  const turning = useRef(false);
  const panPrev = useRef<{ x: number; y: number } | null>(null);
  const pinchPrev = useRef<{
    d: number;
    mid: { x: number; y: number };
  } | null>(null);
  const start = useRef<{ at: number; x: number; y: number } | null>(null);
  const lastTap = useRef<{ at: number; x: number; y: number } | null>(null);
  /**
   * A single tap's action, held back for the double-tap window. Acting on
   * the first tap at once would hide the chrome (or pause a clip) on the way
   * into zoom mode; a second tap inside the window cancels it instead.
   */
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);
  const state = useRef({ current, H, hasNext: false, hasPrev: false, W });
  state.current = {
    current,
    H,
    hasNext: Boolean(next),
    hasPrev: Boolean(prev),
    W,
  };
  const callbacks = useRef({ index, onChange, onClose });
  callbacks.current = { index, onChange, onClose };

  /**
   * Signed turns since the viewer mounted. The row's rest offset is
   * `-turns × W`, and its `left` is laid out to match — see the file comment.
   */
  const turns = useRef(0);
  const rest = () => -turns.current * state.current.W;

  // A new page is always browsed fitted: a turn is only possible from there.
  useLayoutEffect(() => {
    zoom.current = FITTED;
    live.current = FITTED;
    setClock({ duration: 0, time: 0 });
    setPlaying(false);
  }, [index]);

  useEffect(() => {
    if (open) {
      pullY.setValue(0);
      chrome.setValue(1);
      setChromeShown(true);
      setMode("browse");
    }
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = null;
    };
  }, [chrome, open, pullY]);

  // Two pages ahead, into the memory cache, so a fast swipe finds them drawn.
  useEffect(() => {
    if (index === null) return;
    const ahead = [media[index + 2], media[index - 2]].filter(
      (url): url is string => Boolean(url) && !isVideoUrl(url as string),
    );
    if (ahead.length) {
      void Image.prefetch(ahead.map((url) => displayUri(url))).catch(() => {});
    }
  }, [index, media]);

  /** The picture's own shape, by URL, learnt as each loads. */
  const ratios = useRef(new Map<string, number>());
  const onRatio = useCallback((url: string, ratio: number) => {
    ratios.current.set(url, ratio);
  }, []);

  /** The fitted size of the current picture on this screen. */
  const fittedSize = () => {
    const { H: h, W: w, current: url } = state.current;
    const ratio = url ? ratios.current.get(url) : undefined;
    if (!ratio) return { height: h, width: w };
    return ratio > w / h
      ? { height: w / ratio, width: w }
      : { height: h, width: h * ratio };
  };

  /** How far the zoomed picture may be pushed from centre. */
  const bounds = (s: number) => {
    const { H: h, W: w } = state.current;
    const size = fittedSize();
    return {
      x: Math.max(0, (size.width * s - w) / 2),
      y: Math.max(0, (size.height * s - h) / 2),
    };
  };

  const legal = (raw: Zoom): Zoom => {
    const s = clamp(raw.s, 1, MAX_ZOOM);
    const b = bounds(s);
    return { s, tx: clamp(raw.tx, -b.x, b.x), ty: clamp(raw.ty, -b.y, b.y) };
  };

  const drawZoom = (raw: Zoom) => {
    live.current = raw;
    const s = rubber(raw.s, 1, MAX_ZOOM);
    const b = bounds(clamp(raw.s, 1, MAX_ZOOM));
    scale.setValue(s);
    panX.setValue(rubber(raw.tx, -b.x, b.x));
    panY.setValue(rubber(raw.ty, -b.y, b.y));
  };

  const settleZoom = (target: Zoom) => {
    zoom.current = target;
    live.current = target;
    const spec = { bounciness: 0, speed: 18, useNativeDriver: true };
    Animated.parallel([
      Animated.spring(scale, { ...spec, toValue: target.s }),
      Animated.spring(panX, { ...spec, toValue: target.tx }),
      Animated.spring(panY, { ...spec, toValue: target.ty }),
    ]).start();
    // Back at the fit, the viewer is browsing again.
    setMode(target.s > 1.02 ? "zoom" : "browse");
  };

  /** Zoom about a point given from the screen's centre. */
  const zoomAbout = (
    focal: { x: number; y: number },
    from: Zoom,
    s: number,
  ): Zoom => {
    const k = s / from.s;
    return {
      s,
      tx: focal.x - (focal.x - from.tx) * k,
      ty: focal.y - (focal.y - from.ty) * k,
    };
  };

  /** A page point, relative to the screen's centre. */
  const fromCentre = (page: { x: number; y: number }) => ({
    x: page.x - state.current.W / 2,
    y: page.y - state.current.H / 2,
  });

  const toggleChrome = () => {
    setChromeShown((shown) => {
      Animated.timing(chrome, {
        duration: 180,
        toValue: shown ? 0 : 1,
        useNativeDriver: true,
      }).start();
      return !shown;
    });
  };

  const togglePlayback = () => {
    const url = state.current.current;
    const player = url ? players.current.get(url) : undefined;
    if (!player) return;
    try {
      if (player.playing) player.pause();
      else player.play();
    } catch {
      // Released mid-gesture: nothing to toggle.
    }
  };

  const springBack = (value: Animated.Value, to: number, velocity: number) =>
    Animated.spring(value, { ...TURN_SPRING, toValue: to, velocity }).start();

  const turnPage = (direction: 1 | -1, velocity: number) => {
    const { W: w } = state.current;
    turning.current = true;
    Animated.spring(slideX, {
      ...TURN_SPRING,
      toValue: rest() - direction * w,
      velocity,
    }).start(({ finished }) => {
      turning.current = false;
      const { index: i, onChange: change } = callbacks.current;
      if (!finished || i === null) {
        springBack(slideX, rest(), 0);
        return;
      }
      // The row now rests one width further along; the next render lays the
      // slots out for it, so the new current page lands where the old one was.
      turns.current += direction;
      change(i + direction);
    });
  };

  const dismiss = (direction: 1 | -1) => {
    Animated.timing(pullY, {
      duration: 200,
      easing: Easing.in(Easing.cubic),
      toValue: direction * state.current.H,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) callbacks.current.onClose();
    });
  };

  const responder = useRef(
    PanResponder.create({
      // While a turn is in flight the finger waits: taking the row over
      // mid-spring is what makes fast opposite swipes stutter.
      onMoveShouldSetPanResponder: () => !turning.current,
      onPanResponderGrant: (event) => {
        pullY.stopAnimation();
        scale.stopAnimation();
        panX.stopAnimation();
        panY.stopAnimation();
        const touch = event.nativeEvent.touches[0];
        start.current = {
          at: Date.now(),
          x: touch?.pageX ?? 0,
          y: touch?.pageY ?? 0,
        };
        moved.current = false;
        gesture.current = "idle";
        panPrev.current = touch ? { x: touch.pageX, y: touch.pageY } : null;
        pinchPrev.current = null;
        live.current = zoom.current;
      },
      onPanResponderMove: (event, g) => {
        const touches = event.nativeEvent.touches;
        const isVideo = state.current.current
          ? isVideoUrl(state.current.current)
          : false;

        // Two fingers on a picture: a pinch, and the viewer is in zoom mode
        // from here — even if it was browsing a moment ago.
        if (touches.length >= 2 && !isVideo) {
          const mid = midpoint(touches);
          const d = distance(touches);
          if (gesture.current !== "pinch") {
            gesture.current = "pinch";
            pinchPrev.current = { d, mid };
            panPrev.current = null;
            if (modeRef.current !== "zoom") setMode("zoom");
            return;
          }
          if (!pinchPrev.current) {
            pinchPrev.current = { d, mid };
            return;
          }
          moved.current = true;
          const k = d / pinchPrev.current.d;
          const zoomed = zoomAbout(
            fromCentre(mid),
            live.current,
            live.current.s * k,
          );
          zoomed.tx += mid.x - pinchPrev.current.mid.x;
          zoomed.ty += mid.y - pinchPrev.current.mid.y;
          pinchPrev.current = { d, mid };
          drawZoom(zoomed);
          return;
        }

        const touch = touches[0];
        if (!touch) return;

        if (gesture.current === "pinch") {
          // A finger lifted: the pinch is over; carry on as a pan from here.
          gesture.current = "pan";
          pinchPrev.current = null;
          panPrev.current = { x: touch.pageX, y: touch.pageY };
          return;
        }

        if (!panPrev.current) {
          panPrev.current = { x: touch.pageX, y: touch.pageY };
          return;
        }
        const dx = touch.pageX - panPrev.current.x;
        const dy = touch.pageY - panPrev.current.y;
        panPrev.current = { x: touch.pageX, y: touch.pageY };

        // The first clear move decides what this gesture is — and the mode
        // decides what it may be: in zoom, every one-finger move is a pan.
        if (gesture.current === "idle") {
          const far = Math.hypot(g.dx, g.dy);
          if (far < AXIS_SLOP) return;
          moved.current = true;
          if (modeRef.current === "zoom") gesture.current = "pan";
          else if (Math.abs(g.dx) > Math.abs(g.dy)) gesture.current = "swipe";
          else gesture.current = "pull";
        }
        if (Math.hypot(g.dx, g.dy) > TAP_SLOP) moved.current = true;

        switch (gesture.current) {
          case "pan":
            drawZoom({
              s: live.current.s,
              tx: live.current.tx + dx,
              ty: live.current.ty + dy,
            });
            return;
          case "swipe": {
            const { W: w, hasNext, hasPrev } = state.current;
            // No neighbour on that side: the row resists rather than leaves.
            slideX.setValue(
              rest() + rubber(g.dx, hasNext ? -w : 0, hasPrev ? w : 0),
            );
            return;
          }
          case "pull":
            pullY.setValue(g.dy);
            return;
          default:
            return;
        }
      },
      onPanResponderRelease: (_event, g) => {
        const began = start.current;
        const now = Date.now();
        const { W: w, hasNext, hasPrev } = state.current;
        const isVideo = state.current.current
          ? isVideoUrl(state.current.current)
          : false;

        // Taps: one toggles the chrome (and a clip's playback); two switch
        // between browsing and zooming a picture.
        if (began && !moved.current && now - began.at < TAP_MS) {
          const previous = lastTap.current;
          lastTap.current = { at: now, x: began.x, y: began.y };
          const isDouble =
            previous !== null &&
            now - previous.at < DOUBLE_TAP_MS &&
            Math.hypot(began.x - previous.x, began.y - previous.y) <
              TAP_SLOP * 3;
          if (tapTimer.current) {
            clearTimeout(tapTimer.current);
            tapTimer.current = null;
          }
          if (isDouble && !isVideo) {
            lastTap.current = null;
            if (modeRef.current === "zoom") settleZoom(FITTED);
            else {
              settleZoom(
                legal(
                  zoomAbout(fromCentre(began), zoom.current, DOUBLE_TAP_ZOOM),
                ),
              );
            }
            gesture.current = "idle";
            return;
          }
          tapTimer.current = setTimeout(() => {
            tapTimer.current = null;
            if (isVideo) togglePlayback();
            else toggleChrome();
          }, DOUBLE_TAP_MS);
          gesture.current = "idle";
          return;
        }

        switch (gesture.current) {
          case "pinch":
          case "pan":
            settleZoom(legal(live.current));
            break;
          case "swipe": {
            const goNext = g.dx < -w * PAGE_FRACTION || g.vx < -PAGE_VELOCITY;
            const goPrev = g.dx > w * PAGE_FRACTION || g.vx > PAGE_VELOCITY;
            // `vx` is px/ms; the spring wants px/s.
            const velocity = g.vx * 1000;
            if (goNext && hasNext) turnPage(1, velocity);
            else if (goPrev && hasPrev) turnPage(-1, velocity);
            else springBack(slideX, rest(), velocity);
            break;
          }
          case "pull": {
            const far = Math.abs(g.dy) > DISMISS_DISTANCE;
            const fast = Math.abs(g.vy) > DISMISS_VELOCITY;
            if (far || fast) dismiss(g.dy >= 0 ? 1 : -1);
            else springBack(pullY, 0, g.vy * 1000);
            break;
          }
          default:
            break;
        }
        gesture.current = "idle";
      },
      onPanResponderTerminate: () => {
        if (gesture.current === "pinch" || gesture.current === "pan") {
          settleZoom(legal(live.current));
        } else {
          springBack(slideX, rest(), 0);
          springBack(pullY, 0, 0);
        }
        gesture.current = "idle";
      },
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => !turning.current,
    }),
  ).current;

  /** The centre slot's transform: built once, never re-attached. */
  const zoomStyle = useMemo(
    () => ({
      transform: [{ translateX: panX }, { translateY: panY }, { scale }],
    }),
    [panX, panY, scale],
  );

  const backdropOpacity = useMemo(
    () =>
      pullY.interpolate({
        extrapolate: "clamp",
        inputRange: [-H * 0.6, 0, H * 0.6],
        outputRange: [0.2, 1, 0.2],
      }),
    [H, pullY],
  );

  if (!open || !current || index === null) {
    return (
      <Modal
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
        transparent
        visible={false}
      >
        <View />
      </Modal>
    );
  }

  const progress =
    clock.duration > 0 ? Math.min(1, clock.time / clock.duration) : 0;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      {/* Three fixed slots in a row, the current one centred — see the file
          comment for why the slots are fixed, the pages keyed, and the row's
          `left` laid out from the turn count. */}
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.row,
            {
              left: -W + turns.current * W,
              transform: [{ translateX: slideX }, { translateY: pullY }],
              width: W * 3,
            },
          ]}
        >
          <View style={{ height: H, width: W }}>
            {prev ? (
              <Page
                active={false}
                key={prev}
                muted={muted}
                onClock={onClock}
                onPlaying={onPlaying}
                onRatio={onRatio}
                registerPlayer={registerPlayer}
                url={prev}
              />
            ) : null}
          </View>
          <Animated.View style={[{ height: H, width: W }, zoomStyle]}>
            <Page
              active
              key={current}
              muted={muted}
              onClock={onClock}
              onPlaying={onPlaying}
              onRatio={onRatio}
              registerPlayer={registerPlayer}
              url={current}
            />
          </Animated.View>
          <View style={{ height: H, width: W }}>
            {next ? (
              <Page
                active={false}
                key={next}
                muted={muted}
                onClock={onClock}
                onPlaying={onPlaying}
                onRatio={onRatio}
                registerPlayer={registerPlayer}
                url={next}
              />
            ) : null}
          </View>
        </Animated.View>

        {/* A paused clip says so where the eye already is. Drawn under the
            gesture layer, so the tap that starts it is the viewer's. */}
        {currentIsVideo && !playing ? (
          <View pointerEvents="none" style={styles.playBadge}>
            <View style={styles.playDisc}>
              <Ionicons color="#ffffff" name="play" size={34} />
            </View>
          </View>
        ) : null}

        {/* Every touch lands here — never on a page. */}
        <View {...responder.panHandlers} style={StyleSheet.absoluteFill} />
      </View>

      {/* ── Chrome ────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents={chromeShown ? "box-none" : "none"}
        style={[
          styles.header,
          { opacity: chrome, paddingTop: insets.top + space.sm },
        ]}
      >
        {/*
          Apple's one published number: a 35% dim behind controls on bright
          media. The title and counter are white and used to sit straight on
          the picture, which a white photograph made unreadable.
        */}
        <LinearGradient
          colors={[MEDIA_DIM, "transparent"]}
          pointerEvents="none"
          style={styles.headerDim}
        />
        <View style={styles.headerLeft}>
          {title ? (
            <View style={styles.titleBlock}>
              <Text numberOfLines={1} style={styles.title}>
                {title}
              </Text>
              <Text numberOfLines={1} style={styles.subtitle}>
                {media.length > 1 ? `${index + 1} of ${media.length}` : ""}
                {media.length > 1 && subtitle ? " · " : ""}
                {subtitle ?? ""}
              </Text>
            </View>
          ) : (
            <Text style={styles.counter}>
              {index + 1} / {media.length}
            </Text>
          )}
          {mode === "zoom" ? (
            <View style={styles.modeChip}>
              <Ionicons color="#ffffff" name="scan-outline" size={11} />
              <Text style={styles.modeLabel}>Zoom · double-tap to exit</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          {currentIsVideo ? (
            <Pressable
              accessibilityLabel={muted ? "Unmute" : "Mute"}
              accessibilityRole="button"
              hitSlop={space.sm}
              onPress={() => setMuted((m) => !m)}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons
                color="#ffffff"
                name={muted ? "volume-mute" : "volume-high"}
                size={18}
              />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={onClose}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons color="#ffffff" name="close" size={22} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={chromeShown ? "box-none" : "none"}
        style={[
          styles.footer,
          { opacity: chrome, transform: [{ translateY: -keyboard }] },
        ]}
      >
        {/* Instagram's dots, while there are few enough to read. */}
        {media.length > 1 && media.length <= MAX_DOTS ? (
          <View style={styles.dots}>
            {media.map((url, i) => (
              <View
                key={url}
                style={[styles.dot, i === index ? styles.dotActive : null]}
              />
            ))}
          </View>
        ) : null}

        {currentIsVideo ? (
          <View style={styles.progressRow}>
            <Text style={styles.clock}>{formatClock(clock.time)}</Text>
            <View style={styles.track}>
              <View style={[styles.fillBar, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.clock}>{formatClock(clock.duration)}</Text>
          </View>
        ) : null}

        <CaptionBar
          isOwner={isOwner}
          key={`caption-${current}`}
          meta={metaByUrl.get(current)}
          onCaption={(text) => onCaption(current, text)}
          onDelete={() => onDelete(current)}
          onReaction={(next) => onReaction?.(current, next)}
          onShowLikers={(id, count) => setLikers({ count, id })}
          paddingBottom={Math.max(insets.bottom, space.md)}
        />
      </Animated.View>

      {/*
        Inside this modal rather than beside it: a sheet mounted by a sibling
        would open under the viewer's own window.
      */}
      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />
    </Modal>
  );
};

/**
 * One item, filling its slot: a picture or GIF fitted to the screen, or a
 * clip. Keyed by URL by the caller, so a turn remounts it rather than handing
 * it a new source. Nothing here takes a touch — the viewer's layer does.
 */
const Page = memo(function Page({
  active,
  muted,
  onClock,
  onPlaying,
  onRatio,
  registerPlayer,
  url,
}: {
  /** The page in the centre slot: its clip plays, and reports back. */
  active: boolean;
  muted: boolean;
  onClock: (time: number, duration: number) => void;
  onPlaying: (playing: boolean) => void;
  onRatio: (url: string, ratio: number) => void;
  registerPlayer: (url: string, player: VideoPlayer | null) => void;
  url: string;
}) {
  if (isVideoUrl(url)) {
    return (
      <ClipPage
        active={active}
        muted={muted}
        onClock={onClock}
        onPlaying={onPlaying}
        registerPlayer={registerPlayer}
        url={url}
      />
    );
  }
  return <PicturePage onRatio={onRatio} url={url} />;
});

const PicturePage = ({
  onRatio,
  url,
}: {
  onRatio: (url: string, ratio: number) => void;
  url: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  // The smaller copy something on screen already drew, if anything did.
  const placeholder = PLACEHOLDERS.get(url);

  return (
    <View style={styles.page}>
      <Image
        autoplay
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoad={({ source }) => {
          setLoaded(true);
          if (source?.width && source?.height) {
            onRatio(url, source.width / source.height);
          }
        }}
        placeholder={placeholder ? { uri: placeholder } : undefined}
        placeholderContentFit="contain"
        recyclingKey={url}
        source={{ uri: displayUri(url) }}
        style={styles.fill}
        // No fade, placeholder or not: a turn remounts the page, and a fade
        // from nothing is a black flash on every swipe.
        transition={0}
      />
      {!loaded && !placeholder ? (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator color="rgba(255,255,255,0.8)" />
        </View>
      ) : null}
    </View>
  );
};

/**
 * A clip, as a page: no native controls, no `Pressable` of its own. It plays
 * while it is the current page, loops, honours the viewer's mute, and reports
 * its clock and state up for the footer and the play badge.
 */
const ClipPage = ({
  active,
  muted,
  onClock,
  onPlaying,
  registerPlayer,
  url,
}: {
  active: boolean;
  muted: boolean;
  onClock: (time: number, duration: number) => void;
  onPlaying: (playing: boolean) => void;
  registerPlayer: (url: string, player: VideoPlayer | null) => void;
  url: string;
}) => {
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer(url, (instance) => {
    instance.loop = true;
    instance.muted = muted;
    instance.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    registerPlayer(url, player);
    return () => registerPlayer(url, null);
  }, [player, registerPlayer, url]);

  useEffect(() => {
    try {
      player.muted = muted;
    } catch {
      // Released.
    }
  }, [muted, player]);

  // The centre page plays; a neighbour waits, drawn on its first frame.
  useEffect(() => {
    try {
      if (active) player.play();
      else {
        player.pause();
        player.currentTime = 0;
      }
    } catch {
      // Released.
    }
  }, [active, player]);

  useEventListener(player, "playingChange", ({ isPlaying }) => {
    if (active) onPlaying(isPlaying);
  });

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (active) onClock(currentTime, player.duration);
  });

  return (
    <View style={styles.page}>
      <VideoView
        contentFit="contain"
        nativeControls={false}
        onFirstFrameRender={() => setReady(true)}
        player={player}
        style={styles.fill}
      />
      {!ready ? (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator color="rgba(255,255,255,0.8)" />
        </View>
      ) : null}
    </View>
  );
};

/**
 * Web's `MediaCaption`, laid out as the footer of a post.
 *
 * The caption first, because it is what the picture is *about*; under it one
 * row: the heart, which is the toggle and only the toggle, the sentence beside
 * it — "3 novelists like this" — which is the count and opens who, and the
 * owner's tools trailing. Two controls for two jobs, rather than a count
 * nested inside the button that changes it, which is what the first version
 * copied from web and what web has now stopped doing too.
 *
 * An owner with no caption yet sees "Add a caption" where the caption would
 * be, and no pencil — one way in, where the eye already is. The bin stays in
 * the row: deleting is not about the caption.
 */
const CaptionBar = ({
  isOwner,
  meta,
  onCaption,
  onDelete,
  onReaction,
  onShowLikers,
  paddingBottom,
}: {
  isOwner: boolean;
  meta: MediaMetadata | undefined;
  onCaption: (text: string) => Promise<boolean>;
  onDelete: () => void;
  onReaction: (next: { reacted: boolean; reactions: number }) => void;
  onShowLikers: (targetId: string, count: number) => void;
  paddingBottom: number;
}) => {
  const theme = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(meta?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDraft(meta?.description ?? "");
  }, [meta?.description]);

  const reaction = useToggleReaction({
    id: meta?.id ?? "",
    onChange: onReaction,
    reacted: meta?.reacted ?? false,
    reactions: meta?.reactionCount ?? 0,
    type: "media",
  });

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const ok = await onCaption(draft.trim());
    setSaving(false);
    if (!ok) {
      Alert.alert("Not saved", "The caption could not be saved. Try again.");
      return;
    }
    setEditing(false);
  };

  const description = meta?.description ?? "";

  return (
    <View style={[styles.captionBar, { paddingBottom }]}>
      {editing ? (
        <View style={styles.captionEdit}>
          <TextInput
            autoFocus
            maxLength={300}
            multiline
            onChangeText={setDraft}
            placeholder="Write a caption…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.captionInput}
            value={draft}
          />
          <View style={styles.captionActions}>
            <Pressable
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => {
                setDraft(description);
                setEditing(false);
              }}
              style={styles.captionButton}
            >
              <Ionicons color="#ffffff" name="close" size={18} />
            </Pressable>
            <Pressable
              accessibilityLabel="Save caption"
              accessibilityRole="button"
              disabled={saving}
              hitSlop={space.xs}
              onPress={() => void save()}
              style={[
                styles.captionButton,
                { backgroundColor: theme.accent.solid },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons color="#ffffff" name="checkmark" size={18} />
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {description ? (
            // Three lines, and a tap for the rest — Instagram's "more".
            <Pressable
              accessibilityHint={
                expanded ? undefined : "Shows the whole caption"
              }
              onPress={() => setExpanded((value) => !value)}
            >
              <Text
                numberOfLines={expanded ? undefined : 3}
                style={styles.caption}
              >
                {description}
              </Text>
            </Pressable>
          ) : isOwner ? (
            <Pressable
              accessibilityLabel="Add a caption"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => setEditing(true)}
              style={({ pressed }) => [
                styles.addCaption,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons
                color="rgba(255,255,255,0.65)"
                name="pencil-outline"
                size={14}
              />
              <Text style={styles.addCaptionLabel}>Add a caption</Text>
            </Pressable>
          ) : null}

          <View style={styles.footerRow}>
            {meta ? (
              <HeartButton
                emptyHint="Be the first to like this"
                liked={reaction.reacted}
                likes={reaction.reactions}
                onDark
                onPressCount={
                  reaction.reactions > 0
                    ? () => onShowLikers(meta.id, reaction.reactions)
                    : undefined
                }
                onToggle={() => void reaction.toggle()}
              />
            ) : (
              <View style={styles.footerSpacer} />
            )}
            {isOwner ? (
              <View style={styles.tools}>
                {description ? (
                  <Pressable
                    accessibilityLabel="Edit caption"
                    accessibilityRole="button"
                    hitSlop={space.xs}
                    onPress={() => setEditing(true)}
                    style={({ pressed }) => [
                      styles.captionButton,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Ionicons color="#ffffff" name="pencil" size={16} />
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityLabel="Delete"
                  accessibilityRole="button"
                  hitSlop={space.xs}
                  onPress={onDelete}
                  style={({ pressed }) => [
                    styles.captionButton,
                    styles.captionDelete,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Ionicons color="#ffffff" name="trash-outline" size={16} />
                </Pressable>
              </View>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
};

/**
 * The viewer is dark in both themes, so its controls are media chips — web's
 * `MEDIA_CHIP`, black with no blur — rather than theme-tinted glass, which in
 * the light theme would be white chips under white icons.
 */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;
const MEDIA_DIM = `rgba(0,0,0,${SCRIM_ALPHA.dim})`;

const styles = StyleSheet.create({
  addCaption: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: space.xs + 2,
    minHeight: 24,
  },
  addCaptionLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: fontSize.label,
    fontStyle: "italic",
  },
  backdrop: { backgroundColor: "#000000", ...StyleSheet.absoluteFillObject },
  caption: {
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    fontSize: fontSize.label,
    lineHeight: 18,
  },
  captionActions: {
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "flex-end",
  },
  captionBar: {
    backgroundColor: MEDIA_CHIP,
    gap: space.xs + 2,
    paddingHorizontal: space.md,
    paddingTop: space.sm + 2,
  },
  captionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  captionDelete: { backgroundColor: "rgba(180,30,30,0.7)" },
  captionEdit: { gap: space.sm },
  captionInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.md,
    color: "#ffffff",
    fontSize: fontSize.label,
    maxHeight: 96,
    paddingHorizontal: space.sm + 4,
    paddingVertical: space.sm,
  },
  clock: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    minWidth: 34,
    textAlign: "center",
  },
  counter: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: "#ffffff",
    transform: [{ scale: 1.25 }],
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingBottom: space.sm,
  },
  fill: { height: "100%", width: "100%" },
  fillBar: {
    backgroundColor: "#ffffff",
    borderRadius: 2,
    height: "100%",
  },
  footer: { bottom: 0, left: 0, position: "absolute", right: 0 },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "space-between",
    minHeight: 32,
  },
  footerSpacer: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: space.md,
    position: "absolute",
    right: 0,
    top: 0,
  },
  headerDim: { ...StyleSheet.absoluteFillObject, bottom: -space.lg },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: space.sm,
  },
  headerRight: { alignItems: "center", flexDirection: "row", gap: space.sm },
  iconButton: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  loading: {
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  modeChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 4,
  },
  modeLabel: { color: "#ffffff", fontSize: 11, fontWeight: "600" },
  page: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  playBadge: {
    alignItems: "center",
    justifyContent: "center",
    ...StyleSheet.absoluteFillObject,
  },
  playDisc: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 36,
    borderWidth: 1.5,
    height: 72,
    justifyContent: "center",
    paddingLeft: 5,
    width: 72,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
  },
  root: { flex: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    height: "100%",
    position: "absolute",
    top: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  title: { color: "#ffffff", fontSize: fontSize.label, fontWeight: "700" },
  titleBlock: { flexShrink: 1, gap: 1 },
  tools: { alignItems: "center", flexDirection: "row", gap: space.sm },
  track: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 2,
    flex: 1,
    height: 3,
    overflow: "hidden",
  },
});
