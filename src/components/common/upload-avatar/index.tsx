import { FC, useState } from "react";

import * as S from "./styles";
import React from "react";
import classNames from "classnames";
import Image from "next/image";
import { generateToastError } from "@/utils/helpers";
import { useTheme } from "styled-components";
import { TbCameraUp } from "react-icons/tb";
import { Logger } from "@/utils/services";

type UploadAvatarProps = {
  image?: string;
  onChange?: (image: FormData) => void;
};

export const UploadAvatar: FC<UploadAvatarProps> = ({ image, onChange }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const theme = useTheme();

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Logger.log("change", e.currentTarget.files?.[0]);
    const file = e.currentTarget.files?.[0];
    if (!file || !onChange) return;

    const isImage = file.type.includes("image");

    if (!isImage) {
      return generateToastError("File type is not a valid image!", theme);
    }
    setUploadedFile(file);

    const formData = new FormData();
    formData.append("file", file);
    onChange(formData);
  };
  return (
    <>
      <S.FileInputHidden placeholder="" type="file" onChange={onUpload} />
      <S.UploadAvatar
        className={classNames([
          "nw-upload-avatar",
          { added: !!image || !!uploadedFile },
        ])}
      >
        <Image
          src={uploadedFile ? URL.createObjectURL(uploadedFile) : image || ""}
          layout="fill"
          alt={"avatar"}
        />
        <TbCameraUp />
      </S.UploadAvatar>
    </>
  );
};
