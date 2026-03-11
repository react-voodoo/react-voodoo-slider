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
 * FourItems style preset — horizontal 5-up strip.
 *
 * Layout
 * ──────
 * Five slides are visible at once, each occupying 25% of the container width.
 * They are positioned absolutely and slide horizontally.
 *
 *   Container (100% wide, overflow hidden)
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ [25%] [25%] [25%] [25%]  ← four visible at a time             │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Coordinate math
 * ───────────────
 * Base style: left = 100%, translateX = 0 → slide starts parked just off the
 * right edge.
 *
 * `defaultEntering` applies a delta of translateX = -400% (of element width).
 * With an element that is 25% of the container, 400% × 25% = 100% container.
 * So at full progress (entering complete) the slide has moved exactly one full
 * container width to the left, arriving at the rightmost visible slot.
 *
 * `defaultLeaving` applies the same delta so that the slide continues sliding
 * one full container width further left, exiting off the left edge.
 *
 * The layout uses `display: flex` on the carousel container and a separate
 * `wrapperStyle` so that the optional prev/next buttons sit outside the slide
 * strip without affecting the slide coordinate system.
 */

/**
 * How many slides are simultaneously in view.
 * Controls drag sensitivity: swiping the full container width advances by 5
 * slides.
 */
export const visibleItems = 5;

/**
 * carouselStyle — outermost container.
 * Flex row so the prev/next buttons flank the slide wrapper without overlap.
 */
export const carouselStyle = {
	position  : "relative",
	overflow  : "hidden",
	display   : "flex",        // buttons + wrapper in a row
	userSelect: "none",
	transform : { translateZ: "0px" }  // compositor layer promotion
};

/**
 * wrapperStyle — inner slide strip (grows to fill remaining space).
 * overflow: hidden clips slides that are outside the visible range.
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
 * defaultInitial — base (t = 0) style for every slide node.
 *
 * Each slide is 25% wide and 70% tall (centred vertically via top: 15%).
 * `left: 100%` parks it just off the right edge of the wrapper.
 * `translateX: 0px` is the baseline for the entering/leaving deltas.
 */
export const defaultInitial = {
	position : "absolute",
	height   : "70%",
	width    : "25%",      // four slides across the container
	top      : "15%",      // vertically centred
	left     : "100%",     // parked off-screen right
	zIndex   : 50,
	fontSize : ".4em",
	transform: [
		{
			translateX: "0px",  // baseline; entering/leaving deltas accumulate here
		}]
};

/**
 * scrollAxis — extra tween applied while a slide is "passing through" centre.
 * Currently only raises zIndex so the active slide appears above its neighbours.
 * The rotate transform is commented out as a ready-to-use example.
 */
export const scrollAxis = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: {
				//rotate: "-" + stepAngle,
			},
			zIndex   : 150,  // float above resting slides while passing through
		}
	},
];

/**
 * defaultEntering — moves the slide from off-screen right into the strip.
 *
 * Delta translateX = -400% of element width (25% container) = -100% container.
 * Entering tween: slide travels one full container width to the left, landing
 * at the rightmost visible slot in the strip.
 */
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: [
				{
					translateX: "-400%",  // base(0) + delta(-400%) = -400% → rightmost slot
				}]
		}
	},
];
//export const dragHook  = p => -p;  // uncomment to invert drag direction

/**
 * defaultLeaving — moves the slide from the strip off-screen left.
 *
 * Same magnitude as entering so the slide exits by the same distance it
 * entered.  At the start of leaving the slide is at translateX = -400%
 * (rightmost slot); by the end it is at -800%, off the left edge.
 */
export const defaultLeaving = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinOut",
		//easeFn: "easeSinOut",
		apply: {
			transform: [
				{
					translateX: "-400%",  // continues sliding left, exits off-screen
				}]
		}
	}
];
