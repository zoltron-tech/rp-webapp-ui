import {
  Image as ExpoImage,
  type ImageProps,
  type ImageSource,
} from "expo-image";
import {
  createContext,
  forwardRef,
  memo,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  evictMissingMedia,
  type MediaKind,
  mediaEvictions,
  prefetchMedia,
  resolveMediaUri,
  useMediaUri,
} from "@/lib/local-store/media";

export * from "expo-image";

/**
 * `expo-image`'s `Image`, reading through the local media cache.
 *
 * Every remote `source` is resolved with `resolveMediaUri`: a picture the
 * cache holds is drawn from its file, one it does not is drawn from the
 * network and downloaded behind the draw, so the next time it is a file. The
 * component re-renders when that download lands — which `expo-image` takes
 * as a new source; it keeps the memory bitmap it already decoded, so the
 * switch is not visible.
 *
 * Every file in the app imports `Image` from here rather than from
 * `expo-image` (see `local-store/media.ts` for what the cache keeps and for
 * how long). The rest of `expo-image` is re-exported untouched.
 *
 * ## When the file has gone
 *
 * The OS can reclaim a cached file at any time. That is not the picture
 * failing, so `onError` does not hear of it: the URL is dropped from the cache
 * and the picture is drawn from the network. A caller's `onError` marks a URL
 * dead for the session, which here would throw away a picture that is fine.
 *
 * ## Kinds
 *
 * `mediaKind` tags the download for retention — `chat` expires with the
 * messages, `general` does not. A `MediaKindProvider` sets it for a subtree,
 * which is how the conversation screen tags everything it draws without each
 * bubble knowing.
 *
 * A `chat` picture is also drawn with `cachePolicy: "memory"` unless the
 * caller says otherwise: `expo-image` must not keep a disk copy of its own,
 * or the fourteen-day purge would leave one behind. The file this cache keeps
 * is the disk copy.
 */

const MediaKindContext = createContext<MediaKind>("general");

export const MediaKindProvider = MediaKindContext.Provider;

type Source = ImageProps["source"];

const resolveSource = (source: Source, kind: MediaKind): Source => {
  if (typeof source === "string")
    return resolveMediaUri(source, kind) ?? source;
  if (Array.isArray(source)) {
    return (source as (string | ImageSource)[]).map((item) =>
      resolveSource(item, kind),
    ) as Source;
  }
  if (source && typeof source === "object" && "uri" in source) {
    const uri = resolveMediaUri(source.uri, kind);
    return uri === source.uri ? source : { ...source, uri: uri ?? undefined };
  }
  return source;
};

const firstUri = (source: Source): string | null | undefined => {
  if (typeof source === "string") return source;
  if (Array.isArray(source))
    return firstUri((source as (string | ImageSource)[])[0] as Source);
  if (source && typeof source === "object" && "uri" in source)
    return source.uri;
  return null;
};

/**
 * `playing`: whether an animated picture (a GIF) runs.
 *
 * Undefined leaves `expo-image`'s own behaviour — a GIF plays from the moment
 * it loads until the view goes. Set, it is the one switch: `autoplay` for the
 * first frame, and `startAnimating` / `stopAnimating` on the native view for
 * every change after. A stopped GIF costs nothing per frame; a playing one is
 * a decode per frame on the CPU, which is why the profile stops its hero
 * pictures the moment they are scrolled away, the page is left, or the
 * finger is on the list.
 */
const CachedImage = memo(
  forwardRef<
    ExpoImage,
    ImageProps & { mediaKind?: MediaKind; playing?: boolean }
  >(function Image({ mediaKind, playing, source, ...props }, forwarded) {
    const contextKind = useContext(MediaKindContext);
    const kind = mediaKind ?? contextKind;
    // Subscribes to the index for this picture's URL, so the download landing
    // re-renders this component and nothing else.
    const uri = firstUri(source);
    useMediaUri(uri, kind);
    // Not a re-render of its own: `evictMissingMedia` notifies the hook above.
    const evicted = mediaEvictions(uri);
    const resolved = useMemo(
      () => resolveSource(source, kind),
      [evicted, kind, source],
    );
    const { onError } = props;
    const handleError = useCallback<NonNullable<ImageProps["onError"]>>(
      (event) => {
        if (!evictMissingMedia(uri)) onError?.(event);
      },
      [onError, uri],
    );
    const cachePolicy =
      props.cachePolicy ?? (kind === "chat" ? "memory" : undefined);

    const own = useRef<ExpoImage>(null);
    const ref = forwarded ?? own;
    const view = ref as RefObject<ExpoImage | null>;

    useEffect(() => {
      if (playing === undefined) return;
      const target = view.current;
      if (!target) return;
      // Both resolve async on the native side; a view that has gone by
      // then rejects, and there is nothing to do about a picture that
      // is no longer on screen.
      void (playing ? target.startAnimating() : target.stopAnimating()).catch(
        () => {},
      );
    }, [playing, view]);

    return (
      <ExpoImage
        {...props}
        autoplay={playing ?? props.autoplay}
        cachePolicy={cachePolicy}
        onError={handleError}
        ref={ref}
        source={resolved}
      />
    );
  }),
);

/**
 * The statics callers reach for (`Image.prefetch`, `Image.loadAsync`, the
 * cache clears) stay `expo-image`'s own. `prefetch` additionally queues the
 * URL for this cache, so a viewer warming the next picture warms the file.
 */
export const Image = Object.assign(CachedImage, {
  clearDiskCache: ExpoImage.clearDiskCache.bind(ExpoImage),
  clearMemoryCache: ExpoImage.clearMemoryCache.bind(ExpoImage),
  generateBlurhashAsync: ExpoImage.generateBlurhashAsync.bind(ExpoImage),
  generateThumbhashAsync: ExpoImage.generateThumbhashAsync.bind(ExpoImage),
  getCachePathAsync: ExpoImage.getCachePathAsync.bind(ExpoImage),
  loadAsync: ExpoImage.loadAsync.bind(ExpoImage),
  prefetch: ((urls: string | string[], ...rest: unknown[]) => {
    prefetchMedia(Array.isArray(urls) ? urls : [urls], "general");
    return (ExpoImage.prefetch as (...args: unknown[]) => Promise<boolean>)(
      urls,
      ...rest,
    );
  }) as typeof ExpoImage.prefetch,
});
