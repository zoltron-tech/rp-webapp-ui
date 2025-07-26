import { Muse, SubmitPromptType } from "@/types";
import { Avatar, Form, Select } from "radix-ui";
import { FC, forwardRef, useState } from "react";
import * as S from "./styles";
import { TiTick } from "react-icons/ti";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { GrRadialSelected } from "react-icons/gr";
import { usePromptInputState } from "./prompt-input.store";

type Props = {
  muses: Muse[];
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
  ({ muses, ...props }, forwardedRef) => {
    const promptType = usePromptInputState("type");
    const [muse, setMuse] = useState<Muse>(muses[0]);
    const handleMuseChange = (value: string) => {
      const selectedMuse = muses.find((m) => m.id === value);
      if (selectedMuse) {
        setMuse(selectedMuse);
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
            defaultValue={muse.id ?? ""}
            onValueChange={handleMuseChange}
          >
            <Select.Trigger className="select-trigger">
              <Select.Value asChild placeholder="Select a muse">
                <div className="select-value">
                  <MuseAvatar
                    src={muse.image || ""}
                    alt={`${muse.firstName} ${muse.lastName}`}
                  />
                  {muse.firstName} {muse.lastName}
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
                className="select-content"
              >
                <Select.Viewport className="select-viewport">
                  {muses.map((muse) => (
                    <SelectItem key={muse.id} muse={muse} />
                  ))}
                </Select.Viewport>
              </Select.Content>
            </S.MuseSelectPortal>
          </Select.Root>
        </Form.Control>
        <Form.Message className="form-message" match="valueMissing">
          Please select a muse
        </Form.Message>
      </S.MuseSelect>
    );
  }
);

const MuseAvatar: FC<{ src: string; alt: string }> = forwardRef(
  ({ src, alt, ...rest }, forwardedRef) => {
    return (
      <S.MuseAvatarRoot
        className="muse-avatar"
        {...rest}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image className="avatar-image" src={src} alt={alt} />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {alt.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </S.MuseAvatarRoot>
    );
  }
);

const SelectItem: FC<{ muse: Muse }> = forwardRef(
  ({ muse, ...props }, forwardedRef) => {
    return (
      <Select.Item
        key={muse.id}
        value={muse.id!}
        className="select-item"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Select.ItemIndicator className="select-item-indicator">
          <GrRadialSelected />
        </Select.ItemIndicator>
        <Select.Icon>
          <MuseAvatar
            src={muse.image || ""}
            alt={`${muse.firstName} ${muse.lastName}`}
          />
        </Select.Icon>
        <Select.ItemText>
          {muse.firstName} {muse.lastName}
        </Select.ItemText>
      </Select.Item>
    );
  }
);
