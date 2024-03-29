/*
 * Copyright (c) 2022.
 *  MIT
 */

let stepAngle             = "2.05deg";
export const visibleItems = 5;

export const carouselStyle   = {
	position  : "relative",
	overflow  : "hidden",
	display   : "flex",
	userSelect: "none",
	transform : { translateZ: "0px" }
};
export const wrapperStyle    = {
	position: "relative",
	flexGrow: "1",
	overflow: "hidden",
};
export const prevBtnStyle    = {
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
export const nextBtnStyle    = {
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
export const defaultInitial  = {
	position : "absolute",
	height   : "25em",
	width    : "40em",
	top      : "50%",
	left     : "50%",
	fontSize : ".5em",
	zIndex   : 50,
	opacity  : 0,
	transform: [
		
		{
			translateX: "-50%",
			translateY: "-50%"
		},{
			perspective: "1250px",
			translateY : "-30000px",
			rotate     : "-" + stepAngle
		},
		{
			translateY: "30000px",
			translateZ: "-500px",
			rotateY   : "15deg",
		}]
};
export const scrollAxis      = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: [,{
				rotate: "-" + stepAngle,
			}],
			zIndex   : 150,
		}
	},
];
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		easeFn  : "easeSinIn",
		apply   : {
			transform: [,{
				rotate: stepAngle,
			}],
			zIndex   : 150,
		}
	},
	{
		from    : 25,
		duration: 20,
		apply   : {
			opacity: 1,
		}
	}, {
		from    : 55,
		duration: 45,
		apply   : {
			transform: [,{}, {
				rotateY   : "-15deg",
				translateZ: "500px",
				//rotateX: "-90deg",
			}],
		}
	},
];
export const dragHook        = p => -p;
export const defaultLeaving  = [
	{
		from    : 0,
		duration: 45,
		apply   : {
			transform: [,{}, {
				rotateY   : "-15deg",
				translateZ: "-500px",
			}]
		}
	},
	{
		from    : 55,
		duration: 20,
		apply   : {
			opacity: -1,
		}
	}, {
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinOut",
		easeFn: "easeSinOut",
		apply : {
			zIndex: -150,
			
			transform: [,{
				rotate: stepAngle,
			}]
		}
	}]
;
