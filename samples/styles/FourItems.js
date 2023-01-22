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
	height   : "70%",
	width    : "25%",
	top      : "15%",
	left     : "100%",
	zIndex   : 50,
	fontSize : ".4em",
	transform: [
		{
			translateX: "0px",
		}]
};
export const scrollAxis      = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: {
				//rotate: "-" + stepAngle,
			},
			zIndex   : 150,
		}
	},
];
export const defaultEntering = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinIn",
		apply: {
			transform: [
				{
					translateX: "-400%",
				}]
		}
	},
];
//export const dragHook  = p => -p;
export const defaultLeaving  = [
	{
		from    : 0,
		duration: 100,
		//easeFn  : "easeSinOut",
		//easeFn: "easeSinOut",
		apply: {
			transform: [
				{
					translateX: "-400%",
				}]
		}
	}]
;
