"use client";

import classNames from "classnames";
import moment from "moment";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { BsForward, BsReply, BsThreeDots } from "react-icons/bs";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiCopy, FiDownload, FiExternalLink } from "react-icons/fi";
import { RiFlagFill } from "react-icons/ri";
import { TbError404 } from "react-icons/tb";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Message } from "@/types/conversation";
import { ROUTES } from "@/utils/constants/routes";
import { AppAlertDialog } from "../../dialog";
import { AppImageViewer } from "../../image-viewer/AppImageViewer";
import { AppDropdownMenu } from "../../profile-more-dropdown";
import { AvatarNew } from "../avatar-new";
import * as S from "./styles";

type Props = {
  message: Message;
  currentUsername: string;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onReport?: (message: Message) => void;
};

type LinkMeta = {
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
};

const URL_REGEX = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];
const AUDIO_EXTENSIONS = ["mp3", "mpeg", "wav", "ogg", "m4a", "aac"];
const REACTION_EMOJI_MAP: Record<string, string> = {
  angry: "😡",
  fire: "🔥",
  haha: "😂",
  heart: "❤️",
  laugh: "😂",
  like: "👍",
  love: "❤️",
  sad: "😢",
  wow: "😮",
};

const mediaElements = new Set<HTMLMediaElement>();
let mediaListenersAttached = false;

const pauseAllMedia = (except?: HTMLMediaElement | null) => {
  mediaElements.forEach((element) => {
    if (except && element === except) return;
    if (!element.paused) element.pause();
  });
};

const handlePageLeave = () => {
  pauseAllMedia();
};

const attachMediaPageListeners = () => {
  if (mediaListenersAttached || typeof window === "undefined") return;

  window.addEventListener("beforeunload", handlePageLeave);
  window.addEventListener("pagehide", handlePageLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseAllMedia();
    }
  });

  mediaListenersAttached = true;
};

const registerMediaElement = (element: HTMLMediaElement | null) => {
  if (!element) return;
  mediaElements.add(element);
  attachMediaPageListeners();
};

const unregisterMediaElement = (element: HTMLMediaElement | null) => {
  if (!element) return;
  if (!element.paused) element.pause();
  mediaElements.delete(element);
};

const extractUrls = (text: string) => {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  return Array.from(new Set(matches));
};

const getSiteName = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "Link";
  }
};

const getFileExtension = (url: string) => {
  const cleaned = url.split("?")[0]?.split("#")[0] || "";
  const extension = cleaned.split(".").pop()?.toLowerCase();
  return extension || "";
};

const getAttachmentKind = (url: string) => {
  const extension = getFileExtension(url);
  if (!extension) return "file" as const;
  if (IMAGE_EXTENSIONS.includes(extension)) return "image" as const;
  if (VIDEO_EXTENSIONS.includes(extension)) return "video" as const;
  if (AUDIO_EXTENSIONS.includes(extension)) return "audio" as const;
  return "file" as const;
};

const getYouTubeVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1]?.split("/")[0] ?? null;
      }
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }
  } catch {
    // invalid url
  }
  return null;
};

const isInstagramUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname.includes("instagram.com");
  } catch {
    return false;
  }
};

const isFacebookUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return (
      hostname.includes("facebook.com") ||
      hostname.includes("fb.com") ||
      hostname.includes("fb.watch")
    );
  } catch {
    return false;
  }
};

const isTwitterUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return hostname.includes("twitter.com") || hostname.includes("x.com");
  } catch {
    return false;
  }
};

const isTenorUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname.includes("tenor.com");
  } catch {
    return false;
  }
};

const isDirectImageUrl = (url: string): boolean => {
  const ext = getFileExtension(url);
  return IMAGE_EXTENSIONS.includes(ext);
};

const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop() || "file";
    return decodeURIComponent(name);
  } catch {
    return "file";
  }
};

const getReactionDisplay = (reaction: string) => {
  const normalized = reaction.trim().toLowerCase();
  return REACTION_EMOJI_MAP[normalized] || reaction;
};

const REPLIED_URL_RE = /(https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/i;
const REPLIED_MENTION_RE = /class="mention-tag"/i;

const getRepliedImageSrc = (message: Message): string | null => {
  const imgAttachment = message.attachments?.find((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return IMAGE_EXTENSIONS.includes(ext);
  });
  if (imgAttachment) return imgAttachment.url;

  const text = message.message || "";
  const urlMatch = text.match(REPLIED_URL_RE);
  if (urlMatch) {
    const ext =
      urlMatch[0]
        .split("?")[0]
        ?.split("#")[0]
        ?.split(".")
        .pop()
        ?.toLowerCase() ?? "";
    if (IMAGE_EXTENSIONS.includes(ext)) return urlMatch[0];
  }
  return null;
};

const isRepliedImageOnly = (message: Message): boolean => {
  if (REPLIED_MENTION_RE.test(message.message || "")) return false;
  const hasText = !!message.message?.trim();
  const hasImageAttachment = message.attachments?.some((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return IMAGE_EXTENSIONS.includes(ext);
  });
  if (hasImageAttachment && !hasText) return true;
  if (hasText) {
    const text = message.message.trim();
    const urlMatch = text.match(REPLIED_URL_RE);
    if (urlMatch && urlMatch[0] === text) {
      const ext =
        urlMatch[0]
          .split("?")[0]
          ?.split("#")[0]
          ?.split(".")
          .pop()
          ?.toLowerCase() ?? "";
      if (IMAGE_EXTENSIONS.includes(ext)) return true;
    }
  }
  return false;
};

/** Detects messages that contain rich-text HTML tags produced by ChatRichInput. */
const HTML_CONTENT_RE = /<(strong|em|b|i|span|br|div)\b/i;
const EMOJI_ONLY_RE =
  /^(\p{Extended_Pictographic}|\p{Emoji_Modifier}|\uFE0F|\u20E3|\u200D|\s)+$/u;

/**
 * Renders a rich-text HTML message (bold, italic, mention tags).
 * Attaches click delegation so mention chips navigate to the tagged profile.
 */
const HtmlChatBubble: FC<{ html: string; className: string }> = ({
  html,
  className,
}) => {
  const { routeToPage } = usePageRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.innerHTML = html;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.closest(".mention-tag") as HTMLElement | null;
      if (!tag) return;
      const { type, id } = tag.dataset;
      if (!type || !id) return;
      if (type === "NOVELIST") routeToPage(ROUTES.Novelist.View(id));
      if (type === "MUSE") routeToPage(ROUTES.Muse.View(id));
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [html, routeToPage]);

  return (
    <S.ChatBubble className={className}>
      <div ref={contentRef} />
    </S.ChatBubble>
  );
};

const toRenderableMessage = (text: string) => {
  const parts = text.split(URL_REGEX);
  return parts.map((part, idx) => {
    if (part.match(URL_REGEX)) {
      return (
        <S.LinkAnchor
          href={part}
          target="_blank"
          rel="noreferrer"
          key={part + idx}
        >
          {part}
        </S.LinkAnchor>
      );
    }

    return <span key={`${part}-${idx}`}>{part}</span>;
  });
};

const LinkPreview: FC<{ url: string }> = ({ url }) => {
  const [meta, setMeta] = useState<LinkMeta | null>(null);
  const youtubeId = useMemo(() => getYouTubeVideoId(url), [url]);
  const isYouTube = !!youtubeId;
  const isInstagram = useMemo(() => isInstagramUrl(url), [url]);
  const isFacebook = useMemo(() => isFacebookUrl(url), [url]);
  const isTwitter = useMemo(() => isTwitterUrl(url), [url]);
  const isTenor = useMemo(() => isTenorUrl(url), [url]);
  const isDirectImage = useMemo(() => isDirectImageUrl(url), [url]);
  const isDirectVideo = useMemo(
    () => getAttachmentKind(url) === "video",
    [url],
  );

  useEffect(() => {
    // Skip metadata fetch for direct media files and social platforms with static previews
    if (isDirectImage || isDirectVideo || isYouTube) return;
    let isMounted = true;

    const fetchMeta = async () => {
      try {
        const response = await fetch(
          `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`,
        );
        if (!response.ok) return;

        const data = (await response.json()) as LinkMeta;
        if (isMounted) setMeta(data);
      } catch {
        // Fallback uses URL-only preview when metadata cannot be fetched.
      }
    };

    fetchMeta();

    return () => {
      isMounted = false;
    };
  }, [url, isDirectImage, isDirectVideo, isYouTube]);

  if (isDirectVideo) {
    return <ChatVideoAttachment src={url} />;
  }

  // Direct image/GIF URLs (e.g. from Klipy, Tenor CDN) — render immediately
  if (isDirectImage) {
    return (
      <AppImageViewer src={url} alt="GIF">
        <S.AttachmentImage
          src={url}
          alt="GIF"
          $noBg
          style={{ cursor: "zoom-in" }}
        />
      </AppImageViewer>
    );
  }

  const image = meta?.image;
  const description = meta?.description;
  const site = meta?.site_name || getSiteName(url);
  const title =
    meta?.title ||
    (isYouTube
      ? "YouTube Video"
      : isInstagram
        ? "Instagram Post"
        : isFacebook
          ? "Facebook Post"
          : isTwitter
            ? "X Post"
            : url);

  if (isTenor) {
    if (!image) return null;
    return (
      <AppImageViewer src={image} alt="GIF">
        <S.AttachmentImage
          src={image}
          alt="GIF"
          $noBg
          style={{ cursor: "zoom-in" }}
        />
      </AppImageViewer>
    );
  }

  if (isYouTube) {
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    return (
      <S.YouTubeLinkCard href={url} target="_blank" rel="noreferrer">
        <S.YouTubeThumbWrap>
          <S.YouTubeThumb src={thumbnail} alt={title} />
          <S.YouTubePlayBadge>
            <FaPlay size={9} />
            YouTube
          </S.YouTubePlayBadge>
        </S.YouTubeThumbWrap>
        <S.LinkPreviewBody style={{ padding: "8px 10px" }}>
          <S.LinkPreviewTitle>{title}</S.LinkPreviewTitle>
          {description ? (
            <S.LinkPreviewDescription>{description}</S.LinkPreviewDescription>
          ) : null}
          <S.LinkPreviewSite>
            youtube.com
            <FiExternalLink size={11} />
          </S.LinkPreviewSite>
        </S.LinkPreviewBody>
      </S.YouTubeLinkCard>
    );
  }

  if (isInstagram) {
    return (
      <S.InstagramLinkCard href={url} target="_blank" rel="noreferrer">
        <S.SocialThumbWrap>
          {image ? (
            <S.SocialThumb src={image} alt={title} />
          ) : (
            <S.SocialThumbFallback>📷</S.SocialThumbFallback>
          )}
          <S.SocialBrandBadge>Instagram</S.SocialBrandBadge>
        </S.SocialThumbWrap>
        <S.LinkPreviewBody style={{ padding: "8px 10px" }}>
          <S.LinkPreviewTitle>{title}</S.LinkPreviewTitle>
          {description ? (
            <S.LinkPreviewDescription>{description}</S.LinkPreviewDescription>
          ) : null}
          <S.LinkPreviewSite>
            instagram.com
            <FiExternalLink size={11} />
          </S.LinkPreviewSite>
        </S.LinkPreviewBody>
      </S.InstagramLinkCard>
    );
  }

  if (isFacebook) {
    return (
      <S.FacebookLinkCard href={url} target="_blank" rel="noreferrer">
        <S.SocialThumbWrap>
          {image ? (
            <S.SocialThumb src={image} alt={title} />
          ) : (
            <S.SocialThumbFallback>👥</S.SocialThumbFallback>
          )}
          <S.SocialBrandBadge>Facebook</S.SocialBrandBadge>
        </S.SocialThumbWrap>
        <S.LinkPreviewBody style={{ padding: "8px 10px" }}>
          <S.LinkPreviewTitle>{title}</S.LinkPreviewTitle>
          {description ? (
            <S.LinkPreviewDescription>{description}</S.LinkPreviewDescription>
          ) : null}
          <S.LinkPreviewSite>
            facebook.com
            <FiExternalLink size={11} />
          </S.LinkPreviewSite>
        </S.LinkPreviewBody>
      </S.FacebookLinkCard>
    );
  }

  if (isTwitter) {
    return (
      <S.TwitterLinkCard href={url} target="_blank" rel="noreferrer">
        <S.SocialThumbWrap>
          {image ? (
            <S.SocialThumb src={image} alt={title} />
          ) : (
            <S.SocialThumbFallback>🐦</S.SocialThumbFallback>
          )}
          <S.SocialBrandBadge>𝕏</S.SocialBrandBadge>
        </S.SocialThumbWrap>
        <S.LinkPreviewBody style={{ padding: "8px 10px" }}>
          <S.LinkPreviewTitle>{title}</S.LinkPreviewTitle>
          {description ? (
            <S.LinkPreviewDescription>{description}</S.LinkPreviewDescription>
          ) : null}
          <S.LinkPreviewSite>
            x.com
            <FiExternalLink size={11} />
          </S.LinkPreviewSite>
        </S.LinkPreviewBody>
      </S.TwitterLinkCard>
    );
  }

  return (
    <S.LinkPreviewCard href={url} target="_blank" rel="noreferrer">
      {image ? (
        <S.LinkPreviewImage src={image} alt={title} />
      ) : (
        <S.LinkPreviewImageFallback>
          {site.slice(0, 1).toUpperCase()}
        </S.LinkPreviewImageFallback>
      )}
      <S.LinkPreviewBody>
        <S.LinkPreviewTitle>{title}</S.LinkPreviewTitle>
        {description ? (
          <S.LinkPreviewDescription>{description}</S.LinkPreviewDescription>
        ) : null}
        <S.LinkPreviewSite>
          {site}
          <FiExternalLink size={11} />
        </S.LinkPreviewSite>
      </S.LinkPreviewBody>
    </S.LinkPreviewCard>
  );
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
};

const AttachmentFallback: FC = () => (
  <S.AttachmentFallback>
    <TbError404 size={32} />
    No longer available.
  </S.AttachmentFallback>
);

const ChatAudioAttachment: FC<{ src: string }> = ({ src }) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [audioError, setAudioError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioElement) return;
    if (audioError) return;

    registerMediaElement(audioElement);

    const onLoadedMetadata = () => {
      setDuration(audioElement.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime || 0);
      const nextProgress = audioElement.duration
        ? (audioElement.currentTime / audioElement.duration) * 100
        : 0;
      setProgress(nextProgress);
    };

    const onEnded = () => {
      setPlaying(false);
    };

    const onPlay = () => {
      pauseAllMedia(audioElement);
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    audioElement.addEventListener("loadedmetadata", onLoadedMetadata);
    audioElement.addEventListener("timeupdate", onTimeUpdate);
    audioElement.addEventListener("ended", onEnded);
    audioElement.addEventListener("play", onPlay);
    audioElement.addEventListener("pause", onPause);

    return () => {
      unregisterMediaElement(audioElement);
      audioElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      audioElement.removeEventListener("timeupdate", onTimeUpdate);
      audioElement.removeEventListener("ended", onEnded);
      audioElement.removeEventListener("play", onPlay);
      audioElement.removeEventListener("pause", onPause);
    };
  }, [audioElement, audioError]);

  const onTogglePlay = async () => {
    if (!audioElement) return;

    if (playing) {
      audioElement.pause();
      setPlaying(false);
      return;
    }

    try {
      await audioElement.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const onSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    audioElement.currentTime = duration * percentage;
  };

  if (audioError) {
    return <AttachmentFallback />;
  }
  return (
    <S.AudioAttachmentCard>
      <S.HiddenAudio
        ref={setAudioElement}
        preload="metadata"
        src={src}
        onError={() => setAudioError(true)}
      />
      <S.AudioAttachmentTop>
        <S.AudioPlayButton
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </S.AudioPlayButton>
        <S.AudioAttachmentLabel>Audio attachment</S.AudioAttachmentLabel>
      </S.AudioAttachmentTop>

      <S.AudioProgressRow>
        <S.AudioTime>{formatTime(currentTime)}</S.AudioTime>
        <S.AudioProgressBar onClick={onSeek}>
          <S.AudioProgressFill style={{ width: `${progress}%` }} />
        </S.AudioProgressBar>
        <S.AudioTime>{formatTime(duration)}</S.AudioTime>
      </S.AudioProgressRow>
    </S.AudioAttachmentCard>
  );
};

const ChatVideoAttachment: FC<{ src: string }> = ({ src }) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [videoError, setVideoError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoElement) return;
    if (videoError) return;

    registerMediaElement(videoElement);

    const onLoadedMetadata = () => {
      setDuration(videoElement.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime || 0);
      const nextProgress = videoElement.duration
        ? (videoElement.currentTime / videoElement.duration) * 100
        : 0;
      setProgress(nextProgress);
    };

    const onEnded = () => {
      setPlaying(false);
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const onPlayExclusive = () => {
      pauseAllMedia(videoElement);
      setPlaying(true);
    };

    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    videoElement.addEventListener("timeupdate", onTimeUpdate);
    videoElement.addEventListener("ended", onEnded);
    videoElement.addEventListener("play", onPlayExclusive);
    videoElement.addEventListener("pause", onPause);

    return () => {
      unregisterMediaElement(videoElement);
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.removeEventListener("timeupdate", onTimeUpdate);
      videoElement.removeEventListener("ended", onEnded);
      videoElement.removeEventListener("play", onPlayExclusive);
      videoElement.removeEventListener("pause", onPause);
    };
  }, [videoElement, videoError]);

  const onTogglePlay = async () => {
    if (!videoElement) return;

    if (playing) {
      videoElement.pause();
      return;
    }

    try {
      await videoElement.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const onSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoElement || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    videoElement.currentTime = duration * percentage;
  };

  if (videoError) {
    return <AttachmentFallback />;
  }
  return (
    <S.VideoAttachmentCard>
      <S.VideoViewport>
        <S.VideoElement
          ref={setVideoElement}
          preload="metadata"
          src={src}
          playsInline
          disablePictureInPicture
          onError={() => setVideoError(true)}
        />
      </S.VideoViewport>

      <S.AudioAttachmentTop>
        <S.AudioPlayButton
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </S.AudioPlayButton>
        <S.AudioAttachmentLabel>Video attachment</S.AudioAttachmentLabel>
      </S.AudioAttachmentTop>

      <S.AudioProgressRow>
        <S.AudioTime>{formatTime(currentTime)}</S.AudioTime>
        <S.AudioProgressBar onClick={onSeek}>
          <S.AudioProgressFill style={{ width: `${progress}%` }} />
        </S.AudioProgressBar>
        <S.AudioTime>{formatTime(duration)}</S.AudioTime>
      </S.AudioProgressRow>
    </S.VideoAttachmentCard>
  );
};

export const ChatBubble: FC<Props> = ({
  message,
  currentUsername,
  onReply,
  onForward,
  onReport,
}) => {
  const { successToast } = useUIContext();
  const today = moment().format("YYYY-MM-DD");
  const messageDate = moment.utc(message.createdAt).local();
  const [imgError, setImgError] = useState(false);

  const isSender = message.sender.username === currentUsername;
  const isActivityMessage = message.type?.toLowerCase() === "activity";

  const messageText = message.message || "";
  const urls = useMemo(() => extractUrls(messageText), [messageText]);
  const hasAttachments = !!message.attachments?.length;
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const isHtmlMessage = HTML_CONTENT_RE.test(messageText);
  const [repliedWiggling, setRepliedWiggling] = useState(false);

  const handleRepliedToClick = () => {
    const targetId = message.repliedTo?.id;
    if (!targetId) return;
    const el = document.getElementById(`msg-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight after scroll reaches the element
      setTimeout(() => {
        el.classList.add("highlighted");
        el.addEventListener(
          "animationend",
          () => el.classList.remove("highlighted"),
          { once: true },
        );
      }, 400);
    } else {
      setRepliedWiggling(true);
    }
  };

  // ── Swipe-to-reply ────────────────────────────────────────────────────────
  const [swipeTranslate, setSwipeTranslate] = useState(0);
  const [swipeTransitioning, setSwipeTransitioning] = useState(false);
  const swipeTouchStartX = useRef(0);
  const swipeTouchStartY = useRef(0);
  const swipeRawDeltaX = useRef(0);
  const swipeIsHorizontal = useRef<boolean | null>(null);

  const onSwipeTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeTouchStartX.current = touch.clientX;
    swipeTouchStartY.current = touch.clientY;
    swipeRawDeltaX.current = 0;
    swipeIsHorizontal.current = null;
    setSwipeTransitioning(false);
  };

  const onSwipeTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - swipeTouchStartX.current;
    const deltaY = touch.clientY - swipeTouchStartY.current;

    if (swipeIsHorizontal.current === null) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      swipeIsHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!swipeIsHorizontal.current) return;

    swipeRawDeltaX.current = deltaX;

    const SOFT_LIMIT = 60;
    const rubberBand = (magnitude: number) => {
      if (magnitude <= SOFT_LIMIT) return magnitude;
      return SOFT_LIMIT + (magnitude - SOFT_LIMIT) * 0.2;
    };

    // Receiver messages: swipe right; sender messages: swipe left
    if (!isSender && deltaX > 0) {
      setSwipeTranslate(rubberBand(deltaX * 0.5));
    } else if (isSender && deltaX < 0) {
      setSwipeTranslate(-rubberBand(-deltaX * 0.5));
    }
  };

  const onSwipeTouchEnd = () => {
    if (!swipeIsHorizontal.current) return;

    const SWIPE_THRESHOLD = 60;
    if (Math.abs(swipeRawDeltaX.current) >= SWIPE_THRESHOLD) {
      onReply?.(message);
    }

    swipeRawDeltaX.current = 0;
    setSwipeTransitioning(true);
    setSwipeTranslate(0);
  };

  const isSwipingActive = swipeTranslate !== 0;
  // 0 → 1 over the first 20 px of drag — drives cross-fades
  const swipeProgress = Math.min(Math.abs(swipeTranslate) / 20, 1);
  // ─────────────────────────────────────────────────────────────────────────

  const handleCopyMessage = () => {
    const plain = isHtmlMessage
      ? messageText
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .trim()
      : messageText;
    navigator.clipboard.writeText(plain).catch(() => {});
    successToast("Message copied to clipboard");
  };

  const menuItems = useMemo(
    () => [
      { icon: <BsReply />, label: "Reply", onClick: () => onReply?.(message) },
      {
        icon: <BsForward />,
        label: "Forward",
        onClick: () => onForward?.(message),
      },
      { icon: <FiCopy />, label: "Copy message", onClick: handleCopyMessage },
      { separator: true as const },
      {
        icon: <RiFlagFill />,
        label: "Report",
        onClick: () => onReport?.(message),
        variant: "danger" as const,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message, onReply, onForward, onReport],
  );
  const isEmojiOnly = useMemo(
    () =>
      !isHtmlMessage && !!messageText.trim() && EMOJI_ONLY_RE.test(messageText),
    [messageText, isHtmlMessage],
  );

  const isKlipyClip = useMemo(() => {
    const trimmed = messageText.trim();
    return (
      trimmed.startsWith("https://static.klipy.com") && trimmed.endsWith(".mp4")
    );
  }, [messageText]);

  const isMessageOnlyUrls = useMemo(() => {
    if (urls.length !== 1) return false;
    if (!isDirectImageUrl(urls[0]!)) return false;
    return messageText.replace(URL_REGEX, "").trim().length === 0;
  }, [messageText, urls]);

  const groupedReactions = useMemo(() => {
    const grouped = new Map<string, typeof message.reactions>();

    (message.reactions || []).forEach((reaction) => {
      const current = grouped.get(reaction.reaction) || [];
      grouped.set(reaction.reaction, [...current, reaction]);
    });

    return Array.from(grouped.entries()).map(([reaction, users]) => ({
      reaction,
      users,
    }));
  }, [message.reactions]);

  const selectedReactionUsers = useMemo(() => {
    if (!activeReaction) return [];
    return (
      groupedReactions.find((item) => item.reaction === activeReaction)
        ?.users || []
    );
  }, [activeReaction, groupedReactions]);

  const activeReactionLabel = activeReaction
    ? getReactionDisplay(activeReaction)
    : "";

  const isToday = messageDate.isSame(today, "day");
  const formattedDate = isToday
    ? messageDate.format("h:mm A")
    : messageDate.format("MMM D, h:mm A");

  if (isActivityMessage) {
    return (
      <S.ChatRow className="activity">
        <S.ActivityBubble>
          <S.ActivitySenderName>
            {message.sender.name || message.sender.username}
          </S.ActivitySenderName>
          {messageText || "Activity update"}
        </S.ActivityBubble>
      </S.ChatRow>
    );
  }

  return (
    <S.ChatRow
      id={`msg-${message.id}`}
      className={classNames({
        receiver: !isSender,
        sender: isSender,
      })}
    >
      {!isSender ? (
        <S.SenderAvatarWrap>
          {/* Crossfade: avatar fades out, reply icon fades + scales in */}
          <div
            style={{
              flexShrink: 0,
              height: 30,
              position: "relative",
              width: 30,
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                left: 0,
                opacity: 1 - swipeProgress,
                position: "absolute",
                top: 0,
                transition: "opacity 0.18s ease",
                width: "100%",
              }}
            >
              <AvatarNew
                src={message.sender.image || null}
                alt={message.sender.name || message.sender.username || "User"}
                username={message.sender.username}
              />
            </div>
            <div
              style={{
                alignItems: "center",
                color: "var(--accent)",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                left: 0,
                opacity: swipeProgress,
                position: "absolute",
                top: 0,
                transform: `scale(${0.5 + swipeProgress * 0.5})`,
                transition: "opacity 0.18s ease, transform 0.18s ease",
                width: "100%",
              }}
            >
              <BsReply size={20} />
            </div>
          </div>
        </S.SenderAvatarWrap>
      ) : null}

      <S.MessageMenuWrapper
        style={{
          opacity:
            swipeProgress > 0 ? Math.max(0, 1 - swipeProgress * 3) : undefined,
          overflow: isSender ? undefined : "hidden",
          pointerEvents: isSwipingActive ? "none" : undefined,
          visibility: isSender ? undefined : "hidden",
          width: isSender ? undefined : 0,
        }}
      >
        <AppDropdownMenu
          trigger={<BsThreeDots size={14} />}
          items={menuItems}
        />
      </S.MessageMenuWrapper>

      <S.BubbleStack
        className={isSender ? "sender" : "receiver"}
        onTouchStart={onSwipeTouchStart}
        onTouchMove={onSwipeTouchMove}
        onTouchEnd={onSwipeTouchEnd}
        onTransitionEnd={() => setSwipeTransitioning(false)}
        style={{
          transform: `translateX(${swipeTranslate}px)`,
          transition: swipeTransitioning ? "transform 0.25s ease" : "none",
          willChange: "transform",
        }}
      >
        <S.SenderNameRow>
          {isSender ? (
            <AvatarNew
              src={message.sender.image || null}
              alt={message.sender.name || message.sender.username || "User"}
              username={message.sender.username}
            />
          ) : null}
          <S.SenderName>{message.sender.name}</S.SenderName>
        </S.SenderNameRow>

        {message.repliedTo ? (
          <S.RepliedToQuote
            $wiggling={repliedWiggling}
            onClick={handleRepliedToClick}
            onAnimationEnd={() => setRepliedWiggling(false)}
          >
            <S.RepliedToBody>
              <S.RepliedToSender>
                {message.repliedTo.sender.name ||
                  message.repliedTo.sender.username}
              </S.RepliedToSender>
              {isRepliedImageOnly(message.repliedTo) ? (
                <S.RepliedToThumbLabel>📷 Image</S.RepliedToThumbLabel>
              ) : (
                <S.RepliedToText>
                  {message.repliedTo.message
                    ? message.repliedTo.message
                        .replace(/<[^>]+>/g, "")
                        .trim()
                        .slice(0, 100)
                    : "(attachment)"}
                </S.RepliedToText>
              )}
            </S.RepliedToBody>
            {(() => {
              const imgSrc = getRepliedImageSrc(message.repliedTo);
              return imgSrc ? (
                <S.RepliedToThumb src={imgSrc} alt="Replied image" />
              ) : null;
            })()}
          </S.RepliedToQuote>
        ) : null}

        {/* Klipy clip: only render video, not text bubble */}
        {isKlipyClip ? (
          <ChatVideoAttachment src={messageText.trim()} />
        ) : (
          <>
            {urls.length > 0 && !isHtmlMessage
              ? urls.map((url) => <LinkPreview key={url} url={url} />)
              : null}

            {messageText && !isMessageOnlyUrls ? (
              isHtmlMessage ? (
                <HtmlChatBubble
                  html={messageText}
                  className={isSender ? "sender" : "receiver"}
                />
              ) : isEmojiOnly ? (
                <S.EmojiOnlyMessage>{messageText}</S.EmojiOnlyMessage>
              ) : (
                <S.ChatBubble className={isSender ? "sender" : "receiver"}>
                  {toRenderableMessage(messageText)}
                </S.ChatBubble>
              )
            ) : null}
          </>
        )}

        {hasAttachments ? (
          <S.AttachmentsGrid $multi={message.attachments.length > 1}>
            {message.attachments.map((attachment) => {
              const isImg = getAttachmentKind(attachment.url) === "image";
              const isHalf = message.attachments.length > 1 && isImg;
              return (
                <S.AttachmentItem
                  key={attachment.id || attachment.url}
                  $half={isHalf}
                >
                  {isImg ? (
                    imgError ? (
                      <AttachmentFallback />
                    ) : (
                      <AppImageViewer
                        src={attachment.url}
                        alt="Message attachment"
                      >
                        <S.AttachmentImage
                          src={attachment.url}
                          alt="Message attachment"
                          $grid={isHalf}
                          onError={() => setImgError(true)}
                        />
                      </AppImageViewer>
                    )
                  ) : null}

                  {getAttachmentKind(attachment.url) === "video" ? (
                    <ChatVideoAttachment src={attachment.url} />
                  ) : null}

                  {getAttachmentKind(attachment.url) === "audio" ? (
                    <ChatAudioAttachment src={attachment.url} />
                  ) : null}

                  {getAttachmentKind(attachment.url) === "file" ? (
                    <S.FileAttachmentCard
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <S.FileAttachmentIcon>📄</S.FileAttachmentIcon>
                      <S.FileAttachmentInfo>
                        <S.FileAttachmentName>
                          {getFileNameFromUrl(attachment.url)}
                        </S.FileAttachmentName>
                      </S.FileAttachmentInfo>
                      <S.FileDownloadButton>
                        <FiDownload size={16} />
                      </S.FileDownloadButton>
                    </S.FileAttachmentCard>
                  ) : null}
                </S.AttachmentItem>
              );
            })}
          </S.AttachmentsGrid>
        ) : null}

        {groupedReactions.length > 0 ? (
          <S.ReactionsBar>
            {groupedReactions.map((reactionGroup) => (
              <S.ReactionChip
                key={reactionGroup.reaction}
                onClick={() => setActiveReaction(reactionGroup.reaction)}
                type="button"
              >
                <span>{getReactionDisplay(reactionGroup.reaction)}</span>
                <span>{reactionGroup.users.length}</span>
              </S.ReactionChip>
            ))}
          </S.ReactionsBar>
        ) : null}

        <S.TimeStamp>{formattedDate}</S.TimeStamp>
      </S.BubbleStack>

      <S.MessageMenuWrapper
        style={{
          opacity:
            swipeProgress > 0 ? Math.max(0, 1 - swipeProgress * 3) : undefined,
          overflow: !isSender ? undefined : "hidden",
          pointerEvents: isSwipingActive ? "none" : undefined,
          visibility: !isSender ? undefined : "hidden",
          width: !isSender ? undefined : 0,
        }}
      >
        <AppDropdownMenu
          trigger={<BsThreeDots size={14} />}
          items={menuItems}
        />
      </S.MessageMenuWrapper>

      <AppAlertDialog
        heading={
          activeReaction ? `Reaction ${activeReactionLabel}` : "Reactions"
        }
        text=""
        open={!!activeReaction}
        onOpenChange={(open) => {
          if (!open) setActiveReaction(null);
        }}
        body={
          <S.ReactionUsersList>
            {selectedReactionUsers.map((reactionUser) => (
              <S.ReactionUserItem
                key={`${reactionUser.sender.id}-${reactionUser.reaction}`}
              >
                <AvatarNew
                  src={reactionUser.sender.image || null}
                  alt={reactionUser.sender.name || reactionUser.sender.username}
                />
                <S.ReactionUserName>
                  {reactionUser.sender.name || reactionUser.sender.username}
                </S.ReactionUserName>
              </S.ReactionUserItem>
            ))}
          </S.ReactionUsersList>
        }
        showConfirm={false}
        closeButtonText="Close"
      />
    </S.ChatRow>
  );
};
