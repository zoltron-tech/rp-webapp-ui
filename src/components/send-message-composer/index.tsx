"use client";

import type { FC, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { HiGif, HiPaperAirplane } from "react-icons/hi2";
import { IoCheckmark } from "react-icons/io5";
import { LuSticker } from "react-icons/lu";
import { MdOutlineGifBox } from "react-icons/md";
import { TiArrowSortedUp } from "react-icons/ti";
import { ChatRichInput } from "@/components/chat-rich-input";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import { StickerPicker } from "@/components/sticker-picker";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, Muse, Novelist } from "@/types";
import * as S from "./styled";

export type ComposerSender = {
  id: string;
  type: "NOVELIST" | "MUSE";
  name: string;
  image: string | null;
};

type SendMessageComposerProps = {
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  onSendGif?: (gifUrl: string) => Promise<void> | void;
  onSendSticker?: (stickerUrl: string) => Promise<void> | void;
  selectedSender?: ComposerSender | null;
  onSenderChange?: (sender: ComposerSender) => void;
  mentionItems?: MentionDataItem[];
  onHtmlChange?: (html: string) => void;
  getMentionMuseItems?: (prefix: string) => Promise<MentionDataItem[]>;
};

const novelistToSender = (n: Novelist): ComposerSender => ({
  id: n.id,
  image: n.image ?? null,
  name: `${n.firstName} ${n.lastName}`.trim() || n.username,
  type: "NOVELIST",
});

const museToSender = (m: Muse): ComposerSender => ({
  id: m.id ?? "",
  image: m.image ?? null,
  name: `${m.firstName} ${m.lastName}`.trim(),
  type: "MUSE",
});

const SenderRow: FC<{
  sender: ComposerSender;
  isActive: boolean;
  onSelect: (sender: ComposerSender) => void;
}> = ({ sender, isActive, onSelect }) => (
  <S.SenderListItem
    type="button"
    onClick={() => onSelect(sender)}
    $active={isActive}
  >
    <AvatarNew src={sender.image} alt={sender.name} />
    <S.SenderInfo>
      <S.SenderName>{sender.name}</S.SenderName>
      <S.SenderType>
        {sender.type === "NOVELIST" ? "Novelist" : "Muse"}
      </S.SenderType>
    </S.SenderInfo>
    {isActive && (
      <S.SenderSelectedMark>
        <IoCheckmark size={16} />
      </S.SenderSelectedMark>
    )}
  </S.SenderListItem>
);

export const SendMessageComposer: FC<SendMessageComposerProps> = ({
  value,
  sending,
  onChange,
  onSubmit,
  onSendGif,
  onSendSticker,
  selectedSender,
  onSenderChange,
  mentionItems = [],
  onHtmlChange,
  getMentionMuseItems,
}) => {
  const novelist = useGlobalState("novelist");
  const [internalSender, setInternalSender] = useState<ComposerSender | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaToolbarOpen, setMediaToolbarOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (novelist && !internalSender) {
      setInternalSender(novelistToSender(novelist));
    }
  }, [novelist, internalSender]);

  const activeSender =
    selectedSender !== undefined ? selectedSender : internalSender;

  const senderOptions = useMemo<ComposerSender[]>(() => {
    if (!novelist) return [];
    return [
      novelistToSender(novelist),
      ...(novelist.muses ?? []).map(museToSender),
    ];
  }, [novelist]);

  const novelistSender = useMemo(
    () => senderOptions.find((s) => s.type === "NOVELIST") ?? null,
    [senderOptions],
  );

  const museSenders = useMemo(
    () => senderOptions.filter((s) => s.type === "MUSE"),
    [senderOptions],
  );

  const filteredMuses = useMemo(() => {
    const q = search.toLowerCase();
    const list = museSenders;
    const filtered = q
      ? list.filter((s) => s.name.toLowerCase().includes(q))
      : list;
    // Promote selected muse to top of muse section
    if (!activeSender || activeSender.type !== "MUSE") return filtered;
    const selected = filtered.find((s) => s.id === activeSender.id);
    const rest = filtered.filter((s) => s.id !== activeSender.id);
    return selected ? [selected, ...rest] : filtered;
  }, [museSenders, search, activeSender]);

  const hasValue = value.trim().length > 0;

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!hasValue || sending) return;
    setMediaToolbarOpen(false);
    await onSubmit();
  };

  const handleSelectSender = (sender: ComposerSender) => {
    setInternalSender(sender);
    onSenderChange?.(sender);
    setSearch("");
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) setSearch("");
    setDialogOpen(open);
  };

  return (
    <>
      <S.ComposerWrapper>
        <S.MediaToolbar $open={mediaToolbarOpen}>
          {onSendGif && (
            <S.GifButton
              type="button"
              title="Send a GIF"
              data-active={gifPickerOpen ? "true" : undefined}
              onClick={() => {
                setGifPickerOpen((prev) => !prev);
                setStickerPickerOpen(false);
              }}
            >
              <HiGif size={24} />
            </S.GifButton>
          )}
          {onSendSticker && (
            <S.StickerButton
              type="button"
              title="Send a sticker"
              data-active={stickerPickerOpen ? "true" : undefined}
              onClick={() => {
                setStickerPickerOpen((prev) => !prev);
                setGifPickerOpen(false);
              }}
            >
              <LuSticker size={24} />
            </S.StickerButton>
          )}
        </S.MediaToolbar>

        <S.Composer onSubmit={(e) => handleSubmit(e)}>
          <S.SenderButton
            type="button"
            title={activeSender?.name ?? "Select sender"}
            onClick={() => setDialogOpen(true)}
          >
            <AvatarNew
              src={activeSender?.image ?? null}
              alt={activeSender?.name ?? "Sender"}
            />
            <S.SenderCaret>
              <TiArrowSortedUp size={10} />
            </S.SenderCaret>
          </S.SenderButton>

          <ChatRichInput
            value={value}
            onChange={onChange}
            onHtmlChange={onHtmlChange ?? (() => {})}
            onSubmit={() => handleSubmit()}
            mentionItems={mentionItems}
            getMentionMuseItems={getMentionMuseItems}
          />

          {(onSendGif || onSendSticker) && (
            <S.MediaToggleButton
              type="button"
              title="Media"
              data-open={mediaToolbarOpen ? "true" : undefined}
              onClick={() => setMediaToolbarOpen((prev) => !prev)}
            >
              <span>+</span>
            </S.MediaToggleButton>
          )}

          <S.SendButton type="submit" disabled={sending || !hasValue}>
            <HiPaperAirplane size={16} />
            <S.SendButtonText>
              {sending ? "Sending..." : "Send"}
            </S.SendButtonText>
          </S.SendButton>
        </S.Composer>
      </S.ComposerWrapper>

      <AppAlertDialog
        heading="Send as"
        text=""
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        showConfirm={false}
        closeButtonText="Done"
        body={
          <S.SenderDialogBody>
            <S.SenderSearch
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <S.SenderList>
              {/* Novelist — always pinned at top */}
              {novelistSender && (
                <SenderRow
                  sender={novelistSender}
                  isActive={activeSender?.id === novelistSender.id}
                  onSelect={handleSelectSender}
                />
              )}

              {/* Divider + muse section */}
              {filteredMuses.length > 0 && (
                <>
                  <S.SenderDivider> characters </S.SenderDivider>
                  {filteredMuses.map((sender) => (
                    <SenderRow
                      key={sender.id || sender.name}
                      sender={sender}
                      isActive={activeSender?.id === sender.id}
                      onSelect={handleSelectSender}
                    />
                  ))}
                </>
              )}

              {novelistSender === null && filteredMuses.length === 0 && (
                <S.SenderEmptyText>No results found.</S.SenderEmptyText>
              )}
            </S.SenderList>
          </S.SenderDialogBody>
        }
      />

      {onSendGif && (
        <AppAlertDialog
          heading="Pick a GIF"
          text=""
          open={gifPickerOpen}
          onOpenChange={(open) => {
            if (!open) setGifPickerOpen(false);
          }}
          showConfirm={false}
          closeButtonText="Close"
          body={
            <GifPicker
              onSelect={(gifUrl) => {
                onSendGif(gifUrl);
                setGifPickerOpen(false);
                setMediaToolbarOpen(false);
              }}
            />
          }
        />
      )}

      {onSendSticker && (
        <AppAlertDialog
          heading="Pick a Sticker"
          text=""
          open={stickerPickerOpen}
          onOpenChange={(open) => {
            if (!open) setStickerPickerOpen(false);
          }}
          showConfirm={false}
          closeButtonText="Close"
          body={
            <StickerPicker
              onSelect={(stickerUrl) => {
                onSendSticker(stickerUrl);
                setStickerPickerOpen(false);
                setMediaToolbarOpen(false);
              }}
            />
          }
        />
      )}
    </>
  );
};

export default SendMessageComposer;
