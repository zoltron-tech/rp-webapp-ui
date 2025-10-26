import classNames from "classnames";
import { Form, Select } from "radix-ui";
import {
  type FC,
  forwardRef,
  type HTMLProps,
  useCallback,
  useState,
} from "react";
import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useGlobalState } from "@/context/store/stores";
import type { PrivacyLevel } from "@/types";
import { PrivacyIcon } from "../common/privacy-icon";
import * as S from "./styles";

const PRIVACY_OPTIONS = [
  { label: "Public", value: "PUBLIC" },
  { label: "Friends", value: "FRIENDS" },
  { label: "Only Me", value: "ONLY_ME" },
] as const;

type PromptPrivacySelectProps = HTMLProps<HTMLDivElement> & {
  initial?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
};

export const PromptPrivacySelect: FC<PromptPrivacySelectProps> = ({
  className,
  initial = "PUBLIC",
  ...rest
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [privacy, setPrivacy] = useState<PrivacyLevel>(initial);
  const handlePrivacyChange = useCallback((value: PrivacyLevel) => {
    setPrivacy(value);
  }, []);

  return (
    <S.PrivacySelect
      className={className}
      name="privacy"
      title={`Privacy level: ${privacy.toLocaleLowerCase()}`}
      {...rest}
    >
      <Form.Control asChild>
        <Select.Root
          aria-label="Privacy"
          name="privacy"
          required
          defaultValue={privacy}
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
              className={classNames("select-content", theme, accent)}
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
  },
);
