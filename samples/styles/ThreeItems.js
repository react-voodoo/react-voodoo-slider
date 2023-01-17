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

export const visibleItems = 3;

export const defaultInitial  = {
	position: "absolute",
	height  : "100%",
	width   : "33%",
	top     : "0%",
	left    : "100%",
	zIndex  : 50,
	fontSize : ".5em",
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
			left: "-67%"
		}
	},
];
export const defaultLeaving  = [
	{
		from    : 0,
		duration: 100,
		apply: {
			left: "-67%"
		}
	}]
;
