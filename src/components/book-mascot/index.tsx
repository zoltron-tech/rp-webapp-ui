"use client";

import * as S from "./styles";

type BookMascotVariant = "sleeping" | "sad";

interface BookMascotProps {
  /** Mood of the little book. Defaults to "sleeping". */
  variant?: BookMascotVariant;
  /** Rendered width in px (height scales with it). */
  size?: number;
  className?: string;
}

/** A friendly little book mascot.
 *  - "sleeping": dozes off with a gentle bob, blink, and floating Zzz's —
 *    used at the end of a list (nothing left to read).
 *  - "sad": droopy eyes, frown, and a rolling tear with a slow mope — used
 *    when content is gone (e.g. a deleted thread). */
export const BookMascot = ({
  variant = "sleeping",
  size = 56,
  className,
}: BookMascotProps) => {
  const sad = variant === "sad";

  return (
    <S.Mascot
      viewBox="0 0 64 60"
      aria-hidden="true"
      $size={size}
      $sad={sad}
      className={className}
    >
      {!sad && (
        <>
          {/* floating Zzz */}
          <text className="z z1" x="46" y="18">z</text>
          <text className="z z2" x="52" y="11">z</text>
          <text className="z z3" x="58" y="5">z</text>
        </>
      )}

      <g className="body">
        {/* book cover */}
        <rect className="cover" x="12" y="26" width="34" height="26" rx="4" />
        {/* spine / open page hint */}
        <path className="page" d="M29 28 v22" />

        {sad ? (
          <g className="face">
            {/* droopy sad eyes */}
            <path className="eye" d="M18 39 q2.5 -3 5 0" />
            <path className="eye" d="M34 39 q2.5 -3 5 0" />
            {/* frown */}
            <path className="mouth" d="M26 46 q3 -2.5 6 0" />
            {/* tear under one eye */}
            <path className="tear" d="M20.5 42 q2 3 0 4.5 q-2 -1.5 0 -4.5 z" />
          </g>
        ) : (
          <g className="face">
            {/* sleepy closed eyes */}
            <path className="eye" d="M18 37 q2.5 3 5 0" />
            <path className="eye" d="M34 37 q2.5 3 5 0" />
            {/* cheeks */}
            <circle className="cheek" cx="18.5" cy="43" r="1.6" />
            <circle className="cheek" cx="39" cy="43" r="1.6" />
            {/* content smile */}
            <path className="mouth" d="M26 44 q3 2.5 6 0" />
          </g>
        )}

        {/* bookmark */}
        <path className="mark" d="M40 26 v10 l-3 -2.5 l-3 2.5 v-10 z" />
      </g>
    </S.Mascot>
  );
};
