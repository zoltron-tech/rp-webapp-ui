// Browser-preview stub for mediabunny — video transcode is a no-op in cards;
// callers fall back to the original file.
export const ALL_FORMATS = [] as unknown[];
export class BlobSource { constructor(_blob: Blob) {} }
export class BufferTarget { buffer: ArrayBuffer | null = null; }
export class Conversion {
  static async init(_opts: unknown): Promise<Conversion> { throw new Error("mediabunny unavailable in preview"); }
  async execute() {}
}
export const canEncodeVideo = async (_codec?: string) => false;
export class Input { constructor(_opts: unknown) {} async getPrimaryVideoTrack() { return null; } }
export class Mp4OutputFormat { constructor(_opts?: unknown) {} }
export class Output { constructor(_opts: unknown) {} }
export const QUALITY_HIGH = "high";
