/*
 * Copyright (c) 2022.
 *  MIT
 */

/**
 * slider3d style preset — 3D fan / arc carousel.
 *
 * Visual effect
 * ─────────────
 * Cards are arranged in a perspective arc: the centre card faces the viewer
 * straight-on, while cards to either side are rotated slightly around the
 * Y-axis and recede into the background.  Transitioning to a new slide rotates
 * the fan, with cards fading in/out at the edges.
 *
 * Transform layer architecture
 * ────────────────────────────
 * Three independent transform layers allow different axes to modify different
 * parts of the transform stack without overwriting each other:
 *
 *   Layer 0 — centering (static)
 *     translateX: -50%, translateY: -50%
 *     Shifts the card's origin from its top-left corner to its centre so that
 *     all subsequent rotations and translations happen around the card centre.
 *
 *   Layer 1 — arc rotation (animated by slideAxis)
 *     perspective: 1250px
 *     translateY: -30000px  ┐
 *     rotate: -stepAngle    ├─ the "arc trick": a huge Y translate + rotate
 *     translateY: +30000px  ┘  bends the straight translateX path into an arc.
 *
 *     The trick: translate far up, rotate slightly, translate far back down.
 *     Because the rotation pivot is now 30000px away, a small angle (2.05°)
 *     moves the card along a smooth circular arc instead of a straight line.
 *
 *   Layer 2 — depth & face rotation (animated by slideAxis)
 *     translateZ: -500px   — cards start recessed into the scene
 *     rotateY: 15deg       — cards start angled sideways
 *     → entering tween brings them forward (translateZ 0) and face-on (rotateY 0)
 *
 * stepAngle
 * ─────────
 * The angular gap between adjacent cards on the arc.  Smaller values pack
 * cards tighter; larger values spread them further apart.
 *
 * dragHook
 * ────────
 * `p => -p` inverts the raw drag delta.  Without inversion, dragging right
 * would move the arc right too, which feels backwards for a fan where dragging
 * right should bring left-side cards forward.
 */

/** Angular separation between adjacent cards on the arc (in degrees). */
let stepAngle = "2.05deg";

/**
 * How many cards are simultaneously rendered on the arc.
 * Higher values mean more ghost slides in infinite mode.
 */
export const visibleItems = 5;

/**
 * carouselStyle — outermost container.
 * Flex row so optional buttons can flank the arc.
 */
export const carouselStyle = {
	position  : "relative",
	overflow  : "hidden",
	display   : "flex",
	userSelect: "none",
	transform : { translateZ: "0px" }  // compositor layer promotion
};

/** wrapperStyle — clip area for the arc strip. */
export const wrapperStyle = {
	position: "relative",
	flexGrow: "1",
	overflow: "hidden",
};

/** prevBtnStyle / nextBtnStyle — large "‹" and "›" navigation buttons. */
export const prevBtnStyle = {
	position      : "relative",
	flexGrow      : "0",
	flexShrink    : 0,
	fontWeight    : "bolder",
	fontSize      : "10em",
	fontFamily    : "Calibri",
	alignItems    : "center",
	justifyContent: "center",
	display       : "flex",
	cursor        : "pointer",
};
export const nextBtnStyle = {
	position      : "relative",
	flexGrow      : "0",
	flexShrink    : 0,
	fontWeight    : "bolder",
	fontSize      : "10em",
	fontFamily    : "Calibri",
	alignItems    : "center",
	justifyContent: "center",
	display       : "flex",
	cursor        : "pointer",
};

/**
 * defaultInitial — base (t = 0) style for each card node.
 *
 * The card is absolutely centred in the container (top/left 50%, then layer-0
 * translateX/Y -50% corrects for the element's own size).
 *
 * Starting state:
 *   • opacity: 0       — invisible until the entering tween fades it in
 *   • Layer 1 rotate = -stepAngle  — parked one step to the right of centre
 *   • Layer 2 translateZ = -500px  — recessed 500 px into the scene
 *   • Layer 2 rotateY = 15deg      — angled sideways (not face-on)
 */
export const defaultInitial = {
	position : "absolute",
	height   : "25em",
	width    : "40em",
	top      : "50%",   // vertically centred (corrected by layer 0 translateY)
	left     : "50%",   // horizontally centred (corrected by layer 0 translateX)
	fontSize : ".5em",
	zIndex   : 50,
	opacity  : 0,       // cards start invisible; entering fades them in
	transform: [
		// Layer 0 — centering: shift origin to card centre
		{
			translateX: "-50%",
			translateY: "-50%"
		},
		// Layer 1 — arc positioning
		{
			perspective: "1250px",
			translateY : "-30000px",           // huge offset for the arc-rotation trick
			rotate     : "-" + stepAngle,      // one step clockwise (parked to the right)
		},
		// Layer 2 — depth & face angle
		{
			translateY: "30000px",             // cancel the layer-1 Y offset
			translateZ: "-500px",              // recessed into background
			rotateY   : "15deg",               // angled sideways at rest
		}]
};

/**
 * scrollAxis — tween applied as the card passes through the active (centre) slot.
 *
 * Adds one additional -stepAngle rotation (layer 1) to push the card through
 * its arc position.  Also raises zIndex so the passing card appears on top.
 */
export const scrollAxis = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: [, {              // layer 1 only (layer 0 slot skipped with comma)
				rotate: "-" + stepAngle, // advance one more step along the arc
			}],
			zIndex   : 150,              // float above neighbouring cards while active
		}
	},
];

/**
 * defaultEntering — brings a card from the right side of the arc to the centre.
 *
 * Three tweens run in parallel / sequence:
 *
 *   [0 → 100]  rotate layer 1 by +stepAngle → card moves one arc step forward
 *              zIndex 150 → raised above neighbours during motion
 *
 *   [25 → 45]  opacity 0 → 1 → card fades in as it approaches the centre
 *              (delayed start so the card doesn't pop in at the far edge)
 *
 *   [55 → 100] layer 2: rotateY 0 + translateZ +500px → card straightens to
 *              face-on and advances from -500px to 0 (arrives at the front)
 */
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: [, {        // layer 1
				rotate: stepAngle, // +stepAngle cancels the base -stepAngle → card at centre
			}],
			zIndex   : 150,
		}
	},
	{
		from    : 25,    // fade in starts after card has moved 25% along the arc
		duration: 20,
		apply   : {
			opacity: 1,  // base(0) + delta(1) = fully visible at centre
		}
	}, {
		from    : 55,    // depth/face correction starts past the halfway point
		duration: 45,
		apply   : {
			transform: [, {}, {    // layer 2 (layers 0 & 1 slots skipped)
				rotateY   : "-15deg",  // cancels base +15deg → face-on at centre
				translateZ: "500px",   // cancels base -500px → at the front of the scene
				//rotateX: "-90deg",
			}],
		}
	},
];

/**
 * dragHook — inverts the drag delta.
 *
 * Without inversion, a rightward drag would shift the arc to the right, making
 * the left card come forward — the opposite of the expected swipe direction.
 * Negating the delta makes the gesture match the visual expectation.
 */
export const dragHook = p => -p;

/**
 * defaultLeaving — moves a card from the centre to the left side of the arc.
 *
 * Three tweens run in parallel / sequence (mirror of entering):
 *
 *   [0 → 45]   layer 2: rotateY back to +15deg, translateZ back to -500px
 *              → card tilts sideways and recedes as it departs
 *
 *   [55 → 75]  opacity 1 → 0 → card fades out near the edge
 *
 *   [0 → 100]  rotate layer 1 by +stepAngle → card moves one arc step backward
 *              zIndex -150 → sunk below incoming cards during motion
 */
export const defaultLeaving = [
	{
		from    : 0,
		duration: 45,
		apply   : {
			transform: [, {}, {    // layer 2
				rotateY   : "-15deg",  // tilt sideways as the card departs
				translateZ: "-500px",  // recess back into the background
			}]
		}
	},
	{
		from    : 55,    // fade out starts after the card is well past centre
		duration: 20,
		apply   : {
			opacity: -1, // base(1 from entering) + delta(-1) = 0 → invisible at the edge
		}
	}, {
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinOut",
		easeFn: "easeSinOut",
		apply : {
			zIndex: -150,           // sink below all other cards while departing

			transform: [, {         // layer 1
				rotate: stepAngle,  // moves one arc step backward (to the left)
			}]
		}
	}
];
