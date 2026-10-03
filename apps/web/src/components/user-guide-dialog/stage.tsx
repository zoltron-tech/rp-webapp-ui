"use client";

import {
  type FC,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as S from "./styles";

/**
 * The stage: a scale model of a real screen, inside a frame of fixed size.
 *
 * The model is laid out at a screen's worth of width — a desktop's on a
 * desktop, a phone's on a phone — and then scaled down until the whole of it
 * fits the frame. So the reader always sees the entire section at once, small,
 * which is the whole job: this is a picture of where things are, not a copy of
 * the screen to work in.
 *
 * Scaled with a transform rather than by shrinking the components, because the
 * components must lay themselves out exactly as they do on the real page —
 * their own breakpoints, their own wrapping, their own truncation. Anything
 * else would be drawing a screen the app does not have.
 *
 * The fit is measured rather than guessed: a step's mock can be a two-row
 * header or a 600px mesh, and no hand-set scale survives both.
 */
/**
 * The largest a model is ever drawn.
 *
 * Even when a short mock would fit the frame outright it is kept visibly
 * smaller than life, so it reads as a picture of the screen rather than as
 * something to work in — and so a reader never tries to type into it.
 */
const MAX_SCALE = 0.8;

export const GuideStage: FC<{ children: ReactNode }> = ({ children }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const model = modelRef.current;
    if (!frame || !model) return;
    // The model's own box is never scaled — a transform does not touch layout —
    // so this stays the natural size however small it is being drawn.
    const width = model.offsetWidth;
    const height = model.offsetHeight;
    if (!width || !height) return;
    setScale(
      Math.min(
        MAX_SCALE,
        frame.clientWidth / width,
        frame.clientHeight / height,
      ),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // Both ends move: the frame with the dialog, the model as its own content
    // settles (a portrait loading, a tab switching to a taller one).
    const observer = new ResizeObserver(measure);
    if (frameRef.current) observer.observe(frameRef.current);
    if (modelRef.current) observer.observe(modelRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <S.Stage ref={frameRef}>
      {/* `inert` makes the whole model unreachable — no clicks, no tab stops,
          no screen-reader announcements. It is an illustration of the screen,
          and a reader who tried to work it would only be confused when their
          own story did not change. It also keeps a mock's dozen buttons out of
          the dialog's tab order, between Skip and Back. */}
      <S.StageModel ref={modelRef} $scale={scale} inert>
        {children}
      </S.StageModel>
    </S.Stage>
  );
};
