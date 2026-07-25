"use client";

import * as S from "./styles";

interface EndOfListProps {
  /** Copy shown under the mascot. */
  label?: string;
}

/** End-of-list marker — shown in place of a Load more button once every page
 *  has been fetched, so the user knows there's nothing further to load. A
 *  little book mascot dozes off (nothing left to read) with a gentle bob,
 *  the occasional blink, and floating Zzz's for a bit of life. */
export const EndOfList = ({
  label = "You've made it to the end",
}: EndOfListProps) => (
  <S.Root role="status" aria-label={label}>
    <S.Mascot viewBox="0 0 64 60" aria-hidden="true">
      {/* floating Zzz */}
      <text className="z z1" x="46" y="18">z</text>
      <text className="z z2" x="52" y="11">z</text>
      <text className="z z3" x="58" y="5">z</text>

      <g className="body">
        {/* book cover */}
        <rect className="cover" x="12" y="26" width="34" height="26" rx="4" />
        {/* spine / open page hint */}
        <path className="page" d="M29 28 v22" />
        {/* face */}
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
        {/* bookmark */}
        <path className="mark" d="M40 26 v10 l-3 -2.5 l-3 2.5 v-10 z" />
      </g>
    </S.Mascot>
    <S.Label>{label}</S.Label>
  </S.Root>
);
