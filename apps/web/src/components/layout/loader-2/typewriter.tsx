"use client";

import { type FC, memo } from "react";
import { Logger } from "@/utils/services";

type Props = {};

export const TypeWriter: FC<Props> = memo(() => {
  Logger.info("PageLoader rendered");

  return (
    <div className="typewriter">
      <div className="slide">
        <i></i>
      </div>
      <div className="paper"></div>
      <div className="keyboard"></div>
    </div>
  );
});
