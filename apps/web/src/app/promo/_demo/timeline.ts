/**
 * The promo animation, as a pure function of time.
 *
 * Nothing here uses CSS transitions, `requestAnimationFrame` or the wall clock:
 * `applyFrame(root, t)` puts the scene into exactly the state it should be in at
 * `t` milliseconds, every time, from any previous state. That is what lets the
 * capture step the animation frame by frame and get a deterministic, judder-free
 * GIF no matter how long each screenshot takes.
 *
 * It drives the *real* components. The two view changes are genuine clicks on
 * the workspace rail and the codex tab row — the same events a novelist's
 * pointer would produce — and everything else is transform/opacity applied over
 * the DOM those components rendered. Landmarks are found through `data-nw`
 * attributes and ARIA labels, never through styled-components class names.
 */

// ── Beats ──────────────────────────────────────────────────────────────────

type Beat = { start: number; dur: number };
type Stagger = Beat & { stagger: number };

/** The whole frame rises into shot, tilted, and settles flat. */
const ENTRY: Beat = { dur: 1500, start: 0 };
/** The rail's icons light up one after another as the frame arrives. */
const RAIL: Stagger = { dur: 420, stagger: 90, start: 300 };
/** Early, so the page arrives with its section header already on it rather
 *  than as a bare rail beside an empty canvas. */
const CHAPTERS_HEAD: Beat = { dur: 480, start: 950 };
/** The chapter cards deal in from below. */
const CHAPTERS: Stagger = { dur: 560, stagger: 135, start: 1520 };

/** Codex is chosen on the rail. */
const CODEX_CLICK = 3350;
const CODEX_PANEL: Beat = { dur: 520, start: 3380 };
const CODEX_TABS: Stagger = { dur: 340, stagger: 70, start: 3520 };
/** The cast slides in from the left, chip by chip. */
const CAST: Stagger = { dur: 470, stagger: 105, start: 3980 };

/** Relationships is chosen in the codex's tab row. */
const MESH_CLICK = 6150;
const MESH_PANEL: Beat = { dur: 420, start: 6180 };
const LEGEND: Stagger = { dur: 330, stagger: 75, start: 6330 };
/** The ring draws itself, the cast lands on it, then the threads run between. */
const RING: Beat = { dur: 760, start: 6420 };
const NODES: Stagger = { dur: 420, stagger: 88, start: 6900 };
const EDGES: Stagger = { dur: 540, stagger: 108, start: 7560 };
/** An arc's label and arrowhead arrive once the arc itself has drawn. */
const EDGE_TRIM_LAG = 300;

/** Total runtime. The tail is a deliberate hold so the finished screen reads
 *  before a looping GIF snaps back to the start. */
export const DURATION = 10800;

// ── Easing ─────────────────────────────────────────────────────────────────

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Progress through a beat, 0 → 1. */
const at = (t: number, beat: Beat) => clamp01((t - beat.start) / beat.dur);

/** Progress through the `index`-th item of a staggered beat. */
const atIndex = (t: number, beat: Stagger, index: number) =>
  clamp01((t - (beat.start + index * beat.stagger)) / beat.dur);

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
/** Lands slightly past its mark and settles back — the frame's arrival. */
const easeOutBack = (p: number) => {
  const c = 1.42;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
};

const round = (value: number) => Math.round(value * 1000) / 1000;

// ── DOM helpers ────────────────────────────────────────────────────────────

const style = (
  el: Element | null | undefined,
  props: Record<string, string>,
) => {
  if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) return;
  for (const [key, value] of Object.entries(props)) {
    el.style.setProperty(key, value);
  }
};

/** Fade + lift, the scene's default entrance. */
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

/** Path length, measured once — `getTotalLength` is not free and the geometry
 *  never changes while the animation runs. */
const lengths = new WeakMap<SVGPathElement, number>();
const lengthOf = (path: SVGPathElement) => {
  let known = lengths.get(path);
  if (known === undefined) {
    known = path.getTotalLength();
    lengths.set(path, known);
  }
  return known;
};

/** Draws a stroke on, then hands the dash pattern back to the element's own
 *  attribute so a tone's dashes survive the reveal. */
const draw = (path: SVGPathElement | null, p: number) => {
  if (!path) return;
  if (p >= 1) {
    path.style.removeProperty("stroke-dasharray");
    path.style.removeProperty("stroke-dashoffset");
    path.style.opacity = "1";
    return;
  }
  const length = lengthOf(path);
  path.style.opacity = p === 0 ? "0" : "1";
  path.style.strokeDasharray = `${round(length)}`;
  path.style.strokeDashoffset = `${round(length * (1 - easeInOut(p)))}`;
};

/**
 * Clicks a control only when it is not already in the state we want.
 *
 * Real clicks, because the view and tab state belong to the components — the
 * scene asks for a view the way a reader does rather than reaching into it.
 */
const ensureSelected = (
  button: Element | null | undefined,
  wanted: boolean,
) => {
  if (!(button instanceof HTMLElement)) return;
  const selected =
    button.getAttribute("aria-current") === "page" ||
    button.getAttribute("aria-selected") === "true";
  if (selected === wanted) return;
  if (wanted) button.click();
};

// ── The frame ──────────────────────────────────────────────────────────────

export const applyFrame = (root: HTMLElement, t: number) => {
  // 1. View changes first, so everything below styles the DOM they produced.
  //    React commits a discrete click synchronously, so the new subtree is
  //    already in the document by the time these return.
  const rail = root.querySelectorAll<HTMLElement>(
    'nav[aria-label="Storyboard views"] > button',
  );
  if (rail.length > 2) {
    ensureSelected(rail[t >= CODEX_CLICK ? 2 : 0], true);
  }

  const codexTabs = root.querySelectorAll<HTMLElement>(
    '[aria-label="Codex categories"] > button[role="tab"]',
  );
  if (codexTabs.length > 1) {
    ensureSelected(codexTabs[t >= MESH_CLICK ? 1 : 0], true);
  }

  // 2. The frame's arrival.
  const stage = root.querySelector<HTMLElement>('[data-promo="stage"]');
  if (stage) {
    const p = at(t, ENTRY);
    const e = easeOut(p);
    const back = easeOutBack(p);
    style(stage, {
      opacity: String(round(clamp01(t / 380))),
      transform: [
        "perspective(1900px)",
        `translate3d(0, ${round((1 - e) * 460)}px, ${round((1 - e) * -320)}px)`,
        `rotateX(${round((1 - e) * 26)}deg)`,
        `rotateZ(${round((1 - e) * -6.5)}deg)`,
        `scale(${round(0.84 + 0.16 * back)})`,
      ].join(" "),
    });
  }

  rail.forEach((button, index) => {
    enter(button, atIndex(t, RAIL, index), { x: -18 });
  });

  // 3. Chapters.
  enter(
    root.querySelector('[data-promo="chapters-head"]'),
    at(t, CHAPTERS_HEAD),
  );
  root
    .querySelectorAll('[data-promo="chapters"] > *')
    .forEach((card, index) => {
      enter(card, atIndex(t, CHAPTERS, index), { scale: 0.9, y: 74 });
    });

  // 4. The codex — mounted only once the rail has been clicked.
  const codex = root.querySelector<HTMLElement>('[data-nw="codex"]');
  if (codex) {
    enter(codex, at(t, CODEX_PANEL), { y: 26 });

    codex
      .querySelectorAll('[aria-label="Codex categories"] > button')
      .forEach((tab, index) => {
        enter(tab, atIndex(t, CODEX_TABS, index), { scale: 0.86 });
      });

    // Pool headings and their footnotes ride in with the chips they label.
    // Scoped to direct children so the relationships panel nested below is
    // left to its own beat.
    codex.querySelectorAll(":scope > h3, :scope > p").forEach((label) => {
      enter(label, at(t, { dur: 420, start: CAST.start }), { x: -14 });
    });

    codex
      .querySelectorAll('[data-nw="codex-cast-row"] > *')
      .forEach((chip, index) => {
        enter(chip, atIndex(t, CAST, index), { scale: 0.88, x: -34 });
      });
  }

  // 5. The relationship mesh.
  const mesh = root.querySelector<HTMLElement>('[data-nw="relationships"]');
  if (!mesh) return;

  enter(mesh, at(t, MESH_PANEL), { y: 20 });

  mesh
    .querySelectorAll('[data-nw="mesh-legend"] > *')
    .forEach((item, index) => {
      enter(item, atIndex(t, LEGEND, index), { y: 8 });
    });

  const ring = mesh.querySelector<SVGCircleElement>("circle.ring");
  if (ring) {
    const cx = Number(ring.getAttribute("cx") ?? 0);
    const cy = Number(ring.getAttribute("cy") ?? 0);
    const circumference = 2 * Math.PI * Number(ring.getAttribute("r") ?? 0);
    const p = at(t, RING);
    style(ring, {
      "stroke-dasharray": `${round(circumference)}`,
      "stroke-dashoffset": `${round(circumference * (1 - easeInOut(p)))}`,
      // Starts the sweep at twelve o'clock rather than three.
      transform: "rotate(-90deg)",
      "transform-box": "view-box",
      "transform-origin": `${cx}px ${cy}px`,
    });
  }

  // Characters land on the ring, pulled outward from its centre.
  const nodes = mesh.querySelectorAll<SVGGElement>('[data-nw="mesh-node"]');
  nodes.forEach((node, index) => {
    const disc = node.querySelector("circle.node-bg");
    if (!disc) return;
    const cx = Number(disc.getAttribute("cx") ?? 0);
    const cy = Number(disc.getAttribute("cy") ?? 0);
    const centreX = Number(ring?.getAttribute("cx") ?? cx);
    const centreY = Number(ring?.getAttribute("cy") ?? cy);
    const p = atIndex(t, NODES, index);
    const e = easeOut(p);
    style(node, {
      opacity: String(round(p === 0 ? 0 : e)),
      transform: [
        `translate(${round((centreX - cx) * (1 - e) * 0.6)}px, ${round((centreY - cy) * (1 - e) * 0.6)}px)`,
        `scale(${round(0.35 + 0.65 * e)})`,
      ].join(" "),
      "transform-box": "view-box",
      "transform-origin": `${cx}px ${cy}px`,
    });
  });

  // Then every relationship draws itself between them.
  mesh
    .querySelectorAll<SVGGElement>('[data-nw="mesh-edge"]')
    .forEach((edge, index) => {
      const p = atIndex(t, EDGES, index);
      style(edge, { opacity: p === 0 ? "0" : "1" });
      draw(edge.querySelector<SVGPathElement>("path.edge-halo"), p);
      draw(edge.querySelector<SVGPathElement>("path.edge"), p);

      // The arrowhead and the label are the arc's punctuation — they belong
      // after the stroke has arrived, not alongside it.
      const trim = clamp01(
        (t - (EDGES.start + index * EDGES.stagger + EDGE_TRIM_LAG)) / 320,
      );
      style(edge.querySelector("text.edge-label"), {
        opacity: String(round(easeOut(trim))),
      });
      // The directed marker: the only bare <path> in the group.
      edge
        .querySelectorAll<SVGPathElement>("path:not([class])")
        .forEach((tip) => {
          style(tip, { opacity: String(round(easeOut(trim))) });
        });
    });
};
