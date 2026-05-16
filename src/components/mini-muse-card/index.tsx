"use client";

import classNames from "classnames";
import { toPng } from "html-to-image";
import { type FC, useEffect, useRef, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import QRCode from "react-qr-code";
import { NWLogoInner } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import type { Muse } from "@/types";
import { ACCENT_MAP } from "@/types/theme";
import * as S from "./styles";

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

const getIsIOS = () =>
  /iP(ad|hone|od)/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1 &&
    !window.matchMedia("(pointer: fine)").matches);

const getIsPWA = () => window.matchMedia("(display-mode: standalone)").matches;

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  muse: Muse;
  onClose: () => void;
}

const MAX_ATTRIBUTES = 6;

export const MiniMuseCard: FC<Props> = ({ muse, onClose }) => {
  const theme = useGlobalState("theme");
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [coverPosition, setCoverPosition] = useState(50);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  useEffect(() => {
    const src = muse.image;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      setImageRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = src;
  }, [muse.image]);

  const isSquare =
    imageRatio !== null && imageRatio >= 0.9 && imageRatio <= 1.1;
  const isPortrait = imageRatio !== null && imageRatio < 0.9;

  const accent = muse.useAccent ? (muse.accent ?? null) : null;
  const novelistAccent =
    ACCENT_MAP[(muse.pennedBy?.palette as keyof typeof ACCENT_MAP) ?? 0] ??
    ACCENT_MAP[0];

  const coverSrc = muse.image ?? "";
  const profileUrl = `https://novelist.world/rp/muse/${muse.id ?? ""}`;

  const entries = muse.extraAttributes
    ? Object.entries(muse.extraAttributes).slice(0, MAX_ATTRIBUTES)
    : [];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    let restoreImages: (() => void) | undefined;
    try {
      restoreImages = await inlineCardImages(cardRef.current);

      const exportOptions = {
        cacheBust: true,
        height: 646,
        pixelRatio: 2,
        style: { transform: "translateZ(0)" },
        width: 366,
      };

      // First call primes the cache; second call reliably captures everything.
      await toPng(cardRef.current, exportOptions);
      const dataUrl = await toPng(cardRef.current, exportOptions);

      if (getIsIOS() || getIsPWA()) {
        setExportedImage(dataUrl);
      } else {
        const link = document.createElement("a");
        link.download = `${muse.firstName}-${muse.lastName}-muse.png`
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

          {!isSquare && imageRatio !== null && (
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

          {/* Card — this element is captured as the exported image */}
          <S.CardFrame
            ref={cardRef}
            className={classNames([novelistAccent, theme])}
            $accent={accent}
          >
            <S.Card>
              {/* Cover image with name overlay */}
              <S.CoverImage
                $src={coverSrc}
                $position={coverPosition}
                $isPortrait={isPortrait}
              >
                <S.CardTypeLabel>Character</S.CardTypeLabel>
                <S.CoverNameBlock>
                  {muse.fandom && muse.fandom.id !== "FANDOMLESS" && (
                    <S.FandomTag $color={muse.fandom.color}>
                      {muse.fandom.name}
                    </S.FandomTag>
                  )}
                  <S.CharacterName>
                    {muse.firstName}
                    {muse.lastName ? ` ${muse.lastName}` : ""}
                  </S.CharacterName>
                  {muse.nicknames && muse.nicknames.length > 0 && (
                    <>
                      <S.NicknamesList>
                        {muse.nicknames.join(" · ")}
                      </S.NicknamesList>
                      <S.NicknamesDivider />
                    </>
                  )}
                </S.CoverNameBlock>
              </S.CoverImage>

              <S.Body>
                {/* Extra attributes */}
                {entries.length > 0 ? (
                  <S.AttributesGrid>
                    {entries.map(([key, value]) => (
                      <S.AttributeCard key={key} $accent={accent}>
                        <S.AttributeKey>{key}</S.AttributeKey>
                        <S.AttributeValue>{value}</S.AttributeValue>
                      </S.AttributeCard>
                    ))}
                  </S.AttributesGrid>
                ) : (
                  <S.EmptyAttributes>
                    <S.EmptyAttributesIcon>✶</S.EmptyAttributesIcon>
                    <S.EmptyAttributesText>
                      No details added
                    </S.EmptyAttributesText>
                  </S.EmptyAttributes>
                )}
              </S.Body>

              <S.Divider />

              {/* Penned by */}
              <S.PennedByRow>
                <S.PennedByLabel>Penned by</S.PennedByLabel>
                {muse.pennedBy?.image && (
                  <S.PennedByAvatar
                    src={muse.pennedBy.image}
                    alt={muse.pennedBy.username}
                  />
                )}
                <S.PennedByUsername $accent={accent}>
                  {muse.pennedBy?.username}
                </S.PennedByUsername>
              </S.PennedByRow>

              <S.BrandBar>
                <S.BrandLeft>
                  <div
                    style={
                      accent
                        ? ({
                            "--accent": accent,
                            "--accent-hover": `color-mix(in srgb, ${accent} 80%, black)`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <NWLogoInner size={16} />
                  </div>
                  <S.BrandText>
                    <S.BrandName>Novelist</S.BrandName>
                    <S.BrandNameSuffix $accent={accent}>
                      {" "}
                      World
                    </S.BrandNameSuffix>
                  </S.BrandText>
                </S.BrandLeft>
                <S.QrWrapper>
                  <QRCode value={profileUrl} size={36} level="M" />
                </S.QrWrapper>
              </S.BrandBar>
            </S.Card>
          </S.CardFrame>
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
