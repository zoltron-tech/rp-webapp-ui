import type * as nsfwjsType from "nsfwjs";

let model: nsfwjsType.NSFWJS | null = null;
let loadingPromise: Promise<nsfwjsType.NSFWJS> | null = null;

export const getModel = async (): Promise<nsfwjsType.NSFWJS> => {
  if (model) return model;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const [nsfwjs, tf] = await Promise.all([
      import("nsfwjs"),
      import("@tensorflow/tfjs"),
    ]);

    // Prefer WebGL for GPU acceleration; fall back silently if unavailable.
    try {
      await tf.setBackend("webgl");
      await tf.ready();
    } catch {
      // tfjs will fall back to whatever backend is available
    }

    const loaded = await nsfwjs.load("/models/mobilenet_v2/model.json");

    // Warm up the model with a dummy tensor so the first real classification
    // doesn't pay the shader-compile / kernel-allocation cost.
    try {
      tf.tidy(() => {
        const dummy = tf.zeros([1, 224, 224, 3]);
        const inner = (
          loaded as unknown as { model: { predict: (t: unknown) => unknown } }
        ).model;
        const out = inner.predict(dummy) as
          | { dispose: () => void }
          | { dispose: () => void }[];
        if (Array.isArray(out)) {
          for (const t of out) t.dispose();
        } else {
          out.dispose();
        }
      });
    } catch {
      // warmup is best-effort
    }

    model = loaded;
    return loaded;
  })();

  return loadingPromise;
};

/**
 * Kicks off the model download/initialization without awaiting it. Safe to
 * call multiple times — subsequent calls are no-ops.
 */
export const prefetchNsfwModel = (): void => {
  void getModel();
};
