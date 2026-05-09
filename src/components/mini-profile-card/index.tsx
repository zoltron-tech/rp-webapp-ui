"use client";

import classNames from "classnames";
import { toPng } from "html-to-image";
import { type FC, useRef, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import QRCode from "react-qr-code";
import logoText from "@/assets/images/Logo text.png";
import { EmailVerifiedBadge, NWLogoInner } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { useGlobalState } from "@/context/store/stores";
import type { Novelist } from "@/types";
import { ACCENT_MAP } from "@/types/theme";
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

const formatJoinDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ─── Platform detection ──────────────────────────────────────────────────────

/**
 * True on iPhone / iPod / iPad (including iPads that report MacIntel in iOS 13+).
 * Excludes Windows touch laptops and Macs by checking for absence of a fine pointer.
 */
const getIsIOS = () =>
  /iP(ad|hone|od)/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1 &&
    !window.matchMedia("(pointer: fine)").matches);

/** True when the app is running as an installed PWA (standalone mode). */
const getIsPWA = () => window.matchMedia("(display-mode: standalone)").matches;

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

  const profileUrl = `https://novelist.world/rp/profile/${novelist.username}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    let restoreImages: (() => void) | undefined;
    try {
      restoreImages = await inlineCardImages(cardRef.current);

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        // Fix 2 — helps box-shadow / border-radius rendering on iOS canvas
        style: { transform: "translateZ(0)" },
      });

      const isIOS = getIsIOS();
      const isPWA = getIsPWA();

      if (isPWA) {
        // Fix 1 — PWA blocks window.open; show image inline so user can long-press → Save
        setExportedImage(dataUrl);
      } else if (isIOS) {
        // Safari / Chrome on iOS — open data URL in new tab; user long-presses to save
        window.open(dataUrl, "_blank");
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
            <S.CloseButton
              onClick={onClose}
              style={{ alignSelf: "flex-end", position: "static" }}
            >
              <FiX size={22} />
            </S.CloseButton>
          </Flex>

          {/* Card – this element is captured as the exported image */}
          <S.Card ref={cardRef} className={classNames([novelistAccent, theme])}>
            <S.AccentBanner />

            <S.AvatarWrapper>
              {/*
               * Fix 2 — swap box-shadow for a border-ring wrapper.
               * CSS box-shadow on border-radius elements renders skewed
               * when html-to-image draws them on an iOS canvas.
               * A solid-border wrapper div is composited correctly.
               */}
              <div
                style={{
                  background: "var(--accent-primary, transparent)",
                  borderRadius: "50%",
                  display: "inline-flex",
                  flexShrink: 0,
                  padding: 2,
                }}
              >
                <AvatarNew
                  src={novelist.image ?? null}
                  alt={`${novelist.firstName} ${novelist.lastName}`}
                  username={novelist.username}
                />
              </div>
            </S.AvatarWrapper>

            <S.Body>
              <S.FullName>
                {novelist.firstName} {novelist.lastName}
              </S.FullName>
              <S.UsernameRow>
                <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  @{novelist.username}
                </span>
                {novelist.isVerified && <EmailVerifiedBadge size={14} />}
              </S.UsernameRow>

              {novelist.note && novelist.note.length > 0 && (
                <S.NoteText>{novelist.note}</S.NoteText>
              )}

              <S.MetaRow>
                <div>
                  <Flex gap={"2px"}>
                    <S.Img src={logoText.src} alt="NW" />
                    <S.MetaLabel>Member since</S.MetaLabel>
                  </Flex>
                  <S.MetaItem>{formatJoinDate(novelist.createdAt)}</S.MetaItem>
                </div>
              </S.MetaRow>

              {novelist.muses.length > 0 && (
                <>
                  <S.MusesLabel>Characters</S.MusesLabel>
                  <S.MusesRow>
                    {novelist.muses.slice(0, 3).map((muse) => (
                      // Fix 2 — same ring wrapper for character avatars
                      <div
                        key={muse.id}
                        style={{
                          background: "var(--accent-primary, transparent)",
                          borderRadius: "50%",
                          display: "inline-flex",
                          flexShrink: 0,
                          padding: 2,
                        }}
                      >
                        <AvatarNew
                          src={muse.image ?? null}
                          alt={`${muse.firstName} ${muse.lastName}`}
                        />
                      </div>
                    ))}
                  </S.MusesRow>
                </>
              )}
            </S.Body>

            <S.Divider />

            <S.Footer>
              <S.ProfileUrlBlock>
                <S.ProfileUrlLabel>Profile</S.ProfileUrlLabel>
                <S.ProfileUrl>{profileUrl}</S.ProfileUrl>
              </S.ProfileUrlBlock>
              <S.QrWrapper>
                <QRCode value={profileUrl} size={40} level="M" />
              </S.QrWrapper>
            </S.Footer>

            <S.BrandBar>
              <NWLogoInner size={16} />
              <S.BrandText>
                <S.BrandName>Novelist</S.BrandName>
                <S.BrandNameSuffix> World</S.BrandNameSuffix>
              </S.BrandText>
            </S.BrandBar>
          </S.Card>
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
