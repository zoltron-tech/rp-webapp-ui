import { FC, forwardRef, useCallback, useState } from "react";
import * as S from "./styles";
import { Form, Select } from "radix-ui";
import { TiTick } from "react-icons/ti";
import { GrRadialSelected } from "react-icons/gr";
import { SiPrivateinternetaccess } from "react-icons/si";
import { FaGlobeAmericas, FaUserFriends } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type PrivacyLevel = "PUBLIC" | "FRIENDS" | "ONLY_ME";

const PRIVACY_OPTIONS = [
  { value: "PUBLIC", label: "Public" },
  { value: "FRIENDS", label: "Friends" },
  { value: "ONLY_ME", label: "Only Me" },
] as const;

export const PrivacyIcon: FC<{ privacy: PrivacyLevel }> = ({ privacy }) => {
  switch (privacy) {
    case "FRIENDS":
      return <FaUserFriends />;
    case "PUBLIC":
      return <FaGlobeAmericas />;
    case "ONLY_ME":
    default:
      return <SiPrivateinternetaccess />;
  }
};

export const PromptPrivacySelect: FC = () => {
  const [privacy, setPrivacy] = useState<PrivacyLevel>("PUBLIC");
  const handlePrivacyChange = useCallback((value: PrivacyLevel) => {
    setPrivacy(value);
  }, []);

  return (
    <S.PrivacySelect
      name="privacy"
      title={`Privacy level: ${privacy.toLocaleLowerCase()}`}
    >
      <Form.Control asChild>
        <Select.Root
          aria-label="Privacy"
          name="privacy"
          required
          defaultValue="PUBLIC"
          onValueChange={handlePrivacyChange}
        >
          <Select.Trigger className="select-trigger">
            <Select.Value asChild placeholder="Select a privacy level">
              <div className="select-value">
                <PrivacyIcon privacy={privacy} />
              </div>
            </Select.Value>
            <Select.Icon asChild>
              <MdOutlineKeyboardArrowDown className="select-icon" />
            </Select.Icon>
          </Select.Trigger>
          <S.PrivacySelectPortal>
            <Select.Content
              position="popper"
              side="bottom"
              align="end"
              className="select-content"
            >
              <Select.Viewport className="select-viewport">
                {PRIVACY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} option={option} />
                ))}
              </Select.Viewport>
            </Select.Content>
          </S.PrivacySelectPortal>
        </Select.Root>
      </Form.Control>
      <Form.Message className="form-message" match="valueMissing">
        Please select a privacy level
      </Form.Message>
    </S.PrivacySelect>
  );
};

type SelectItemProps = {
  option: (typeof PRIVACY_OPTIONS)[number];
};

const SelectItem: FC<SelectItemProps> = forwardRef(
  ({ option, ...props }, forwardedRef) => {
    return (
      <Select.Item
        key={option.value}
        value={option.value}
        className="select-item"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Select.ItemIndicator className="select-item-indicator">
          <GrRadialSelected />
        </Select.ItemIndicator>
        <Select.ItemText>{option.label}</Select.ItemText>
      </Select.Item>
    );
  }
);
