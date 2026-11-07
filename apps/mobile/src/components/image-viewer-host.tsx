import { MediaViewer } from "@/components/muse/media-viewer";
import { closeImage, useOpenImage } from "@/lib/image-viewer";

const NO_META = new Map();

/**
 * The one full-screen viewer behind `openImage`: a single picture, read-only,
 * with no captions and no owner tools. Mounted only while something is open, so
 * it costs nothing the rest of the time.
 */
export const ImageViewerHost = () => {
  const url = useOpenImage();
  if (!url) return null;

  return (
    <MediaViewer
      index={0}
      isOwner={false}
      media={[url]}
      metaByUrl={NO_META}
      onCaption={async () => false}
      onChange={() => undefined}
      onClose={closeImage}
      onDelete={() => undefined}
    />
  );
};
