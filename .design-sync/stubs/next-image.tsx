// Browser-preview stub for next/image — plain img, no optimization pipeline.
import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  quality?: number | string;
  placeholder?: string;
  blurDataURL?: string;
  loader?: unknown;
  unoptimized?: boolean;
};

const Image = React.forwardRef<HTMLImageElement, Props>(function Image(
  { src, fill, priority, quality, placeholder, blurDataURL, loader, unoptimized, style, alt = "", ...rest },
  ref,
) {
  const url = typeof src === "string" ? src : src?.src;
  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: (style as React.CSSProperties)?.objectFit ?? "cover" }
    : {};
  return <img ref={ref} src={url} alt={alt} style={{ ...fillStyle, ...style }} {...rest} />;
});

export default Image;
