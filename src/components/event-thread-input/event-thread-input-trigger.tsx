import classNames from "classnames";
import { Collapsible } from "radix-ui";
import type { FC } from "react";
import { BsArrowsCollapse } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import * as S from "./styles";

type EventThreadInputTriggerProps = {
  open: boolean;
};

const EventThreadInputTriggerInner: FC<EventThreadInputTriggerProps> = ({
  open,
}) => {
  if (open) {
    return <BsArrowsCollapse />;
  }

  return <IoMdAdd className="plus-icon" />;
};

export const EventThreadInputTrigger: FC<EventThreadInputTriggerProps> = ({
  open,
}) => {
  return (
    <Collapsible.Trigger asChild>
      <S.EventThreadTrigger className={classNames([{ open }])}>
        <EventThreadInputTriggerInner open={open} />
      </S.EventThreadTrigger>
    </Collapsible.Trigger>
  );
};
