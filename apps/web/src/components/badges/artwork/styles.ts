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

/** The route's dashes marching from the first pin towards the last. */
const routeMarch = keyframes`
  to { stroke-dashoffset: -12; }
`;

/**
 * A pin dropping onto the chart, on a clock shared by all three.
 *
 * Each pin lands at its own point in the cycle and they all lift off together
 * at the end, so the route reads as planned stop by stop and then started over
 * — staggering one keyframe with `animation-delay` would stagger the exit too.
 */
const pinDrop = (start: number) => keyframes`
  0%, ${start}%   { transform: translateY(-8px); opacity: 0; }
  ${start + 6}%   { transform: translateY(0.6px); opacity: 1; }
  ${start + 9}%   { transform: translateY(0); opacity: 1; }
  84%             { transform: translateY(0); opacity: 1; }
  92%, 100%       { transform: translateY(-3px); opacity: 0; }
`;
const pinDrop1 = pinDrop(4);
const pinDrop2 = pinDrop(20);
const pinDrop3 = pinDrop(36);

/** A compass needle settling: overshoot, swing back, come to rest. */
const needleSettle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  14%      { transform: rotate(-22deg); }
  30%      { transform: rotate(14deg); }
  44%      { transform: rotate(-7deg); }
  56%      { transform: rotate(3deg); }
  66%      { transform: rotate(0deg); }
`;

/** Swells on open water, drifting a little each way. */
const tideDrift = keyframes`
  0%, 100% { transform: translateX(-1.5px); opacity: 0.55; }
  50%      { transform: translateX(1.5px);  opacity: 1; }
`;

/**
 * The last volume being shelved.
 *
 * Relative to its resting lean, which its parent group holds: it comes down
 * upright (+6deg back) onto the shelf, tips over past its rest, settles against
 * its neighbour, and later lifts away to be shelved again. Down rather than in
 * from the side, because from the side it hangs in the air past the plank's end.
 */
const bookArrive = keyframes`
  0%, 8%    { transform: translateY(-18px) rotate(6deg); opacity: 0; }
  20%       { transform: translateY(0) rotate(6deg); opacity: 1; }
  23%       { transform: translateY(-1px) rotate(6deg); opacity: 1; }
  26%       { transform: translateY(0) rotate(6deg); opacity: 1; }
  34%       { transform: translateY(0) rotate(-1.5deg); opacity: 1; }
  39%       { transform: translateY(0) rotate(0.6deg); opacity: 1; }
  43%, 86%  { transform: translateY(0) rotate(0deg); opacity: 1; }
  94%, 100% { transform: translateY(-18px) rotate(6deg); opacity: 0; }
`;

/** The ribbon marker swinging gently from the shelf edge. */
const markerSway = keyframes`
  0%, 100% { transform: rotate(-7deg); }
  50%      { transform: rotate(7deg); }
`;

/**
 * The hourglass's run, on one 8s clock across the four parts below.
 *
 * The sand runs for four fifths of the cycle; then the glass makes a half turn.
 * The glass, frame and glints are symmetric about the crest's centre, so the
 * flipped glass with a full bottom bulb is the same picture as the upright one
 * with a full top — which is the loop's first frame, and why it never jumps.
 *
 * Sand offsets are from the half-run position the crest is drawn in.
 */
const hourglassFlip = keyframes`
  0%, 82%   { transform: rotate(0deg); }
  96%, 100% { transform: rotate(180deg); }
`;

const sandDrain = keyframes`
  0%        { transform: translateY(-15px); }
  80%, 100% { transform: translateY(16px); }
`;

const sandPile = keyframes`
  0%        { transform: translateY(23px); }
  80%, 100% { transform: translateY(-16px); }
`;

const sandStream = keyframes`
  0%        { opacity: 0; }
  4%, 78%   { opacity: 1; }
  80%, 100% { opacity: 0; }
`;

/** Grains falling down the stream. */
const grainsFall = keyframes`
  to { stroke-dashoffset: -9; }
`;

/** The rune circle inside the dial, turning against it. */
const sigilTurn = keyframes`
  to { transform: rotate(-360deg); }
`;

/** The timeline dial turning, slowly enough to read as time passing. */
const dialTurn = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * Cupid's arrow, on one 5s clock with the hearts and the burst below.
 *
 * It flies in along its own length (its parent lays it on the diagonal, so
 * translateX is straight down the shaft), overshoots a hair, sticks and
 * quivers, holds, then fades where it is and flies in again.
 */
const arrowFly = keyframes`
  0%        { transform: translate(-40px, 0); opacity: 0; }
  8%        { opacity: 1; }
  18%       { transform: translate(1.5px, 0); opacity: 1; }
  20%       { transform: translate(0, 0); }
  23%       { transform: translate(0, -0.9px); }
  26%       { transform: translate(0, 0.7px); }
  29%       { transform: translate(0, -0.35px); }
  32%, 84%  { transform: translate(0, 0); opacity: 1; }
  94%, 100% { transform: translate(0, 0); opacity: 0; }
`;

/** Both hearts thump on the hit, the back one a beat behind the front. */
const heartThump = (start: number) => keyframes`
  0%, ${start}%   { transform: scale(1); }
  ${start + 4}%   { transform: scale(1.14); }
  ${start + 10}%  { transform: scale(0.96); }
  ${start + 16}%  { transform: scale(1.05); }
  ${start + 24}%, 100% { transform: scale(1); }
`;
const heartThumpFront = heartThump(18);
const heartThumpBack = heartThump(21);

/** Sparks thrown outward off the hit, and gone. */
const sparkBurst = keyframes`
  0%, 19%   { transform: scale(0.5); opacity: 0; }
  23%       { transform: scale(0.9); opacity: 1; }
  42%, 100% { transform: scale(1.35); opacity: 0; }
`;

/**
 * The mirror's three forms, on one 9s clock: each holds for most of a third,
 * then crossfades into the next — the third back into the first.
 */
const formOne = keyframes`
  0%, 30%  { opacity: 1; }
  36%, 94% { opacity: 0; }
  100%     { opacity: 1; }
`;

const formTwo = keyframes`
  0%, 30%   { opacity: 0; }
  36%, 63%  { opacity: 1; }
  69%, 100% { opacity: 0; }
`;

const formThree = keyframes`
  0%, 63%  { opacity: 0; }
  69%, 94% { opacity: 1; }
  100%     { opacity: 0; }
`;

/**
 * A shimmer across the glass, on a 3s clock so it crosses at each of the
 * three changes of form. It rests off the glass to the left.
 */
const mirrorShimmer = keyframes`
  0%, 86% { transform: translateX(0); }
  100%    { transform: translateX(120px); }
`;

/** The opal behind the reflection, turning slowly. */
const opalTurn = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * The presentation case, on one 7s clock: shut, the lid swings up, the quill
 * rises out, holds, settles back, and the lid comes down over it.
 *
 * The crest is drawn open, so these run *to* the closed pose and back. The lid
 * is flipped open by its parent at scaleY(-1.25); closed is scaleY(+1), which
 * from there is -0.8, and swinging between the two passes through edge-on.
 */
const lidSwing = keyframes`
  0%, 12%   { transform: scaleY(-0.8); }
  28%, 84%  { transform: scaleY(1); }
  98%, 100% { transform: scaleY(-0.8); }
`;

/**
 * The quill lying on the velvet, expressed from its raised pose: undo the
 * raise, move down to the velvet, lay it nearly flat and small. Both ends of
 * the animation carry the same five functions, so each one interpolates on
 * its own and the quill travels in an arc rather than morphing.
 */
const QUILL_AT_REST =
  "scale(1.389) rotate(-22deg) translate(0px, 30px) rotate(84deg) scale(0.5)";
const QUILL_RAISED_POSE =
  "scale(1) rotate(0deg) translate(0px, 0px) rotate(0deg) scale(1)";
const quillRise = keyframes`
  0%, 24%   { transform: ${QUILL_AT_REST}; }
  42%, 78%  { transform: ${QUILL_RAISED_POSE}; }
  92%, 100% { transform: ${QUILL_AT_REST}; }
`;

/** Light out of the case, there only while it is open. */
const caseGlow = keyframes`
  0%, 12%   { opacity: 0.15; }
  32%, 84%  { opacity: 1; }
  98%, 100% { opacity: 0.15; }
`;

/**
 * The herald's fanfare, on one 4.8s clock: the trumpet kicks, rings of sound
 * spread off the bell, and the five stars fly out of it one after another,
 * hold where they land, and fade before the next blast.
 */
const trumpetKick = keyframes`
  0%, 16%, 100% { transform: rotate(0deg); }
  4%            { transform: rotate(-2.2deg); }
  10%           { transform: rotate(0.6deg); }
`;

const soundRing = keyframes`
  0%        { transform: scale(0.6); opacity: 0; }
  6%        { opacity: 1; }
  40%, 100% { transform: scale(1.3); opacity: 0; }
`;

/** Out along its bearing from the bell's mouth to where it rests. */
const heraldStar = keyframes`
  0%        { transform: translateX(-17px) scale(0.3); opacity: 0; }
  8%        { opacity: 1; }
  28%       { transform: translateX(0) scale(1); }
  76%       { transform: translateX(0) scale(1); opacity: 1; }
  90%, 100% { transform: translateX(1px) scale(0.9); opacity: 0; }
`;

/**
 * Each invitation, on the same clock and delay as the herald carrying it: it
 * flies out sealed, and where it lands it gives way to a star that pops in
 * past its size and settles.
 */
const inviteFade = keyframes`
  0%, 24%   { opacity: 1; }
  32%, 100% { opacity: 0; }
`;

const joinedPop = keyframes`
  0%, 24%   { transform: scale(0.3); opacity: 0; }
  32%       { transform: scale(1.4); opacity: 1; }
  38%, 100% { transform: scale(1); opacity: 1; }
`;

/** Confetti thrown off the bell on the blast, tumbling as it goes. */
const confettiPop = keyframes`
  0%        { transform: translateX(0) rotate(0deg); opacity: 0; }
  4%        { opacity: 1; }
  32%       { transform: translateX(20px) rotate(300deg); opacity: 1; }
  44%, 100% { transform: translateX(25px) rotate(420deg); opacity: 0; }
`;

/** A glint down the brass after the blast; rests off the tube's left end. */
const tubeGlint = keyframes`
  0%, 30%   { transform: translateX(0); }
  56%, 100% { transform: translateX(86px); }
`;

/** The tassel swinging on its cord. */
const tasselSwing = keyframes`
  0%, 100% { transform: rotate(-6deg); }
  50%      { transform: rotate(6deg); }
`;

/** The sunburst behind the fanfare. */
const raysTurn = keyframes`
  to { transform: rotate(360deg); }
`;

/** The banner rippling from the trumpet. */
const bannerRipple = keyframes`
  0%, 100% { transform: skewY(0deg) scaleX(1); }
  50%      { transform: skewY(2deg) scaleX(0.97); }
`;

/**
 * A campfire's flames, each layer on its own clock so the fire never repeats
 * the same shape. Scaled from the base, so they leap up rather than swell.
 */
const blazeFlicker = keyframes`
  0%, 100% { transform: scale(1, 1) skewX(0deg); }
  30%      { transform: scale(0.93, 1.1) skewX(-3deg); }
  60%      { transform: scale(1.05, 0.92) skewX(2deg); }
  80%      { transform: scale(0.97, 1.05) skewX(-1deg); }
`;

/** Firelight on the ground and trees, pulsing with the flames. */
const firelightPulse = keyframes`
  0%, 100% { opacity: 0.75; }
  35%      { opacity: 1; }
  70%      { opacity: 0.85; }
`;

/** An ember lifting off the fire and burning out. */
const emberRise = keyframes`
  0%   { transform: translate(0, 0); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(3px, -28px); opacity: 0; }
`;

/**
 * A voice joining: the bubble rises from the fire's height into its place,
 * holds, and drifts off. Five of them, a beat apart, on one 6s clock.
 */
const replyRise = keyframes`
  0%        { transform: translateY(26px) scale(0.2); opacity: 0; }
  10%       { opacity: 1; }
  34%       { transform: translateY(0) scale(1); opacity: 1; }
  80%       { transform: translateY(-3px) scale(1); opacity: 1; }
  92%, 100% { transform: translateY(-6px) scale(0.95); opacity: 0; }
`;

/**
 * The grimoire, on one 7s clock: locked, the shackle springs, the padlock
 * drops and the chain slides off both ways, the emblem flares and the lore
 * rises out — then the chain slides back and the lock returns.
 */
const shackleSpring = keyframes`
  0%, 14%   { transform: translateY(0); }
  18%, 86%  { transform: translateY(-3.5px); }
  92%, 100% { transform: translateY(0); }
`;

const padlockDrop = keyframes`
  0%, 20%   { transform: translateY(0); opacity: 1; }
  30%, 80%  { transform: translateY(14px); opacity: 0; }
  88%, 100% { transform: translateY(0); opacity: 1; }
`;

const chainLeft = keyframes`
  0%, 20%   { transform: translateX(0); opacity: 1; }
  30%, 80%  { transform: translateX(-12px); opacity: 0; }
  88%, 100% { transform: translateX(0); opacity: 1; }
`;

const chainRight = keyframes`
  0%, 20%   { transform: translateX(0); opacity: 1; }
  30%, 80%  { transform: translateX(12px); opacity: 0; }
  88%, 100% { transform: translateX(0); opacity: 1; }
`;

const loreFlare = keyframes`
  0%, 24%   { transform: scale(0.9); opacity: 0.4; }
  34%       { transform: scale(1.25); opacity: 1; }
  44%, 76%  { transform: scale(1); opacity: 0.85; }
  90%, 100% { transform: scale(0.9); opacity: 0.4; }
`;

/** A rune lifting out of the open book and fading. */
const glyphRise = keyframes`
  0%, 30%   { transform: translateY(0) scale(0.6); opacity: 0; }
  36%       { opacity: 1; }
  64%, 100% { transform: translateY(-15px) scale(1); opacity: 0; }
`;

/** Loose pages slipping out of the top, one to each side. */
const leafRight = keyframes`
  0%, 32%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  38%       { opacity: 1; }
  68%, 100% { transform: translate(13px, -16px) rotate(38deg); opacity: 0; }
`;

const leafLeft = keyframes`
  0%, 36%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  42%       { opacity: 1; }
  72%, 100% { transform: translate(-13px, -15px) rotate(-34deg); opacity: 0; }
`;

/**
 * The show, on one 7s clock: the five spotlights come up one after another,
 * each player bowing into theirs as it lands; the whole company holds in the
 * light, then the lights dim and the next performance begins.
 */
const SPOT_STARTS = [0.06, 0.14, 0.22, 0.3, 0.38];
const spotUp = (start: number) => keyframes`
  0%, ${start * 100}%  { opacity: 0; }
  ${start * 100 + 4}%  { opacity: 1; }
  86%                  { opacity: 1; }
  94%, 100%            { opacity: 0; }
`;
const spotsUp = SPOT_STARTS.map(spotUp);

const playerBow = (start: number) => keyframes`
  0%, ${start * 100 + 2}% { transform: translateY(0); }
  ${start * 100 + 5}%     { transform: translateY(-2px); }
  ${start * 100 + 9}%     { transform: translateY(0.4px); }
  ${start * 100 + 12}%, 100% { transform: translateY(0); }
`;
const playersBow = SPOT_STARTS.map(playerBow);

/** The curtains stirring on their rail. */
const curtainSway = keyframes`
  0%, 100% { transform: rotate(-1.2deg); }
  50%      { transform: rotate(1.2deg); }
`;

/** Footlights, never quite steady. */
const footlightFlicker = keyframes`
  0%, 100% { opacity: 1; }
  40%      { opacity: 0.7; }
  60%      { opacity: 0.95; }
  80%      { opacity: 0.8; }
`;

/** The masks rocking above the arch, out of step with each other. */
const maskRock = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50%      { transform: rotate(5deg); }
`;

/**
 * The typewriter, on one 4.2s clock. For seven tenths of it the carriage steps
 * left a keystroke at a time while the bottom line types itself out — both in
 * twelve hard steps, the way a carriage actually moves — and four keys and the
 * space bar keep up a rhythm. Then the bell, the carriage thrown back, and the
 * finished line fading as the next one starts.
 */
const carriageStep = keyframes`
  0%        { transform: translateX(10px); animation-timing-function: steps(12, end); }
  70%, 74%  { transform: translateX(-10px); animation-timing-function: ease-in-out; }
  82%, 100% { transform: translateX(10px); }
`;

const lineTyping = keyframes`
  0%   { transform: translateX(-37px); opacity: 1; animation-timing-function: steps(12, end); }
  70%  { transform: translateX(0); opacity: 1; }
  84%  { transform: translateX(-37px); opacity: 0; }
  100% { transform: translateX(-37px); opacity: 1; }
`;

/** A key going down and back, at each of the given points in the lap. */
const keyStrikes = (at: number[]) => keyframes`
  0%, 100% { transform: translateY(0); }
  ${at
    .map(
      (t) => `
  ${t * 100}% { transform: translateY(0); }
  ${t * 100 + 1.5}% { transform: translateY(0.9px); }
  ${t * 100 + 4}% { transform: translateY(0); }`,
    )
    .join("")}
`;
const KEY_STRIKES = [
  keyStrikes([0.02, 0.24, 0.46]),
  keyStrikes([0.08, 0.3, 0.52]),
  keyStrikes([0.13, 0.36, 0.58]),
  keyStrikes([0.18, 0.41, 0.63]),
  keyStrikes([0.27, 0.5]),
];

/** The bell at the end of the line. */
const bellDing = keyframes`
  0%, 69%   { opacity: 0; transform: scale(0.6); }
  72%       { opacity: 1; transform: scale(1.15); }
  80%, 100% { opacity: 0; transform: scale(1); }
`;

/**
 * The passport, on one 6s clock: closed, it opens — the cover narrows to the
 * spine, the ID page widens out the other way, and the booklet slides to
 * centre the open spread — then the rubber stamp thumps down and prints the
 * newest stamp with a jolt and a splash of ink, lifts away, and the passport
 * closes again. The closed pose is the stylesheet's resting state (see the
 * base rules on the frame), so each keyframe set starts and ends on it.
 */
const bookletSlide = keyframes`
  0%, 14%   { transform: translateX(-21px); }
  27%, 70%  { transform: translateX(0); }
  84%, 100% { transform: translateX(-21px); }
`;

/*
 * The swing is one motion split across two parts at the spine, so the two
 * halves hand over at full speed: the part folding towards the spine
 * accelerates into it (ease-in), the part unfolding from it decelerates away
 * (ease-out). Easing both ends of each half stopped the swing dead at the
 * spine for a beat — a visible hitch, opening and closing.
 */
const coverSwing = keyframes`
  0%, 14%   { transform: scaleX(1); animation-timing-function: ease-in; }
  20%       { transform: scaleX(0); }
  77%       { transform: scaleX(0); animation-timing-function: ease-out; }
  84%, 100% { transform: scaleX(1); }
`;

const idPageOpen = keyframes`
  0%        { transform: scaleX(0); }
  20%       { transform: scaleX(0); animation-timing-function: ease-out; }
  27%       { transform: scaleX(1); }
  70%       { transform: scaleX(1); animation-timing-function: ease-in; }
  77%, 100% { transform: scaleX(0); }
`;

const rubberThump = keyframes`
  0%        { transform: translate(0, 0); }
  8%        { transform: translate(0, -2px); }
  16%       { transform: translate(0, 0); }
  30%       { transform: translate(0, 0); animation-timing-function: ease-in; }
  36%       { transform: translate(5px, 32px); }
  39%       { transform: translate(5px, 31px); }
  42%       { transform: translate(5px, 32px); animation-timing-function: ease-out; }
  52%, 100% { transform: translate(0, 0); }
`;

const passportJolt = keyframes`
  0%, 35%   { transform: scale(1); }
  37%       { transform: scale(0.985); }
  40%       { transform: scale(1.005); }
  43%, 100% { transform: scale(1); }
`;

const stampPrinted = keyframes`
  0%, 36%   { opacity: 0; transform: scale(1.25); }
  38%       { opacity: 1; transform: scale(0.95); }
  41%       { opacity: 1; transform: scale(1); }
  90%       { opacity: 1; transform: scale(1); }
  95%, 100% { opacity: 0; transform: scale(1); }
`;

const inkSplash = keyframes`
  0%, 36%   { opacity: 0; transform: scale(0.5); }
  38%       { opacity: 1; transform: scale(0.9); }
  52%, 100% { opacity: 0; transform: scale(1.5); }
`;

/**
 * The passport's legendary trimmings: the cover's five stars twinkle left to
 * right on a 3s clock; the ribbon sways (the seal's sway, reused); the sparkles pulse in turn; the paper
 * plane flies off up and away as the passport opens and glides back in down
 * its route as it closes, the route fading while it is gone.
 */
const starTwinkle = keyframes`
  0%, 30%, 100% { transform: scale(1); }
  10%           { transform: scale(1.6); }
  20%           { transform: scale(0.9); }
`;

const sparklePulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(0.4); }
`;

const planeFlight = keyframes`
  0%, 12%   { opacity: 1; transform: translate(0, 0) rotate(0deg); animation-timing-function: ease-in; }
  24%       { opacity: 0; transform: translate(26px, -30px) rotate(-12deg); }
  82%       { opacity: 0; transform: translate(-14px, 40px) rotate(-20deg); animation-timing-function: ease-out; }
  96%, 100% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
`;

const routeFade = keyframes`
  0%, 14%, 94%, 100% { opacity: 1; }
  24%, 82%           { opacity: 0; }
`;

/** The bookworm swaying from its hole. */
const wormSway = keyframes`
  0%, 100% { transform: rotate(-4deg); }
  50%      { transform: rotate(4deg); }
`;

/** A blink, then a long while with eyes open; the lids rest folded away. */
const wormBlink = keyframes`
  0%, 88%, 100% { transform: scaleY(0); }
  91%           { transform: scaleY(1); }
  94%           { transform: scaleY(0); }
`;

/** Eyes glancing one way, back, the other way, back. */
const wormGlance = keyframes`
  0%, 20%, 50%, 70%, 100% { transform: translateX(0); }
  28%, 42%                { transform: translateX(0.7px); }
  78%, 92%                { transform: translateX(-0.9px); }
`;

/** Crumbs puffing out of the hole with each nibble, and settling back. */
const crumbPuff = keyframes`
  0%, 60%, 100% { transform: scale(1); opacity: 1; }
  68%           { transform: scale(1.35); opacity: 0.4; }
  76%           { transform: scale(0.85); opacity: 1; }
`;

/** The tail wiggling out of the bottom book. */
const tailWiggle = keyframes`
  0%, 100% { transform: rotate(-10deg); }
  50%      { transform: rotate(10deg); }
`;

/**
 * The box set, on one 6s clock: the five volumes drop into their slots one
 * after another, each with a small bounce; with the fifth home a glint runs
 * across the case and the seal pulses; the set holds, then lifts out together
 * to be filled again.
 */
const VOLUME_STARTS = [0.04, 0.13, 0.22, 0.31, 0.4];
const volumeDrop = (start: number) => keyframes`
  0%, ${start * 100}% { transform: translateY(-18px); opacity: 0; }
  ${start * 100 + 5}% { transform: translateY(1px); opacity: 1; }
  ${start * 100 + 7}% { transform: translateY(0); opacity: 1; }
  82%                 { transform: translateY(0); opacity: 1; }
  92%, 100%           { transform: translateY(-18px); opacity: 0; }
`;
const volumesDrop = VOLUME_STARTS.map(volumeDrop);

const setGlint = keyframes`
  0%, 48%   { transform: translateX(0); }
  62%, 100% { transform: translateX(130px); }
`;

const sealShine = keyframes`
  0%, 60%, 100% { transform: scale(1); }
  64%           { transform: scale(1.25); }
  70%           { transform: scale(0.96); }
  75%           { transform: scale(1); }
`;

/** Ribbon markers swaying under the set. */
const ribbonSwing = keyframes`
  0%, 100% { transform: rotate(-6deg); }
  50%      { transform: rotate(6deg); }
`;

/**
 * The book club, on one 6s clock: the big bubble steps aside and the readers
 * talk it over — a small bubble over each in turn (first, third, second,
 * fourth), each popping up from its tail, overlapping the next a little so the
 * talk flows — then the big bubble comes back; the third reader peeks over
 * her book. The heart beats on a clock of its own.
 */
const clubBubble = keyframes`
  0%, 10%, 90%, 100% { opacity: 1; }
  14%, 84%           { opacity: 0; }
`;

/** Which reader speaks when: say-1 is the first reader, and so on. */
const SAY_STARTS = [0.16, 0.44, 0.3, 0.58];
const sayLine = (start: number) => keyframes`
  0%, ${start * 100}%   { opacity: 0; transform: scale(0.4); }
  ${start * 100 + 3}%   { opacity: 1; transform: scale(1.08); }
  ${start * 100 + 5}%   { opacity: 1; transform: scale(1); }
  ${start * 100 + 18}%  { opacity: 1; transform: scale(1); }
  ${start * 100 + 22}%, 100% { opacity: 0; transform: scale(1); }
`;
const sayLines = SAY_STARTS.map(sayLine);

const heartbeat = keyframes`
  0%, 40%, 100% { transform: scale(1); }
  10%           { transform: scale(1.22); }
  20%           { transform: scale(1); }
  30%           { transform: scale(1.12); }
`;

const readerPeek = keyframes`
  0%, 70%, 90%, 100% { transform: translateY(0); }
  76%, 84%           { transform: translateY(-2.4px); }
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
  .nwb-flip,
  .nwb-dial,
  .nwb-sigil,
  .nwb-rays,
  .nwb-disc,
  .nwb-wave-1,
  .nwb-wave-2,
  .nwb-wave-3 {
    transform-box: view-box;
    transform-origin: 60px 60px;
  }

  /* The last book tips about its own foot, on the shelf. */
  .nwb-arrival {
    transform-box: view-box;
    transform-origin: 88.5px 88px;
  }

  /* The trumpet kicks about its mouthpiece; sound spreads from the bell's
     mouth. Both in the trumpet's own drawn coordinates. */
  .nwb-trumpet {
    transform-box: view-box;
    transform-origin: 0 0;
  }
  .nwb-blast-1,
  .nwb-blast-2,
  .nwb-blast-3 {
    transform-box: view-box;
    transform-origin: 84px 0;
  }

  /* Each star scales about itself; the banner ripples from its top. */
  .nwb-herald-1,
  .nwb-herald-2,
  .nwb-herald-3,
  .nwb-herald-4,
  .nwb-herald-5 {
    transform-box: fill-box;
    transform-origin: center;
  }
  .nwb-banner,
  .nwb-tassel {
    transform-box: fill-box;
    transform-origin: top center;
  }

  /* The passport jolts, its cover swings and its ID page opens about the
     spine, in the booklet's own tilted coordinates; the new stamp and its
     splash grow from their own centres. */
  .nwb-passport,
  .nwb-cover,
  .nwb-left-page {
    transform-box: view-box;
    transform-origin: 60px 76px;
  }

  /* The passport rests closed: ID page folded away behind the cover, the
     booklet shifted to centre the closed half. The keyframes start and end
     here. Set in the stylesheet rather than as attributes, which a phone's
     animated wrapper would multiply into instead of replacing. */
  .nwb-left-page {
    transform: scaleX(0);
  }
  .nwb-booklet {
    transform: translateX(-21px);
  }
  .nwb-new-stamp,
  .nwb-splash,
  .nwb-star-1,
  .nwb-star-2,
  .nwb-star-3,
  .nwb-star-4,
  .nwb-star-5,
  .nwb-sparkle-1,
  .nwb-sparkle-2,
  .nwb-sparkle-3,
  .nwb-plane {
    transform-box: fill-box;
    transform-origin: center;
  }
  .nwb-ribbon {
    transform-box: fill-box;
    transform-origin: top center;
  }

  /* Each reader's bubble pops up from its tail; the heart beats about its
     own middle. */
  .nwb-say-1,
  .nwb-say-2,
  .nwb-say-3,
  .nwb-say-4 {
    transform-box: fill-box;
    transform-origin: bottom center;
  }
  .nwb-heartbeat {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* The seal pulses about its own centre (drawn at its own origin); the
     ribbons swing from where they leave the books. */
  .nwb-seal-shine {
    transform-box: view-box;
    transform-origin: 0 0;
  }
  .nwb-ribbon-a,
  .nwb-ribbon-b {
    transform-box: fill-box;
    transform-origin: top center;
  }

  /* The worm sways from its hole; its tail from the bottom book's hole; its
     lids drop from the top of the lenses; crumbs puff from the hole. */
  .nwb-worm {
    transform-box: view-box;
    transform-origin: 70px 66px;
  }
  .nwb-tail-wiggle {
    transform-box: view-box;
    transform-origin: 33px 88px;
  }
  .nwb-eyelid {
    transform-box: view-box;
    transform-origin: 52px 34.1px;
  }
  .nwb-crumbs {
    transform-box: view-box;
    transform-origin: 70px 66px;
  }
  /* Lids rest folded away; the blink brings them down. Set here, not as an
     attribute, for the reason given on the passport's resting pose. */
  .nwb-eyelid {
    transform: scaleY(0);
  }

  /* The bell rings out from where its rays meet. */
  .nwb-ding {
    transform-box: fill-box;
    transform-origin: bottom left;
  }

  /* The stage curtains sway from the rail; the masks rock about themselves. */
  .nwb-curtain-l,
  .nwb-curtain-r {
    transform-box: fill-box;
    transform-origin: top center;
  }
  .nwb-mask-l,
  .nwb-mask-r {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* The grimoire's glow, runes and loose pages move about their own
     centres. */
  .nwb-lore-glow,
  .nwb-glyph-1,
  .nwb-glyph-2,
  .nwb-glyph-3,
  .nwb-glyph-4,
  .nwb-glyph-5,
  .nwb-glyph-6,
  .nwb-leaf-l,
  .nwb-leaf-r {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Flames leap from the fire's base; bubbles grow from their own middle. */
  .nwb-blaze-1,
  .nwb-blaze-2,
  .nwb-blaze-3 {
    transform-box: fill-box;
    transform-origin: bottom center;
  }
  .nwb-reply-1,
  .nwb-reply-2,
  .nwb-reply-3,
  .nwb-reply-4,
  .nwb-reply-5 {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Stars pop, and confetti tumbles, about their own centres. */
  .nwb-joined-1,
  .nwb-joined-2,
  .nwb-joined-3,
  .nwb-joined-4,
  .nwb-joined-5,
  .nwb-confetti-1,
  .nwb-confetti-2,
  .nwb-confetti-3,
  .nwb-confetti-4 {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* The case lid swings on its hinge, in its own drawn coordinates. */
  .nwb-lid {
    transform-box: view-box;
    transform-origin: 60px 58px;
  }

  /* The quill's moves are written about its own drawn origin. */
  .nwb-quill-rise {
    transform-box: view-box;
    transform-origin: 0 0;
  }

  /* The opal turns about the glass's centre, which is its own. */
  .nwb-opal {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Each heart thumps about its own centre; the burst spreads from the
     front heart's. */
  .nwb-heart-front,
  .nwb-heart-back,
  .nwb-burst {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* The ribbon marker swings from where it leaves the book. */
  .nwb-marker {
    transform-box: fill-box;
    transform-origin: top center;
  }

  /* The chart's compass needle turns about the compass's own centre. */
  .nwb-needle {
    transform-box: view-box;
    transform-origin: 88px 84px;
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

  /* Parts that exist only while they move: a burst, a ring of sound, a
     rune in mid-air. Hidden here rather than with an opacity on the element,
     so a still crest (locked, reduced motion) shows none of them and the
     keyframes below can still bring them in — and so the phone, whose
     animated wrapper multiplies into the element's own opacity, is not handed
     a 0 it can never lift. Native hides them with a rest pose instead. */
  .nwb-burst,
  .nwb-form-2,
  .nwb-form-3,
  .nwb-blast-1,
  .nwb-blast-2,
  .nwb-blast-3,
  .nwb-confetti-1,
  .nwb-confetti-2,
  .nwb-confetti-3,
  .nwb-confetti-4,
  .nwb-invite-1,
  .nwb-invite-2,
  .nwb-invite-3,
  .nwb-invite-4,
  .nwb-invite-5,
  .nwb-ember-1,
  .nwb-ember-2,
  .nwb-ember-3,
  .nwb-ember-4,
  .nwb-glyph-1,
  .nwb-glyph-2,
  .nwb-glyph-3,
  .nwb-glyph-4,
  .nwb-glyph-5,
  .nwb-glyph-6,
  .nwb-leaf-l,
  .nwb-leaf-r,
  .nwb-ding,
  .nwb-splash,
  .nwb-say-1,
  .nwb-say-2,
  .nwb-say-3,
  .nwb-say-4 {
    opacity: 0;
  }
  .nwb-lore-glow {
    opacity: 0.55;
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
          .nwb-route {
            animation: ${routeMarch} 1.4s linear infinite;
          }
          .nwb-pin-1 {
            animation: ${pinDrop1} 6s ease-out infinite;
          }
          .nwb-pin-2 {
            animation: ${pinDrop2} 6s ease-out infinite;
          }
          .nwb-pin-3 {
            animation: ${pinDrop3} 6s ease-out infinite;
          }
          .nwb-needle {
            animation: ${needleSettle} 5s ease-in-out infinite;
          }
          .nwb-tide-1 {
            animation: ${tideDrift} 4s ease-in-out infinite;
          }
          .nwb-tide-2 {
            animation: ${tideDrift} 4s ease-in-out 2s infinite;
          }
          .nwb-arrival {
            animation: ${bookArrive} 7s ease-in-out infinite;
          }
          .nwb-marker {
            animation: ${markerSway} 3.6s ease-in-out infinite;
          }
          .nwb-flip {
            animation: ${hourglassFlip} 8s ease-in-out infinite;
          }
          .nwb-sand-top {
            animation: ${sandDrain} 8s linear infinite;
          }
          .nwb-sand-bottom {
            animation: ${sandPile} 8s linear infinite;
          }
          .nwb-stream {
            animation: ${sandStream} 8s linear infinite;
          }
          .nwb-grains {
            animation: ${grainsFall} 0.6s linear infinite;
          }
          .nwb-dial {
            animation: ${dialTurn} 60s linear infinite;
          }
          .nwb-trumpet {
            animation: ${trumpetKick} 4.8s ease-out infinite;
          }
          .nwb-blast-1 {
            animation: ${soundRing} 4.8s ease-out infinite;
          }
          .nwb-blast-2 {
            animation: ${soundRing} 4.8s ease-out 0.25s infinite;
          }
          .nwb-blast-3 {
            animation: ${soundRing} 4.8s ease-out 0.5s infinite;
          }
          ${[0, 1, 2, 3, 4].map(
            (i) => css`
              .nwb-herald-${i + 1} {
                animation: ${heraldStar} 4.8s ease-out ${0.15 + i * 0.18}s
                  infinite;
              }
              .nwb-invite-${i + 1} {
                animation: ${inviteFade} 4.8s ease-out ${0.15 + i * 0.18}s
                  infinite;
              }
              .nwb-joined-${i + 1} {
                animation: ${joinedPop} 4.8s ease-out ${0.15 + i * 0.18}s
                  infinite;
              }
            `,
          )}
          ${[0, 1, 2, 3].map(
            (i) => css`
              .nwb-confetti-${i + 1} {
                animation: ${confettiPop} 4.8s ease-out ${i * 0.07}s infinite;
              }
            `,
          )}
          .nwb-club-bubble {
            animation: ${clubBubble} 6s ease-in-out infinite;
          }
          ${sayLines.map(
            (say, i) => css`
              .nwb-say-${i + 1} {
                animation: ${say} 6s ease-out infinite;
              }
            `,
          )}
          .nwb-heartbeat {
            animation: ${heartbeat} 1.6s ease-in-out infinite;
          }
          .nwb-peek {
            animation: ${readerPeek} 6s ease-in-out infinite;
          }
          ${volumesDrop.map(
            (drop, i) => css`
              .nwb-volume-${i + 1} {
                animation: ${drop} 6s ease-out infinite;
              }
            `,
          )}
          .nwb-set-glint {
            animation: ${setGlint} 6s ease-in-out infinite;
          }
          .nwb-seal-shine {
            animation: ${sealShine} 6s ease-out infinite;
          }
          .nwb-ribbon-a {
            animation: ${ribbonSwing} 2.6s ease-in-out infinite;
          }
          .nwb-ribbon-b {
            animation: ${ribbonSwing} 2.6s ease-in-out -1.3s infinite;
          }
          .nwb-worm {
            animation: ${wormSway} 3.2s ease-in-out infinite;
          }
          .nwb-eyelid {
            animation: ${wormBlink} 4s ease-in-out infinite;
          }
          .nwb-pupils {
            animation: ${wormGlance} 6s ease-in-out infinite;
          }
          .nwb-crumbs {
            animation: ${crumbPuff} 2.4s ease-out infinite;
          }
          .nwb-tail-wiggle {
            animation: ${tailWiggle} 1.4s ease-in-out infinite;
          }
          .nwb-booklet {
            animation: ${bookletSlide} 6s ease-in-out infinite;
          }
          .nwb-cover {
            animation: ${coverSwing} 6s ease-in-out infinite;
          }
          .nwb-left-page {
            animation: ${idPageOpen} 6s ease-in-out infinite;
          }
          .nwb-rubber {
            animation: ${rubberThump} 6s infinite;
          }
          .nwb-passport {
            animation: ${passportJolt} 6s ease-out infinite;
          }
          .nwb-new-stamp {
            animation: ${stampPrinted} 6s ease-out infinite;
          }
          .nwb-splash {
            animation: ${inkSplash} 6s ease-out infinite;
          }
          ${[1, 2, 3, 4, 5].map(
            (n) => css`
              .nwb-star-${n} {
                animation: ${starTwinkle} 3s ease-in-out ${(n - 1) * 0.25}s
                  infinite;
              }
            `,
          )}
          ${[1, 2, 3].map(
            (n) => css`
              .nwb-sparkle-${n} {
                animation: ${sparklePulse} 2.4s ease-in-out ${(n - 1) * -0.8}s
                  infinite;
              }
            `,
          )}
          .nwb-ribbon {
            animation: ${ribbonSway} 2.8s ease-in-out infinite;
          }
          .nwb-plane {
            animation: ${planeFlight} 6s infinite;
          }
          .nwb-route {
            animation: ${routeFade} 6s ease-in-out infinite;
          }
          .nwb-carriage {
            animation: ${carriageStep} 4.2s infinite;
          }
          .nwb-typing {
            animation: ${lineTyping} 4.2s infinite;
          }
          ${KEY_STRIKES.map(
            (strike, i) => css`
              .nwb-key-${i + 1} {
                animation: ${strike} 4.2s linear infinite;
              }
            `,
          )}
          .nwb-ding {
            animation: ${bellDing} 4.2s ease-out infinite;
          }
          ${spotsUp.map(
            (spot, i) => css`
              .nwb-spot-${i + 1} {
                animation: ${spot} 7s ease-out infinite;
              }
              .nwb-player-${i + 1} {
                animation: ${playersBow[i]} 7s ease-out infinite;
              }
            `,
          )}
          .nwb-curtain-l {
            animation: ${curtainSway} 5.2s ease-in-out infinite;
          }
          .nwb-curtain-r {
            animation: ${curtainSway} 5.2s ease-in-out -2.6s infinite;
          }
          ${[1.3, 1.7, 1.1].map(
            (period, i) => css`
              .nwb-footlight-${i + 1} {
                animation: ${footlightFlicker} ${period}s ease-in-out
                  ${-i * 0.4}s infinite;
              }
            `,
          )}
          .nwb-mask-l {
            animation: ${maskRock} 4.4s ease-in-out infinite;
          }
          .nwb-mask-r {
            animation: ${maskRock} 4.4s ease-in-out -2.2s infinite;
          }
          .nwb-shackle {
            animation: ${shackleSpring} 7s ease-in-out infinite;
          }
          .nwb-padlock {
            animation: ${padlockDrop} 7s ease-in-out infinite;
          }
          .nwb-chain-l {
            animation: ${chainLeft} 7s ease-in-out infinite;
          }
          .nwb-chain-r {
            animation: ${chainRight} 7s ease-in-out infinite;
          }
          .nwb-lore-glow {
            animation: ${loreFlare} 7s ease-in-out infinite;
          }
          ${[0, 1, 2, 3, 4, 5].map(
            (i) => css`
              .nwb-glyph-${i + 1} {
                animation: ${glyphRise} 7s ease-out ${[0.1, 0.45, 0, 0.3, 0.6, 0.2][i]}s
                  infinite;
              }
            `,
          )}
          .nwb-leaf-r {
            animation: ${leafRight} 7s ease-out infinite;
          }
          .nwb-leaf-l {
            animation: ${leafLeft} 7s ease-out infinite;
          }
          .nwb-blaze-1 {
            animation: ${blazeFlicker} 1.1s ease-in-out infinite;
          }
          .nwb-blaze-2 {
            animation: ${blazeFlicker} 0.85s ease-in-out -0.3s infinite;
          }
          .nwb-blaze-3 {
            animation: ${blazeFlicker} 0.7s ease-in-out -0.15s infinite;
          }
          .nwb-firelight {
            animation: ${firelightPulse} 1.3s ease-in-out infinite;
          }
          ${[2.2, 2.6, 1.9, 2.4].map(
            (period, i) => css`
              .nwb-ember-${i + 1} {
                animation: ${emberRise} ${period}s ease-out ${i * 0.55}s
                  infinite;
              }
            `,
          )}
          ${[0, 1, 2, 3, 4].map(
            (i) => css`
              .nwb-reply-${i + 1} {
                animation: ${replyRise} 6s ease-out ${i * 0.45}s infinite;
              }
            `,
          )}
          .nwb-tube-glint {
            animation: ${tubeGlint} 4.8s ease-in-out infinite;
          }
          .nwb-tassel {
            animation: ${tasselSwing} 2.6s ease-in-out infinite;
          }
          .nwb-rays {
            animation: ${raysTurn} 40s linear infinite;
          }
          .nwb-banner {
            animation: ${bannerRipple} 3.2s ease-in-out infinite;
          }
          .nwb-lid {
            animation: ${lidSwing} 7s ease-in-out infinite;
          }
          .nwb-quill-rise {
            animation: ${quillRise} 7s ease-in-out infinite;
          }
          .nwb-case-glow {
            animation: ${caseGlow} 7s ease-in-out infinite;
          }
          .nwb-form-1 {
            animation: ${formOne} 9s ease-in-out infinite;
          }
          .nwb-form-2 {
            animation: ${formTwo} 9s ease-in-out infinite;
          }
          .nwb-form-3 {
            animation: ${formThree} 9s ease-in-out infinite;
          }
          .nwb-shimmer {
            animation: ${mirrorShimmer} 3s ease-in infinite;
          }
          .nwb-opal {
            animation: ${opalTurn} 14s linear infinite;
          }
          .nwb-arrow {
            animation: ${arrowFly} 5s ease-out infinite;
          }
          .nwb-heart-front {
            animation: ${heartThumpFront} 5s ease-in-out infinite;
          }
          .nwb-heart-back {
            animation: ${heartThumpBack} 5s ease-in-out infinite;
          }
          .nwb-burst {
            animation: ${sparkBurst} 5s ease-out infinite;
          }
          .nwb-sigil {
            animation: ${sigilTurn} 36s linear infinite;
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
    .nwb-bar-4,
    .nwb-route,
    .nwb-pin-1,
    .nwb-pin-2,
    .nwb-pin-3,
    .nwb-needle,
    .nwb-tide-1,
    .nwb-tide-2,
    .nwb-arrival,
    .nwb-marker,
    .nwb-flip,
    .nwb-sand-top,
    .nwb-sand-bottom,
    .nwb-stream,
    .nwb-grains,
    .nwb-dial,
    .nwb-sigil,
    .nwb-trumpet,
    .nwb-blast-1,
    .nwb-blast-2,
    .nwb-blast-3,
    .nwb-herald-1,
    .nwb-herald-2,
    .nwb-herald-3,
    .nwb-herald-4,
    .nwb-herald-5,
    .nwb-banner,
    .nwb-invite-1,
    .nwb-invite-2,
    .nwb-invite-3,
    .nwb-invite-4,
    .nwb-invite-5,
    .nwb-joined-1,
    .nwb-joined-2,
    .nwb-joined-3,
    .nwb-joined-4,
    .nwb-joined-5,
    .nwb-confetti-1,
    .nwb-confetti-2,
    .nwb-confetti-3,
    .nwb-confetti-4,
    .nwb-club-bubble,
    .nwb-say-1,
    .nwb-say-2,
    .nwb-say-3,
    .nwb-say-4,
    .nwb-heartbeat,
    .nwb-peek,
    .nwb-volume-1,
    .nwb-volume-2,
    .nwb-volume-3,
    .nwb-volume-4,
    .nwb-volume-5,
    .nwb-set-glint,
    .nwb-seal-shine,
    .nwb-ribbon-a,
    .nwb-ribbon-b,
    .nwb-worm,
    .nwb-eyelid,
    .nwb-pupils,
    .nwb-crumbs,
    .nwb-tail-wiggle,
    .nwb-booklet,
    .nwb-cover,
    .nwb-left-page,
    .nwb-rubber,
    .nwb-passport,
    .nwb-new-stamp,
    .nwb-splash,
    .nwb-star-1,
    .nwb-star-2,
    .nwb-star-3,
    .nwb-star-4,
    .nwb-star-5,
    .nwb-sparkle-1,
    .nwb-sparkle-2,
    .nwb-sparkle-3,
    .nwb-ribbon,
    .nwb-plane,
    .nwb-route,
    .nwb-carriage,
    .nwb-typing,
    .nwb-key-1,
    .nwb-key-2,
    .nwb-key-3,
    .nwb-key-4,
    .nwb-key-5,
    .nwb-ding,
    .nwb-spot-1,
    .nwb-spot-2,
    .nwb-spot-3,
    .nwb-spot-4,
    .nwb-spot-5,
    .nwb-player-1,
    .nwb-player-2,
    .nwb-player-3,
    .nwb-player-4,
    .nwb-player-5,
    .nwb-curtain-l,
    .nwb-curtain-r,
    .nwb-footlight-1,
    .nwb-footlight-2,
    .nwb-footlight-3,
    .nwb-mask-l,
    .nwb-mask-r,
    .nwb-shackle,
    .nwb-padlock,
    .nwb-chain-l,
    .nwb-chain-r,
    .nwb-lore-glow,
    .nwb-glyph-1,
    .nwb-glyph-2,
    .nwb-glyph-3,
    .nwb-glyph-4,
    .nwb-glyph-5,
    .nwb-glyph-6,
    .nwb-leaf-l,
    .nwb-leaf-r,
    .nwb-blaze-1,
    .nwb-blaze-2,
    .nwb-blaze-3,
    .nwb-firelight,
    .nwb-ember-1,
    .nwb-ember-2,
    .nwb-ember-3,
    .nwb-ember-4,
    .nwb-reply-1,
    .nwb-reply-2,
    .nwb-reply-3,
    .nwb-reply-4,
    .nwb-reply-5,
    .nwb-tube-glint,
    .nwb-tassel,
    .nwb-rays,
    .nwb-lid,
    .nwb-quill-rise,
    .nwb-case-glow,
    .nwb-form-1,
    .nwb-form-2,
    .nwb-form-3,
    .nwb-shimmer,
    .nwb-opal,
    .nwb-arrow,
    .nwb-heart-front,
    .nwb-heart-back,
    .nwb-burst {
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
