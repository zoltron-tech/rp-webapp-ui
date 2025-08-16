import classNames from "classnames";
import Image from "next/image";
import type React from "react";
import { type FC, useState } from "react";
import { TbCameraUp } from "react-icons/tb";
import { useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";
import * as S from "./styles";

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
          <Image
            src={URL.createObjectURL(uploadedFile)}
            layout="fill"
            alt={"avatar"}
          />
        ) : image ? (
          <Image src={image} layout="fill" alt={"avatar"} />
        ) : null}
        <TbCameraUp />
      </S.UploadAvatar>
    </>
  );
};
