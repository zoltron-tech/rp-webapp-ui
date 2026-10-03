"use client";

import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as S from "./styles";

export type SegmentedTabOption<T extends string> = {
  value: T;
  label: string;
  /** Tinted with the accent while its tab is selected. */
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the tablist. */
  ariaLabel: string;
  className?: string;
};

/**
 * Pill segmented control (material track, lifted thumb) whose selection
 * glides between options. The thumb is a single element measured off the
 * selected tab, so it slides rather than blinking from button to button.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: Props<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<T, HTMLButtonElement>>>({});
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [canAnimate, setCanAnimate] = useState(false);

  // Measure before paint so the thumb never flashes at the wrong spot; the
  // observer follows width changes from late-loading fonts or resizes.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const tab = tabRefs.current[value];
      if (tab) setThumb({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [value]);

  // Place the thumb without motion first, then let later selections slide.
  useEffect(() => {
    if (!thumb || canAnimate) return;
    const frame = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [thumb, canAnimate]);

  return (
    <S.Track
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      className={className}
    >
      {thumb && (
        <S.Thumb
          aria-hidden
          $animate={canAnimate}
          style={{
            transform: `translateX(${thumb.left}px)`,
            width: thumb.width,
          }}
        />
      )}
      {options.map((option) => (
        <S.Tab
          key={option.value}
          ref={(el) => {
            if (el) tabRefs.current[option.value] = el;
          }}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          $active={value === option.value}
          $thumbReady={thumb !== null}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </S.Tab>
      ))}
    </S.Track>
  );
}
