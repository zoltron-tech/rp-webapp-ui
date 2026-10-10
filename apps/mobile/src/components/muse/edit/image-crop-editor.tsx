import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line, Path } from "react-native-svg";
import type { CropState } from "@/hooks/use-muse-edit";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Adjusting a picture: the avatar's circle, the card's 9:16 portrait.
 *
 * ## What this replaced, and why
 *
 * The first version was a bottom sheet: a small viewport, −/+ buttons, and a
 * drag that changed the stored *percentage* by the finger's distance over the
 * spare width. Three things were wrong with it, all of them things people feel
 * before they can name them:
 *
 *  - **The picture did not follow the finger.** Percentage-per-pixel changes
 *    with zoom, so a drag that moved the picture an inch at 3× moved it a foot
 *    at 1.1×, and at exactly-fitting zoom the axis locked. Every editor people
 *    use daily moves the picture by exactly the distance the finger moved.
 *  - **Pinch zoomed about the centre**, so the point under the fingers slid
 *    away as you zoomed toward it. A pinch has a focal point — the midpoint of
 *    the two touches — and the picture must scale *about that point*.
 *  - **Every move re-rendered.** The transform was React state, so each of the
 *    sixty gesture events a second went through a render. It stuttered under
 *    the finger, which is the one place stutter cannot be hidden.
 *
 * ## What the editors people know actually do
 *
 * WhatsApp's profile photo, Telegram's, Discord's avatar, Instagram's, and the
 * system photo pickers on both platforms agree on a shape, and this is it:
 *
 *  - **Full screen, on black.** The crop frame sits in the middle; the picture
 *    is drawn *unclipped* underneath and the rest is dimmed, so you can see
 *    what you are cropping away, not only what you are keeping.
 *  - **One finger pans, two fingers pinch, and both at once.** The pinch zooms
 *    about the fingers' midpoint and the midpoint's own drift pans.
 *  - **The picture always covers the frame.** You cannot zoom out past cover
 *    or drag an edge into the frame; pushing past a bound moves the picture a
 *    fraction of the finger (rubber band) and it springs back on release.
 *  - **Composition guides while touching.** A rule-of-thirds grid fades in for
 *    the gesture and out again after, so it never sits on the result.
 *  - **Double-tap toggles zoom** about the tap, and there is a Reset.
 *  - **The transform runs off the JS thread.** Gesture events set animated
 *    values that drive a native transform; nothing renders until release,
 *    when a spring settles the picture within bounds.
 *
 * This is that, on `PanResponder` and `Animated` — the gesture library and
 * Reanimated would each be a native rebuild for every device, which
 * `components/sheet.tsx` explains this app avoids.
 *
 * ## The one model, in pixels then percentages
 *
 * The stored crop is `x`, `y` (0–100) and `scale` (1–3), read by `CroppedImage`
 * as: the picture is `scale × frame width` wide, its height follows its own
 * ratio, and `x%` of the spare width lies to its left. While a finger is down
 * the same picture is held as a top-left offset in *pixels* (`tx`, `ty`) and a
 * scale — the space gestures happen in — and is converted back to percentages
 * only on save. Both are the one framing; only the units differ.
 *
 * ## What was tried and taken back
 *
 * A second pass added fling momentum, a dim that eased while touching, a live
 * zoom readout written through `setNativeProps`, a placeholder blur and a
 * bounded display copy. Together they made the drag and pinch flicker on
 * device, so the whole pass was reverted to this version. Reintroduce any of
 * them one at a time, on a device, or not at all.
 */

const MAX_ZOOM = 3;

/** How much of an over-scroll the picture follows — the rubber band. */
const RUBBER = 0.38;

/** A tap is shorter and stiller than this; two within `DOUBLE_TAP_MS` toggle zoom. */
const TAP_MS = 260;
const TAP_SLOP = 8;
const DOUBLE_TAP_MS = 320;

/** Air round the frame in the canvas. */
const MARGIN_X = space.lg;
const MARGIN_Y = space.xl;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Past a bound the picture moves `RUBBER` of the finger, both directions. */
const rubber = (value: number, min: number, max: number) => {
  if (value < min) return min - (min - value) * RUBBER;
  if (value > max) return max + (value - max) * RUBBER;
  return value;
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

interface Pose {
  s: number;
  tx: number;
  ty: number;
}

interface Frame {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface ImageCropEditorProps {
  /** Frame shape: 1 for the avatar's circle, 9/16 for the card. */
  aspect: number;
  /** Open fitted to cover the frame (a new upload) rather than at `initial`. */
  autoFit?: boolean;
  busy?: boolean;
  /** A round frame, for the avatar. */
  circle?: boolean;
  initial: CropState;
  onClose: () => void;
  onConfirm: (crop: CropState) => void;
  /** "Choose another" — pick a different picture, same flow. */
  onReplace?: () => void;
  title: string;
  /** Local while uploading, then remote. */
  uri: string | null;
  uploading?: boolean;
  visible: boolean;
}

export const ImageCropEditor = ({
  aspect,
  autoFit = false,
  busy = false,
  circle = false,
  initial,
  onClose,
  onConfirm,
  onReplace,
  title,
  uploading = false,
  uri,
  visible,
}: ImageCropEditorProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [canvas, setCanvas] = useState<{
    height: number;
    width: number;
  } | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [placed, setPlaced] = useState(false);

  // Where the canvas sits in the window, so a touch's page point can be turned
  // into a point in the frame — which is where the pinch's focal point lives.
  const canvasRef = useRef<View>(null);
  const canvasOrigin = useRef({ x: 0, y: 0 });

  const onCanvasLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    if (!canvas || canvas.width !== width || canvas.height !== height) {
      setCanvas({ height, width });
    }
    canvasRef.current?.measureInWindow((x, y) => {
      canvasOrigin.current = { x, y };
    });
  };

  /** The crop frame, centred in the canvas with air round it. */
  const frame = useMemo<Frame | null>(() => {
    if (!canvas) return null;
    const maxWidth = canvas.width - MARGIN_X * 2;
    const maxHeight = canvas.height - MARGIN_Y * 2;
    const width = Math.min(maxWidth, maxHeight * aspect);
    const height = width / aspect;
    return {
      height,
      width,
      x: (canvas.width - width) / 2,
      y: (canvas.height - height) / 2,
    };
  }, [aspect, canvas]);

  // ── The pose, in two places ─────────────────────────────────────────────
  // `pose` is the truth between gestures; the animated values are what the
  // picture is drawn from and are written on every move without a render.
  const pose = useRef<Pose>({ s: 1, tx: 0, ty: 0 });
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const zoom = useRef(new Animated.Value(1)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;

  /** The smallest zoom the picture may rest at: covering the frame. */
  const coverScale = useCallback(
    () =>
      frame && ratio ? Math.max(1, (frame.height / frame.width) * ratio) : 1,
    [frame, ratio],
  );

  /**
   * The zoom floor. Cover, normally — but a crop saved on web at a zoom that
   * left bands is opened as saved rather than silently corrected, so the
   * floor is whichever is lower until the person zooms.
   */
  const minScale = useRef(1);

  /** Where the picture's top-left may rest at zoom `s`. */
  const bounds = useCallback(
    (s: number) => {
      if (!frame || !ratio) return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
      const w = frame.width * s;
      const h = w / ratio;
      // Wider than the frame: slide between flush-left and flush-right.
      // Narrower (only when cover would exceed 3×): held centred.
      const spareX = frame.width - w;
      const spareY = frame.height - h;
      return {
        maxX: spareX >= 0 ? spareX / 2 : 0,
        maxY: spareY >= 0 ? spareY / 2 : 0,
        minX: spareX >= 0 ? spareX / 2 : spareX,
        minY: spareY >= 0 ? spareY / 2 : spareY,
      };
    },
    [frame, ratio],
  );

  const write = useCallback(
    (next: Pose) => {
      pose.current = next;
      panX.setValue(next.tx);
      panY.setValue(next.ty);
      zoom.setValue(next.s);
    },
    [panX, panY, zoom],
  );

  const settle = useCallback(
    (target: Pose, animated = true) => {
      pose.current = target;
      if (!animated) {
        write(target);
        return;
      }
      const spec = { bounciness: 0, speed: 18, useNativeDriver: true };
      Animated.parallel([
        Animated.spring(panX, { ...spec, toValue: target.tx }),
        Animated.spring(panY, { ...spec, toValue: target.ty }),
        Animated.spring(zoom, { ...spec, toValue: target.s }),
      ]).start();
    },
    [panX, panY, write, zoom],
  );

  /** The nearest legal pose to `raw`. */
  const legal = useCallback(
    (raw: Pose): Pose => {
      const s = clamp(raw.s, minScale.current, MAX_ZOOM);
      const b = bounds(s);
      return {
        s,
        tx: clamp(raw.tx, b.minX, b.maxX),
        ty: clamp(raw.ty, b.minY, b.maxY),
      };
    },
    [bounds],
  );

  /** Percentages → pixels, for the opening pose. */
  const fromCrop = useCallback(
    (crop: CropState): Pose => {
      if (!frame || !ratio) return { s: 1, tx: 0, ty: 0 };
      const w = frame.width * crop.scale;
      const h = w / ratio;
      return {
        s: crop.scale,
        tx: ((frame.width - w) * crop.x) / 100,
        ty: ((frame.height - h) * crop.y) / 100,
      };
    },
    [frame, ratio],
  );

  /** Pixels → percentages, for the save. */
  const toCrop = useCallback(
    (p: Pose): CropState => {
      if (!frame || !ratio) return { scale: p.s, x: 50, y: 50 };
      const w = frame.width * p.s;
      const h = w / ratio;
      const spareX = frame.width - w;
      const spareY = frame.height - h;
      return {
        scale: p.s,
        x: spareX === 0 ? 50 : clamp((p.tx / spareX) * 100, 0, 100),
        y: spareY === 0 ? 50 : clamp((p.ty / spareY) * 100, 0, 100),
      };
    },
    [frame, ratio],
  );

  /** Cover, centred — the pose a new upload opens at and Reset returns to. */
  const fitted = useCallback((): Pose => {
    const s = Math.min(coverScale(), MAX_ZOOM);
    const b = bounds(s);
    return { s, tx: (b.minX + b.maxX) / 2, ty: (b.minY + b.maxY) / 2 };
  }, [bounds, coverScale]);

  // A different picture has a different shape: wait for its `onLoad` again.
  useEffect(() => {
    setRatio(null);
    setPlaced(false);
  }, [uri]);

  useEffect(() => {
    if (!visible) setPlaced(false);
  }, [visible]);

  // Place the picture once its shape and the frame are both known.
  useEffect(() => {
    if (!visible || placed || !frame || !ratio) return;
    const cover = Math.min(coverScale(), MAX_ZOOM);
    if (autoFit) {
      minScale.current = cover;
      write(fitted());
    } else {
      minScale.current = Math.min(cover, Math.max(1, initial.scale));
      write(legal(fromCrop(initial)));
    }
    setPlaced(true);
  }, [
    autoFit,
    coverScale,
    fitted,
    frame,
    fromCrop,
    initial,
    legal,
    placed,
    ratio,
    visible,
    write,
  ]);

  // ── Gestures ────────────────────────────────────────────────────────────
  // The responder is created once, so everything it reads is a ref.
  const live = useRef<Pose>({ s: 1, tx: 0, ty: 0 });
  const panPrev = useRef<{ x: number; y: number } | null>(null);
  const pinchPrev = useRef<{
    d: number;
    mid: { x: number; y: number };
  } | null>(null);
  const gestureStart = useRef<{ at: number; x: number; y: number } | null>(
    null,
  );
  const moved = useRef(false);
  const lastTap = useRef<{ at: number; x: number; y: number } | null>(null);
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const fns = useRef({ bounds, fitted, legal, settle, write });
  fns.current = { bounds, fitted, legal, settle, write };

  const showGrid = useCallback(
    (on: boolean) =>
      Animated.timing(gridOpacity, {
        duration: on ? 120 : 220,
        toValue: on ? 1 : 0,
        useNativeDriver: true,
      }).start(),
    [gridOpacity],
  );

  /** A page point as a point in the frame's coordinates. */
  const inFrame = (page: { x: number; y: number }) => {
    const f = frameRef.current;
    return {
      x: page.x - canvasOrigin.current.x - (f?.x ?? 0),
      y: page.y - canvasOrigin.current.y - (f?.y ?? 0),
    };
  };

  /** Draw `raw` with the rubber band applied, without committing it. */
  const drawLive = (raw: Pose) => {
    const soft = {
      s: rubber(raw.s, minScale.current, MAX_ZOOM),
      tx: raw.tx,
      ty: raw.ty,
    };
    const b = fns.current.bounds(clamp(soft.s, minScale.current, MAX_ZOOM));
    soft.tx = rubber(raw.tx, b.minX, b.maxX);
    soft.ty = rubber(raw.ty, b.minY, b.maxY);
    live.current = raw;
    panX.setValue(soft.tx);
    panY.setValue(soft.ty);
    zoom.setValue(soft.s);
  };

  const zoomAbout = (
    focal: { x: number; y: number },
    from: Pose,
    s: number,
  ) => {
    const k = s / from.s;
    return {
      s,
      tx: focal.x - (focal.x - from.tx) * k,
      ty: focal.y - (focal.y - from.ty) * k,
    };
  };

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const touch = event.nativeEvent.touches[0];
        gestureStart.current = {
          at: Date.now(),
          x: touch?.pageX ?? 0,
          y: touch?.pageY ?? 0,
        };
        moved.current = false;
        panPrev.current = touch ? { x: touch.pageX, y: touch.pageY } : null;
        pinchPrev.current = null;
        live.current = pose.current;
        showGrid(true);
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const current = live.current;

        if (touches.length >= 2) {
          const mid = midpoint(touches);
          const d = distance(touches);
          if (!pinchPrev.current) {
            // Second finger just landed: from here the gesture is a pinch.
            pinchPrev.current = { d, mid };
            panPrev.current = null;
            return;
          }
          moved.current = true;
          const k = d / pinchPrev.current.d;
          const focal = inFrame(mid);
          const zoomed = zoomAbout(focal, current, current.s * k);
          // The midpoint's own drift is a pan, at the same time.
          zoomed.tx += mid.x - pinchPrev.current.mid.x;
          zoomed.ty += mid.y - pinchPrev.current.mid.y;
          pinchPrev.current = { d, mid };
          drawLive(zoomed);
          return;
        }

        const touch = touches[0];
        if (!touch) return;
        if (pinchPrev.current) {
          // A finger lifted mid-pinch: continue as a pan from where the
          // remaining finger *is*, not from where the gesture began.
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
        if (
          gestureStart.current &&
          Math.hypot(
            touch.pageX - gestureStart.current.x,
            touch.pageY - gestureStart.current.y,
          ) > TAP_SLOP
        ) {
          moved.current = true;
        }
        // One finger, one picture: it moves exactly as far as the finger did.
        drawLive({ s: current.s, tx: current.tx + dx, ty: current.ty + dy });
      },
      onPanResponderRelease: () => {
        showGrid(false);
        const start = gestureStart.current;
        const now = Date.now();
        const isTap =
          start !== null && !moved.current && now - start.at < TAP_MS;

        if (isTap && start) {
          const previous = lastTap.current;
          lastTap.current = { at: now, x: start.x, y: start.y };
          if (
            previous &&
            now - previous.at < DOUBLE_TAP_MS &&
            Math.hypot(start.x - previous.x, start.y - previous.y) <
              TAP_SLOP * 3
          ) {
            lastTap.current = null;
            const current = pose.current;
            const floor = minScale.current;
            // Zoomed in: back to the fit. At the fit: in, about the tap.
            if (current.s > floor * 1.05) {
              fns.current.settle(fns.current.fitted());
            } else {
              const target = Math.min(MAX_ZOOM, floor * 2.2);
              const focal = inFrame({ x: start.x, y: start.y });
              fns.current.settle(
                fns.current.legal(zoomAbout(focal, current, target)),
              );
            }
            return;
          }
        }

        // Settle the rubber band: spring to the nearest legal pose.
        fns.current.settle(fns.current.legal(live.current));
      },
      onPanResponderTerminate: () => {
        showGrid(false);
        fns.current.settle(fns.current.legal(live.current));
      },
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  // ── The drawn transform ────────────────────────────────────────────────
  // React Native scales about a view's centre, so the translate carries the
  // centre's drift: top-left = translate + (1 − s) × size / 2, solved for the
  // translate. Every node here runs on the native driver.
  const base = useMemo(() => {
    if (!frame || !ratio) return null;
    return { height: frame.width / ratio, width: frame.width };
  }, [frame, ratio]);

  const transform = useMemo(() => {
    if (!base) return null;
    const grown = Animated.subtract(zoom, 1);
    return [
      {
        translateX: Animated.add(
          panX,
          Animated.multiply(grown, base.width / 2),
        ),
      },
      {
        translateY: Animated.add(
          panY,
          Animated.multiply(grown, base.height / 2),
        ),
      },
      { scale: zoom },
    ];
  }, [base, panX, panY, zoom]);

  const canConfirm = Boolean(uri) && placed && !uploading && !busy;

  const maskPath = useMemo(() => {
    if (!canvas || !frame) return "";
    const outer = `M0 0 H${canvas.width} V${canvas.height} H0 Z`;
    if (circle) {
      const r = frame.width / 2;
      const cx = frame.x + r;
      const cy = frame.y + r;
      // Two arcs make the circle; even-odd fill leaves it as the hole.
      return `${outer} M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
    }
    const rr = 8;
    const { height: h, width: w, x, y } = frame;
    return `${outer} M${x + rr} ${y} H${x + w - rr} Q${x + w} ${y} ${x + w} ${y + rr} V${y + h - rr} Q${x + w} ${y + h} ${x + w - rr} ${y + h} H${x + rr} Q${x} ${y + h} ${x} ${y + h - rr} V${y + rr} Q${x} ${y} ${x + rr} ${y} Z`;
  }, [canvas, circle, frame]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      <View style={styles.root}>
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: insets.top + space.xs }]}>
          <Pressable
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            disabled={busy}
            hitSlop={space.sm}
            onPress={onClose}
            style={({ pressed }) => [
              styles.textButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.textButtonLabel}>Cancel</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Pressable
            accessibilityLabel="Done"
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: !canConfirm }}
            disabled={!canConfirm}
            hitSlop={space.sm}
            onPress={() => onConfirm(toCrop(pose.current))}
            style={({ pressed }) => [
              styles.done,
              {
                backgroundColor: canConfirm
                  ? pressed
                    ? theme.accent.fillPressed
                    : theme.accent.fill
                  : "rgba(255,255,255,0.14)",
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text
                style={[
                  styles.doneLabel,
                  {
                    color: canConfirm ? "#ffffff" : "rgba(255,255,255,0.45)",
                  },
                ]}
              >
                Done
              </Text>
            )}
          </Pressable>
        </View>

        {/* ── Canvas ──────────────────────────────────────────────────── */}
        <View
          {...responder.panHandlers}
          onLayout={onCanvasLayout}
          ref={canvasRef}
          style={styles.canvas}
        >
          {uri && frame && base && transform ? (
            <Animated.View
              style={[
                styles.picture,
                {
                  height: base.height,
                  left: frame.x,
                  opacity: placed ? 1 : 0,
                  top: frame.y,
                  transform,
                  width: base.width,
                },
              ]}
            >
              <Image
                cachePolicy="memory-disk"
                contentFit="fill"
                source={{ uri }}
                style={styles.fill}
                transition={0}
              />
            </Animated.View>
          ) : null}

          {/* The shape's own picture loads once, unseen, to learn its ratio. */}
          {uri ? (
            <Image
              onLoad={({ source }) => {
                if (source?.width && source?.height) {
                  setRatio(source.width / source.height);
                }
              }}
              source={{ uri }}
              style={styles.probe}
            />
          ) : null}

          {canvas && frame ? (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {/* Dim everything the frame will not keep; the hole shows it. */}
              <Svg height={canvas.height} width={canvas.width}>
                <Path d={maskPath} fill="rgba(0,0,0,0.62)" fillRule="evenodd" />
              </Svg>

              {/* The frame's edge, always, and the thirds while touching. */}
              <View
                style={[
                  styles.edge,
                  {
                    borderRadius: circle ? frame.width / 2 : 8,
                    height: frame.height,
                    left: frame.x,
                    top: frame.y,
                    width: frame.width,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.grid,
                  {
                    height: frame.height,
                    left: frame.x,
                    opacity: gridOpacity,
                    top: frame.y,
                    width: frame.width,
                  },
                ]}
              >
                <Svg height={frame.height} width={frame.width}>
                  {[1, 2].map((n) => (
                    <Line
                      key={`v${n}`}
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth={StyleSheet.hairlineWidth}
                      x1={(frame.width * n) / 3}
                      x2={(frame.width * n) / 3}
                      y1={0}
                      y2={frame.height}
                    />
                  ))}
                  {[1, 2].map((n) => (
                    <Line
                      key={`h${n}`}
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth={StyleSheet.hairlineWidth}
                      x1={0}
                      x2={frame.width}
                      y1={(frame.height * n) / 3}
                      y2={(frame.height * n) / 3}
                    />
                  ))}
                </Svg>
              </Animated.View>
            </View>
          ) : null}

          {uploading || (uri && !placed) ? (
            <View pointerEvents="none" style={styles.status}>
              <View style={styles.statusChip}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.statusLabel}>
                  {uploading ? "Uploading…" : "Loading…"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* ── Foot ────────────────────────────────────────────────────── */}
        <View
          style={[
            styles.foot,
            { paddingBottom: Math.max(insets.bottom, space.md) },
          ]}
        >
          <Text style={styles.hint}>
            Drag to move · Pinch to zoom · Double-tap to zoom in or out
          </Text>
          <View style={styles.tools}>
            <Tool
              disabled={!placed}
              icon="refresh-outline"
              label="Reset"
              onPress={() => settle(fitted())}
            />
            {onReplace ? (
              <Tool
                disabled={uploading || busy}
                icon="images-outline"
                label="Choose another"
                onPress={onReplace}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Tool = ({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.tool,
      { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
    ]}
  >
    <Ionicons color="#ffffff" name={icon} size={16} />
    <Text style={styles.toolLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: "#000000",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  done: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  doneLabel: { fontSize: fontSize.label, fontWeight: "700" },
  edge: {
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: border.edge * 2,
    position: "absolute",
  },
  fill: { height: "100%", width: "100%" },
  foot: {
    alignItems: "center",
    backgroundColor: "#000000",
    gap: space.m,
    paddingHorizontal: space.md,
    paddingTop: space.m,
  },
  grid: { position: "absolute" },
  hint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: fontSize.caption,
    textAlign: "center",
  },
  picture: { position: "absolute" },
  probe: { height: 1, opacity: 0, position: "absolute", width: 1 },
  root: { backgroundColor: "#000000", flex: 1 },
  status: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: space.md,
  },
  statusChip: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.s,
  },
  statusLabel: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: "600",
  },
  textButton: { minWidth: 72, paddingVertical: 7 },
  textButtonLabel: { color: "#ffffff", fontSize: fontSize.body },
  title: {
    color: "#ffffff",
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: "700",
    textAlign: "center",
  },
  tool: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  toolLabel: { color: "#ffffff", fontSize: fontSize.label, fontWeight: "600" },
  tools: { flexDirection: "row", gap: space.sm },
  topBar: {
    alignItems: "center",
    backgroundColor: "#000000",
    flexDirection: "row",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
  },
});
