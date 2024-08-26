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
		[tweener, ViewBox]              = Voodoo.hook({}, Voodoo.Node.div),
		rootRef                         = React.useRef(),
		allItemRefs                     = React.useRef([]).current,
		[currentIndex, setCurrentIndex] = React.useState(index !== undefined ? index : defaultIndex),
		innerStyles                     = React.useMemo(
			() => {
				let map      = {
					carouselStyle          : { ...(carouselStyle || styles[defaultStyleId]?.carouselStyle), ...style },
					defaultInitial : defaultInitial || styles[defaultStyleId]?.defaultInitial,
					defaultEntering: defaultEntering || styles[defaultStyleId]?.defaultEntering,
					defaultLeaving : defaultLeaving || styles[defaultStyleId]?.defaultLeaving,
					visibleItems   : visibleItems || styles[defaultStyleId]?.visibleItems,
					wrapperStyle   : wrapperStyle || styles[defaultStyleId]?.wrapperStyle,
					prevBtnStyle   : prevBtnStyle || styles[defaultStyleId]?.prevBtnStyle,
					nextBtnStyle   : nextBtnStyle || styles[defaultStyleId]?.nextBtnStyle,
					overlaps       : 0,
				};
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
		state                           = React.useMemo(
			() => {
				let
					children            = items && renderItem
					                      ?
					                      [...items]
					                      : Array.isArray(_childs) ? _childs : [],
					nbGhosts            = infinite ? Math.max(~~(innerStyles.visibleItems / children.length), 1) : 0,
					allItems            = !infinite
					                      ? [...children]
					                      : Array(nbGhosts).fill(1).reduce(( list, i ) => ([...children, ...list, ...children]), [...children]),
					nbInstantiatedItems = allItems.length,
					step                = 100 * innerStyles.overlaps,
					dec                 = infinite ? nbGhosts * (children.length * step) : 0,
					scrollAxis          = [
						...innerStyles.defaultEntering,
						...Voodoo.tools.offset(innerStyles.defaultLeaving, 100)
					],
					tweenLines          = allItems.map(( e, i ) => ({
						slideAxis: Voodoo.tools.offset(
							scrollAxis,
							i * step
						)
					}));
				if ( items && renderItem ) {
					allItems = allItems.map(( elem, i ) => renderItem(elem, i, ref => (allItemRefs[i] = ref)))
				}
				else if ( updateItemAxes ) {
					allItems = allItems.map(( elem, i ) => React.cloneElement(elem, {
						key      : i,
						voodooRef: ref => (allItemRefs[i] = ref)
					}))
				}
				else {
					allItems = allItems.map(( elem, i ) => React.cloneElement(elem, {
						key: i
					}))
				}
				return {
					overlaps  : innerStyles.overlaps,
					allItems,
					allItemRefs,
					nbInstantiatedItems,
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
				_childs,
				infinite,
				innerStyles,
				updateItemAxes
			]
		),
		locals                          = useTracked(
			{
				items,
				renderItem,
				onChange,
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
		axisConf                        = React.useMemo(
			() => (
				{
					defaultPosition : 100 + state.dec + locals.currentIndex * state.step,
					size            : state.nbInstantiatedItems * state.step + 100,
					scrollableWindow: innerStyles.visibleItems * state.step,
					bounds          : !infinite && {
						min: 100,
						max: state.dec + state.nbInstantiatedItems * state.step,
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
			[state, infinite, innerStyles.visibleItems, maxJump]
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
						locals.hookUpdateItemAxes?.(itemTweener, cPos - i)
					}
				)
			},
			goNext() {
				let { nbItems } = locals.state,
				    nextIndex   = ((nbItems + locals.currentIndex + 1) % (nbItems));
				
				api.goTo(nextIndex)
			},
			goPrev() {
				let { nbItems } = locals.state,
				    prevIndex   = ((nbItems + locals.currentIndex - 1) % (nbItems));
				
				api.goTo(prevIndex)
			},
			goTo( targetIndex ) {
				let { nbItems } = locals.state,
				    nextIndex   = ((nbItems + targetIndex) % (nbItems));
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
			{
				locals.firstDrawDone = true;
				return;
			}
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
			if ( updateItemAxes ) {
				api.updateItemsAxes(axisConf.defaultPosition)
				return tweener.watchAxis(
					"slideAxis",
					pos => api.updateItemsAxes(pos)
				)
			}
		},
		[updateItemAxes]
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
	return <ViewBox
		className={"VoodooSlider Carousel " + className}
		style={innerStyles.carouselStyle}
		ref={rootRef}
	>
		<Voodoo.Axis
			id={"slideAxis"}
			{...axisConf}
		/>
		
		{
			innerStyles.prevBtnStyle
			? <Voodoo.Node.div className={"btnPrev"} style={innerStyles.prevBtnStyle}
			                   onClick={api.goPrev}>&lt;</Voodoo.Node.div>
			: ""
		}
		<Voodoo.Node style={innerStyles.wrapperStyle}>
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
										innerStyles.defaultInitial
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
		</Voodoo.Node>
		{
			innerStyles.nextBtnStyle
			? <Voodoo.Node.div className={"btnNext"} style={innerStyles.nextBtnStyle}
			                   onClick={api.goNext}>&gt;</Voodoo.Node.div>
			: ""
		}
	</ViewBox>
}
