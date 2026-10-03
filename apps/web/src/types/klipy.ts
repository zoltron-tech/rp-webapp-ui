/**
 * Shapes returned by the Klipy proxy routes.
 *
 * They live here rather than beside the handlers because both sides need them:
 * the pickers in `src/components/*-picker` and the routes in `api/_klipy.ts`.
 * The key is deliberately different per media type (`clipUrl`, `gifUrl`,
 * `stickerUrl`) — the pickers are not interchangeable and the types say so.
 */

export type ClipItem = {
  id: string;
  title: string;
  clipUrl: string;
  previewUrl: string;
};

export type GifItem = {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
};

export type StickerItem = {
  id: string;
  title: string;
  stickerUrl: string;
  previewUrl: string;
};
