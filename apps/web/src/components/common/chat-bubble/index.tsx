"use client";

import {
  getAttachmentKind,
  getFileNameFromUrl,
  IMAGE_EXTENSIONS,
  isDirectImageUrl,
  isKlipyClip,
  isMediaOnlyMessage,
  isReadingBreaker,
  isSameReaction,
  messageTextOf,
  REACTION_OPTIONS as REACTION_KEYS,
  URL_REGEX,
  withoutUrls,
} from "@nw/chat";
import type { Message } from "@nw/types/conversation";
import { formatTime } from "@nw/utils";
import {
  parseNovelistWorldLink,
  uniqueNovelistWorldLinks,
} from "@nw/utils/nw-links";
import classNames from "classnames";
import moment from "moment";
import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BsArrowClockwise,
  BsChevronLeft,
  BsChevronRight,
  BsForward,
  BsPencil,
  BsReply,
  BsThreeDots,
  BsTrash,
} from "react-icons/bs";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiCopy, FiDownload, FiExternalLink } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { IoBookOutline } from "react-icons/io5";
import { RiFlagFill } from "react-icons/ri";
import { TbAlertCircle, TbError404 } from "react-icons/tb";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { ROUTES } from "@/utils/constants/routes";
import { AppAlertDialog } from "../../dialog";
import { AppImageViewer } from "../../image-viewer/AppImageViewer";
import { VideoViewer } from "../../image-viewer/VideoViewer";
import { localLinkHosts } from "../../muse-embed/link-slots";
import { NovelistWorldLinkEmbed } from "../../nw-link-embed";
import { AppDropdownMenuResponsive } from "../../profile-more-dropdown";
import { AvatarNew } from "../avatar-new";
import { PlaceholderAvatar } from "../placeholder-avatar";
import * as S from "./styles";

type Props = {
  message: Message;
  currentUsername: string;
  hideSender?: boolean;
  hideDate?: boolean;
  isNew?: boolean;
  failed?: boolean;
  onRetry?: () => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onReport?: (message: Message) => void;
  /** `remove` takes the viewer's own reaction back instead of setting it. */
  onReact?: (message: Message, reaction: string, remove?: boolean) => void;
  onEdit?: (message: Message) => void;
  /** Offered on the viewer's own messages; the panel confirms before acting. */
  onDelete?: (message: Message) => void;
};

type LinkMeta = {
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
};

// The URL pattern, the extension lists and the media predicates moved to
// `@nw/chat` so the phone applies exactly the same rules. A client that
// disagrees does not error — it renders a link where everyone else sees a GIF.
const REACTION_EMOJI_MAP: Record<string, string> = {
  "100": "💯",

  // light / affectionate
  adore: "🥰",

  // high-react / expressive
  amazing: "🤩",
  angry: "😡",
  biting_lip: "🫦",
  broken_heart: "💔",
  celebrate: "🎉",
  clap: "👏",
  cry: "😭",
  fire: "🔥",
  gem: "💎",
  haha: "😂",
  // core (very common / backend-compatible)
  heart: "❤️",
  hundred: "💯",
  kiss: "😘",
  laugh: "😂",

  // common thumbs/affirmations
  like: "👍",

  // legacy aliases
  love: "❤️",
  mind_blown: "🤯",
  ok: "👌🏼",
  pray: "🙏",
  respect: "🫡",
  ribbon: "🎀",
  sad: "😢",
  skull: "💀",
  smile: "🙂",

  // utility / celebratory
  star: "⭐",
  strong: "💪",
  tada: "🎉",
  wow: "😮",
};

// Reactions offered in the bubble menu (ordered by mood / frequency).
/*
 * The reaction vocabulary now lives in `@nw/chat`, next to the other things the
 * two clients cannot afford to disagree about. The stored value is a key, and
 * this file draws it with hand-built SVG art while the phone draws the system
 * emoji — a split that stayed invisible until the native app printed `laugh`
 * under a message because it assumed the value was already a glyph.
 */
const REACTION_OPTIONS = REACTION_KEYS;

const mediaElements = new Set<HTMLMediaElement>();
let mediaListenersAttached = false;

const SELECTION_LOCK_STYLE_ID = "chat-press-selection-lock";

// Injects (once) a global rule that forces selection off on every element. A
// plain inline `user-select: none` on <html> is unreliable because any
// descendant that sets its own `user-select` breaks the inherited value; the
// `!important` rule below overrides those so nothing in the app can be
// highlighted while the class is present.
const ensureSelectionLockStyle = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(SELECTION_LOCK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SELECTION_LOCK_STYLE_ID;
  style.textContent = `
    html.chat-press-lock,
    html.chat-press-lock * {
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
  `;
  document.head.appendChild(style);
};
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

const getReactionDisplay = (reaction: string) => {
  const normalized = reaction.trim().toLowerCase();
  return REACTION_EMOJI_MAP[normalized] || reaction;
};

const REPLIED_URL_RE = /(https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+)/i;
const REPLIED_MENTION_RE = /class="mention-tag"/i;

/** Ice breaker messages are plain text (typed into a bare textarea, not
 *  ChatRichInput), so `**bold**`/`*italic*` markers are never converted to
 *  HTML the way a chat reply's are. Parse them the same way ChatRichInput
 *  does live as-you-type, so the reply-quote preview renders the same
 *  stylings instead of showing literal asterisks. */
const ICE_BREAKER_MARKDOWN_RE = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

const renderIceBreakerMessage = (text: string) => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  ICE_BREAKER_MARKDOWN_RE.lastIndex = 0;
  let match: RegExpExecArray | null = ICE_BREAKER_MARKDOWN_RE.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = ICE_BREAKER_MARKDOWN_RE.lastIndex;
    match = ICE_BREAKER_MARKDOWN_RE.exec(text);
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

/** Minimal shape shared by the two kinds of items a message can reply to
 *  (a prior message or an ice breaker) — enough for the reply-quote preview. */
type RepliedPreview = {
  message?: string | null;
  attachments?: Message["attachments"];
};

const getRepliedImageSrc = (preview: RepliedPreview): string | null => {
  const imgAttachment = preview.attachments?.find((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return IMAGE_EXTENSIONS.includes(ext);
  });
  if (imgAttachment) return imgAttachment.url;

  const text = preview.message || "";
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

const isRepliedImageOnly = (preview: RepliedPreview): boolean => {
  if (REPLIED_MENTION_RE.test(preview.message || "")) return false;
  const hasText = !!preview.message?.trim();
  const hasImageAttachment = preview.attachments?.some((att) => {
    const ext =
      att.url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ??
      "";
    return IMAGE_EXTENSIONS.includes(ext);
  });
  if (hasImageAttachment && !hasText) return true;
  if (hasText) {
    const text = (preview.message ?? "").trim();
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

export const ChatVideoAttachment: FC<{ src: string }> = ({ src }) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [videoError, setVideoError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  // True until the user presses play for the first time; used to seek back to
  // 0 after the thumbnail seek so playback always starts from the beginning.
  const showingThumbnailRef = useRef(true);

  useEffect(() => {
    if (!videoElement) return;
    if (videoError) return;

    registerMediaElement(videoElement);

    const onLoadedMetadata = () => {
      const dur = videoElement.duration || 0;
      setDuration(dur);
      if (videoElement.videoWidth && videoElement.videoHeight) {
        setAspectRatio(videoElement.videoWidth / videoElement.videoHeight);
      }
      // Seek to 1 s (clamped to the actual duration) to show a meaningful
      // thumbnail frame instead of the typically-black very first frame.
      if (dur > 0) {
        videoElement.currentTime = Math.min(0.5, dur);
      }
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

    // On first play, reset to the start so the video plays from 0, not from
    // the thumbnail-seek position.
    if (showingThumbnailRef.current) {
      showingThumbnailRef.current = false;
      videoElement.currentTime = 0;
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
  const MAX_VIDEO_HEIGHT = 280;
  return (
    <S.VideoAttachmentCard>
      <S.VideoViewport
        style={{
          cursor: "zoom-in",
          ...(aspectRatio != null
            ? {
                aspectRatio,
                maxHeight: `${MAX_VIDEO_HEIGHT}px`,
                maxWidth: `${MAX_VIDEO_HEIGHT * aspectRatio}px`,
              }
            : {}),
        }}
        onClick={() => {
          if (videoElement && !videoElement.paused) videoElement.pause();
          setViewerOpen(true);
        }}
      >
        <S.VideoElement
          ref={setVideoElement}
          preload="metadata"
          src={src}
          playsInline
          disablePictureInPicture
          onError={() => setVideoError(true)}
        />
      </S.VideoViewport>

      <S.AudioProgressRow>
        <S.AudioPlayButton
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </S.AudioPlayButton>

        <S.AudioTime>{formatTime(currentTime)}</S.AudioTime>
        <S.AudioProgressBar onClick={onSeek}>
          <S.AudioProgressFill style={{ width: `${progress}%` }} />
        </S.AudioProgressBar>
        <S.AudioTime>{formatTime(duration)}</S.AudioTime>
      </S.AudioProgressRow>

      <VideoViewer src={src} open={viewerOpen} onOpenChange={setViewerOpen} />
    </S.VideoAttachmentCard>
  );
};

export const ChatBubble: FC<Props> = ({
  message,
  currentUsername,
  hideSender = false,
  hideDate = false,
  isNew = false,
  failed = false,
  onRetry,
  onReply,
  onForward,
  onReport,
  onReact,
  onEdit,
  onDelete,
}) => {
  const { successToast, errorToast } = useUIContext();
  const today = moment().format("YYYY-MM-DD");
  const messageDate = moment.utc(message.createdAt).local();
  const [imgError, setImgError] = useState(false);

  const isSender = message.sender.username === currentUsername;
  // Still sending (or failed): the id is local, so nothing that needs a server
  // id — edit, reply, forward, react, delete — can act on it yet.
  const isOptimistic = message.id.startsWith("optimistic-");
  const isActivityMessage = message.type?.toLowerCase() === "activity";

  const rawMessageText = message.message || "";
  // Normalise backend-generated anchor HTML (<a href="URL">URL</a>) to plain
  // URLs before any rendering so the URL is picked up once by extractUrls and
  // rendered once by toRenderableMessage instead of leaking tag text.
  const messageText = useMemo(() => {
    if (!rawMessageText.includes("<a ")) return rawMessageText;
    return rawMessageText.replace(
      /<a\s[^>]*href="([^"]+)"[^>]*>.*?<\/a>/gi,
      (_, href: string) => href,
    );
  }, [rawMessageText]);
  const urls = useMemo(() => extractUrls(messageText), [messageText]);
  // Links back into Novelist World draw as the thing they point at — a muse
  // card — and the URL itself leaves the bubble, so "She's here! <link>"
  // reads as the sentence with the card beneath it. Read from the words of
  // the message so a link typed into the HTML composer counts too.
  const nwLinks = useMemo(
    () =>
      messageText.includes("/rp/") || messageText.includes("/@")
        ? uniqueNovelistWorldLinks(messageTextOf(messageText), localLinkHosts())
        : [],
    [messageText],
  );
  const bubbleText = useMemo(
    () =>
      nwLinks.length
        ? withoutUrls(
            messageText,
            nwLinks.map((link) => link.url),
          )
            // "go say hi to <link>, she…" loses its link and keeps its comma;
            // close the gap the link left in front of the punctuation.
            .replace(/(?:\s|&nbsp;)+([,.;:!?])/g, "$1")
        : messageText,
    [messageText, nwLinks],
  );
  // Everything else still gets the generic preview card.
  const previewUrls = useMemo(
    () =>
      nwLinks.length
        ? urls.filter((url) => !parseNovelistWorldLink(url, localLinkHosts()))
        : urls,
    [urls, nwLinks],
  );
  const hasAttachments = !!message.attachments?.length;

  // A message can be text-edited only when it carries actual text — not when it
  // is a bare media/sticker/gif URL or an attachment-only message.
  const isWholeMessageMedia = useMemo(() => {
    const trimmed = messageText.trim();
    if (!trimmed) return false;
    return (
      urls.length === 1 &&
      messageText.replace(URL_REGEX, "").trim().length === 0
    );
  }, [messageText, urls]);
  // Nor a message that never decrypted: its "text" is the fallback notice,
  // and saving that would overwrite the real words for good.
  const canEditMessage =
    isSender &&
    !hasAttachments &&
    !!messageText.trim() &&
    !isWholeMessageMedia &&
    !message.e2eCiphertext;
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [burstReaction, setBurstReaction] = useState<string | null>(null);
  const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isHtmlMessage = HTML_CONTENT_RE.test(messageText);
  const [repliedWiggling, setRepliedWiggling] = useState(false);

  // ── Long-press → context menu ─────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const pressActiveRef = useRef(false);
  const lastTapRef = useRef(0);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Toggle a document-wide selection lock. `user-select` is inherited, so
  // setting it on <html> prevents iOS from highlighting *anything* in the app
  // while a finger is pressing on a bubble — even if the thumb drifts slightly.
  const setGlobalSelectionLock = (locked: boolean) => {
    if (typeof document === "undefined") return;
    ensureSelectionLockStyle();
    document.documentElement.classList.toggle("chat-press-lock", locked);
  };

  const fireReaction = (reactionKey: string) => {
    // The panel drops reactions on unsent bubbles; no burst for one that
    // will not land.
    if (isOptimistic) return;
    // Fire the floating burst animation locally for instant feedback.
    setBurstReaction(reactionKey);
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    burstTimeoutRef.current = setTimeout(() => setBurstReaction(null), 850);
    onReact?.(message, reactionKey);
  };

  // What the viewer already reacted with, if anything. One per person, so
  // there is at most one.
  const myReaction = currentUsername
    ? message.reactions?.find((r) => r.sender?.username === currentUsername)
        ?.reaction
    : undefined;

  const removeMyReaction = () => {
    if (myReaction) onReact?.(message, myReaction, true);
  };

  useEffect(
    () => () => {
      clearLongPress();
      // Ensure the lock is released if we unmount mid-press.
      setGlobalSelectionLock(false);
    },
    [],
  );

  // While a finger is pressing on a bubble, block the OS from starting a text
  // selection (which otherwise highlights the page when the menu slides up).
  useEffect(() => {
    const onSelectStart = (e: Event) => {
      if (pressActiveRef.current) e.preventDefault();
    };
    document.addEventListener("selectstart", onSelectStart);
    return () => document.removeEventListener("selectstart", onSelectStart);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const handleRepliedToClick = () => {
    if (message.repliedTo?.type !== "MESSAGE") return;
    const targetId = message.repliedTo.message?.id;
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
    // Stop propagation immediately so no parent (ConversationSheet / MessagesWrapper)
    // starts tracking this touch as a page-swipe gesture.
    e.stopPropagation();
    swipeTouchStartX.current = touch.clientX;
    swipeTouchStartY.current = touch.clientY;
    swipeRawDeltaX.current = 0;
    swipeIsHorizontal.current = null;
    setSwipeTransitioning(false);

    // Begin long-press detection; fires the context menu if the finger is held
    // still for the threshold duration.
    pressActiveRef.current = true;
    setGlobalSelectionLock(true);
    longPressFiredRef.current = false;
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setSwipeTranslate(0);
      setMenuOpen(true);
      // Drop any selection the OS may have started under the finger.
      window.getSelection?.()?.removeAllRanges();
    }, 450);
  };

  const onSwipeTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - swipeTouchStartX.current;
    const deltaY = touch.clientY - swipeTouchStartY.current;

    // Any meaningful movement cancels the long-press.
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) clearLongPress();

    if (swipeIsHorizontal.current === null) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      swipeIsHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!swipeIsHorizontal.current) return;

    // Prevent the ConversationSheet (or any parent) from also handling this gesture.
    e.stopPropagation();

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

  const onSwipeTouchEnd = (e: React.TouchEvent) => {
    clearLongPress();
    pressActiveRef.current = false;
    setGlobalSelectionLock(false);

    // Double-tap to react with a heart (genuine taps only — not swipes or
    // long-press).
    if (!swipeIsHorizontal.current && !longPressFiredRef.current && onReact) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        fireReaction("heart");
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }

    if (!swipeIsHorizontal.current) return;

    // Prevent the ConversationSheet (or any parent) from also handling this gesture.
    e.stopPropagation();

    const SWIPE_THRESHOLD = 60;
    if (Math.abs(swipeRawDeltaX.current) >= SWIPE_THRESHOLD && !isOptimistic) {
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
    navigator.clipboard
      .writeText(plain)
      .then(() => successToast("Message copied."))
      .catch(() => errorToast("Could not copy the message."));
  };

  const menuItems = useMemo(
    () => [
      ...(canEditMessage && onEdit
        ? [
            {
              icon: <BsPencil />,
              label: "Edit message",
              onClick: () => onEdit(message),
            },
          ]
        : []),
      { icon: <BsReply />, label: "Reply", onClick: () => onReply?.(message) },
      {
        icon: <BsForward />,
        label: "Forward",
        onClick: () => onForward?.(message),
      },
      { icon: <FiCopy />, label: "Copy message", onClick: handleCopyMessage },
      { separator: true as const },
      ...(isSender && onDelete
        ? [
            {
              icon: <BsTrash />,
              label: "Delete message",
              onClick: () => onDelete(message),
              variant: "danger" as const,
            },
          ]
        : []),
      {
        icon: <RiFlagFill />,
        label: "Report",
        onClick: () => onReport?.(message),
        variant: "danger" as const,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      message,
      onReply,
      onForward,
      onReport,
      onEdit,
      onDelete,
      canEditMessage,
      isSender,
    ],
  );

  // An unsent bubble has a local id only: copy it, retry it, or drop it.
  const bubbleMenuItems = isOptimistic
    ? [
        { icon: <FiCopy />, label: "Copy message", onClick: handleCopyMessage },
        ...(failed && onRetry
          ? [{ icon: <BsArrowClockwise />, label: "Retry", onClick: onRetry }]
          : []),
        ...(failed && isSender && onDelete
          ? [
              { separator: true as const },
              {
                icon: <BsTrash />,
                label: "Remove",
                onClick: () => onDelete(message),
                variant: "danger" as const,
              },
            ]
          : []),
      ]
    : menuItems;

  // Clear any pending burst-animation timer on unmount.
  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    };
  }, []);

  // Picking the reaction that is already yours takes it back. Only the picker
  // toggles: a double-tap heart on a message you already hearted stays a heart.
  const handleReact = (reactionKey: string) => {
    if (isSameReaction(reactionKey, myReaction)) {
      removeMyReaction();
      return;
    }
    fireReaction(reactionKey);
  };

  const scrollPicker = (dir: "left" | "right") => {
    // 44px button + 6px gap = one emoji step
    pickerRef.current?.scrollBy({
      behavior: "smooth",
      left: dir === "right" ? 50 : -50,
    });
  };

  const reactionPicker = onReact && !isOptimistic ? (
    <S.ReactionPickerWrapper
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <S.ReactionPickerArrow
        type="button"
        aria-label="Scroll reactions left"
        onClick={(e) => {
          e.stopPropagation();
          scrollPicker("left");
        }}
      >
        <BsChevronLeft size={11} />
      </S.ReactionPickerArrow>
      <S.ReactionPicker ref={pickerRef}>
        {REACTION_OPTIONS.map((option) => (
          <S.ReactionPickerButton
            key={option.key}
            type="button"
            aria-label={option.label}
            aria-pressed={isSameReaction(option.key, myReaction)}
            title={
              isSameReaction(option.key, myReaction)
                ? `Remove ${option.label}`
                : option.label
            }
            $active={isSameReaction(option.key, myReaction)}
            onClick={() => handleReact(option.key)}
          >
            {option.emoji}
          </S.ReactionPickerButton>
        ))}
      </S.ReactionPicker>
      <S.ReactionPickerArrow
        type="button"
        aria-label="Scroll reactions right"
        onClick={(e) => {
          e.stopPropagation();
          scrollPicker("right");
        }}
      >
        <BsChevronRight size={11} />
      </S.ReactionPickerArrow>
    </S.ReactionPickerWrapper>
  ) : undefined;

  const isEmojiOnly = useMemo(
    () =>
      !isHtmlMessage && !!bubbleText.trim() && EMOJI_ONLY_RE.test(bubbleText),
    [bubbleText, isHtmlMessage],
  );

  const isClip = useMemo(() => isKlipyClip(messageText), [messageText]);

  const isMessageOnlyUrls = useMemo(
    () => isMediaOnlyMessage(messageText),
    [messageText],
  );

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
      $isNew={isNew && isSender}
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
            {!hideSender && (
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
                {message.sender.isPlaceholder ? (
                  <PlaceholderAvatar label={message.sender.name} />
                ) : (
                  <AvatarNew
                    src={message.sender.image || null}
                    alt={message.sender.name || message.sender.username || "User"}
                    username={message.sender.username}
                  />
                )}
              </div>
            )}
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
        <AppDropdownMenuResponsive
          trigger={<BsThreeDots size={14} />}
          items={bubbleMenuItems}
          headerContent={reactionPicker}
          {...(isSender ? { onOpenChange: setMenuOpen, open: menuOpen } : {})}
        />
      </S.MessageMenuWrapper>

      <S.BubbleStack
        $wide={nwLinks.length > 0}
        className={isSender ? "sender" : "receiver"}
        onTouchStart={onSwipeTouchStart}
        onTouchMove={onSwipeTouchMove}
        onTouchEnd={onSwipeTouchEnd}
        onTouchCancel={() => {
          clearLongPress();
          pressActiveRef.current = false;
          setGlobalSelectionLock(false);
        }}
        onDoubleClick={() => {
          if (onReact) fireReaction("heart");
        }}
        onTransitionEnd={() => setSwipeTransitioning(false)}
        onContextMenu={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          // Swallow the click that follows a long-press so it doesn't also
          // open the image/video viewer.
          if (longPressFiredRef.current) {
            e.preventDefault();
            e.stopPropagation();
            longPressFiredRef.current = false;
          }
        }}
        style={{
          transform: `translateX(${swipeTranslate}px)`,
          transition: swipeTransitioning ? "transform 0.25s ease" : "none",
          willChange: "transform",
        }}
      >
        {!hideSender && (
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
        )}

        {message.repliedTo
          ? (() => {
              if (message.repliedTo.type === "ICE_BREAKER") {
                const repliedIceBreaker = message.repliedTo.iceBreaker;
                if (!repliedIceBreaker) return null;

                return (
                  <S.RepliedToIceBreakerQuote
                    $wiggling={repliedWiggling}
                    $color={repliedIceBreaker.color}
                    onClick={handleRepliedToClick}
                    onAnimationEnd={() => setRepliedWiggling(false)}
                  >
                    <S.RepliedToIceBreakerAvatar>
                      <AvatarNew
                        src={repliedIceBreaker.source.image || null}
                        alt={repliedIceBreaker.source.name}
                        nwImage={repliedIceBreaker.source.avatar}
                      />
                    </S.RepliedToIceBreakerAvatar>
                    <S.RepliedToIceBreakerBody>
                      <S.RepliedToIceBreakerTag>
                        {isReadingBreaker(repliedIceBreaker) ? (
                          <IoBookOutline size={8} />
                        ) : (
                          <HiSparkles size={8} />
                        )}
                        {isReadingBreaker(repliedIceBreaker)
                          ? "Reading"
                          : "Ice breaker"}
                      </S.RepliedToIceBreakerTag>
                      <S.RepliedToIceBreakerText>
                        {renderIceBreakerMessage(
                          repliedIceBreaker.message
                            .replace(/<[^>]+>/g, "")
                            .trim()
                            .slice(0, 100),
                        )}
                      </S.RepliedToIceBreakerText>
                    </S.RepliedToIceBreakerBody>
                  </S.RepliedToIceBreakerQuote>
                );
              }

              const repliedMessage = message.repliedTo.message;
              const senderName =
                repliedMessage?.sender.name || repliedMessage?.sender.username;
              const previewText = repliedMessage?.message ?? null;
              const preview: RepliedPreview = {
                attachments: repliedMessage?.attachments,
                message: previewText,
              };

              return (
                <S.RepliedToQuote
                  $wiggling={repliedWiggling}
                  onClick={handleRepliedToClick}
                  onAnimationEnd={() => setRepliedWiggling(false)}
                >
                  <S.RepliedToBody>
                    <S.RepliedToSender>{senderName}</S.RepliedToSender>
                    {isRepliedImageOnly(preview) ? (
                      <S.RepliedToThumbLabel>📷 Image</S.RepliedToThumbLabel>
                    ) : (
                      <S.RepliedToText>
                        {previewText
                          ? previewText
                              .replace(/<[^>]+>/g, "")
                              .trim()
                              .slice(0, 100)
                          : "(attachment)"}
                      </S.RepliedToText>
                    )}
                  </S.RepliedToBody>
                  {(() => {
                    const imgSrc = getRepliedImageSrc(preview);
                    return imgSrc ? (
                      <S.RepliedToThumb src={imgSrc} alt="Replied image" />
                    ) : null;
                  })()}
                </S.RepliedToQuote>
              );
            })()
          : null}

        {/* Klipy clip: only render video, not text bubble */}
        {isClip ? (
          <ChatVideoAttachment src={messageText.trim()} />
        ) : (
          <>
            {previewUrls.length > 0 && !isHtmlMessage
              ? previewUrls.map((url) => <LinkPreview key={url} url={url} />)
              : null}

            {bubbleText.trim() && !isMessageOnlyUrls ? (
              isHtmlMessage ? (
                <HtmlChatBubble
                  html={bubbleText}
                  className={isSender ? "sender" : "receiver"}
                />
              ) : isEmojiOnly ? (
                <S.EmojiOnlyMessage>{bubbleText}</S.EmojiOnlyMessage>
              ) : (
                <S.ChatBubble className={isSender ? "sender" : "receiver"}>
                  {toRenderableMessage(bubbleText)}
                </S.ChatBubble>
              )
            ) : null}

            {/* After the words, so "She's here!" is read before the card. */}
            {nwLinks.map((link) => (
              <NovelistWorldLinkEmbed
                key={`${link.kind}-${link.id}`}
                link={link}
              />
            ))}
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
            {groupedReactions.map((reactionGroup) => {
              const mine = !!onReact && reactionGroup.reaction === myReaction;
              // A chip always opens who reacted; your row in that list is
              // where your own reaction is taken back.
              return (
                <S.ReactionChip
                  key={reactionGroup.reaction}
                  $mine={mine}
                  onClick={() => setActiveReaction(reactionGroup.reaction)}
                  type="button"
                >
                  {getReactionDisplay(reactionGroup.reaction)}
                  <span>{reactionGroup.users.length}</span>
                </S.ReactionChip>
              );
            })}
          </S.ReactionsBar>
        ) : null}

        {!hideDate && <S.TimeStamp>{formattedDate}</S.TimeStamp>}
        {failed && isSender && (
          <S.RetryRow type="button" onClick={onRetry}>
            <TbAlertCircle size={13} />
            Failed · Tap to retry
          </S.RetryRow>
        )}
        {burstReaction ? (
          <S.ReactionBurst aria-hidden="true">
            {getReactionDisplay(burstReaction)}
          </S.ReactionBurst>
        ) : null}
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
        <AppDropdownMenuResponsive
          trigger={<BsThreeDots size={14} />}
          items={bubbleMenuItems}
          headerContent={reactionPicker}
          {...(!isSender ? { onOpenChange: setMenuOpen, open: menuOpen } : {})}
        />
      </S.MessageMenuWrapper>

      <AppAlertDialog
        heading="Reactions"
        text=""
        open={!!activeReaction}
        onOpenChange={(open) => {
          if (!open) setActiveReaction(null);
        }}
        body={
          <S.ReactionDialogContent>
            <S.ReactionTabBar>
              {groupedReactions.map((reactionGroup) => (
                <S.ReactionTab
                  key={reactionGroup.reaction}
                  $active={activeReaction === reactionGroup.reaction}
                  onClick={() => setActiveReaction(reactionGroup.reaction)}
                  type="button"
                >
                  <span className="emoji">
                    {getReactionDisplay(reactionGroup.reaction)}
                  </span>
                  <span className="count">{reactionGroup.users.length}</span>
                </S.ReactionTab>
              ))}
            </S.ReactionTabBar>
            <S.ReactionUsersList style={{ marginTop: 12 }}>
              {(
                groupedReactions.find((g) => g.reaction === activeReaction)
                  ?.users ?? []
              ).map((reactionUser) => (
                <S.ReactionUserItem
                  key={`${reactionUser.sender.id}-${reactionUser.reaction}`}
                >
                  {reactionUser.sender.isPlaceholder ? (
                    <PlaceholderAvatar label={reactionUser.sender.name} />
                  ) : (
                    <AvatarNew
                      src={reactionUser.sender.image || null}
                      alt={
                        reactionUser.sender.name || reactionUser.sender.username
                      }
                    />
                  )}
                  <S.ReactionUserName>
                    {reactionUser.sender.name || reactionUser.sender.username}
                  </S.ReactionUserName>
                  {onReact &&
                  !!currentUsername &&
                  reactionUser.sender.username === currentUsername ? (
                    <S.ReactionRemoveButton
                      type="button"
                      onClick={() => {
                        removeMyReaction();
                        setActiveReaction(null);
                      }}
                    >
                      Remove
                    </S.ReactionRemoveButton>
                  ) : null}
                </S.ReactionUserItem>
              ))}
            </S.ReactionUsersList>
          </S.ReactionDialogContent>
        }
        showConfirm={false}
        closeButtonText="Close"
      />
    </S.ChatRow>
  );
};
