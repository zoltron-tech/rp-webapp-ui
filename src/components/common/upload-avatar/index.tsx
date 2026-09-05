import classNames from "classnames";
import type React from "react";
import { type FC, useState } from "react";
import { TbCameraUp } from "react-icons/tb";
import { useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";
import * as S from "./styles";

/**
 * Reproduces next/image's legacy `layout="fill"`: stretch to the positioned
 * parent. S.UploadAvatar is already `position: absolute` with a fixed clamp
 * size, so this fills exactly what the Image did.
 */
const FILL: React.CSSProperties = {
  height: "100%",
  inset: 0,
  objectFit: "cover",
  position: "absolute",
  width: "100%",
};

type UploadAvatarProps = {
  image?: string;
  onChange?: (image: FormData) => void;
};

export const UploadAvatar: FC<UploadAvatarProps> = ({ image, onChange }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { errorToast } = useUIContext();

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Logger.debug("change", e.currentTarget.files?.[0]);
    const file = e.currentTarget.files?.[0];
    if (!file || !onChange) return;

    const isImage = file.type.includes("image");

    if (!isImage) {
      return errorToast("File type is not a valid image!");
    }
    setUploadedFile(file);

    const formData = new FormData();
    formData.append("file", file);
    onChange(formData);
  };

  Logger.info("UploadAvatar rendered");

  return (
    <>
      <S.FileInputHidden placeholder="" type="file" onChange={onUpload} />
      <S.UploadAvatar
        className={classNames([
          "nw-upload-avatar",
          { added: !!image || !!uploadedFile },
        ])}
      >
        {uploadedFile ? (
          <img
            src={URL.createObjectURL(uploadedFile)}
            style={FILL}
            alt={"avatar"}
          />
        ) : image ? (
          <img src={image} style={FILL} alt={"avatar"} />
        ) : null}
        <TbCameraUp />
      </S.UploadAvatar>
    </>
  );
};
