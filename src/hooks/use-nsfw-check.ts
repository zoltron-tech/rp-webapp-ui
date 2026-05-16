"use client";
import { useEffect, useState } from "react";
import { getModel } from "@/lib/nsfw-model";

// Per-class thresholds. "Sexy" alone is too prone to false positives
// (artistic/suggestive content), so it requires a much higher confidence.
// "Porn" and "Hentai" are flagged at a lower threshold to catch mixed results.
const CLASS_THRESHOLDS: Record<string, number> = {
  Hentai: 0.99,
  Porn: 0.9,
  Sexy: 0.99,
};

const MODEL_INPUT_SIZE = 224;
const MAX_CONCURRENT = 2;

// Cache classification results across the whole app so the same image URL
// is only classified once per page load.
const resultCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

// Simple FIFO queue with a small concurrency cap to avoid GPU thrashing
// when many images mount at the same time.
let active = 0;
const waiters: Array<() => void> = [];
const acquire = (): Promise<void> =>
  new Promise((resolve) => {
    if (active < MAX_CONCURRENT) {
      active++;
      resolve();
    } else {
      waiters.push(() => {
        active++;
        resolve();
      });
    }
  });
const release = (): void => {
  active--;
  const next = waiters.shift();
  if (next) next();
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });

// Downscale to the model's native input size before classification. This
// avoids uploading multi-MB images to the GPU and slashes inference time
// for large covers/wallpapers.
const toCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  }
  return canvas;
};

const classifyUrl = async (src: string): Promise<boolean> => {
  if (resultCache.has(src)) return resultCache.get(src) as boolean;
  const existing = inflight.get(src);
  if (existing) return existing;

  const promise = (async () => {
    await acquire();
    try {
      const img = await loadImage(src);
      const canvas = toCanvas(img);

      const model = await getModel();
      const predictions = await model.classify(canvas);

      const unsafe = predictions.some(
        (p) =>
          p.className in CLASS_THRESHOLDS &&
          p.probability > CLASS_THRESHOLDS[p.className],
      );

      if (unsafe) {
        console.log(
          "[NSFW] 🔴 UNSAFE:",
          src,
          predictions.map(
            (p) => `${p.className}: ${(p.probability * 100).toFixed(1)}%`,
          ),
        );
      }

      resultCache.set(src, unsafe);
      return unsafe;
    } catch (err) {
      // If we can't load or classify the image (CORS, network, etc.), treat
      // it as safe — failing closed would hide every image.
      console.warn("[NSFW] Failed to classify:", src, err);
      resultCache.set(src, false);
      return false;
    } finally {
      release();
      inflight.delete(src);
    }
  })();

  inflight.set(src, promise);
  return promise;
};

/**
 * Classifies the given image URL with NSFWJS and returns whether it should
 * be considered sensitive. Returns `null` while the check is in flight.
 */
export const useNsfwCheck = (
  src?: string | null,
  skip?: boolean,
): boolean | null => {
  const [isNsfw, setIsNsfw] = useState<boolean | null>(() => {
    if (skip) return false;
    return src && resultCache.has(src)
      ? (resultCache.get(src) as boolean)
      : null;
  });

  useEffect(() => {
    if (skip) {
      setIsNsfw(false);
      return;
    }
    if (!src) {
      setIsNsfw(null);
      return;
    }

    if (resultCache.has(src)) {
      setIsNsfw(resultCache.get(src) as boolean);
      return;
    }

    let cancelled = false;
    setIsNsfw(null);
    classifyUrl(src).then((result) => {
      if (!cancelled) setIsNsfw(result);
    });

    return () => {
      cancelled = true;
    };
  }, [src, skip]);

  return isNsfw;
};
