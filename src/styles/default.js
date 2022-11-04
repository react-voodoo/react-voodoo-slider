/*
 * Copyright (c) 2022.
 *  MIT
 */

export const visibleItems = 1;

export const carouselStyle   = {
	position  : "relative",
	overflow  : "hidden",
	userSelect: "none",
	transform : [
		{
			translateZ: "0px"
		}]
};
export const defaultInitial  = {
	position: "absolute",
	height  : "100%",
	width   : "100%",
	top     : "0%",
	left    : "0%",
	zIndex  : 50,
	//opacity  : 0,
	transform: [
		{
			translateX: "100%"
		}]
};
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: {
				translateX: "-100%"
			},
			zIndex   : 150,
		}
	}
];
//export const dragHook  = p => -p;
export const defaultLeaving  = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: {
				translateX: "-100%"
			},
			zIndex   : -150,
		}
	}]
;