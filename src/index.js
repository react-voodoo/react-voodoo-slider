import React  from "react";
import Voodoo from "react-voodoo";
import styles from "./styles/(*).js";

/**
 * useTracked — stable mutable ref bag.
 *
 * Returns a plain object whose identity never changes (it lives inside a ref).
 * On every render the latest values are merged into it with Object.assign, so
 * any callback that closes over `locals` always reads fresh data without the
 * callback itself needing to be recreated.
 *
 * This is the escape hatch that lets the `api` object (created once with an
 * empty dep-array) still access the current props/state on every call.
 */
function useTracked( refs ) {
	const scope = React.useRef({}).current;  // stable object across renders
	Object.assign(scope, refs);              // sync latest values in-place
	return scope;
}

/**
 * genItemsInitialAxesPos — compute per-slide axis positions for the first paint.
 *
 * When `updateItemAxes` is enabled, each slide child has its own inner Voodoo
 * tweener with dedicated axes (`entering`, `leaving`, `visible`, `visibleNext`).
 * On SSR / first mount those axes haven't been driven by the slideAxis watcher
 * yet, so we pre-compute where each of them should start.
 *
 * @param {number} pos           Current slideAxis position (absolute axis units).
 * @param {number} nbItems       Total number of instantiated slide nodes.
 * @param {number} step          Axis units occupied by one slide (100 × overlaps).
 * @param {number} visibleItems  How many slides are simultaneously visible.
 * @returns {Array<{entering, leaving, visibleNext, visible}>}
 *          One entry per slide — each value is a [0-100] axis position.
 */
function genItemsInitialAxesPos( pos, nbItems, step, visibleItems ) {
	// cPos: which slide index is currently at the centre (fractional)
	let cPos           = ((pos - 100) / step),
	    // nbLR: how many slides to either side are still "near" (inside view)
	    nbLR           = Math.max(~~(visibleItems / 2), 0) + 1,
	    initialByItems = [];

	for ( let i = 0; i < nbItems; i++ ) {
		// pos:   how far slide i is from the current centre, in slide-units
		//        negative → slide is to the right (not yet entered)
		//        positive → slide is to the left (has left)
		let pos   = cPos - i,
		    close = pos;
		initialByItems[i] = {};

		if ( pos < 0 ) {
			// Slide is ahead of the current position (entering from the right).
			// `entering` axis: partial progress — clamp at -1 (fully off-screen right).
			pos                        = Math.max(pos, -1);
			initialByItems[i].entering = (1 + pos) * 100; // 0 = not started, 100 = fully entered
			initialByItems[i].leaving  = 0;               // hasn't started leaving yet
		}
		else {
			// Slide is behind the current position (leaving to the left).
			// `entering` axis is at 100 (fully entered), `leaving` encodes how far gone.
			pos                        = Math.min(pos, 1);
			initialByItems[i].entering = 100;
			initialByItems[i].leaving  = pos * 100; // 0 = still visible, 100 = fully left
		}

		// `visibleNext`: 100 when the slide is within the visible neighbourhood,
		// 0 when it is too far away to matter (outside ±nbLR range).
		if ( close < -nbLR || close > nbLR ) {
			close = 1;
		}
		else {
			close = 0;
		}

		initialByItems[i].visibleNext = (1 - close) * 100;
		// `visible`: 100 at the centre, 0 at exactly ±1 slide away.
		initialByItems[i].visible     = (1 - Math.abs(pos)) * 100;
	}
	return initialByItems;
}

/**
 * VoodooSlider — swipeable carousel built on react-voodoo.
 *
 * Architecture overview
 * ─────────────────────
 * A single Voodoo axis ("slideAxis") drives the entire carousel. Each slide
 * occupies `step` units on that axis. The axis position encodes which slide
 * is centred:
 *
 *   axisPos = 100 + dec + slideIndex × step
 *
 * where `dec` is a pre-roll offset used in infinite mode (see below).
 *
 * Each slide node receives tween descriptors (`slideAxis` key) that are just
 * the shared entering/leaving tween array shifted in time by `i × step` — so
 * slide i's animation window starts at `i × step` on the global axis.
 *
 * Infinite looping
 * ────────────────
 * Ghost copies of the children are prepended and appended to the live array.
 * When the axis drifts too far in either direction, `shouldLoop` in the inertia
 * config teleports it by exactly one "window" (nbItems × step) without any
 * visible jump — the ghost slides are pixel-identical to the real ones.
 *
 * Per-slide inner axes (updateItemAxes)
 * ─────────────────────────────────────
 * When `updateItemAxes` is true the slide children are expected to be Voodoo
 * sub-tweeners with their own `entering`, `leaving`, `visible`, `visibleNext`
 * axes. The slider watches the slideAxis and imperatively drives those inner
 * axes every frame via `api.updateItemsAxes`.
 *
 * Props
 * ─────
 * @prop {number}   defaultIndex           Slide index to start on (uncontrolled).
 * @prop {string}   defaultStyleId         Key into the `styles` map (default: "default").
 * @prop {object}   defaultInitial         Base style for every slide node (overrides preset).
 * @prop {array}    defaultEntering        Tween descriptors for a slide entering (overrides preset).
 * @prop {array}    defaultLeaving         Tween descriptors for a slide leaving (overrides preset).
 * @prop {number}   visibleItems           How many slides are simultaneously in view (controls drag sensitivity).
 * @prop {object}   prevBtnStyle           Style for the "‹" button; omit to hide the button.
 * @prop {object}   nextBtnStyle           Style for the "›" button; omit to hide the button.
 * @prop {object}   wrapperStyle           Style for the inner slide-strip wrapper node.
 * @prop {object}   carouselStyle          Style for the outermost carousel container.
 * @prop {function} onClick                `(event, realIndex, api) => void` — slide click handler.
 * @prop {function} onChange               `(index, item) => void` — fires once the transition completes.
 * @prop {function} onWillChange           `(index, item) => void` — fires immediately when the target index is known.
 * @prop {boolean}  infinite               Enable infinite looping via ghost slides.
 * @prop {number}   maxJump                Max number of waypoints inertia may skip in one flick.
 * @prop {function} dragHook               `(delta) => delta` — transform the raw drag delta before it moves the axis.
 * @prop {array}    items                  Data array — used together with `renderItem`.
 * @prop {function} renderItem             `(item, index, refCb) => ReactElement` — renders one slide from data.
 * @prop {*}        children               Alternative to items/renderItem: plain React children.
 * @prop {number}   index                  Controlled current index (drives the slider externally).
 * @prop {number}   autoScroll             Auto-advance interval in ms; pauses on hover.
 * @prop {boolean}  updateItemAxes         Drive per-slide inner tweener axes from the slideAxis.
 * @prop {function} hookUpdateItemAxes     `(itemTweener, relPos) => void` — called each frame per slide when updateItemAxes is on.
 * @prop {number}   overlaps               Fraction of a slide that overlaps with neighbours (default: 1/visibleItems).
 * @prop {string}   autoScrollEaseFn       Easing for programmatic slide transitions (default: "easeQuadInOut").
 * @prop {number}   autoScrollEaseDuration Duration in ms for programmatic transitions (default: 750).
 * @prop {object}   style                  Extra styles merged into the carousel container.
 * @prop {string}   className              Extra class names on the carousel root.
 */
export let customStyles = styles;
export default ( {
	                 defaultIndex = 0,
	                 defaultStyleId = "default",
	                 defaultInitial,
	                 defaultEntering,
	                 defaultLeaving,
	                 visibleItems,
	                 prevBtnStyle,
	                 nextBtnStyle,
	                 wrapperStyle,
	                 carouselStyle,
	                 onClick,
	                 onChange,
	                 onWillChange,
	                 infinite,
	                 maxJump,
	                 dragHook,
	                 items,
	                 renderItem,
	                 children: _childs,
	                 index,
	                 autoScroll,
	                 updateItemAxes,
	                 hookUpdateItemAxes,

	                 overlaps,
	                 autoScrollEaseFn = "easeQuadInOut",
	                 autoScrollEaseDuration = 750,
	                 style = {},
	                 className = ""
                 } ) => {
	const
		// Create the root Voodoo tweener.  Voodoo.Node.div makes ViewBox render
		// as a plain <div> instead of the default wrapper.
		[tweener, ViewBox]              = Voodoo.hook({}, Voodoo.Node.div),
		// Ref forwarded to the outermost DOM node — needed for mouseover/out
		// listeners in autoScroll mode.
		rootRef                         = React.useRef(),
		// Stable array that holds the tweener ref for each instantiated slide.
		// Items are populated via the `voodooRef` / `ref` callbacks in state.
		allItemRefs                     = React.useRef([]).current,
		// currentIndex: the logical index of the active slide (0-based, wraps at nbItems).
		// Drives both the controlled (prop `index`) and uncontrolled paths.
		[currentIndex, setCurrentIndex] = React.useState(index !== undefined ? index : defaultIndex),

		// ─── innerStyles ────────────────────────────────────────────────────
		// Merge the chosen style preset with any prop overrides.
		// `overlaps` controls how much neighbouring slides peek in from the sides;
		// it defaults to 1/visibleItems so that exactly visibleItems slides fill
		// the container width.
		innerStyles                     = React.useMemo(
			() => {
				let map      = {
					carouselStyle  : { ...(carouselStyle || styles[defaultStyleId]?.carouselStyle), ...style },
					defaultInitial : defaultInitial || styles[defaultStyleId]?.defaultInitial,
					defaultEntering: defaultEntering || styles[defaultStyleId]?.defaultEntering,
					defaultLeaving : defaultLeaving || styles[defaultStyleId]?.defaultLeaving,
					visibleItems   : visibleItems || styles[defaultStyleId]?.visibleItems,
					wrapperStyle   : wrapperStyle || styles[defaultStyleId]?.wrapperStyle,
					prevBtnStyle   : prevBtnStyle || styles[defaultStyleId]?.prevBtnStyle,
					nextBtnStyle   : nextBtnStyle || styles[defaultStyleId]?.nextBtnStyle,
					overlaps       : 0,
				};
				// overlaps fraction → if not provided, one slide = 1/visibleItems of the strip
				map.overlaps = overlaps || (1 / ((map.visibleItems - (map.visibleItems % 2)) || 1));
				return map;
			},
			[
				style,
				styles[defaultStyleId],
				defaultInitial,
				defaultEntering,
				defaultLeaving,
				carouselStyle,
				visibleItems,
				prevBtnStyle,
				wrapperStyle,
				overlaps,
				nextBtnStyle]
		),

		// ─── state ──────────────────────────────────────────────────────────
		// Core carousel data derived from props/innerStyles. Rebuilt whenever
		// the slide list, infinite flag, or style preset changes.
		state                           = React.useMemo(
			() => {
				// Resolve the canonical list of real children.
				let
					children            = items && renderItem
					                      ?
					                      [...items]
					                      : Array.isArray(_childs) ? _childs : [],
					// In infinite mode we prepend/append ghost copies so the axis
					// can scroll past either end and be silently teleported back.
					// nbGhosts: how many full copies to add on each side.
					nbGhosts            = infinite ? Math.max(~~(innerStyles.visibleItems / children.length), 1) : 0,
					// allItems: the full list of slide nodes including ghosts.
					allItems            = !infinite
					                      ? [...children]
					                      : Array(nbGhosts).fill(1).reduce(( list, i ) => ([...children, ...list, ...children]), [...children]),
					nbInstantiatedItems = allItems.length,
					// step: axis units per slide.  Each slide "window" is 100 base
					// units × the overlap fraction.
					step                = 100 * innerStyles.overlaps,
					// dec: axis offset that accounts for the ghost slides prepended
					// at the left of the strip in infinite mode.
					dec                 = infinite ? nbGhosts * (children.length * step) : 0,
					// scrollAxis: the shared entering+leaving tween array (un-shifted).
					// Each slide gets this array offset to its own position on the axis.
					scrollAxis          = [
						...innerStyles.defaultEntering,
						...Voodoo.tools.offset(innerStyles.defaultLeaving, 100)
					],
					// tweenLines[i].slideAxis: the tween descriptors for slide i,
					// offset so that its animation window starts at i × step.
					tweenLines          = allItems.map(( e, i ) => ({
						slideAxis: Voodoo.tools.offset(
							scrollAxis,
							i * step
						)
					}));

				// Materialise React elements from the items/renderItem API.
				if ( items && renderItem ) {
					allItems = allItems.map(( elem, i ) => renderItem(elem, i, ref => (allItemRefs[i] = ref)))
				}
				// When per-slide inner axes are needed, inject a voodooRef that
				// sets the initial axis positions before the first watchAxis fires.
				else if ( updateItemAxes ) {
					let initialChildAxesPos = genItemsInitialAxesPos(dec + step * currentIndex + 100, allItems.length, step, innerStyles.visibleItems);
					allItems                = allItems.map(( elem, i ) => React.cloneElement(elem, {
						key      : i,
						voodooRef: ref => {
							// Store the pre-computed starting positions so the child
							// tweener can seed its axes before the slider drives them.
							ref._.defaultAxesPosition = initialChildAxesPos[i];
							allItemRefs[i]            = ref;
						}
					}))
				}
				else {
					// Basic mode: just stamp stable keys so React can reconcile.
					allItems = allItems.map(( elem, i ) => React.cloneElement(elem, {
						key: i
					}))
				}
				return {
					overlaps  : innerStyles.overlaps,
					allItems,
					allItemRefs,
					nbInstantiatedItems,
					nbItems   : children.length,  // real (non-ghost) slide count
					step,
					dec,
					tweenLines,
					// windowSize: total axis span of one full loop of real slides
					windowSize: children.length * step,
				}
			},
			[
				items,
				renderItem,
				_childs,
				infinite,
				innerStyles,
				updateItemAxes
			]
		),

		// ─── locals ─────────────────────────────────────────────────────────
		// Stable mutable bag (see useTracked).  All values here are readable by
		// the stable `api` callbacks without stale-closure issues.
		locals                          = useTracked(
			{
				items,
				renderItem,
				onChange, innerStyles,
				onWillChange,
				updateItemAxes,
				hookUpdateItemAxes,
				autoScrollEaseFn,
				autoScrollEaseDuration,
				_childs,
				allItemRefs,
				state,
				currentIndex,
				infinite,
				autoScroll,
				visibleItems
			}),

		// ─── axisConf ───────────────────────────────────────────────────────
		// Configuration object passed to <Voodoo.Axis id="slideAxis">.
		// Rebuilt when the slide list or style changes; the axis itself is
		// re-mounted by Voodoo when its config changes.
		axisConf                        = React.useMemo(
			() => (
				{
					// Start at the position corresponding to `currentIndex`.
					defaultPosition : 100 + state.dec + locals.currentIndex * state.step,
					// Total axis length: one step per instantiated slide + 100-unit padding.
					size            : state.nbInstantiatedItems * state.step + 100,
					// How many axis units map to one full swipe across visibleItems slides.
					scrollableWindow: innerStyles.visibleItems * state.step,
					// Hard clamp for finite mode — prevents over-scroll past first/last slide.
					bounds          : !infinite && {
						min: 100,
						max: state.dec + state.nbInstantiatedItems * state.step,
					} || undefined,
					inertia         : {
						snapToBounds: false,
						maxJump,
						// shouldLoop: called each inertia frame in infinite mode.
						// Returns an axis delta to apply (teleport) when the position
						// drifts outside the "live" window, keeping it inside without
						// a visible jump.
						shouldLoop  : infinite && (( v, d ) => {
							let { windowSize } = state;

							// Scrolled too far forward → jump back one window
							if ( d > 0 && (v) >= (100 + windowSize * 2) )
								return -windowSize;

							// Scrolled too far backward → jump forward one window
							if ( d < 0 && (v) < (100 + windowSize) )
								return windowSize;
						}),
						// willSnap: fired at drag release, before the animation plays out.
						// The engine already knows the landing waypoint — use this for
						// predictive state updates (e.g. preloading content).
						willSnap    : ( i, v ) => {
							let { nbItems }     = locals.state,
							    nextIndex       = (i) % nbItems;
							// Flag so the currentIndex effect knows this came from a user
							// drag and doesn't re-trigger a programmatic scrollTo.
							locals._wasUserSnap = true;
							setCurrentIndex(nextIndex);
							locals.onWillChange?.(nextIndex, locals.items?.[nextIndex])
						},
						// onSnap: fired once the axis fully settles on a waypoint.
						onSnap      : ( i, v ) => {
							let { nbItems } = locals.state,
							    newIndex    = (i) % nbItems;
							locals.onChange?.(newIndex, locals.items?.[newIndex])
						},
						// One waypoint per instantiated slide (including ghosts).
						wayPoints   : state.allItems.map(( child, i ) => ({ at: 100 + i * state.step }))
					}
				}
			),
			[state, infinite, innerStyles.visibleItems, maxJump]
		),

		// ─── api ────────────────────────────────────────────────────────────
		// Stable imperative API (empty dep-array — never rebuilt).
		// All methods read fresh data from `locals` and `state` refs.
		api                             = React.useMemo(() => ({

			/**
			 * updateItemsAxes — drive per-slide inner tweener axes from a raw
			 * slideAxis position.
			 *
			 * For each instantiated slide, computes its normalised distance from
			 * the current centre and pushes that value into the slide's own
			 * `entering`, `leaving`, `visible`, and `visibleNext` axes (all
			 * instant, duration=0).
			 *
			 * Only meaningful when `updateItemAxes` is true.
			 *
			 * @param {number} pos  Current slideAxis absolute position.
			 */
			updateItemsAxes: ( pos ) => {
				// cPos: fractional slide index at the current axis position
				let cPos = ((pos - 100) / locals.state.step),
				    nbLR = Math.max(~~(locals.innerStyles.visibleItems / 2), 0) + 1;

				locals.allItemRefs.forEach(
					( itemTweener, i ) => {
						// pos: signed distance of slide i from centre (negative = ahead)
						let pos   = cPos - i,
						    close = pos;

						if ( pos < 0 ) {
							// Slide is to the right of centre (entering)
							pos = Math.max(pos, -1);
							itemTweener?.axes?.entering?.scrollTo((1 + pos) * 100, 0);
							itemTweener?.axes?.leaving?.scrollTo(0, 0);
						}
						else {
							// Slide is to the left of centre (leaving)
							pos = Math.min(pos, 1);
							itemTweener?.axes?.entering?.scrollTo(100, 0);
							itemTweener?.axes?.leaving?.scrollTo(pos * 100, 0);
						}

						// visibleNext: binary — 100 if within the visible neighbourhood
						if ( close < -nbLR || close > nbLR ) {
							close = 1;
						}
						else {
							close = 0;
						}

						itemTweener?.axes?.visibleNext?.scrollTo((1 - close) * 100, 0);
						// visible: continuous — 100 at centre, 0 at ±1 slide
						itemTweener?.axes?.visible?.scrollTo((1 - Math.abs(pos)) * 100, 0);

						// Optional per-frame hook for custom per-slide effects
						locals.hookUpdateItemAxes?.(itemTweener, cPos - i)
					}
				)
			},

			/** Advance to the next slide (wraps around). */
			goNext() {
				let { nbItems } = locals.state,
				    nextIndex   = ((nbItems + locals.currentIndex + 1) % (nbItems));

				api.goTo(nextIndex)
			},

			/** Go back to the previous slide (wraps around). */
			goPrev() {
				let { nbItems } = locals.state,
				    prevIndex   = ((nbItems + locals.currentIndex - 1) % (nbItems));

				api.goTo(prevIndex)
			},

			/**
			 * goTo — jump to a specific slide index.
			 * The index is normalised (mod nbItems) so negative values and
			 * values beyond the last slide wrap correctly.
			 */
			goTo( targetIndex ) {
				let { nbItems } = locals.state,
				    nextIndex   = ((nbItems + targetIndex) % (nbItems));
				setCurrentIndex(nextIndex)
			},

			/**
			 * updateCurrentPosition — snap the axis and inner axes to the
			 * current logical index instantly (duration = 0).
			 *
			 * Called after a slide list change finishes animating, so the
			 * position stays consistent with the new item count.
			 */
			updateCurrentPosition() {
				let nextCurrentIndex    = locals.prevIndex = locals.currentIndex = locals.currentIndex % locals.state.nbItems;
				locals._updateAfterMove = false;
				tweener.axes.slideAxis?.scrollTo(locals.state.dec + locals.state.step * nextCurrentIndex + 100, 0);
				api.updateItemsAxes(locals.state.dec + locals.state.step * nextCurrentIndex + 100);
				setCurrentIndex(nextCurrentIndex)
			},

			/**
			 * autoScrollUpdater — schedules the next auto-advance tick.
			 *
			 * Advances to the next slide unless the pointer is hovering over
			 * the carousel.  Re-schedules itself recursively until `autoScroll`
			 * is falsy or the effect cleans up.
			 *
			 * @param {boolean} skip  If true, reschedule without advancing
			 *                        (used to reset the timer after a manual navigation).
			 */
			autoScrollUpdater( skip ) {
				let { nbItems } = locals.state,
				    nextIndex   = ((nbItems + locals.currentIndex + 1) % (nbItems));
				if ( !locals.autoScroll )
					return;
				if ( !locals.hovering && !skip )
					setCurrentIndex(nextIndex);
				clearTimeout(locals.updaterTM);
				locals.updaterTM = setTimeout(
					tm => api.autoScrollUpdater(),
					locals.autoScroll
				)
			}
		}), []);

	// ─── Effect: respond to currentIndex changes ──────────────────────────
	// Drives the slideAxis to the position that corresponds to `currentIndex`.
	// Handles three scroll strategies:
	//   1. Short-path: straightforward linear scroll to the target.
	//   2. Wrap-forward: going forward is shorter than going backward (e.g.
	//      last→first); scroll forward past the ghost slides then teleport.
	//   3. Wrap-backward: going backward is shorter (e.g. first→last); scroll
	//      backward past the ghost slides then teleport.
	React.useEffect(
		() => {
			// Skip the programmatic scroll if this change was triggered by the
			// inertia engine itself (willSnap already moved the axis).
			if ( locals._wasUserSnap ) {
				locals._wasUserSnap = false;
				locals.prevIndex    = currentIndex || 0;
				return;
			}
			let { step, dec, nbItems } = locals.state;
			locals.prevIndex           = locals.prevIndex || 0;

			// Reset any pending auto-scroll timer on every manual navigation.
			api.autoScrollUpdater(true);

			locals.onWillChange?.(currentIndex, locals.items?.[currentIndex]);
			locals._isMoving = true;

			if ( infinite && Math.abs(locals.prevIndex - currentIndex) > Math.abs(nbItems - locals.prevIndex + currentIndex) ) {
				// Wrap-forward: scroll into the ghost region then teleport back.
				tweener.scrollTo(dec + step * (nbItems + currentIndex) + 100, locals.autoScrollEaseDuration, "slideAxis", locals.autoScrollEaseFn)
				       .then(() => {
					       tweener.scrollTo(dec + step * currentIndex + 100, 0, "slideAxis");
					       locals._isMoving = false;
					       if ( locals._updateAfterMove )
						       api.updateCurrentPosition()
					       locals.onChange?.(locals.currentIndex, locals.items?.[locals.currentIndex])
				       });
			}
			else if ( infinite && Math.abs(currentIndex - locals.prevIndex) > Math.abs(nbItems - currentIndex + locals.prevIndex) ) {
				// Wrap-backward: scroll into the ghost region on the left then teleport.
				tweener.scrollTo(dec + step * (-(nbItems - currentIndex)) + 100, locals.autoScrollEaseDuration, "slideAxis", locals.autoScrollEaseFn)
				       .then(() => {
					       tweener.scrollTo(dec + step * currentIndex + 100, 0, "slideAxis");
					       locals._isMoving = false;
					       if ( locals._updateAfterMove )
						       api.updateCurrentPosition()
					       locals.onChange?.(locals.currentIndex, locals.items?.[locals.currentIndex])
				       });
			}
			else {
				// Normal case: direct scroll to target index.
				tweener.scrollTo(dec + step * currentIndex + 100, locals.autoScrollEaseDuration, "slideAxis", locals.autoScrollEaseFn)
				       .then(() => {
					       locals._isMoving = false;
					       if ( locals._updateAfterMove )
						       api.updateCurrentPosition()
					       locals.onChange?.(locals.currentIndex, locals.items?.[locals.currentIndex])
				       });
			}
			locals.prevIndex = currentIndex;
		},
		[currentIndex, infinite]
	)

	// ─── Effect: respond to slide list / style changes ────────────────────
	// When `state` is rebuilt (new items, style preset switch, etc.) the axis
	// positions must be re-synced.  If an animation is in flight we defer until
	// it completes to avoid a jarring jump.
	React.useEffect(
		() => {
			if ( !locals.firstDrawDone ) {
				// First mount: seed the per-slide inner axes right away.
				api.updateItemsAxes(axisConf.defaultPosition || 0)
				locals.firstDrawDone = true;
				return;
			}
			if ( !locals._isMoving )
				api.updateCurrentPosition()
			else
				// A transition is playing; flag so it calls updateCurrentPosition when done.
				locals._updateAfterMove = true;
		},
		[state.dec, state.step, state.nbItems]
	)

	// ─── Effect: controlled `index` prop ─────────────────────────────────
	// When the consumer drives the slider via the `index` prop, forward changes
	// to `goTo`.  Also re-applies when `defaultStyleId` changes (a style switch
	// may reset the axis layout).
	React.useEffect(
		() => {
			if ( index !== undefined ) {
				api.goTo(index);
			}
		},
		[index, defaultStyleId]
	)

	// ─── Effect: per-slide inner axes watcher ────────────────────────────
	// When `updateItemAxes` is enabled, subscribe to slideAxis position changes
	// and forward them to all slide sub-tweeners every frame.
	React.useEffect(
		() => {
			if ( updateItemAxes ) {
				// Sync immediately in case the axis is already at a non-zero position.
				requestAnimationFrame(() => {
					api.updateItemsAxes(tweener.axes.slideAxis.scrollPos)
				})
				// watchAxis returns an unsubscribe fn — returned directly as cleanup.
				return tweener.watchAxis(
					"slideAxis",
					pos => api.updateItemsAxes(pos)
				)
			}
		},
		[updateItemAxes]
	)

	// ─── Effect: auto-scroll setup ────────────────────────────────────────
	// Starts the recurring timer and registers hover detection so the carousel
	// pauses when the pointer is over it.  Cleans up on unmount or when
	// `autoScroll` is toggled off.
	React.useEffect(
		() => {
			if ( autoScroll ) {
				let
					mouseOver    = () => {
						locals.hovering = true
					},
					mouseOut     = () => {
						locals.hovering = false;
					};
				locals.updaterTM = setTimeout(
					api.autoScrollUpdater,
					autoScroll
				)
				rootRef.current?.addEventListener("mouseover", mouseOver)
				rootRef.current?.addEventListener("mouseout", mouseOut)
				return () => {
					rootRef.current?.removeEventListener("mouseover", mouseOver)
					rootRef.current?.removeEventListener("mouseout", mouseOut)
					clearTimeout(locals.updaterTM);
				}
			}
		},
		[autoScroll]
	)

	// ─── Render ───────────────────────────────────────────────────────────
	// Layout:
	//   ViewBox (carousel root, overflow hidden)
	//     Voodoo.Axis "slideAxis"          ← virtual timeline, no DOM output
	//     [Voodoo.Node.div .btnPrev]        ← optional ‹ button
	//     Voodoo.Node (wrapper)
	//       Voodoo.Draggable (xAxis=slideAxis)
	//         Voodoo.Node × N              ← one per instantiated slide
	//           <div .slide>               ← actual slide shell
	//     [Voodoo.Node.div .btnNext]        ← optional › button
	return <ViewBox
		className={"VoodooSlider Carousel " + className}
		style={innerStyles.carouselStyle}
		ref={rootRef}
	>
		{/* The slideAxis drives all per-slide tween descriptors. */}
		<Voodoo.Axis
			id={"slideAxis"}
			{...axisConf}
		/>

		{/* Prev button — rendered only when prevBtnStyle is provided. */}
		{
			innerStyles.prevBtnStyle
			? <Voodoo.Node.div className={"btnPrev"} style={innerStyles.prevBtnStyle}
			                   onClick={api.goPrev}>&lt;</Voodoo.Node.div>
			: ""
		}

		{/* Wrapper node — clips the slide strip. */}
		<Voodoo.Node style={innerStyles.wrapperStyle}>
			{/* Draggable maps horizontal drag pixels → slideAxis units. */}
			<Voodoo.Draggable xAxis={"slideAxis"}
			                  className={"items"}
			                  xHook={dragHook}
			                  mouseDrag={true}>
				{
					state.allItems.map(
						( Child, i ) =>
							(
								<Voodoo.Node
									key={i}
									// Base (t=0) style for this slide node.
									style={
										innerStyles.defaultInitial
									}
									// Per-slide tween descriptors: the shared entering+leaving
									// curve shifted to this slide's window on the slideAxis.
									axes={
										state.tweenLines[i]
									}
								>
									{/* Slide shell — routes clicks back to the consumer. */}
									<div className={"slide"}
									     onClick={onClick && (e => onClick(e, i % state.nbItems, api))}>
										{
											Child
										}
									</div>
								</Voodoo.Node>
							)
					)
				}
			</Voodoo.Draggable>
		</Voodoo.Node>

		{/* Next button — rendered only when nextBtnStyle is provided. */}
		{
			innerStyles.nextBtnStyle
			? <Voodoo.Node.div className={"btnNext"} style={innerStyles.nextBtnStyle}
			                   onClick={api.goNext}>&gt;</Voodoo.Node.div>
			: ""
		}
	</ViewBox>
}
