import classNames from "classnames";
import { Collapsible } from "radix-ui";
import type { FC } from "react";
import { BsArrowsCollapse } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { typeToTriggerButtonText } from "./helpers";
import { usePromptInputState } from "./prompt-input.store";
import * as S from "./styles";

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
