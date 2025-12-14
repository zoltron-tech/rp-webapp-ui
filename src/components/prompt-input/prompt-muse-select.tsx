import classNames from "classnames";
import { Avatar, Form, Select, Separator } from "radix-ui";
import { type FC, forwardRef, useState } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useGlobalState } from "@/context/store/stores";
import type { Muse, PromptSource, SubmitPromptType } from "@/types";
import { usePromptInputState } from "./prompt-input.store";
import * as S from "./styles";

type Props = {
  sources: PromptSource[];
};

const promptTypeToLabel = (type: SubmitPromptType): string => {
  switch (type) {
    case "prompt":
      return "Post as";
    case "reply":
      return "Reply as";
    case "comment":
      return "Comment as";
    default:
      return "Post as";
  }
};

export const PromptMuseSelect: FC<Props> = forwardRef(
  ({ sources, ...props }, forwardedRef) => {
    const accent = useGlobalState("accent");
    const theme = useGlobalState("theme");
    const promptType = usePromptInputState("type");
    const [source, setSource] = useState<PromptSource>(sources?.[0]);
    const novelistSource = sources.find((s) => s.sourceType === "NOVELIST");

    const museSources = sources.filter((s) => s.sourceType === "MUSE");
    const handleMuseChange = (value: string) => {
      const selectedSource = sources?.find((s) => s.sourceId === value);
      if (selectedSource) {
        setSource(selectedSource);
      }
    };

    return (
      <S.MuseSelect
        name="muse"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Form.Label className="form-label">
          {promptTypeToLabel(promptType)}
        </Form.Label>
        <Form.Control asChild>
          <Select.Root
            name="muse"
            required
            defaultValue={source?.sourceId ?? ""}
            onValueChange={handleMuseChange}
          >
            <Select.Trigger className="select-trigger">
              <Select.Value asChild placeholder="Select a muse">
                <div className="select-value">
                  <MuseAvatar
                    src={source?.image ?? null}
                    alt={`${source?.name}`}
                  />
                  {source?.name}
                </div>
              </Select.Value>
              <Select.Icon>
                <MdOutlineKeyboardArrowDown className="select-icon" />
              </Select.Icon>
            </Select.Trigger>
            <S.MuseSelectPortal>
              <Select.Content
                position="popper"
                side="bottom"
                className={classNames("select-content", theme, accent)}
              >
                <Select.Viewport className="select-viewport">
                  <SelectItem
                    key={novelistSource?.sourceId}
                    source={novelistSource}
                  />
                  <Separator.Root
                    className="separator"
                    orientation="horizontal"
                  />
                  {museSources?.map((source) => (
                    <SelectItem key={source.sourceId} source={source} />
                  ))}
                </Select.Viewport>
              </Select.Content>
            </S.MuseSelectPortal>
          </Select.Root>
        </Form.Control>
        <Form.Message className="form-message" match="valueMissing">
          Please select a muse or yourself as the author
        </Form.Message>
      </S.MuseSelect>
    );
  },
);

const MuseAvatar: FC<{ src: string | null; alt: string }> = forwardRef(
  ({ src, alt, ...rest }, forwardedRef) => {
    return (
      <S.MuseAvatarRoot
        className="muse-avatar"
        {...rest}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image
          className="avatar-image"
          src={src ?? undefined}
          alt={alt}
        />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {alt.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </S.MuseAvatarRoot>
    );
  },
);

const SelectItem: FC<{ source: PromptSource | undefined }> = forwardRef(
  ({ source, ...props }, forwardedRef) => {
    if (source === undefined) return null;
    return (
      <Select.Item
        key={source.sourceId}
        value={source.sourceId!}
        className="select-item"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Select.ItemIndicator className="select-item-indicator">
          <GrRadialSelected />
        </Select.ItemIndicator>
        <Select.Icon>
          <MuseAvatar src={source.image ?? null} alt={`${source.name}`} />
        </Select.Icon>
        <Select.ItemText>{source.name}</Select.ItemText>
      </Select.Item>
    );
  },
);
