"use client";

import { type FC, memo } from "react";
import { Logger } from "@/utils/services";
import * as S from "./footer-styles";

const words = ["Characters", "Novelists", "Motivation", "Potatoes"] as const;

export const LoadingTextVariation: FC = memo(() => {
  Logger.info("LoadingTextVariation rendered");

  return (
    <S.Container>
      <div className="loader">
        <p>loading</p>
        <div className="words">
          {words.concat(words[0]).map((word, index) => (
            <span key={`${word}-${index}`} className="word">
              {word}
            </span>
          ))}
        </div>
      </div>
    </S.Container>
  );
});
