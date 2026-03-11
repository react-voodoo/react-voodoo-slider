/*
 * Copyright (c) 2022.
 *  MIT
 */

/**
 * Default style preset for VoodooSlider.
 *
 * A style preset is a plain object whose keys map directly to VoodooSlider
 * props of the same name.  Consumers can select a preset via `defaultStyleId`
 * and override individual keys with explicit props.
 *
 * This default preset implements a **full-width, one-slide-at-a-time** layout
 * where slides stack in absolute position and slide horizontally in/out.
 *
 * Coordinate convention
 * ─────────────────────
 * The slideAxis runs from 100 (first slide centred) upward.  Each slide
 * occupies `step = 100 × overlaps` units.  Two tween ranges are active for
 * every slide:
 *
 *   [0, 100]   → entering  (slide approaches centre from the right)
 *   [100, 200] → leaving   (slide departs to the left)
 *
 * Both are defined as delta descriptors: `apply` values accumulate on top of
 * the `defaultInitial` base style.
 */

/**
 * How many slides are simultaneously visible in the viewport.
 * With 1, the entering/leaving tweens fill exactly the full container width.
 */
export const visibleItems = 1;

/**
 * carouselStyle — styles applied to the outermost carousel container (ViewBox).
 *
 * `translateZ: "0px"` promotes the element to its own compositor layer, which
 * prevents repaints from leaking into the surrounding page during animation.
 */
export const carouselStyle = {
	position  : "relative",
	overflow  : "hidden",    // clip slides that are off-screen
	userSelect: "none",      // prevent text selection during drag
	transform : { translateZ: "0px" }
};

// Optional: uncomment to enable a flex layout with explicit prev/next buttons
// inlined with the slide strip.
//export const wrapperStyle    = {
//	position: "relative",
//	flexGrow: "1",
//	overflow: "hidden",
//};
//export const prevBtnStyle    = {
//	position  : "relative",
//	flexGrow  : "0",
//	flexShrink: 0,
//	padding   : "5px"
//};
//export const nextBtnStyle    = {
//	position  : "relative",
//	flexGrow  : "0",
//	flexShrink: 0,
//	padding   : "5px"
//};

/**
 * defaultInitial — base (t = 0) style for every slide node.
 *
 * Slides are absolutely positioned on top of each other inside the carousel.
 * The base `translateX: "100%"` parks every slide to the right of the
 * viewport; the entering tween then pulls it into view.
 *
 * These values are additive baselines — tween `apply` deltas accumulate on top.
 */
export const defaultInitial = {
	position: "absolute",
	height  : "100%",
	width   : "100%",
	top     : "0%",
	left    : "0%",
	zIndex  : 50,
	//opacity  : 0,  // uncomment to fade slides in/out in addition to sliding
	transform: [
		{
			translateX: "100%"  // parked off-screen to the right at rest
		}]
};

/**
 * defaultEntering — tween descriptors applied while a slide moves into view.
 *
 * Active during slideAxis range [slideOffset + 0, slideOffset + 100].
 * The delta `translateX: "-100%"` added to the base `"100%"` resolves to 0
 * at full progress → the slide sits at `translateX: 0%` (centred).
 * `zIndex: 150` raises the entering slide above all resting slides (zIndex 50)
 * while it is in motion.
 */
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: {
				translateX: "-100%"  // 0 → -100%: base(100%) + delta(-100%) = 0 at centre
			},
			zIndex   : 150,          // float above resting slides during entry
		}
	}
];

// Optional drag hook — uncomment to invert the drag direction.
// Useful when xAxis direction and visual slide direction feel reversed.
//export const dragHook = p => -p;

/**
 * defaultLeaving — tween descriptors applied while a slide moves out of view.
 *
 * Active during slideAxis range [slideOffset + 100, slideOffset + 200].
 * `translateX: "-100%"` added to the base `"100%"` = 0 at start of this range,
 * so the slide begins centred and moves fully left by the end.
 * `zIndex: -150` sends the departing slide below all others so it doesn't
 * visually clip the incoming slide.
 */
export const defaultLeaving = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: {
				translateX: "-100%"  // continues sliding left past centre toward off-screen left
			},
			zIndex   : -150,         // sink below resting slides during exit
		}
	}
];
