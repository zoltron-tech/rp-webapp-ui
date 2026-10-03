/**
 * Loads the Spotify IFrame API script once and hands back the global
 * `IFrameAPI` object. Multiple players share a single load via one promise.
 *
 * Docs: https://developer.spotify.com/documentation/embeds/references/iframe-api
 */

export interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  loadUri: (uri: string) => void;
  destroy: () => void;
  addListener: (
    event: "ready" | "playback_update",
    cb: (e: {
      data: {
        isPaused: boolean;
        isBuffering: boolean;
        position: number; // ms
        duration: number; // ms
      };
    }) => void,
  ) => void;
}

export interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

const SRC = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

export function getSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<SpotifyIFrameAPI>((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);

    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return apiPromise;
}
