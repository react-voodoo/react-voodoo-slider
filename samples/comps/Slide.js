/*
 * Copyright (c) 2020-2022.
 */

import * as React from "react";
import Voodoo     from "react-voodoo";

/**
 * Slide — individual carousel slide with its own inner Voodoo tweener.
 *
 * Architecture
 * ────────────
 * When the parent VoodooSlider has `updateItemAxes={true}`, it calls
 * `api.updateItemsAxes(pos)` every frame and drives four named axes on each
 * slide's inner tweener:
 *
 *   entering    [0 → 100]  — slide is approaching the centre from the right.
 *   leaving     [0 → 100]  — slide is departing from the centre to the left.
 *   visible     [0 → 100]  — continuous proximity to centre (100 = centred, 0 = ±1 slide away).
 *   visibleNext [0 → 100]  — binary: 100 when within the visible neighbourhood, 0 when far away.
 *
 * Each inner node (`content`, `label`, `summary`) subscribes to one or more
 * of these axes to animate its own properties independently of the outer slide
 * translation.
 *
 * Props
 * ─────
 * @prop {object}   record     Data object: { label, summary, backgroundImage }
 * @prop {function} voodooRef  Callback injected by the slider — receives this
 *                             slide's tweener instance so the slider can drive
 *                             its axes via `itemTweener.axes.entering.scrollTo(…)`.
 * @prop {*}        children   Unused; present for composition compatibility.
 * @prop {object}   axesInit   Reserved for SSR initial axis positions (set by the
 *                             slider via `ref._.defaultAxesPosition`).
 * @prop {*}        ...props   Forwarded to ViewBox.
 */
export default ( {
	                 children, record,
	                 voodooRef, axesInit,
	                 ...props
                 } ) => {
	const
		// Each slide owns its own independent Voodoo tweener.
		// The parent slider reaches in via the `voodooRef` callback below.
		[tweener, ViewBox] = Voodoo.hook(),
		[p, setP]          = React.useState(),

		// ─── Per-node style + axes descriptors ──────────────────────────────
		// Memoised with an empty dep-array: these descriptors are pure constants
		// (no runtime dependencies), so they never need to be recreated.
		styles             = React.useMemo(
			() => (
				{
					// ── content ────────────────────────────────────────────────
					// The content wrapper is hidden by default (display: none) and
					// revealed as soon as the slide enters the visible neighbourhood.
					// This avoids rendering images and text for slides that are too
					// far away to be seen, saving GPU memory on large lists.
					content: {
						style: {
							display: "none",
						},
						axes : {
							// `visibleNext` goes from 0 → 100 when the slide is near.
							// At position 1 (effectively "just became visible") we flip
							// display to "block" via a 1-unit instantaneous tween.
							visibleNext: [
								{
									from    : 1,
									duration: 1,
									apply   : {
										display: "block",
										//color:"red"
									}
								},
							]
						}
					},

					// ── label ─────────────────────────────────────────────────
					// The slide title.  Hooks into `entering` and `leaving` axes
					// for per-element choreography on top of the outer slide motion.
					// (opacity and translateY tweens are commented out — they serve
					// as a ready-made template to enable custom entry/exit effects.)
					label  : {
						style: {
							position: "absolute",
							top     : "20%",
							left    : "5%",
							right   : "30%",
							color   : "white",
							fontSize: "4em",
							//opacity  : 0,
							transform: [{
								//translateY: "-5em"
							}]
						},
						axes : {
							entering: [
								{
									from    : 0,
									duration: 100,
									apply   : {
										//opacity  : 1,
										transform: [
											{
												//translateY: "5em"
											}
										]
									}
								},
							],
							leaving : [
								{
									from    : 0,
									duration: 100,
									apply   : {
										//opacity  : -1,
										transform: [
											{
												//translateX: "5em"
											}
										]
									}
								},
							]
						}
					},

					// ── summary ───────────────────────────────────────────────
					// Secondary text below the title.  Animates on the `visible`
					// axis (proximity to centre) rather than `entering`/`leaving`,
					// so it fades+slides in smoothly as the slide approaches and
					// fades out as it recedes — regardless of direction.
					//
					// Base style parks it invisible and offset to the right.
					// The `visible` tween: opacity 0→1, translateX -3em→0 as the
					// slide nears the centre.
					// Color is also animatable (commented-out example shown).
					summary: {
						style: {
							position: "absolute",
							top     : ["20%", "3em"],  // multi-unit: calc(20% + 3em)
							left    : "10%",
							right   : "40%",
							color   : "rgb(255,0,0)",
							fontSize: "2em",
							opacity  : 0,               // invisible at rest
							transform: [{
								translateX: "3em"       // shifted right at rest
							}]
						},
						axes : {
							visible: [
								{
									from    : 0,
									duration: 100,
									apply   : {
										//color    : "rgb(0,255,0)",
										color: { r: -255, g: 255 }, // rgb delta: red→green as slide centres
										opacity  : 1,               // fade in as proximity → 100
										transform: [
											{
												translateX: "-3em"  // slide in from right (base 3em + delta -3em = 0)
											}
										]
									}
								},
							]
						}
					},
				}
			),
			[]  // constant — no dependencies
		);

	// Expose this slide's tweener to the parent slider so it can drive the
	// entering/leaving/visible/visibleNext axes on every slideAxis frame.
	// Called during render (not in an effect) so the ref is available before
	// the first axis update fires.
	voodooRef?.(tweener);

	return <ViewBox className={'Slide '}>

		{/* ── Inner axes ──────────────────────────────────────────────────────
		    Declared here so the slider can find them by id on the tweener.
		    Default positions mirror the "fully off-screen right" resting state:
		      entering  = 0   (hasn't started entering)
		      visible   = 0   (not visible)
		      entering  = 0
		      leaving   = 100 (fully "left" — parked off to the left at rest)
		────────────────────────────────────────────────────────────────────── */}
		<Voodoo.Axis
			id={"visibleNext"}
			defaultPosition={0}
		/>
		<Voodoo.Axis
			id={"visible"}
			defaultPosition={0}
		/>
		<Voodoo.Axis
			id={"entering"}
			defaultPosition={0}
		/>
		<Voodoo.Axis
			id={"leaving"}
			defaultPosition={100} // starts at 100 so the leaving tween is fully applied (slide is off-screen left)
		/>

		{/* ── Slide content ───────────────────────────────────────────────────
		    Rendered only when a `record` is provided (the slider always passes
		    one, but the guard prevents crashes during SSR or in edge cases).
		────────────────────────────────────────────────────────────────────── */}
		{
			record &&
			<Voodoo.Node.div className={"content"} {...styles.content}>
				{/* Ghost image — rendered behind the main image and blurred via CSS
				    to create a colour-fill background that bleeds to the edges. */}
				{
					record.backgroundImage &&
					<img src={record.backgroundImage} className={"ghost"} draggable={false}/>
				}
				{/* Main image — sits on top of the ghost, cropped by the slide bounds. */}
				{
					record.backgroundImage &&
					<img src={record.backgroundImage} draggable={false}/>
				}

				{/* Title — animates on entering/leaving axes (see styles.label). */}
				<Voodoo.Node.div className={"label"} {...styles.label}>
					{record.label}
				</Voodoo.Node.div>

				{/* Summary text — animates on the visible axis (see styles.summary). */}
				<Voodoo.Node.div className={"summary"} {...styles.summary}>
					<span dangerouslySetInnerHTML={{ __html: (record.summary || "").replace(/\n/ig, "<br/>") }}/>
				</Voodoo.Node.div>

			</Voodoo.Node.div>
		}
	</ViewBox>
}
