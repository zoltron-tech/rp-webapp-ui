/**
 * Client-side video compatibility fixup.
 *
 * iPhones record video as HEVC (`hvc1`/`hev1`) by default, which Chrome and
 * Firefox cannot decode in <video> — the upload silently ends up unplayable
 * for most viewers. Rather than fixing this server-side (which would touch
 * every upload path), we detect the codec in-browser before upload and
 * re-encode to H.264 using WebCodecs (via mediabunny) when needed, so the
 * presigned-URL upload always ships a broadly playable file.
 */

import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  canEncodeVideo,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
} from "mediabunny";

// Codecs every major browser already decodes natively in <video> — no need to touch these.
const WEB_COMPATIBLE_VIDEO_CODECS = new Set(["avc", "vp9", "vp8", "av1"]);

/**
 * Re-encodes `file` to H.264/MP4 when its video codec isn't broadly
 * browser-compatible. Falls back to returning the original file untouched
 * whenever transcoding isn't necessary or isn't possible (no video track,
 * already compatible, WebCodecs unsupported, or any failure during
 * conversion) — transcoding is a best-effort improvement, never a hard
 * requirement for upload to proceed.
 */
export const ensureWebCompatibleVideo = async (file: File): Promise<File> => {
  if (!file.type.startsWith("video/")) return file;

  let input: Input | null = null;
  try {
    input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return file;

    const codec = await videoTrack.getCodec();
    if (codec && WEB_COMPATIBLE_VIDEO_CODECS.has(codec)) return file;

    if (!(await canEncodeVideo("avc"))) return file;

    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    const conversion = await Conversion.init({
      input,
      output,
      video: { bitrate: QUALITY_HIGH, codec: "avc" },
    });
    if (!conversion.isValid) return file;

    await conversion.execute();

    const { buffer } = output.target as BufferTarget;
    if (!buffer) return file;

    const nameWithoutExt = file.name.replace(/\.\w+$/, "") || "video";
    return new File([buffer], `${nameWithoutExt}.mp4`, { type: "video/mp4" });
  } catch (err) {
    console.warn(
      "[video-transcode] Falling back to original file after error:",
      err,
    );
    return file;
  } finally {
    input?.dispose();
  }
};
