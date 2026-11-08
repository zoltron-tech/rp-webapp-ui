const MB = 1024 * 1024;
const GB = 1024 * MB;

/**
 * Bytes as people read storage: megabytes, or gigabytes from 1 GB up with one
 * decimal ("340 MB", "1.5 GB", "2 GB"). The one formatter for storage and
 * upload sizes, so the settings row, its explainer and the refusal copy all
 * print a limit the same way.
 *
 * Binary units (1 MB = 1024 × 1024 bytes), matching the upload caps and the
 * service's limits. A trailing ".0" is dropped, and a non-zero amount under
 * half a megabyte reads "<1 MB" rather than a misleading "0 MB".
 */
export const formatBytes = (bytes: number | null | undefined): string => {
  const value =
    Number.isFinite(bytes) && (bytes as number) > 0 ? (bytes as number) : 0;
  if (value >= GB) {
    const gb = Math.round((value / GB) * 10) / 10;
    return `${Number.isInteger(gb) ? gb.toFixed(0) : gb.toFixed(1)} GB`;
  }
  const mb = Math.round(value / MB);
  if (mb === 0 && value > 0) return "<1 MB";
  // 1023.6 MB rounds to 1024: say "1 GB" rather than "1024 MB".
  if (mb >= 1024) return "1 GB";
  return `${mb} MB`;
};
