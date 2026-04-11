"use client";

import classNames from "classnames";
import moment from "moment";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Message } from "@/types/conversation";
import { ROUTES } from "@/utils/constants/routes";
import { AppAlertDialog } from "../../dialog";
import { AppImageViewer } from "../../image-viewer/AppImageViewer";
import { AvatarNew } from "../avatar-new";
import * as S from "./styles";

type Props = {
  message: Message;
  currentUsername: string;
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

/** Detects messages that contain rich-text HTML tags produced by ChatRichInput. */
const HTML_CONTENT_RE = /<(strong|em|b|i|span)\b/i;

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

  useEffect(() => {
    // Skip metadata fetch for direct image files and social platforms with static previews
    if (isDirectImage || isYouTube) return;
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
  }, [url, isDirectImage, isYouTube]);

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

const ChatAudioAttachment: FC<{ src: string }> = ({ src }) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioElement) return;

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
  }, [audioElement]);

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

  return (
    <S.AudioAttachmentCard>
      <S.HiddenAudio ref={setAudioElement} preload="metadata" src={src} />
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
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoElement) return;

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
  }, [videoElement]);

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

  return (
    <S.VideoAttachmentCard>
      <S.VideoViewport>
        <S.VideoElement ref={setVideoElement} preload="metadata" src={src} />
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

export const ChatBubble: FC<Props> = ({ message, currentUsername }) => {
  const today = moment().format("YYYY-MM-DD");
  const messageDate = moment.utc(message.createdAt).local();

  const isSender = message.sender.username === currentUsername;
  const isActivityMessage = message.type?.toLowerCase() === "activity";

  const messageText = message.message || "";
  const urls = useMemo(() => extractUrls(messageText), [messageText]);
  const hasAttachments = !!message.attachments?.length;
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const isHtmlMessage = HTML_CONTENT_RE.test(messageText);

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
        <S.ActivityBubble>{messageText || "Activity update"}</S.ActivityBubble>
      </S.ChatRow>
    );
  }

  return (
    <S.ChatRow
      className={classNames({
        receiver: !isSender,
        sender: isSender,
      })}
    >
      {!isSender ? (
        <S.SenderAvatarWrap>
          <AvatarNew
            src={message.sender.image || null}
            alt={message.sender.name || message.sender.username || "User"}
            username={message.sender.username}
          />
        </S.SenderAvatarWrap>
      ) : null}

      <S.BubbleStack className={isSender ? "sender" : "receiver"}>
        {!isSender ? <S.SenderName>{message.sender.name}</S.SenderName> : null}

        {urls.length > 0 && !isHtmlMessage
          ? urls.map((url) => <LinkPreview key={url} url={url} />)
          : null}

        {messageText && !isMessageOnlyUrls ? (
          isHtmlMessage ? (
            <HtmlChatBubble
              html={messageText}
              className={isSender ? "sender" : "receiver"}
            />
          ) : (
            <S.ChatBubble className={isSender ? "sender" : "receiver"}>
              {toRenderableMessage(messageText)}
            </S.ChatBubble>
          )
        ) : null}

        {hasAttachments ? (
          <S.AttachmentsGrid>
            {message.attachments.map((attachment) => (
              <S.AttachmentItem key={attachment.id || attachment.url}>
                {getAttachmentKind(attachment.url) === "image" ? (
                  <AppImageViewer src={attachment.url} alt="Message attachment">
                    <S.AttachmentImage
                      src={attachment.url}
                      alt="Message attachment"
                    />
                  </AppImageViewer>
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
            ))}
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
