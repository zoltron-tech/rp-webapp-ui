"use client";

import type { Novelist } from "@nw/types";
import { ACCENT_MAP } from "@nw/types/theme";
import { isIOS, isPWA } from "@nw/utils/platform";
import classNames from "classnames";
import { toPng } from "html-to-image";
import { type FC, useRef, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import QRCode from "react-qr-code";
import { EmailVerifiedBadge, NWLogoInner } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { useGlobalState } from "@/context/store/stores";
import { mainVerseMuses } from "@/utils/muse";
import { Flex } from "../edit-muse-card/styles";
import * as S from "./styles";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    .catch(() => url); // fallback: keep original src if fetch fails

/**
 * Waits for every <img> in the card to finish loading, then converts
 * each src to a base64 data-URL so html-to-image can paint them on
 * iOS / cross-origin without CORS taint issues.
 * Returns a cleanup fn that restores the original srcs.
 */
const inlineCardImages = async (card: HTMLDivElement): Promise<() => void> => {
  const imgs = Array.from(card.querySelectorAll("img"));
  const originals = imgs.map((img) => img.src);

  // Fix 3 — wait for images that haven't finished loading yet
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // don't block on broken images
          }),
    ),
  );

  // Convert every external src to base64
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

const formatJoinYear = (dateStr: string | undefined): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.getFullYear().toString();
};

// ─── Platform detection ──────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  novelist: Novelist;
  onClose: () => void;
}

export const MiniProfileCard: FC<Props> = ({ novelist, onClose }) => {
  const theme = useGlobalState("theme");
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Fix 1 — exported image state for PWA inline-display fallback
  const [exportedImage, setExportedImage] = useState<string | null>(null);

  const novelistAccent =
    ACCENT_MAP[novelist.palette as keyof typeof ACCENT_MAP] ?? ACCENT_MAP[0];

  const profileUrl = `https://novelist.world/${novelist.username}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    let restoreImages: (() => void) | undefined;
    try {
      restoreImages = await inlineCardImages(cardRef.current);

      const exportOptions = {
        cacheBust: true,
        height: 682,
        pixelRatio: 2,
        style: { transform: "translateZ(0)" },
        width: 386,
      };
      // html-to-image misses images on the first pass (known bug);
      // the second call reliably captures everything that's now cached.
      await toPng(cardRef.current, exportOptions);
      const dataUrl = await toPng(cardRef.current, exportOptions);

      if (isIOS() || isPWA()) {
        // iOS / PWA — show inline overlay so user can long-press → Save
        setExportedImage(dataUrl);
      } else {
        // Desktop — standard anchor download
        const link = document.createElement("a");
        link.download = `${novelist.username}-profile.png`;
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
            position: "relative",
          }}
        >
          <Flex
            gap={"8px"}
            align="center"
            justify="flex-end"
            style={{ width: "100%" }}
          >
            <S.DownloadButton onClick={handleDownload} disabled={exporting}>
              <FiDownload size={16} />
              {exporting ? "Exporting…" : "Download as Image"}
            </S.DownloadButton>
            <S.CloseButton onClick={onClose}>
              <FiX size={22} />
            </S.CloseButton>
          </Flex>

          {/* Card – this element is captured as the exported image */}
          <S.CardFrame
            ref={cardRef}
            className={classNames([novelistAccent, theme])}
          >
            <S.Card>
              <S.HeroBanner>
                <S.HeroBg $src={novelist.image ?? ""} />
                <S.HeroAccentOverlay />
                <S.HeroInner>
                  <S.AvatarRing>
                    <AvatarNew
                      src={novelist.image ?? null}
                      alt={`${novelist.firstName} ${novelist.lastName}`}
                    />
                  </S.AvatarRing>
                  <S.HeroName>
                    {novelist.firstName} {novelist.lastName}
                  </S.HeroName>
                  <S.HeroUsername>
                    @{novelist.username}
                    {novelist.isVerified && <EmailVerifiedBadge size={13} />}
                  </S.HeroUsername>
                </S.HeroInner>
              </S.HeroBanner>

              <S.ContentArea>
                {novelist.note && novelist.note.text && novelist.note.text.length > 0 ? (
                  <S.NoteQuote>
                    <S.NoteBar />
                    <S.NoteText>{novelist.note.text}</S.NoteText>
                  </S.NoteQuote>
                ) : (
                  <S.EmptyNote>No note added yet.</S.EmptyNote>
                )}

                <S.StatsBar>
                  <S.StatItem>
                    <S.StatValue>{novelist.museCount}</S.StatValue>
                    <S.StatLabel>Characters</S.StatLabel>
                  </S.StatItem>
                  <S.StatSep />
                  <S.StatItem>
                    <S.StatValue>
                      {formatJoinYear(novelist.createdAt)}
                    </S.StatValue>
                    <S.StatLabel>Joined</S.StatLabel>
                  </S.StatItem>
                </S.StatsBar>

                <S.CharSection>
                  <S.CharLabel>Top Characters</S.CharLabel>
                  {mainVerseMuses(novelist.muses).length > 0 ? (
                    <S.CharRow>
                      {mainVerseMuses(novelist.muses)
                        .slice(0, 3)
                        .map((muse) => (
                        <S.CharItem key={muse.id}>
                          <S.CharCard>
                            {muse.image ? (
                              <img
                                src={muse.image}
                                alt={`${muse.firstName} ${muse.lastName}`}
                              />
                            ) : (
                              <S.CharCardFallback>
                                {muse.firstName[0]}
                              </S.CharCardFallback>
                            )}
                          </S.CharCard>
                          <S.CharName>{muse.firstName}</S.CharName>
                        </S.CharItem>
                      ))}
                    </S.CharRow>
                  ) : (
                    <S.EmptyChars>
                      <S.EmptyCharsIcon>✦</S.EmptyCharsIcon>
                      <S.EmptyCharsText>No characters yet.</S.EmptyCharsText>
                    </S.EmptyChars>
                  )}
                </S.CharSection>
              </S.ContentArea>

              <S.BottomBar>
                <S.QrWrapper>
                  <QRCode value={profileUrl} size={30} level="M" />
                </S.QrWrapper>
                <S.BrandBlock>
                  <S.BrandRow>
                    <NWLogoInner size={15} />
                    <S.BrandText>
                      <S.BrandName>Novelist</S.BrandName>
                      <S.BrandNameSuffix> World</S.BrandNameSuffix>
                    </S.BrandText>
                  </S.BrandRow>
                  <S.ProfileUrl>{profileUrl}</S.ProfileUrl>
                </S.BrandBlock>
              </S.BottomBar>
            </S.Card>
          </S.CardFrame>
        </div>
      </S.Modal>

      {/* Fix 1 — PWA export overlay: shown instead of window.open */}
      {exportedImage && (
        <S.Overlay
          onClick={() => setExportedImage(null)}
          style={{
            alignItems: "center",
            background: "rgba(0,0,0,0.85)",
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
            alt="Exported profile card"
            style={{ borderRadius: 12, maxWidth: "100%" }}
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
