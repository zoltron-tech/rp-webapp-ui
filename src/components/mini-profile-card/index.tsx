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
    .catch(() => url); // fallback: keep original if fetch fails

const inlineCardImages = async (card: HTMLDivElement): Promise<() => void> => {
  const imgs = Array.from(card.querySelectorAll("img"));
  const originals = imgs.map((img) => img.src);

  await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return;
      const b64 = await toBase64(img.src);
      img.src = b64;
    }),
  );

  // Return a cleanup function to restore the original srcs
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

interface Props {
  novelist: Novelist;
  onClose: () => void;
}

export const MiniProfileCard: FC<Props> = ({ novelist, onClose }) => {
  const theme = useGlobalState("theme");
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Use the viewed novelist's own palette, not the logged-in user's accent
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
      });

      const isIOS =
        /iP(ad|hone|od)/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad on iOS 13+

      if (isIOS) {
        window.open(dataUrl, "_blank");

        const isIOS =
          /iP(ad|hone|od)/i.test(navigator.userAgent) ||
          // iPad on iOS 13+ masquerades as Mac, but never has a mouse
          (navigator.platform === "MacIntel" &&
            navigator.maxTouchPoints > 1 &&
            !window.matchMedia("(pointer: fine)").matches); // fine pointer = real mouse = not iPad

        console.log("isIOS:", isIOS);
        console.log("userAgent:", navigator.userAgent);
        console.log("platform:", navigator.platform);
        console.log("maxTouchPoints:", navigator.maxTouchPoints);
      } else {
        // Directly use the dataUrl — no need to re-fetch it as a blob
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
              <AvatarNew
                src={novelist.image ?? null}
                alt={`${novelist.firstName} ${novelist.lastName}`}
                username={novelist.username}
              />
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
                      <AvatarNew
                        key={muse.id}
                        src={muse.image ?? null}
                        alt={`${muse.firstName} ${muse.lastName}`}
                      />
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
                <S.BrandNameSuffix> World</S.BrandNameSuffix>
              </S.BrandText>
            </S.BrandBar>
          </S.Card>
        </div>
      </S.Modal>
    </>
  );
};
