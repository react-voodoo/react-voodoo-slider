import React  from "react";
import Voodoo from "react-voodoo";
import styles from "./styles/(*).js";

function useTracked( refs ) {
	
	const scope = React.useRef({}).current;
	
	Object.assign(scope, refs);
	
	return scope;
}

export let customStyles = styles;
export default ( {
	                 defaultIndex = 0,
	                 defaultStyleId = "default",
	                 defaultInitial = styles[defaultStyleId]?.defaultInitial,
	                 defaultEntering = styles[defaultStyleId]?.defaultEntering,
	                 defaultLeaving = styles[defaultStyleId]?.defaultLeaving,
	                 visibleItems = styles[defaultStyleId]?.visibleItems,
	                 style = {},
	                 _style = { ...styles[defaultStyleId]?.carouselStyle, ...style },
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
	                 overlaps = 1 / ((visibleItems - (visibleItems % 2)) || 1),
	                 autoScrollEaseFn = "easeQuadInOut",
	                 autoScrollEaseDuration = 750,
	                 className = ""
                 } ) => {
	const
		[tweener, ViewBox]              = Voodoo.hook(),
		rootRef                         = React.useRef(),
		allItemRefs                     = React.useRef([]).current,
		[currentIndex, setCurrentIndex] = React.useState(index !== undefined ? index : defaultIndex),
		state                           = React.useMemo(
			() => {
				let
					children     = items && renderItem
					               ?
					               [...items]
					               : Array.isArray(_childs) ? _childs : [],
					allItems     = !infinite
					               ? [...children]
					               : [...children, ...children, ...children],
					nbGhostItems = allItems.length,
					step         = 100 * overlaps,
					dec          = infinite ? children.length * step : 0,
					scrollAxis   = [
						...defaultEntering,
						...Voodoo.tools.offset(defaultLeaving, 100)
					],
					tweenLines   = allItems.map(( e, i ) => ({
						slideAxis: Voodoo.tools.offset(
							scrollAxis,
							i * step
						)
					}));
				
				if ( items && renderItem ) {
					allItems = allItems.map(( elem, i ) => renderItem(elem, i, ref => (allItemRefs[i] = ref)))
				}
				else {
					allItems = allItems.map(( elem, i ) => React.cloneElement(elem, {
						key      : i,
						voodooRef: ref => (allItemRefs[i] = ref)
					}))
				}
				return {
					overlaps,
					allItems,
					allItemRefs,
					nbGhostItems,
					nbItems   : children.length,
					step,
					dec,
					tweenLines,
					windowSize: children.length * step,
				}
			},
			[
				items,
				renderItem,
				overlaps,
				_childs,
				infinite,
				defaultInitial,
				defaultEntering,
				defaultLeaving,
				visibleItems
			]
		),
		locals                          = useTracked(
			{
				items,
				renderItem,
				onChange,
				onWillChange,
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
		axisConf                        = React.useMemo(
			() => (
				{
					defaultPosition : 100 + state.dec + locals.currentIndex * state.step,
					size            : state.nbGhostItems * state.step + 100,
					scrollableWindow: visibleItems * state.step,
					bounds          : !infinite && {
						min: 100,
						max: state.dec + state.nbGhostItems * state.step,
					} || undefined,
					inertia         : {
						snapToBounds: false,
						maxJump,
						shouldLoop  : infinite && (( v, d ) => {
							let { windowSize } = state;
							
							if ( d > 0 && (v) >= (100 + windowSize * 2) )
								return -windowSize;
							
							if ( d < 0 && (v) < (100 + windowSize) )
								return windowSize;
						}),
						willSnap    : ( i, v ) => {
							let { nbItems }     = locals.state,
							    nextIndex       = (i) % nbItems;
							locals._wasUserSnap = true;
							setCurrentIndex(nextIndex);
							locals.onWillChange?.(nextIndex, locals.items?.[nextIndex])
						},
						onSnap      : ( i, v ) => {
							let { nbItems } = locals.state,
							    newIndex    = (i) % nbItems;
							locals.onChange?.(newIndex, locals.items?.[newIndex])
						},
						wayPoints   : state.allItems.map(( child, i ) => ({ at: 100 + i * state.step }))
					}
				}
			),
			[state, infinite, visibleItems, maxJump]
		),
		api                             = React.useMemo(() => ({
			updateItemsAxes: ( pos ) => {
				let cPos = ((pos - 100) / locals.state.step);
				locals.allItemRefs.forEach(
					( itemTweener, i ) => {
						let pos = cPos - i;
						if ( pos < 0 ) {
							pos = Math.max(pos, -1);
							itemTweener?.axes?.entering?.scrollTo((1 + pos) * 100, 0);
							itemTweener?.axes?.leaving?.scrollTo(0, 0);
						}
						else {
							pos = Math.min(pos, 1);
							itemTweener?.axes?.entering?.scrollTo(100, 0);
							itemTweener?.axes?.leaving?.scrollTo(pos * 100, 0);
						}
						itemTweener?.axes?.visible?.scrollTo((1 - Math.abs(pos)) * 100, 0);
					}
				)
			},
			goNext() {
				let { step, windowSize, nbItems } = locals.state,
				    nextIndex                     = ((nbItems + locals.currentIndex + 1) % (locals.state.nbItems));
				
				api.goTo(nextIndex)
			},
			goTo( targetIndex ) {
				let { step, windowSize, nbItems } = locals.state,
				    nextIndex                     = ((nbItems + targetIndex) % (nbItems));
				setCurrentIndex(nextIndex)
			},
			updateCurrentPosition() {
				let nextCurrentIndex    = locals.prevIndex = locals.currentIndex = locals.currentIndex % locals.state.nbItems;
				locals._updateAfterMove = false;
				tweener.axes.slideAxis?.scrollTo(locals.state.dec + locals.state.step * nextCurrentIndex + 100, 0);
				api.updateItemsAxes(locals.state.dec + locals.state.step * nextCurrentIndex + 100);
				setCurrentIndex(nextCurrentIndex)
			},
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
	
	React.useEffect(
		() => {
			if ( locals._wasUserSnap ) {
				locals._wasUserSnap = false;
				locals.prevIndex    = currentIndex || 0;
				return;
			}
			let { step, dec, nbItems } = locals.state;
			locals.prevIndex           = locals.prevIndex || 0;
			
			api.autoScrollUpdater(true);
			
			locals.onWillChange?.(currentIndex, locals.items?.[currentIndex]);
			locals._isMoving = true;
			if ( infinite && Math.abs(locals.prevIndex - currentIndex) > Math.abs(nbItems - locals.prevIndex + currentIndex) ) {
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
	React.useEffect(
		() => {
			if ( !locals.firstDrawDone )
				return locals.firstDrawDone = true;
			if ( !locals._isMoving )
				api.updateCurrentPosition()
			else
				locals._updateAfterMove = true;
		},
		[state.dec, state.step, state.nbItems]
	)
	React.useEffect(
		() => {
			if ( index !== undefined ) {
				api.goTo(index);
				
			}
		},
		[index, defaultStyleId]
	)
	React.useEffect(
		() => {
			api.updateItemsAxes(axisConf.defaultPosition)
			return tweener.watchAxis(
				"slideAxis",
				pos => api.updateItemsAxes(pos)
			)
		},
		[]
	)
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
				rootRef.current.addEventListener("mouseover", mouseOver)
				rootRef.current.addEventListener("mouseout", mouseOut)
				return () => {
					rootRef.current.removeEventListener("mouseover", mouseOver)
					rootRef.current.removeEventListener("mouseout", mouseOut)
					clearTimeout(locals.updaterTM);
				}
			}
		},
		[autoScroll]
	)
	return <ViewBox
		className={"VoodooSlider Carousel " + className}
		style={_style}
		ref={rootRef}
	>
		<Voodoo.Axis
			id={"slideAxis"}
			{...axisConf}
		/>
		
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
								style={
									defaultInitial
								}
								axes={
									state.tweenLines[i]
								}
							>
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
	</ViewBox>
}
