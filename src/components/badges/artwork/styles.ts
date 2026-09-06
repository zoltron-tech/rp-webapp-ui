import { css, keyframes, styled } from "styled-components";

/**
 * Motion for the animated badges.
 *
 * Every animated part is driven from this one wrapper by class name rather than
 * from the SVG itself: SMIL is dead on some of the browsers this app runs in,
 * and CSS is the only way to honour `prefers-reduced-motion` — which matters
 * more here than anywhere else in the app, because a badge sits on a profile
 * spinning forever rather than playing once and stopping.
 *
 * ONE RULE when adding a class here. An SVG element's `transform` *attribute*
 * and its CSS `transform` are the same property, and the animation wins — so
 * putting any transform animation on an element that also carries
 * `transform="translate(…)"` silently throws that placement away and draws the
 * thing at the origin. Every class below that animates a transform must be on a
 * wrapper whose only job is to move, with the static placement on a child.
 *
 * This is not hypothetical: the clouds, the distant bird, the seal's gloss and
 * the plate's light sweep were all written the flat way first, and all four
 * vanished or lost their angle.
 */

/** The ward ring turning around the crest. */
const wardSpin = keyframes`
  to { transform: rotate(360deg); }
`;

/** Sparks circling the other way, so the two rings never look locked together. */
const orbitSpin = keyframes`
  to { transform: rotate(-360deg); }
`;

/** The glow behind the plate breathing. */
const auraPulse = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(0.94); }
  50%      { opacity: 1;    transform: scale(1.06); }
`;

/** The emblem drifting, so the crest reads as floating rather than pasted on. */
const emblemFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2.2px); }
`;

/** A light sweep across the plate, clipped to the hexagon. */
const sheenSweep = keyframes`
  0%        { transform: translateX(-130px); }
  55%, 100% { transform: translateX(130px); }
`;

/** Staggered twinkle on the orbiting sparks. */
const sparkTwinkle = keyframes`
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 1; }
`;

/** The quill nib catching the light a beat after the sheen passes. */
const nibGlint = keyframes`
  0%, 70%, 100% { opacity: 0.75; }
  82%           { opacity: 1; }
`;

/**
 * A nib working along the line still being written.
 *
 * The travel is that line's own length on the 120 grid — ACTIVE_LINE spans
 * 2.3 units, which the emblem's ×1.5 makes ~3.4px — so the nib runs the line
 * rather than sliding across the page. It lifts at the end and starts over, so
 * the manuscript reads as in progress instead of as a page with a dot on it.
 */
const nibWrite = keyframes`
  0%        { transform: translateX(-3.4px); opacity: 0; }
  12%       { opacity: 1; }
  70%       { transform: translateX(0); opacity: 1; }
  82%, 100% { transform: translateX(0); opacity: 0; }
`;

/** The seal's ribbons, swinging from where they leave the wax. */
const ribbonSway = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50%      { transform: rotate(5deg); }
`;

/** The crescent of light travelling across a pressed seal. */
const sealGloss = keyframes`
  0%, 100% { opacity: 0.45; transform: translate(-5px, 2px) rotate(-4deg); }
  50%      { opacity: 1;    transform: translate(6px, -2px) rotate(4deg); }
`;

/** The wax breathing, so the seal is never completely still. */
const sealPress = keyframes`
  0%, 100% { transform: scale(1) rotate(-1.2deg); }
  50%      { transform: scale(1.035) rotate(1.2deg); }
`;

/**
 * A page turning: it collapses to the spine, and opens again onto a fresh one.
 *
 * The long hold either side is what makes it read as a page rather than as a
 * flicker — the turn itself is a fifth of the cycle, and the rest is a book
 * being written in.
 */
const pageTurn = keyframes`
  0%, 62%   { transform: scaleX(1); }
  74%       { transform: scaleX(0.04); }
  76%       { transform: scaleX(0.04); }
  88%, 100% { transform: scaleX(1); }
`;

/**
 * The bird crossing its sky.
 *
 * A wide arc: it climbs as it moves right, banks into the turn, and falls back.
 * The travel is most of the bubble's width, so the bird is visibly going
 * somewhere rather than hovering in the middle of the badge.
 */
const birdGlide = keyframes`
  0%, 100% { transform: translate(-9px, 5px) rotate(-5deg); }
  50%      { transform: translate(9px, -7px) rotate(5deg); }
`;

/**
 * Wingbeats, on their own much faster clock than the glide.
 *
 * `scaleY` about the wing's top edge: the wing shortens as it comes up and
 * extends on the downstroke, which is the whole of a bird's flap at this size.
 */
const wingFlap = keyframes`
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(0.28); }
`;

/** Cloud drift. Two speeds, so the sky has depth rather than one flat layer. */
const cloudDrift = keyframes`
  0%, 100% { transform: translateX(-12px); }
  50%      { transform: translateX(12px); }
`;

/**
 * A far-off bird crossing the whole sky and starting over.
 *
 * Its own long clock — it is scenery, and scenery that came round as often as
 * the near bird's wingbeat would pull the eye off the badge's subject.
 */
const farBirdCross = keyframes`
  0%        { transform: translate(0, 6px); opacity: 0; }
  10%       { opacity: 1; }
  78%       { opacity: 1; }
  90%, 100% { transform: translate(104px, -14px); opacity: 0; }
`;

/** The chatter dots, bouncing the way a typing indicator does. */
const chatterBounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-5px); }
`;

/** The bubble itself, breathing. */
const bubblePop = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.028); }
`;

/**
 * A pulse running down the link from one mark to the other.
 *
 * The travel is the gap between the two tiles on the 120 grid. It fades in as
 * it leaves the first and out as it arrives, so it reads as something passing
 * between them rather than as a bead sliding on a wire.
 */
const linkPulse = keyframes`
  0%        { transform: translateX(0); opacity: 0; }
  20%       { opacity: 1; }
  80%       { opacity: 1; }
  100%      { transform: translateX(14px); opacity: 0; }
`;

/** Each mark answering the pulse as it arrives. */
const tileNudge = keyframes`
  0%, 100% { transform: scale(1); }
  46%      { transform: scale(1.06); }
`;

/**
 * A friend landing in the ring: overshoot in, hold for most of the cycle, and
 * clear out so the circle can fill again.
 *
 * The four are staggered rather than simultaneous, which is what makes the
 * badge read as a list being added to instead of four marks blinking.
 */
const friendJoin = keyframes`
  0%        { transform: scale(0.25); opacity: 0; }
  9%        { transform: scale(1.16); opacity: 1; }
  15%       { transform: scale(1); opacity: 1; }
  84%       { transform: scale(1); opacity: 1; }
  94%, 100% { transform: scale(0.25); opacity: 0; }
`;

/**
 * The spoke reaching out to a friend a beat before they arrive.
 *
 * The dash array is the line's own length, so pulling the offset to zero draws
 * the line out from the centre rather than fading it up in place.
 */
const linkDraw = keyframes`
  0%        { stroke-dashoffset: 8; opacity: 0; }
  6%        { opacity: 1; }
  14%       { stroke-dashoffset: 0; opacity: 1; }
  86%       { stroke-dashoffset: 0; opacity: 1; }
  95%, 100% { stroke-dashoffset: 0; opacity: 0; }
`;

/** The wreath's two halves, breathing about the knot that ties them. */
const branchSway = keyframes`
  0%, 100% { transform: rotate(-2.4deg); }
  50%      { transform: rotate(2.4deg); }
`;

/**
 * A record turning. Slower than the real 33rpm, which at badge size reads as a
 * wobble rather than as a record playing.
 */
const discSpin = keyframes`
  to { transform: rotate(360deg); }
`;

/** The tonearm tracking in across the side, and lifting back to the edge. */
const armTrack = keyframes`
  0%        { transform: rotate(-1.6deg); }
  70%       { transform: rotate(4.2deg); }
  86%, 100% { transform: rotate(-1.6deg); }
`;

/** Sound coming off the record: each arc swells outward and thins away. */
const wavePulse = keyframes`
  0%        { transform: scale(0.86); opacity: 0; }
  25%       { opacity: 0.8; }
  100%      { transform: scale(1.3); opacity: 0; }
`;

/**
 * A cassette hub turning. Slower than the record beside it on the shelf: a
 * hub is small and toothed, and at badge size a fast one strobes.
 */
const reelSpin = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * The level meter reading the tape.
 *
 * Scaled from the foot rather than moved, because a meter bar grows out of its
 * baseline — a translated bar would leave a gap under it at the top of its
 * travel. Uneven stops so four bars on one keyframe set never march in step.
 */
const meterBounce = keyframes`
  0%, 100% { transform: scaleY(0.45); }
  30%      { transform: scaleY(1); }
  55%      { transform: scaleY(0.7); }
  75%      { transform: scaleY(0.95); }
`;

/**
 * The two cards behind the top one, fanning open and closing again.
 *
 * Their resting angle lives here rather than in a transform attribute on the
 * card: on an SVG element those are the same property, so an attribute would be
 * thrown away the moment this animation ran.
 */
const fanLeft = keyframes`
  0%, 100% { transform: rotate(-15deg); }
  50%      { transform: rotate(-22deg); }
`;

const fanRight = keyframes`
  0%, 100% { transform: rotate(15deg); }
  50%      { transform: rotate(22deg); }
`;

/**
 * The top card being dealt away, and the next one taking its place.
 *
 * It leaves to the right and the replacement appears from under the deck,
 * which is the only way to fake a reordering: SVG paints in document order, so
 * a card cannot actually go behind the ones drawn before it.
 */
const cardDeal = keyframes`
  0%, 58%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  72%       { transform: translate(16px, -13px) rotate(13deg); opacity: 1; }
  82%       { transform: translate(32px, -4px) rotate(22deg); opacity: 0; }
  83%       { transform: translate(0, 9px) rotate(0deg); opacity: 0; }
  93%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
`;

/**
 * A quill working across the page, lifting at the end of the line and coming
 * back to start the next one.
 *
 * The travel is the written line's own length on the 120 grid, so the nib runs
 * the line rather than sliding over the book, and the lift is what stops the
 * return stroke from drawing a second line backwards.
 */
const quillWrite = keyframes`
  0%        { transform: translate(0, 0) rotate(0deg); }
  64%       { transform: translate(20px, 0) rotate(0deg); }
  72%       { transform: translate(21px, -7px) rotate(-7deg); }
  84%       { transform: translate(1px, -7px) rotate(-7deg); }
  92%, 100% { transform: translate(0, 0) rotate(0deg); }
`;

/** The ink appearing under it, on the same clock and at the same pace. */
const inkDraw = keyframes`
  0%        { stroke-dashoffset: 20; }
  64%, 84%  { stroke-dashoffset: 0; }
  92%, 100% { stroke-dashoffset: 20; }
`;

/** A spark off the nib: up, out, gone. Staggered so they never leave together. */
const moteRise = keyframes`
  0%   { transform: translateY(5px) scale(0.5); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateY(-11px) scale(1); opacity: 0; }
`;

/**
 * A letter dropping into the slot.
 *
 * It comes in from above the badge, lands on the mouth of the box and is gone —
 * the fade at the bottom is the letter going *in*, not vanishing, which is why
 * it happens over the last few percent rather than gradually on the way down.
 */
const letterDrop = keyframes`
  0%        { transform: translateY(-34px) rotate(-10deg); opacity: 0; }
  16%       { opacity: 1; }
  74%       { transform: translateY(0) rotate(0deg); opacity: 1; }
  84%, 100% { transform: translateY(4px) rotate(0deg); opacity: 0; }
`;

/** The box taking the weight of each one as it lands. */
const boxNudge = keyframes`
  0%, 68%   { transform: scaleY(1); }
  78%       { transform: scaleY(0.972); }
  90%, 100% { transform: scaleY(1); }
`;

/**
 * Two pens taking turns in one pot.
 *
 * Half a cycle apart rather than together: the badge is about sharing the ink,
 * and two feathers rising and falling in step read as one pen drawn twice.
 */
const quillDip = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  46%      { transform: translateY(-7px) rotate(-4deg); }
`;

/** Ink coming off the raised pen and falling back into the pot. */
const inkDrop = keyframes`
  0%, 34%   { transform: translateY(0) scaleY(1); opacity: 0; }
  44%       { opacity: 1; }
  74%       { transform: translateY(15px) scaleY(1.25); opacity: 1; }
  80%, 100% { transform: translateY(17px) scaleY(0.4); opacity: 0; }
`;

/** The surface stirring as a nib goes back in. */
const inkStir = keyframes`
  0%, 100% { transform: scaleX(1); }
  50%      { transform: scaleX(0.94); }
`;

/**
 * Thread paying out: the dash pattern marches along the line.
 *
 * Animating the offset rather than moving anything is what makes the run look
 * endless — the path never changes, so there is no seam where a loop restarts.
 */
const threadFeed = keyframes`
  to { stroke-dashoffset: -32; }
`;

/**
 * The winding on the barrel, travelling up behind the barrel's clip.
 *
 * The travel is exactly the gap between two windings, so the loop lands on the
 * next line and the spool turns forever without a jump.
 */
const windingScroll = keyframes`
  to { transform: translateY(-6px); }
`;

/** Wet paint, each blob on its own clock. */
const blobPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.09); }
`;

/** A brush loading itself: down into the paint, and back out with it. */
const brushDip = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  40%      { transform: translate(-2px, 5px) rotate(-5deg); }
  62%      { transform: translate(-1px, 2px) rotate(-2deg); }
`;

export const Frame = styled.span<{ $size: number; $animated: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  flex-shrink: 0;
  line-height: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }

  /* Rotations are around the crest's centre, which is the middle of the
     view box rather than of each group's own bounding box — a dashed ring and
     a three-spark orbit have different boxes and would drift apart under
     fill-box. */
  .nwb-ward,
  .nwb-orbit,
  .nwb-aura,
  .nwb-disc,
  .nwb-wave-1,
  .nwb-wave-2,
  .nwb-wave-3 {
    transform-box: view-box;
    transform-origin: 60px 60px;
  }

  /* A tonearm swings about its pivot, which is a fixed post on the deck. */
  .nwb-arm {
    transform-box: view-box;
    transform-origin: 108px 18px;
  }

  /* Each cassette hub turns about its own spindle. View-box coordinates, not
     fill-box: the toothed group's box grows and shrinks with DETAIL_THRESHOLD,
     and a hub that changes its centre of rotation with the badge's size wobbles
     at small sizes. These two match REEL_L / REEL_R in musician.tsx. */
  .nwb-reel-l {
    transform-box: view-box;
    transform-origin: 45px 71px;
  }
  .nwb-reel-r {
    transform-box: view-box;
    transform-origin: 75px 71px;
  }

  /* A quill turns about its nib, which is where the written line starts —
     a fixed point on the view box, and the one place on a feather that is not
     supposed to move when the pen is lifted. Matches ACTIVE_LINE in
     prolific-writer.tsx. */
  .nwb-quill {
    transform-box: view-box;
    transform-origin: 64px 82px;
  }

  /* A fanned card pivots on the corner it rests on, at the foot of the deck. */
  .nwb-card-l,
  .nwb-card-r {
    transform-box: fill-box;
    transform-origin: bottom center;
  }

  /* A postbox is bolted down: it settles onto its plinth rather than squashing
     about its middle. */
  .nwb-box {
    transform-box: fill-box;
    transform-origin: bottom center;
  }

  /* A meter bar grows off its own foot. */
  .nwb-bar-1,
  .nwb-bar-2,
  .nwb-bar-3,
  .nwb-bar-4 {
    transform-box: fill-box;
    transform-origin: bottom center;
  }

  .nwb-card-top,
  .nwb-quill-l,
  .nwb-quill-r,
  .nwb-drop,
  .nwb-ink,
  .nwb-brush,
  .nwb-blob-1,
  .nwb-blob-2,
  .nwb-blob-3,
  .nwb-blob-4,
  .nwb-blob-5,
  .nwb-letter-1,
  .nwb-letter-2,
  .nwb-letter-3,
  .nwb-mote-1,
  .nwb-mote-2,
  .nwb-mote-3,
  .nwb-mote-4,
  .nwb-emblem,
  .nwb-nib,
  .nwb-write,
  .nwb-glide,
  .nwb-gloss,
  .nwb-seal,
  .nwb-bubble,
  .nwb-link,
  .nwb-tile-a,
  .nwb-tile-b,
  .nwb-farbird,
  .nwb-chatter-1,
  .nwb-chatter-2,
  .nwb-chatter-3,
  .nwb-cloud-1,
  .nwb-cloud-2,
  .nwb-friend-1,
  .nwb-friend-2,
  .nwb-friend-3,
  .nwb-friend-4 {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Both halves of the wreath swing about the knot they are tied at, which is
     a fixed point on the view box rather than the bottom of either half's own
     box — the right branch's box is centred well to the right of it. */
  .nwb-branch-l,
  .nwb-branch-r {
    transform-box: view-box;
    transform-origin: 60px 99px;
  }

  /* A ribbon hangs from its top edge, so that is what it swings about. */
  .nwb-ribbon-l,
  .nwb-ribbon-r {
    transform-box: fill-box;
    transform-origin: top center;
  }

  /* A page turns about its spine, which is the left edge of its own box — the
     right page's path starts at the spine, so a left origin lands on it. */
  .nwb-page {
    transform-box: fill-box;
    transform-origin: left center;
  }

  /* A wing beats from the shoulder, not from its middle. */
  .nwb-flap {
    transform-box: fill-box;
    transform-origin: top center;
  }

  ${(p) =>
    p.$animated
      ? css`
          .nwb-ward {
            animation: ${wardSpin} 18s linear infinite;
          }
          .nwb-orbit {
            animation: ${orbitSpin} 11s linear infinite;
          }
          .nwb-aura {
            animation: ${auraPulse} 3.4s ease-in-out infinite;
          }
          .nwb-emblem {
            animation: ${emblemFloat} 3.8s ease-in-out infinite;
          }
          .nwb-sheen {
            animation: ${sheenSweep} 5.2s ease-in-out infinite;
          }
          .nwb-nib {
            animation: ${nibGlint} 5.2s ease-in-out infinite;
          }
          .nwb-write {
            animation: ${nibWrite} 4.6s ease-in-out infinite;
          }
          .nwb-ribbon-l {
            animation: ${ribbonSway} 5.4s ease-in-out infinite;
          }
          .nwb-ribbon-r {
            animation: ${ribbonSway} 5.4s ease-in-out -2.7s infinite;
          }
          .nwb-gloss {
            animation: ${sealGloss} 4.8s ease-in-out infinite;
          }
          .nwb-seal {
            animation: ${sealPress} 6s ease-in-out infinite;
          }
          .nwb-page {
            animation: ${pageTurn} 5.6s ease-in-out infinite;
          }
          .nwb-glide {
            animation: ${birdGlide} 5s ease-in-out infinite;
          }
          .nwb-flap {
            animation: ${wingFlap} 0.42s ease-in-out infinite;
          }
          .nwb-bubble {
            animation: ${bubblePop} 4.4s ease-in-out infinite;
          }
          .nwb-farbird {
            animation: ${farBirdCross} 11s linear infinite;
          }
          .nwb-chatter-1 {
            animation: ${chatterBounce} 1.4s ease-in-out infinite;
          }
          .nwb-chatter-2 {
            animation: ${chatterBounce} 1.4s ease-in-out 0.18s infinite;
          }
          .nwb-chatter-3 {
            animation: ${chatterBounce} 1.4s ease-in-out 0.36s infinite;
          }
          .nwb-link {
            animation: ${linkPulse} 2.6s ease-in-out infinite;
          }
          .nwb-tile-a {
            animation: ${tileNudge} 2.6s ease-in-out infinite;
          }
          .nwb-tile-b {
            animation: ${tileNudge} 2.6s ease-in-out 1.3s infinite;
          }
          .nwb-cloud-1 {
            animation: ${cloudDrift} 9s ease-in-out infinite;
          }
          .nwb-cloud-2 {
            animation: ${cloudDrift} 13s ease-in-out -4s infinite;
          }
          .nwb-star-1 {
            animation: ${sparkTwinkle} 3.1s ease-in-out infinite;
          }
          .nwb-star-2 {
            animation: ${sparkTwinkle} 3.1s ease-in-out 0.7s infinite;
          }
          .nwb-star-3 {
            animation: ${sparkTwinkle} 3.1s ease-in-out 1.4s infinite;
          }
          .nwb-star-4 {
            animation: ${sparkTwinkle} 3.1s ease-in-out 2.1s infinite;
          }
          .nwb-spark-1 {
            animation: ${sparkTwinkle} 2.4s ease-in-out infinite;
          }
          .nwb-spark-2 {
            animation: ${sparkTwinkle} 2.4s ease-in-out 0.8s infinite;
          }
          .nwb-spark-3 {
            animation: ${sparkTwinkle} 2.4s ease-in-out 1.6s infinite;
          }
          .nwb-friend-1 {
            animation: ${friendJoin} 5.6s ease-in-out infinite;
          }
          .nwb-friend-2 {
            animation: ${friendJoin} 5.6s ease-in-out 0.34s infinite;
          }
          .nwb-friend-3 {
            animation: ${friendJoin} 5.6s ease-in-out 0.68s infinite;
          }
          .nwb-friend-4 {
            animation: ${friendJoin} 5.6s ease-in-out 1.02s infinite;
          }
          .nwb-spoke-1 {
            animation: ${linkDraw} 5.6s ease-in-out infinite;
          }
          .nwb-spoke-2 {
            animation: ${linkDraw} 5.6s ease-in-out 0.34s infinite;
          }
          .nwb-spoke-3 {
            animation: ${linkDraw} 5.6s ease-in-out 0.68s infinite;
          }
          .nwb-spoke-4 {
            animation: ${linkDraw} 5.6s ease-in-out 1.02s infinite;
          }
          .nwb-branch-r {
            animation: ${branchSway} 6.4s ease-in-out infinite;
          }
          .nwb-branch-l {
            animation: ${branchSway} 6.4s ease-in-out -3.2s infinite;
          }
          .nwb-disc {
            animation: ${discSpin} 4.2s linear infinite;
          }
          .nwb-arm {
            animation: ${armTrack} 12s ease-in-out infinite;
          }
          .nwb-wave-1 {
            animation: ${wavePulse} 2.4s ease-out infinite;
          }
          .nwb-wave-2 {
            animation: ${wavePulse} 2.4s ease-out 0.8s infinite;
          }
          .nwb-wave-3 {
            animation: ${wavePulse} 2.4s ease-out 1.6s infinite;
          }
          /* The take-up reel runs faster than the supply reel, which is what a
             cassette actually does — the tape on the full side has the bigger
             radius, so it turns more slowly for the same tape speed. */
          .nwb-reel-l {
            animation: ${reelSpin} 6s linear infinite;
          }
          .nwb-reel-r {
            animation: ${reelSpin} 4.2s linear infinite;
          }
          .nwb-bar-1 {
            animation: ${meterBounce} 1.6s ease-in-out infinite;
          }
          .nwb-bar-2 {
            animation: ${meterBounce} 1.6s ease-in-out 0.2s infinite;
          }
          .nwb-bar-3 {
            animation: ${meterBounce} 1.6s ease-in-out 0.45s infinite;
          }
          .nwb-bar-4 {
            animation: ${meterBounce} 1.6s ease-in-out 0.15s infinite;
          }
          .nwb-card-l {
            animation: ${fanLeft} 5.2s ease-in-out infinite;
          }
          .nwb-card-r {
            animation: ${fanRight} 5.2s ease-in-out infinite;
          }
          .nwb-card-top {
            animation: ${cardDeal} 5.2s ease-in-out infinite;
          }
          /* One clock for the quill and the ink it is laying down: they are
             the same event seen twice, and a beat of drift between them reads
             as a pen that has run dry. */
          .nwb-quill {
            animation: ${quillWrite} 4.4s ease-in-out infinite;
          }
          .nwb-inkline {
            animation: ${inkDraw} 4.4s ease-in-out infinite;
          }
          .nwb-mote-1 {
            animation: ${moteRise} 2.2s ease-out infinite;
          }
          .nwb-mote-2 {
            animation: ${moteRise} 2.2s ease-out 0.45s infinite;
          }
          .nwb-mote-3 {
            animation: ${moteRise} 2.2s ease-out 0.95s infinite;
          }
          .nwb-mote-4 {
            animation: ${moteRise} 2.2s ease-out 1.5s infinite;
          }
          /* One clock for the post going in and the box taking it. */
          .nwb-letter-1 {
            animation: ${letterDrop} 2.7s ease-in infinite;
          }
          .nwb-letter-2 {
            animation: ${letterDrop} 2.7s ease-in -0.9s infinite;
          }
          .nwb-letter-3 {
            animation: ${letterDrop} 2.7s ease-in -1.8s infinite;
          }
          .nwb-box {
            animation: ${boxNudge} 0.9s ease-in-out infinite;
          }
          .nwb-quill-l {
            animation: ${quillDip} 3.6s ease-in-out infinite;
          }
          .nwb-quill-r {
            animation: ${quillDip} 3.6s ease-in-out -1.8s infinite;
          }
          .nwb-drop {
            animation: ${inkDrop} 3.6s ease-in infinite;
          }
          .nwb-ink {
            animation: ${inkStir} 1.8s ease-in-out infinite;
          }
          .nwb-thread {
            animation: ${threadFeed} 1.6s linear infinite;
          }
          .nwb-winding {
            animation: ${windingScroll} 1.1s linear infinite;
          }
          .nwb-brush {
            animation: ${brushDip} 3.2s ease-in-out infinite;
          }
          .nwb-blob-1 {
            animation: ${blobPulse} 3s ease-in-out infinite;
          }
          .nwb-blob-2 {
            animation: ${blobPulse} 3s ease-in-out 0.5s infinite;
          }
          .nwb-blob-3 {
            animation: ${blobPulse} 3s ease-in-out 1s infinite;
          }
          .nwb-blob-4 {
            animation: ${blobPulse} 3s ease-in-out 1.5s infinite;
          }
          .nwb-blob-5 {
            animation: ${blobPulse} 3s ease-in-out 2s infinite;
          }
        `
      : ""}

  /* A badge animates for as long as the profile is open. Anyone who has asked
     the OS for less motion gets the crest as a still illustration. */
  @media (prefers-reduced-motion: reduce) {
    .nwb-ward,
    .nwb-orbit,
    .nwb-aura,
    .nwb-emblem,
    .nwb-sheen,
    .nwb-nib,
    .nwb-write,
    .nwb-ribbon-l,
    .nwb-ribbon-r,
    .nwb-gloss,
    .nwb-seal,
    .nwb-page,
    .nwb-glide,
    .nwb-flap,
    .nwb-bubble,
    .nwb-farbird,
    .nwb-link,
    .nwb-tile-a,
    .nwb-tile-b,
    .nwb-chatter-1,
    .nwb-chatter-2,
    .nwb-chatter-3,
    .nwb-cloud-1,
    .nwb-cloud-2,
    .nwb-star-1,
    .nwb-star-2,
    .nwb-star-3,
    .nwb-star-4,
    .nwb-spark-1,
    .nwb-spark-2,
    .nwb-spark-3,
    .nwb-friend-1,
    .nwb-friend-2,
    .nwb-friend-3,
    .nwb-friend-4,
    .nwb-spoke-1,
    .nwb-spoke-2,
    .nwb-spoke-3,
    .nwb-spoke-4,
    .nwb-branch-l,
    .nwb-branch-r,
    .nwb-card-l,
    .nwb-card-r,
    .nwb-card-top,
    .nwb-quill,
    .nwb-inkline,
    .nwb-mote-1,
    .nwb-mote-2,
    .nwb-mote-3,
    .nwb-mote-4,
    .nwb-box,
    .nwb-quill-l,
    .nwb-quill-r,
    .nwb-drop,
    .nwb-ink,
    .nwb-thread,
    .nwb-winding,
    .nwb-brush,
    .nwb-blob-1,
    .nwb-blob-2,
    .nwb-blob-3,
    .nwb-blob-4,
    .nwb-blob-5,
    .nwb-letter-1,
    .nwb-letter-2,
    .nwb-letter-3,
    .nwb-disc,
    .nwb-arm,
    .nwb-wave-1,
    .nwb-wave-2,
    .nwb-wave-3,
    .nwb-reel-l,
    .nwb-reel-r,
    .nwb-bar-1,
    .nwb-bar-2,
    .nwb-bar-3,
    .nwb-bar-4 {
      animation: none;
    }

    /* These two exist only while they are moving: a pulse frozen on the wire
       and a distant bird frozen mid-sky both read as artefacts. */
    .nwb-link,
    .nwb-farbird {
      opacity: 0;
    }
    .nwb-sheen {
      opacity: 0;
    }

    /* A spark frozen halfway out of the page is a smudge, not a spark, and a
       letter frozen in mid-air is litter. The two already wedged in the slot
       carry the badge on their own. */
    .nwb-mote-1,
    .nwb-mote-2,
    .nwb-mote-3,
    .nwb-mote-4,
    .nwb-letter-1,
    .nwb-letter-2,
    .nwb-letter-3,
    .nwb-drop {
      opacity: 0;
    }

    /* The fan is the badge. With the animation off, the two cards behind carry
       their resting angle here instead, or the deck collapses into one card. */
    .nwb-card-l {
      transform: rotate(-18deg);
    }
    .nwb-card-r {
      transform: rotate(18deg);
    }
  }
`;
