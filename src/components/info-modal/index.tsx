import { FC, ForwardedRef, forwardRef, useCallback } from "react";
import { Dialog } from "radix-ui";
import classNames from "classnames";
import * as S from "./styled";
import "./info-box.css";
import { CgClose } from "react-icons/cg";
import { IoIosWarning } from "react-icons/io";

type InfoModalProps = {
  type?: "info" | "warning" | "error";
  title?: string;
  description: string;
  onClose?: () => void;
  open: boolean;
};

const infoTypeToTitle = (type: InfoModalProps["type"]): string => {
  switch (type) {
    case "info":
      return "Alert";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    default:
      return "Alert";
  }
};

type InfoModalTitleProps = {
  title: string;
  type: InfoModalProps["type"];
};

const InfoModalTitle: FC<InfoModalTitleProps> = forwardRef(
  ({ title, type, ...props }, forwardedRef) => {
    if (type === "info") {
      return (
        <Dialog.Title
          {...props}
          ref={forwardedRef as ForwardedRef<HTMLHeadingElement>}
          className="title"
        >
          {title}
        </Dialog.Title>
      );
    }

    return (
      <Dialog.Title
        {...props}
        ref={forwardedRef as ForwardedRef<HTMLHeadingElement>}
        className="title"
      >
        {type === "warning" ? <IoIosWarning className="warning-icon" /> : null}
        {type === "error" ? <CgClose className="error-icon" /> : null}
        {title}
      </Dialog.Title>
    );
  }
);

export const InfoModal: FC<InfoModalProps> = ({
  type = "info",
  title,
  description,
  onClose = () => {},
  open,
}) => {
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <S.InfoModalRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="info-box-overlay" />
        <S.ModalContent className={classNames([type])}>
          <InfoModalTitle title={title || infoTypeToTitle(type)} type={type} />
          <Dialog.Description className="description">
            {description}
          </Dialog.Description>
          <Dialog.Close
            className={classNames(["close-button", type])}
            onClick={onClose}
          >
            <CgClose />
          </Dialog.Close>
        </S.ModalContent>
      </Dialog.Portal>
    </S.InfoModalRoot>
  );
};
