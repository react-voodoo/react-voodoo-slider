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

import "./samples.scss";

Object.assign(customStyles, myCustomStyles);
const stubThemes = ["magic", "sky", "forge", "birds", "bridge", "cat", "eye", "ship", "car", "sunset", "forest", "boobs"];

function generateStubs() {
	let count = Math.max(~~(Math.random() * 30), 5),
	    stubs = [];
	for ( let i = 0; i < count; i++ )
		stubs.push(
			{
				label          : "Test " + i,
				summary        : "Test khjjhk kh kjh k\njkkhkjh kh kj",
				backgroundImage: "https://source.unsplash.com/500x400/?" + stubThemes[~~(i + Math.random() * 100000) % stubThemes.length]
			}
		)
	return stubs;
}

const App = () => {
	const [slideIndex, setSlideIndex] = React.useState(0),
	      [styleId, setStyleId]       = React.useState("default"),
	      [stubs, setStubs]           = React.useState(generateStubs());
	return <div className={"sample"}>
		<Slider
			key={"mainSlider"}
			infinite={true}
			updateItemAxes={true}
			autoScroll={10 * 1000}
			index={slideIndex}
			defaultStyleId={styleId}
			onWillChange={i => setSlideIndex(i)}
		>
			{
				stubs?.map(
					( rec, i ) =>
						<Slide record={rec} key={i}/>
				) || <></>
			}
		</Slider>
		<div className={"slideInfos"}>{slideIndex} / {stubs.length}</div>
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
			<div className={"regenBtn"} onClick={e => setStubs(generateStubs())}>↺</div>
		</div>
	</div>
}

function renderSamples() {
	ReactDom.render(
		<App/>
		, document.getElementById('app'));
	
}

renderSamples()
//
if ( process.env.NODE_ENV !== 'production' && module.hot ) {
	module.hot.accept('.', renderSamples);
}
