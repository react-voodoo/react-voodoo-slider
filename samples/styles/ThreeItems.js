/*
 * Copyright (c) 2022-2023 Braun Nathanael
 *
 * This project is dual licensed under one of the following licenses:
 * - Creative Commons Attribution-NoDerivatives 4.0 International License.
 * - GNU AFFERO GENERAL PUBLIC LICENSE Version 3
 *
 * You should have received a copy of theses licenses along with this work.
 * If not, see <http://creativecommons.org/licenses/by-nd/4.0/> or <http://www.gnu.org/licenses/agpl-3.0.txt>.
 */

/**
 * ThreeItems style preset — horizontal 3-up strip.
 *
 * Layout
 * ──────
 * Three slides share the container width equally, each 33% wide and full
 * height.  They slide horizontally.
 *
 *   ┌──────────┬──────────┬──────────┐
 *   │  left    │  centre  │  right   │  ← all three visible at once
 *   └──────────┴──────────┴──────────┘
 *
 * Coordinate math
 * ───────────────
 * Base: left = 100%, translateX = 0 → slide is parked just off-screen right.
 *
 * `defaultEntering` delta: translateX = -202% (of element = 33% container).
 *   202% × 33% ≈ 66.7% of the container.
 *   100% (left) − 66.7% ≈ 33.3% → the slide lands at the rightmost visible slot.
 *
 * The +2% overshoot beyond the exact 200% keeps a 1-pixel hairline gap from
 * appearing between slides due to sub-pixel rounding.
 *
 * `defaultLeaving` uses the same delta: from the rightmost slot the slide
 * continues 66.7% further left, landing off-screen.
 *
 * The layout uses flex so the optional prev/next buttons sit outside the strip.
 */

/**
 * How many slides are simultaneously in view.
 * A full swipe across the container advances by 3 slides.
 */
export const visibleItems = 3;

/**
 * carouselStyle — outermost container.
 * Flex row so the prev/next buttons flank the wrapper.
 */
export const carouselStyle = {
	position  : "relative",
	overflow  : "hidden",
	display   : "flex",        // buttons + wrapper side by side
	userSelect: "none",
	transform : { translateZ: "0px" }  // compositor layer promotion
};

/**
 * wrapperStyle — inner slide strip.
 * Grows to fill all available width between the two buttons.
 */
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
 * defaultInitial — base (t = 0) style for each slide node.
 *
 * `width: 33%` — one third of the wrapper.
 * `left: 100%` — parked just off the right edge, out of view.
 * `translateX: 0px` — baseline for the entering/leaving deltas.
 */
export const defaultInitial = {
	position : "absolute",
	height   : "100%",
	width    : "33%",      // three slides fill the wrapper
	top      : "0%",
	left     : "100%",     // parked off-screen right
	zIndex   : 50,
	fontSize : ".5em",
	transform: [
		{
			translateX: "0px",  // delta baseline
		}]
};

/**
 * scrollAxis — additional tween active while a slide is the focused centre.
 * Raises zIndex so the active slide floats above its neighbours.
 */
export const scrollAxis = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			zIndex: 150,  // centre slide appears on top during transition
		}
	},
];

/**
 * defaultEntering — slides the card from off-screen right into the strip.
 *
 * -202% of element width (33% of container) ≈ -66.7% of container.
 * Final position: left(100%) + translateX(-66.7%) ≈ 33.3% → rightmost slot.
 * The 2% extra prevents sub-pixel gaps between adjacent slides.
 */
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: [
				{
					translateX: "-202%",  // -202% × 33% ≈ -66.7% container → rightmost slot
				}]
		}
	},
];

/**
 * defaultLeaving — continues the leftward motion off-screen.
 *
 * At the start of leaving, the slide is at the rightmost slot (translateX
 * already at -202% from entering).  Adding another -202% moves it off the
 * left edge.
 */
export const defaultLeaving = [
	{
		from    : 0,
		duration: 100,
		apply   : {
			transform: [
				{
					translateX: "-202%",  // continues left, exits the viewport
				}]
		}
	}
];
