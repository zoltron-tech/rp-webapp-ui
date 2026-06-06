import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { Form, Select } from "radix-ui";
import { type FC, forwardRef, useState } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { AvatarNew } from "@/components/common/avatar-new";
import { useGlobalState } from "@/context/store/stores";
import type { PromptSource } from "@/types";
import { useEventThreadInputState } from "./event-thread-input.store";
import * as S from "./styles";

type Props = {
  sources: PromptSource[];
};

export const EventThreadMuseSelect: FC<Props> = forwardRef(
  ({ sources, ...props }, forwardedRef) => {
    const accent = useGlobalState("accent");
    const theme = useGlobalState("theme");
    const promptType = useEventThreadInputState("type");
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
        <Form.Label className="form-label">Write as:</Form.Label>
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
                    nwImage={source?.avatar}
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
                  {/* As Narrator */}
                  {novelistSource && (
                    <SelectItem
                      key={novelistSource.sourceId}
                      source={novelistSource}
                      labelOverride="As Narrator"
                    />
                  )}

                  <S.OrDivider>OR</S.OrDivider>
                  <Flex direction="column" gap={0}>
                    <S.DialogueLabel>Dialogue from a muse</S.DialogueLabel>
                  </Flex>
                  {museSources?.map((source) => (
                    <SelectItem key={source.sourceId} source={source} />
                  ))}
                </Select.Viewport>
              </Select.Content>
            </S.MuseSelectPortal>
          </Select.Root>
        </Form.Control>
        <Form.Message className="form-message" match="valueMissing">
          Please select a muse or yourself as the narrator
        </Form.Message>
      </S.MuseSelect>
    );
  },
);

const MuseAvatar: FC<{
  src: string | null;
  alt: string;
  nwImage?: PromptSource["avatar"];
}> = forwardRef(({ src, alt, nwImage, ...rest }, forwardedRef) => {
  return (
    <AvatarNew
      className="muse-avatar"
      src={src}
      alt={alt}
      nwImage={nwImage}
      {...rest}
      ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
    />
  );
});

const SelectItem: FC<{
  source: PromptSource | undefined;
  labelOverride?: string;
}> = forwardRef(({ source, labelOverride, ...props }, forwardedRef) => {
  if (!source) return null;

  return (
    <Select.Item
      value={source.sourceId!}
      className="select-item"
      {...props}
      ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
    >
      <Select.ItemIndicator className="select-item-indicator">
        <GrRadialSelected />
      </Select.ItemIndicator>

      <Select.Icon>
        <MuseAvatar
          src={source.image ?? null}
          alt={source.name}
          nwImage={source.avatar}
        />
      </Select.Icon>

      <Select.ItemText>{labelOverride ?? source.name}</Select.ItemText>
    </Select.Item>
  );
});
