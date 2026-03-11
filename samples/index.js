/*
 *   The MIT License (MIT)
 *   Copyright (c) 2019. Wise Wild Web
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 *
 *   @author : Nathanael Braun
 *   @contact : n8tz.js@gmail.com
 */

import React                  from "react";
import ReactDom               from "react-dom";
import Slide                  from "./comps/Slide";
import Slider, {customStyles} from "..";
import myCustomStyles         from "./styles/(*).js";

import {renderToString} from "react-dom/server";
import "./samples.scss";

// Register all sample style presets (FourItems, ThreeItems, slider3d, …) into
// the global customStyles map so the Slider can look them up by name via
// `defaultStyleId`.  This must happen before the first render.
Object.assign(customStyles, myCustomStyles);

// ─── Stub data ───────────────────────────────────────────────────────────────
// Unsplash-seeded random images so each generated set looks different.
const stubThemes = ["magic", "sky", "forge", "birds", "bridge", "cat", "eye", "ship", "car", "sunset", "forest", "boobs"];

/**
 * generateStubs — produce a random list of slide data objects.
 *
 * Each object carries the fields that `Slide` knows how to render:
 *   - label           : displayed as the slide title
 *   - summary         : secondary text (newlines become <br/>)
 *   - backgroundImage : URL passed to <img> inside the slide
 *
 * The random image seed guarantees variety while staying cacheable across
 * re-generations within the same session.
 */
function generateStubs() {
	let count = Math.max(~~(Math.random() * 30), 5), // 5–30 slides
	    stubs = [];
	for ( let i = 0; i < count; i++ )
		stubs.push(
			{
				label          : "Test " + i,
				summary        : "Test khjjhk kh kjh k\njkkhkjh kh kj",
				backgroundImage: "https://picsum.photos/400/700?random=" + ~~(i + Math.random() * 10000)
			}
		)
	return stubs;
}

// ─── App ─────────────────────────────────────────────────────────────────────
/**
 * App — root demo component.
 *
 * Demonstrates the main VoodooSlider features in a single page:
 *
 *   • Infinite looping         — `infinite={true}` wraps ghost slides around
 *                                the real ones so drag never hits a hard end.
 *   • Per-slide inner axes     — `updateItemAxes={true}` lets each <Slide>
 *                                own its own tweener with `entering`, `leaving`,
 *                                `visible`, and `visibleNext` axes that the
 *                                slider drives in real time.
 *   • Auto-scroll              — advances to the next slide every 10 s; pauses
 *                                automatically while the pointer is hovering.
 *   • Controlled index         — `index` + `onWillChange` keep external React
 *                                state in sync so the "X / N" counter updates
 *                                as soon as the user starts a swipe.
 *   • Hot style switching      — clicking a preset name in the footer replaces
 *                                `defaultStyleId`, which swaps the layout (1-up,
 *                                3-up, 5-up, 3D fan, …) without remounting.
 *   • Live data regeneration   — the ↺ button replaces the stub array with a
 *                                freshly generated one of random length.
 */
const App = () => {
	const [slideIndex, setSlideIndex] = React.useState(0),
	      [styleId, setStyleId]       = React.useState("slider3d"),
	      [stubs, setStubs]           = React.useState(generateStubs());

	return <div className={"sample"}>
		<Slider
			key={"mainSlider"}
			infinite={true}
			updateItemAxes={true}       // drive per-slide inner tweener axes
			autoScroll={10 * 1000}      // auto-advance every 10 s
			index={slideIndex}          // controlled: external state drives position
			defaultStyleId={styleId}    // swap layout preset without remounting
			onWillChange={i => setSlideIndex(i)} // sync index as soon as snap target is known
		>
			{
				// Each Slide receives a `record` prop and a `voodooRef` callback
				// (injected by the slider when updateItemAxes is true) that exposes
				// its inner tweener so the slider can drive its axes.
				stubs?.map(
					( rec, i ) =>
						<Slide record={rec} key={i}/>
				) || <></>
			}
		</Slider>

		{/* Live position counter — updates immediately on drag thanks to onWillChange. */}
		<div className={"slideInfos"}>{slideIndex} / {stubs.length}</div>

		{/* Style preset switcher — lists all registered presets as clickable chips. */}
		<div className={"slideStyles"}>
			{
				Object.keys(customStyles)
				      .map(
					      id =>
						      <div className={"style " + (styleId === id ? "selected" : "")}
						           onClick={e => setStyleId(id)}>
							      {id}
						      </div>
				      )
			}
			{/* Regenerate button — produces a new random stub list. */}
			<div className={"regenBtn"} onClick={e => setStubs(generateStubs())}>↺</div>
		</div>
	</div>
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
/**
 * renderSamples — mounts the App into the #app DOM node.
 *
 * Also serves as the HMR accept callback so hot-reloading works in dev:
 * when any module in this entry changes, React remounts from this function.
 *
 * SSR alternative (commented out below): swap ReactDom.render for
 * renderToString + innerHTML to test server-side rendering output.
 */
function renderSamples() {
	ReactDom.render(
		<App/>
		, document.getElementById('app'));
	//let node=document.getElementById('app');
	//node.innerHTML=renderToString(<App/>)
}

renderSamples()

// Accept HMR updates for the entire entry chunk.
if ( process.env.NODE_ENV !== 'production' && module.hot ) {
	module.hot.accept('.', renderSamples);
}
