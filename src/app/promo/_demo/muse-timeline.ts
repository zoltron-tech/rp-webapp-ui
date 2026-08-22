/**
 * The muse-profile animation, as a function of time.
 *
 * Same contract as the other scenes: `applyFrame(root, t)` puts everything into
 * the state it should be in at `t`, so the capture can step it frame by frame.
 * The scene's own controls — the nav cards, the verse circles, the side menu —
 * are clicked for real; what is written here is the choreography around them:
 * the grid opening, the card turning over on a verse switch, and the story
 * being read through.
 */

// ── Beats ──────────────────────────────────────────────────────────────────

type Beat = { start: number; dur: number };
type Stagger = Beat & { stagger: number };

const ENTRY: Beat = { dur: 900, start: 0 };
/** The cards deal into the grid. */
const GRID: Stagger = { dur: 520, stagger: 110, start: 500 };

/** The third card grows toward the profile while the rest clear the frame. */
const OPEN: Beat = { dur: 900, start: 2600 };
/** The profile arrives under it: chrome in from the edges it lives on. */
const PROFILE: Beat = { dur: 800, start: 3300 };

/** Two steps along the roster, each a slide-through rather than a cut. */
const NEXT_1: Beat = { dur: 700, start: 5150 };
const NEXT_2: Beat = { dur: 700, start: 6350 };

/** Verse switches. The card turns edge-on, swaps, and turns back. */
const FLIP_TO_2: Beat = { dur: 1000, start: 7900 };
const FLIP_TO_1: Beat = { dur: 1000, start: 9400 };

/** Info opens beside the card, which slides over to make room for it. */
const INFO: Beat = { dur: 800, start: 11100 };

/** The back story, and a slow read down it. */
const STORY: Beat = { dur: 600, start: 13300 };
const STORY_SCROLL: Beat = { dur: 3800, start: 14200 };

/** Peers, and the same again. */
const PEERS: Beat = { dur: 600, start: 18600 };
const PEERS_SCROLL: Beat = { dur: 2200, start: 19600 };

export const DURATION = 23000;

// ── Easing ─────────────────────────────────────────────────────────────────

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const at = (t: number, beat: Beat) => clamp01((t - beat.start) / beat.dur);
const atIndex = (t: number, beat: Stagger, index: number) =>
  clamp01((t - (beat.start + index * beat.stagger)) / beat.dur);

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
const easeOutBack = (p: number) => {
  const c = 1.42;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
};
const round = (v: number) => Math.round(v * 1000) / 1000;
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

const style = (
  el: Element | null | undefined,
  props: Record<string, string>,
) => {
  if (!(el instanceof HTMLElement)) return;
  for (const [key, value] of Object.entries(props)) {
    el.style.setProperty(key, value);
  }
};

const enter = (
  el: Element | null | undefined,
  p: number,
  { x = 0, y = 0, scale = 1 } = {},
) => {
  const e = easeOut(p);
  style(el, {
    opacity: String(round(p === 0 ? 0 : e)),
    transform: `translate3d(${round((1 - e) * x)}px, ${round((1 - e) * y)}px, 0) scale(${round(scale + (1 - scale) * e)})`,
  });
};

const find = (root: HTMLElement, name: string) =>
  root.querySelector<HTMLElement>(`[data-promo="${name}"]`);

// ── One-shot actions ───────────────────────────────────────────────────────

type Action = { at: number; run: (root: HTMLElement) => void };

const click = (root: HTMLElement, name: string) => find(root, name)?.click();

const ACTIONS: Action[] = [
  // Mid-slide, so the roster changes while the card is off the frame's centre.
  { at: NEXT_1.start + NEXT_1.dur / 2, run: (r) => click(r, "nav-next") },
  { at: NEXT_2.start + NEXT_2.dur / 2, run: (r) => click(r, "nav-next") },
  // Mid-flip, with the card edge-on and nothing of it showing.
  { at: FLIP_TO_2.start + FLIP_TO_2.dur / 2, run: (r) => click(r, "verse-2") },
  { at: FLIP_TO_1.start + FLIP_TO_1.dur / 2, run: (r) => click(r, "verse-1") },

  { at: INFO.start, run: (r) => click(r, "rail-info") },
  { at: STORY.start, run: (r) => click(r, "rail-story") },
  { at: PEERS.start, run: (r) => click(r, "rail-peers") },
];

const done = new Set<number>();

export const resetActions = () => {
  done.clear();
};

// ── Helpers for the two set pieces ─────────────────────────────────────────

/**
 * A slide-through: out one side, back from the other, with the swap hidden at
 * the crossing. Returns the transform and opacity for a given progress.
 */
const slideThrough = (p: number, distance: number) => {
  const half = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
  const out = p < 0.5;
  const eased = out ? easeInOut(half) : 1 - easeInOut(half);
  return {
    opacity: String(round(1 - 0.9 * eased)),
    transform: `translate3d(${round((out ? -1 : 1) * distance * eased)}px, 0, 0)`,
  };
};

/**
 * The card turning over: 0 → edge-on → 0. Never past 90°, so the face never
 * shows mirrored and the swap happens in the blind spot.
 */
const flipAngle = (p: number) =>
  p < 0.5 ? 90 * easeInOut(p / 0.5) : -90 * (1 - easeInOut((p - 0.5) / 0.5));

/**
 * The scroller inside the open section.
 *
 * Each section is a fixed-size card that scrolls its own content, so the thing
 * to move is somewhere inside it rather than the wrapper the scene provides.
 * Found by measurement — the outermost descendant with room to scroll — rather
 * than by class name, which is a styled-components hash.
 */
const sectionScroller = (root: HTMLElement) => {
  const section = find(root, "section");
  if (!section) return null;
  for (const node of section.querySelectorAll<HTMLElement>("*")) {
    if (node.scrollHeight - node.clientHeight > 8) return node;
  }
  return null;
};

/** Scroll position for a beat, as a fraction of whatever there is to scroll. */
const scrollThrough = (el: HTMLElement | null, p: number) => {
  if (!el) return;
  const room = el.scrollHeight - el.clientHeight;
  if (room <= 0) return;
  el.scrollTop = room * easeInOut(p);
};

// ── The frame ──────────────────────────────────────────────────────────────

export const applyFrame = (root: HTMLElement, t: number) => {
  for (const action of ACTIONS) {
    if (t < action.at || done.has(action.at)) continue;
    done.add(action.at);
    action.run(root);
  }

  // 1. The screen rises into shot.
  const stage = find(root, "stage");
  if (stage) {
    const p = at(t, ENTRY);
    const e = easeOut(p);
    style(stage, {
      opacity: String(round(clamp01(t / 280))),
      transform: [
        "perspective(1800px)",
        `translate3d(0, ${round((1 - e) * 300)}px, ${round((1 - e) * -220)}px)`,
        `rotateX(${round((1 - e) * 18)}deg)`,
        `rotateZ(${round((1 - e) * -4)}deg)`,
        `scale(${round(0.9 + 0.1 * easeOutBack(p))})`,
      ].join(" "),
    });
  }

  // 2. The grid deals in, then clears for the card that was chosen.
  const opening = at(t, OPEN);
  const openEase = easeInOut(opening);
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>('[data-promo="muse-grid"] > *'),
  );
  const chosen = 2;

  cards.forEach((card, index) => {
    const arrival = atIndex(t, GRID, index);
    const e = easeOut(arrival);

    if (index === chosen) {
      // Grows and lifts toward where the profile's own card will be, then
      // hands over to it.
      style(card, {
        opacity: String(round(Math.min(arrival === 0 ? 0 : e, 1 - openEase))),
        transform: [
          `translate3d(${round(mix((1 - e) * 0, -150, openEase))}px, ${round(mix((1 - e) * 60, -40, openEase))}px, 0)`,
          `scale(${round(mix(0.9 + 0.1 * e, 1.45, openEase))})`,
        ].join(" "),
        "z-index": "2",
      });
      return;
    }

    // Everything else clears the frame, outward from the chosen card.
    const away = index < chosen ? -1 : 1;
    style(card, {
      opacity: String(round(Math.min(arrival === 0 ? 0 : e, 1 - openEase))),
      transform: [
        `translate3d(${round(mix((1 - e) * 0, away * 620, openEase))}px, ${round(mix((1 - e) * 60, 40, openEase))}px, 0)`,
        `scale(${round(mix(0.9 + 0.1 * e, 0.82, openEase))})`,
      ].join(" "),
    });
  });

  style(find(root, "muse-list"), {
    "pointer-events": opening > 0.9 ? "none" : "auto",
  });

  // 3. The profile, and its chrome arriving from the edges it lives on.
  const profile = at(t, PROFILE);
  style(find(root, "muse-profile"), {
    opacity: String(round(easeOut(profile))),
    "pointer-events": profile > 0.5 ? "auto" : "none",
  });
  enter(find(root, "nav-prev"), profile, { x: -70 });
  enter(find(root, "nav-next"), profile, { x: 70 });
  enter(find(root, "verses"), at(t, { dur: 700, start: PROFILE.start + 120 }), {
    y: -34,
  });
  enter(find(root, "song"), at(t, { dur: 700, start: PROFILE.start + 220 }), {
    y: -28,
  });
  enter(find(root, "rail"), at(t, { dur: 700, start: PROFILE.start + 320 }), {
    x: 60,
  });

  // 4. The card: two slide-throughs along the roster, then two turns.
  const cardFlip = find(root, "card-flip");
  const section = find(root, "section");

  const infoOpen = easeOut(at(t, INFO));
  // Info pushes the card off centre to make room for the panel.
  const cardShift = mix(0, -30, infoOpen);

  let cardTransform = `translate3d(${round(cardShift)}px, 0, 0)`;
  let cardOpacity = 1;

  if (t >= NEXT_1.start && t < NEXT_2.start) {
    const slide = slideThrough(at(t, NEXT_1), 220);
    cardTransform = slide.transform;
    cardOpacity = Number(slide.opacity);
  } else if (t >= NEXT_2.start && t < FLIP_TO_2.start) {
    const slide = slideThrough(at(t, NEXT_2), 220);
    cardTransform = slide.transform;
    cardOpacity = Number(slide.opacity);
  } else if (t >= FLIP_TO_2.start && t < FLIP_TO_1.start) {
    cardTransform = `rotateY(${round(flipAngle(at(t, FLIP_TO_2)))}deg)`;
  } else if (t >= FLIP_TO_1.start && t < INFO.start) {
    cardTransform = `rotateY(${round(flipAngle(at(t, FLIP_TO_1)))}deg)`;
  }

  style(cardFlip, {
    opacity: String(round(cardOpacity)),
    transform: cardTransform,
  });

  // The wallpaper crosses with the card on a roster step, so the whole screen
  // changes character rather than just the portrait.
  const banner = find(root, "muse-banner");
  if (banner) {
    const step =
      t >= NEXT_1.start && t < NEXT_1.start + NEXT_1.dur
        ? at(t, NEXT_1)
        : t >= NEXT_2.start && t < NEXT_2.start + NEXT_2.dur
          ? at(t, NEXT_2)
          : null;
    style(banner, {
      opacity:
        step === null
          ? "1"
          : String(round(1 - 0.55 * Math.sin(Math.PI * step))),
      transform:
        step === null
          ? "scale(1)"
          : `scale(${round(1 + 0.04 * Math.sin(Math.PI * step))})`,
    });
  }

  // 5. The section panel: closed until Info is chosen, then a crossfade on
  //    each rail change.
  if (section) {
    const swap =
      t >= PEERS.start
        ? at(t, PEERS)
        : t >= STORY.start
          ? at(t, STORY)
          : infoOpen;
    style(section, {
      // Collapsed entirely until Info is chosen, so the card and the rail
      // centre on the stage instead of straddling an empty column.
      flex: infoOpen > 0 ? "" : "0 0 0px",
      opacity: String(round(easeOut(swap))),
      transform: `translate3d(${round(mix(28, 0, easeOut(swap)))}px, 0, 0)`,
      width: infoOpen > 0 ? "" : "0px",
    });

    const scroller = sectionScroller(root);
    if (t >= STORY_SCROLL.start && t < PEERS.start) {
      scrollThrough(scroller, at(t, STORY_SCROLL));
    } else if (t >= PEERS_SCROLL.start) {
      scrollThrough(scroller, at(t, PEERS_SCROLL));
    } else if (scroller) {
      scroller.scrollTop = 0;
    }
  }
};
