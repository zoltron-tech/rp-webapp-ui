"use client";

import type { Muse } from "@nw/types";
import { ACCENT_MAP } from "@nw/types/theme";
import { personName } from "@nw/utils";
import { isIOS, isPWA } from "@nw/utils/platform";
import { toPng } from "html-to-image";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiX } from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import { PortraitCardDesign } from "./portrait";
import { SquareCardDesign } from "./square";
import * as S from "./styles";
import type { Design, DesignId } from "./types";

// ─── Helpers (same pattern as MiniProfileCard) ───────────────────────────────

const toBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    )
    .catch(() => url);

const inlineCardImages = async (card: HTMLDivElement): Promise<() => void> => {
  const imgs = Array.from(card.querySelectorAll("img"));
  const originals = imgs.map((img) => img.src);

  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
  );

  await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return;
      const b64 = await toBase64(img.src);
      img.src = b64;
    }),
  );

  return () => {
    imgs.forEach((img, i) => {
      img.src = originals[i] ?? "";
    });
  };
};

const waitForImages = (node: HTMLElement): Promise<void[]> => {
  const imgs = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );
};

// ─── Design gallery ───────────────────────────────────────────────────────────
// Each export design lives in its own folder (./portrait, ./square) as a
// forwardRef component matching CardDesignProps. To add a new design: create
// its folder, then add one entry below — the carousel, swipe/keyboard nav,
// dots, and export all pick it up automatically.

const MAX_ATTRIBUTES = 6;

const DESIGNS: Design[] = [
  {
    Component: PortraitCardDesign,
    height: 646,
    id: "portrait",
    label: "Portrait · 9:16",
    usesCoverPosition: true,
    width: 366,
  },
  {
    Component: SquareCardDesign,
    exportHeight: 1400,
    exportWidth: 1400,
    height: 403,
    id: "square",
    label: "Square · 1:1",
    maxAttributes: 8,
    pixelRatio: 1,
    width: 403,
  },
];

const SWIPE_THRESHOLD_RATIO = 0.2;

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  muse: Muse;
  onClose: () => void;
}

export const MiniMuseCard: FC<Props> = ({ muse, onClose }) => {
  const theme = useGlobalState("theme");
  const cardRefs = useRef<Partial<Record<DesignId, HTMLDivElement | null>>>({});
  const [exporting, setExporting] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [coverPosition, setCoverPosition] = useState(50);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  // ── Design carousel state ──
  const [designIndex, setDesignIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const src = muse.image;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setImageRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = src;
  }, [muse.image]);

  const isSquareImage =
    imageRatio !== null && imageRatio >= 0.9 && imageRatio <= 1.1;
  const isPortrait = imageRatio !== null && imageRatio < 0.9;

  const accent = muse.useAccent ? (muse.accent ?? null) : null;
  const novelistAccent =
    ACCENT_MAP[(muse.pennedBy?.palette as keyof typeof ACCENT_MAP) ?? 0] ??
    ACCENT_MAP[0];

  const coverSrc = muse.image ?? "";
  const profileUrl = `https://novelist.world/rp/muse/${muse.id ?? ""}`;

  const allEntries = muse.extraAttributes
    ? (Object.entries(muse.extraAttributes) as [string, string][])
    : [];

  const activeDesign = DESIGNS[designIndex];
  const viewportSize = useMemo(
    () => ({
      height: Math.max(...DESIGNS.map((d) => d.height)),
      width: Math.max(...DESIGNS.map((d) => d.width)),
    }),
    [],
  );

  const goTo = (i: number) =>
    setDesignIndex(Math.max(0, Math.min(DESIGNS.length - 1, i)));
  const goPrev = () => goTo(designIndex - 1);
  const goNext = () => goTo(designIndex + 1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [designIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current) {
      setDragging(false);
      return;
    }
    const width = viewportRef.current?.offsetWidth || 1;
    const threshold = width * SWIPE_THRESHOLD_RATIO;
    if (dragX <= -threshold && designIndex < DESIGNS.length - 1) {
      goNext();
    } else if (dragX >= threshold && designIndex > 0) {
      goPrev();
    }
    setDragX(0);
    setDragging(false);
    touchStartRef.current = null;
  };

  const handleDownload = async () => {
    const node = cardRefs.current[activeDesign.id];
    if (!node) return;
    setExporting(true);
    let restoreImages: (() => void) | undefined;
    try {
      restoreImages = await inlineCardImages(node);
      await waitForImages(node);
      // Let the browser finish decoding the inlined images before capture.
      await new Promise((resolve) => setTimeout(resolve, 150));

      const exportOptions = {
        cacheBust: true,
        canvasHeight: activeDesign.exportHeight,
        canvasWidth: activeDesign.exportWidth,
        fetchRequestInit: { cache: "no-cache" as RequestCache },
        height: activeDesign.height,
        // html-to-image's internal resource cache keys images by URL with
        // the query string stripped by default. Our images are proxied
        // through wsrv.nl (`https://wsrv.nl/?url=...`), where the query
        // string is the *only* part that differs between images — without
        // this flag, every export after the first reuses whichever
        // wsrv-proxied image its page-lifetime cache saw first.
        includeQueryParams: true,
        pixelRatio: activeDesign.pixelRatio ?? 2,
        style: { transform: "translateZ(0)" },
        width: activeDesign.width,
      };

      // First call primes the cache; second call reliably captures everything.
      await toPng(node, exportOptions);
      const dataUrl = await toPng(node, exportOptions);

      if (isIOS() || isPWA()) {
        setExportedImage(dataUrl);
      } else {
        const link = document.createElement("a");
        link.download =
          `${personName(muse.firstName, muse.lastName).replace(/\s+/g, "-")}-muse-${activeDesign.id}.png`
            .replace(/\s+/g, "-")
            .toLowerCase();
        link.href = dataUrl;
        link.click();
      }
    } finally {
      restoreImages?.();
      setExporting(false);
    }
  };

  return (
    <>
      <S.Overlay onClick={onClose} />
      <S.Modal>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <S.Controls>
            <S.DownloadButton onClick={handleDownload} disabled={exporting}>
              <FiDownload size={16} />
              {exporting ? "Exporting…" : "Download as Image"}
            </S.DownloadButton>
            <S.CloseButton onClick={onClose}>
              <FiX size={20} />
            </S.CloseButton>
          </S.Controls>

          {DESIGNS.length > 1 && (
            <S.DesignSwitcher>
              <S.NavArrow
                type="button"
                onClick={goPrev}
                disabled={designIndex === 0}
                aria-label="Previous design"
              >
                <FiChevronLeft size={18} />
              </S.NavArrow>
              <S.DesignLabel>{activeDesign.label}</S.DesignLabel>
              <S.NavArrow
                type="button"
                onClick={goNext}
                disabled={designIndex === DESIGNS.length - 1}
                aria-label="Next design"
              >
                <FiChevronRight size={18} />
              </S.NavArrow>
            </S.DesignSwitcher>
          )}

          {activeDesign.usesCoverPosition &&
            !isSquareImage &&
            imageRatio !== null && (
              <S.PositionSliderRow>
                <S.PositionSliderLabel>
                  {isPortrait ? "Vertical" : "Horizontal"} position
                </S.PositionSliderLabel>
                <S.PositionSlider
                  type="range"
                  min={0}
                  max={100}
                  value={coverPosition}
                  onChange={(e) => setCoverPosition(Number(e.target.value))}
                />
              </S.PositionSliderRow>
            )}

          {/* Carousel — each slide is a design; only the active slide is exported */}
          <S.CarouselViewport
            ref={viewportRef}
            $maxWidth={viewportSize.width}
            $maxHeight={viewportSize.height}
            $isSquareActive={activeDesign.id === "square"}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <S.CarouselTrack
              $index={designIndex}
              $dragX={dragX}
              $dragging={dragging}
            >
              {DESIGNS.map((design) => {
                const designElement = (
                  <design.Component
                    ref={(el) => {
                      cardRefs.current[design.id] = el;
                    }}
                    muse={muse}
                    accent={accent}
                    novelistAccent={novelistAccent}
                    theme={theme}
                    coverSrc={coverSrc}
                    coverPosition={coverPosition}
                    isPortrait={isPortrait}
                    entries={allEntries.slice(
                      0,
                      design.maxAttributes ?? MAX_ATTRIBUTES,
                    )}
                    profileUrl={profileUrl}
                  />
                );

                return (
                  <S.CarouselSlide key={design.id}>
                    <S.CompactPreviewScale>
                      {design.id === "square" ? (
                        <S.SquarePreviewScale>
                          {designElement}
                        </S.SquarePreviewScale>
                      ) : (
                        designElement
                      )}
                    </S.CompactPreviewScale>
                  </S.CarouselSlide>
                );
              })}
            </S.CarouselTrack>
          </S.CarouselViewport>

          {DESIGNS.length > 1 && (
            <S.DotsRow>
              {DESIGNS.map((design, i) => (
                <S.Dot
                  key={design.id}
                  type="button"
                  $active={i === designIndex}
                  onClick={() => goTo(i)}
                  aria-label={`Show ${design.label}`}
                />
              ))}
            </S.DotsRow>
          )}
        </div>
      </S.Modal>

      {/* PWA / iOS fallback — long-press to save */}
      {exportedImage && (
        <S.Overlay
          onClick={() => setExportedImage(null)}
          style={{
            alignItems: "center",
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "center",
            padding: 24,
            zIndex: 9999,
          }}
        >
          <p style={{ color: "white", fontSize: 13, margin: 0 }}>
            Long press the image below to save it
          </p>
          <img
            src={exportedImage}
            alt="Exported muse card"
            style={{ borderRadius: 16, maxWidth: "100%" }}
          />
          <p
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}
          >
            Tap anywhere to close
          </p>
        </S.Overlay>
      )}
    </>
  );
};
