"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import * as S from "./styles";

interface ExpandableTextProps {
  text: string;
  collapsedHeight?: number; // px height when collapsed
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  collapsedHeight = 200,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>(`${collapsedHeight}px`);
  const [animating, setAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (expanded) {
        setMaxHeight(`${ref.current.scrollHeight}px`);
      } else {
        setMaxHeight(`${collapsedHeight}px`);
      }
      setAnimating(true);
      const timeout = setTimeout(() => setAnimating(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [expanded, collapsedHeight, text]);

  if (!text) return null;

  return (
    <>
      <S.Wrapper ref={ref} style={{ maxHeight }} $animating={animating}>
        {text}
      </S.Wrapper>
      {text.length > 200 && (
        <S.Toggle onClick={() => setExpanded(!expanded)}>
          {expanded ? " Show less..." : " See more..."}
        </S.Toggle>
      )}
    </>
  );
};

export default ExpandableText;
