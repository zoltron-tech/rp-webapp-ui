import { Collapsible } from "radix-ui";
import * as S from "./styles";
import classNames from "classnames";
import { typeToTriggerButtonText } from "./helpers";
import { BsArrowsCollapse } from "react-icons/bs";
import { FC } from "react";
import { usePromptInputState } from "./prompt-input.store";
import { IoMdAdd } from "react-icons/io";

type PromptInputTriggerProps = {
  open: boolean;
};

const PromptInputTriggerInner: FC<PromptInputTriggerProps> = ({ open }) => {
  const type = usePromptInputState("type");

  if (open) {
    return <BsArrowsCollapse />;
  }

  return (
    <>
      <IoMdAdd className="plus-icon" />
      {typeToTriggerButtonText(type)}
    </>
  );
};

export const PromptInputTrigger: FC<PromptInputTriggerProps> = ({ open }) => {
  return (
    <Collapsible.Trigger asChild>
      <S.PromptTrigger className={classNames([{ open }])}>
        <PromptInputTriggerInner open={open} />
      </S.PromptTrigger>
    </Collapsible.Trigger>
  );
};
