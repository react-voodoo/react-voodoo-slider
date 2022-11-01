import React    from "react";
import ReactDOM from "react-dom";
import Voodoo   from "react-voodoo";

function useTracked( refs ) {
	
	const scope = React.useRef({}).current;
	
	Object.assign(scope, refs);
	
	return scope;
}

export default ( {
	                 defaultIndex = 0,
	                 defaultInitial,
	                 style = {},
	                 onClick,
	                 infinite,
	                 maxJump,
	                 visibleItems,
	                 dragHook,
	                 items, renderItem,
	                 children: _childs,
	                 overlaps = 1 / ((visibleItems - (visibleItems % 2)) || 1),
	                 defaultEntering,
	                 defaultLeaving,
	                 index: pIndex, autoScroll,
	                 className = ""
                 } ) => {
	const
		[tweener, ViewBox] = Voodoo.hook(),
		rootRef            = React.useRef(),
		allItemRefs        = React.useRef([]).current,
		[index, setIndex]  = React.useState(pIndex !== undefined ? pIndex : defaultIndex),
		state              = React.useMemo(
			() => {
				let
					children     = items && renderItem
					               ?
					               [...items]
					               : Array.isArray(_childs) ? _childs : [],
					allItems     = !infinite
					               ? [...children]
					               : [...children, ...children, ...children, ...children, ...children, ...children],
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
			[items,
				renderItem,
				_childs, infinite, overlaps]
		),
		locals             = useTracked({
			                                items,
			                                renderItem,
			                                _childs,
			                                allItemRefs,
			                                state,
			                                index, infinite, visibleItems
		                                }),
		axisConf           = React.useMemo(
			() => (
				{
					defaultPosition : 100 + state.dec + locals.index * state.step,
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
							let { nbItems }     = locals.state;
							locals._wasUserSnap = true;
							setIndex((i) % nbItems);
						},
						wayPoints   : state.allItems.map(( child, i ) => ({ at: 100 + i * state.step }))
					}
				}
			),
			[state, infinite, visibleItems, maxJump]
		),
		api                = React.useMemo(() => ({
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
				    nextIndex                     = ((nbItems + locals.index + 1) % (locals.state.nbItems));
				
				//console.log(this.state.index, nextIndex)
				//if ( this.state.index > nextIndex )
				//	tweener.scrollTo(100 + windowSize - step, 0, scrollDir);
				
				setIndex(nextIndex)
			}
		}), []);
	
	React.useEffect(
		() => {
			if ( locals._wasUserSnap ) {
				locals._wasUserSnap = false;
				locals.prevIndex    = index;
				return;
			}
			let { step, dec, nbItems } = locals.state;
			locals.prevIndex           = locals.prevIndex || 0;
			if ( infinite && Math.abs(locals.prevIndex - index) > Math.abs(nbItems - locals.prevIndex + index) ) {
				//console.log('locals:::204:next ', locals.prevIndex, index);
				tweener.scrollTo(dec + step * (nbItems + index) + 100, 750, "slideAxis", "easeQuadInOut")
				       .then(() => {
					       tweener.scrollTo(dec + step * index + 100, 0, "slideAxis");
					       //then?.()
				       });
			}
			else if ( infinite && Math.abs(index - locals.prevIndex) > Math.abs(nbItems - index + locals.prevIndex) ) {
				//console.log('locals:::204:prec ', locals.prevIndex, index);
				tweener.scrollTo(dec + step * (-(nbItems - index)) + 100, 750, "slideAxis", "easeQuadInOut")
				       .then(() => {
					       tweener.scrollTo(dec + step * index + 100, 0, "slideAxis");
					       //then?.()
				       });
			}
			else {
				tweener.scrollTo(dec + step * index + 100, 750, "slideAxis", "easeQuadInOut");
			}
			locals.prevIndex = index;
		},
		[index, infinite]
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
					updaterTM,
					updater   = tm => {
						if ( !locals.hovering )
							api.goNext();
						updaterTM = setTimeout(
							updater,
							autoScroll
						)
					},
					mouseOver = () => {
						locals.hovering = true
					},
					mouseOut  = () => {
						locals.hovering = false;
					};
				updaterTM     = setTimeout(
					updater,
					autoScroll
				)
				rootRef.current.addEventListener("mouseover", mouseOver)
				rootRef.current.addEventListener("mouseout", mouseOut)
				return () => {
					rootRef.current.removeEventListener("mouseover", mouseOver)
					rootRef.current.removeEventListener("mouseout", mouseOut)
					clearTimeout(updaterTM);
				}
			}
		},
		[autoScroll]
	)
	return <ViewBox
		className={"rSlide Slider " + className}
		style={
			{
				userSelect: "none",
				...style
			}
		}
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
