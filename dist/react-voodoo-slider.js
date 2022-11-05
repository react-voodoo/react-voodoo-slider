/*! For license information please see react-voodoo-slider.js.LICENSE.txt */
(()=>{var e={450:e=>{e.exports={walknSetExport:function(e,n,t){var o,l,s=n.split("/"),a=e;for(o=0;o<s.length-1;)a=a[s[o]]=a[s[o]]||{},o++;l=1===Object.keys(t).length&&t.default||t,a[s[o]]?(a[s[o]].__esModule||Object.assign(l,a[s[o]]),a[s[o]]=l):a[s[o]]=l}}},865:(e,n,t)=>{"use strict";t.r(n),t.d(n,{carouselStyle:()=>l,defaultEntering:()=>a,defaultInitial:()=>s,defaultLeaving:()=>r,visibleItems:()=>o});var o=1,l={position:"relative",overflow:"hidden",userSelect:"none",transform:[{translateZ:"0px"}]},s={position:"absolute",height:"100%",width:"100%",top:"0%",left:"0%",zIndex:50,transform:[{translateX:"100%"}]},a=[{from:0,duration:100,easeFn:"easeSinIn",apply:{transform:{translateX:"-100%"},zIndex:150}}],r=[{from:0,duration:100,easeFn:"easeSinIn",apply:{transform:{translateX:"-100%"},zIndex:-150}}]}},n={};function t(o){var l=n[o];if(void 0!==l)return l.exports;var s=n[o]={exports:{}};return e[o](s,s.exports,t),s.exports}t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};(()=>{"use strict";t.r(o),t.d(o,{customStyles:()=>d,default:()=>c});const e=require("@babel/runtime/helpers/extends");var n=t.n(e);const l=require("react");var s=t.n(l);const a=require("react-voodoo");var r=t.n(a),i={};(0,t(450).walknSetExport)(i,"default",t(865));const u=i;var d=i;const c=function(e){var t,o,l,a,i,d,c,f=e.defaultIndex,v=void 0===f?0:f,m=e.defaultStyleId,p=void 0===m?"default":m,x=e.defaultInitial,g=void 0===x?null==(t=u[p])?void 0:t.defaultInitial:x,h=e.defaultEntering,I=void 0===h?null==(o=u[p])?void 0:o.defaultEntering:h,b=e.defaultLeaving,S=void 0===b?null==(l=u[p])?void 0:l.defaultLeaving:b,E=e.visibleItems,y=void 0===E?null==(a=u[p])?void 0:a.visibleItems:E,w=e.style,C=void 0===w?{}:w,A=e._style,T=void 0===A?n()({},null==(i=u[p])?void 0:i.carouselStyle,C):A,M=e.onClick,D=e.onChange,_=e.onWillChange,k=e.infinite,L=e.maxJump,O=e.dragHook,z=e.items,j=e.renderItem,F=e.children,N=e.index,P=e.autoScroll,R=e.overlaps,W=void 0===R?1/(y-y%2||1):R,q=e.autoScrollEaseFn,G=void 0===q?"easeQuadInOut":q,U=e.autoScrollEaseDuration,X=void 0===U?750:U,H=e.className,J=void 0===H?"":H,B=r().hook(),Q=B[0],V=B[1],Z=s().useRef(),K=s().useRef([]).current,Y=s().useState(void 0!==N?N:v),$=Y[0],ee=Y[1],ne=s().useMemo((function(){var e=z&&j?[].concat(z):Array.isArray(F)?F:[],n=k?[].concat(e,e,e):[].concat(e),t=n.length,o=100*W,l=k?e.length*o:0,a=[].concat(I,r().tools.offset(S,100)),i=n.map((function(e,n){return{slideAxis:r().tools.offset(a,n*o)}}));return n=z&&j?n.map((function(e,n){return j(e,n,(function(e){return K[n]=e}))})):n.map((function(e,n){return s().cloneElement(e,{key:n,voodooRef:function(e){return K[n]=e}})})),{overlaps:W,allItems:n,allItemRefs:K,nbGhostItems:t,nbItems:e.length,step:o,dec:l,tweenLines:i,windowSize:e.length*o}}),[z,j,W,F,k,g,I,S,y]),te=(d={items:z,renderItem:j,onChange:D,onWillChange:_,autoScrollEaseFn:G,autoScrollEaseDuration:X,_childs:F,allItemRefs:K,state:ne,currentIndex:$,infinite:k,visibleItems:y},c=s().useRef({}).current,Object.assign(c,d),c),oe=s().useMemo((function(){return{defaultPosition:100+ne.dec+te.currentIndex*ne.step,size:ne.nbGhostItems*ne.step+100,scrollableWindow:y*ne.step,bounds:!k&&{min:100,max:ne.dec+ne.nbGhostItems*ne.step}||void 0,inertia:{snapToBounds:!1,maxJump:L,shouldLoop:k&&function(e,n){var t=ne.windowSize;return n>0&&e>=100+2*t?-t:n<0&&e<100+t?t:void 0},willSnap:function(e,n){var t,o=e%te.state.nbItems;te._wasUserSnap=!0,ee(o),null==te.onWillChange||te.onWillChange(o,null==(t=te.items)?void 0:t[o])},onSnap:function(e,n){var t,o=e%te.state.nbItems;null==te.onChange||te.onChange(o,null==(t=te.items)?void 0:t[o])},wayPoints:ne.allItems.map((function(e,n){return{at:100+n*ne.step}}))}}}),[ne,k,y,L]),le=s().useMemo((function(){return{updateItemsAxes:function(e){var n=(e-100)/te.state.step;te.allItemRefs.forEach((function(e,t){var o,l,s,a,r,i,u,d,c,f,v=n-t;v<0?(v=Math.max(v,-1),null==e||null==(s=e.axes)||null==(a=s.entering)||a.scrollTo(100*(1+v),0),null==e||null==(r=e.axes)||null==(i=r.leaving)||i.scrollTo(0,0)):(v=Math.min(v,1),null==e||null==(u=e.axes)||null==(d=u.entering)||d.scrollTo(100,0),null==e||null==(c=e.axes)||null==(f=c.leaving)||f.scrollTo(100*v,0)),null==e||null==(o=e.axes)||null==(l=o.visible)||l.scrollTo(100*(1-Math.abs(v)),0)}))},goNext:function(){var e=te.state,n=(e.step,e.windowSize,(e.nbItems+te.currentIndex+1)%te.state.nbItems);ee(n)},goTo:function(e){var n=te.state,t=(n.step,n.windowSize,n.nbItems);ee((t+e)%t)}}}),[]);return s().useEffect((function(){var e;if(te._wasUserSnap)return te._wasUserSnap=!1,void(te.prevIndex=$||0);var n=te.state,t=n.step,o=n.dec,l=n.nbItems;te.prevIndex=te.prevIndex||0,null==te.onWillChange||te.onWillChange($,null==(e=te.items)?void 0:e[$]),k&&Math.abs(te.prevIndex-$)>Math.abs(l-te.prevIndex+$)?Q.scrollTo(o+t*(l+$)+100,te.autoScrollEaseDuration,"slideAxis",te.autoScrollEaseFn).then((function(){var e;Q.scrollTo(o+t*$+100,0,"slideAxis"),null==te.onChange||te.onChange($,null==(e=te.items)?void 0:e[$])})):k&&Math.abs($-te.prevIndex)>Math.abs(l-$+te.prevIndex)?Q.scrollTo(o+t*-(l-$)+100,te.autoScrollEaseDuration,"slideAxis",te.autoScrollEaseFn).then((function(){var e;Q.scrollTo(o+t*$+100,0,"slideAxis"),null==te.onChange||te.onChange($,null==(e=te.items)?void 0:e[$])})):Q.scrollTo(o+t*$+100,te.autoScrollEaseDuration,"slideAxis",te.autoScrollEaseFn).then((function(){var e;null==te.onChange||te.onChange($,null==(e=te.items)?void 0:e[$])})),te.prevIndex=$}),[$,k]),s().useEffect((function(){var e;if(!te.firstDrawDone)return te.firstDrawDone=!0;null==(e=Q.axes.slideAxis)||e.scrollTo(ne.dec+ne.step*$+100,0),le.updateItemsAxes(ne.dec+ne.step*$+100)}),[ne.dec,ne.step]),s().useEffect((function(){void 0!==N&&le.goTo(N)}),[N,p]),s().useEffect((function(){return le.updateItemsAxes(oe.defaultPosition),Q.watchAxis("slideAxis",(function(e){return le.updateItemsAxes(e)}))}),[]),s().useEffect((function(){if(P){var e,n=function(){te.hovering=!0},t=function(){te.hovering=!1};return e=setTimeout((function n(t){te.hovering||le.goNext(),e=setTimeout(n,P)}),P),Z.current.addEventListener("mouseover",n),Z.current.addEventListener("mouseout",t),function(){Z.current.removeEventListener("mouseover",n),Z.current.removeEventListener("mouseout",t),clearTimeout(e)}}}),[P]),s().createElement(V,{className:"VoodooCarousel Carousel "+J,style:n()({},T),ref:Z},s().createElement(r().Axis,n()({id:"slideAxis"},oe)),s().createElement(r().Draggable,{xAxis:"slideAxis",className:"items",xHook:O,mouseDrag:!0},ne.allItems.map((function(e,n){return s().createElement(r().Node,{key:n,style:g,axes:ne.tweenLines[n]},s().createElement("div",{className:"slide",onClick:M&&function(e){return M(e,n%ne.nbItems,le)}},e))}))))}})(),module.exports=o})();
//# sourceMappingURL=react-voodoo-slider.js.map