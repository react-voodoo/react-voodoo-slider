<h1 align="center">react-voodoo-slider</h1>
<p align="center">Swipeable, physics-driven carousel built on <a href="https://github.com/react-voodoo/react-voodoo">react-voodoo</a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-voodoo-slider">
    <img src="https://img.shields.io/npm/v/react-voodoo-slider.svg" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions welcome" />
</p>

---

## Overview

`react-voodoo-slider` is a carousel/slider component built entirely on `react-voodoo` axes. A single Voodoo axis (`slideAxis`) drives the whole carousel. Each slide occupies a fixed range of units on that axis, enabling:

- **Infinite looping** via ghost slides
- **Physics-based drag** with momentum and snap-to-slide
- **Per-slide inner tweeners** with `entering` / `leaving` / `visible` / `visibleNext` axes
- **Auto-scroll** with automatic hover pause
- **Controlled and uncontrolled** active index
- **Hot-swappable style presets** — swap layouts at runtime
- **Optional prev/next buttons** included in each preset

[Live demo](http://htmlpreview.github.io/?https://github.com/react-voodoo/react-voodoo-slider/blob/master/dist.samples/index.html) · [Sample sources](./samples)

---

## Installation

```bash
npm install react-voodoo-slider
```

`react-voodoo` is a peer dependency and must be installed alongside this package. React 16, 17, and 18 are all supported.

---

## Basic usage

```jsx
import Slider from "react-voodoo-slider";

// 1. Plain children
const SimpleSlider = () => (
  <Slider style={{ height: 400 }}>
    <div>Slide A</div>
    <div>Slide B</div>
    <div>Slide C</div>
  </Slider>
);

// 2. Data array + renderItem
const items = [
  { label: "Slide 1", backgroundImage: "https://picsum.photos/400/700?random=1" },
  { label: "Slide 2", backgroundImage: "https://picsum.photos/400/700?random=2" },
  { label: "Slide 3", backgroundImage: "https://picsum.photos/400/700?random=3" },
];

const DataSlider = () => (
  <Slider
    items={items}
    renderItem={(item, index, ref) => (
      <div ref={ref} style={{ backgroundImage: `url(${item.backgroundImage})` }}>
        {item.label}
      </div>
    )}
  />
);
```

---

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultIndex` | `number` | `0` | Initial active index (uncontrolled). |
| `index` | `number` | — | Controlled active index. |
| `defaultStyleId` | `string` | `"default"` | Key of the style preset to apply. |
| `items` | `array` | — | Data array — used together with `renderItem`. |
| `renderItem` | `function` | — | `(item, index, refCb) => ReactElement` — renders one slide from data. |
| `children` | `ReactNode` | — | Plain React children used as slides when `items`/`renderItem` are not provided. |
| `infinite` | `boolean` | `false` | Enable infinite looping via ghost slides. |
| `autoScroll` | `number` | — | Auto-advance interval in ms. Pauses automatically on hover. |
| `onChange` | `function` | — | `(index, item) => void` — fires when a transition completes. |
| `onWillChange` | `function` | — | `(index, item) => void` — fires immediately when the target index is known (predictive). |
| `onClick` | `function` | — | `(event, realIndex, api) => void` — slide click handler. |
| `updateItemAxes` | `boolean` | `false` | Drive per-slide inner tweener axes (`entering`, `leaving`, `visible`, `visibleNext`). |
| `hookUpdateItemAxes` | `function` | — | `(itemTweener, relPos) => void` — extra hook called per-slide per-frame when `updateItemAxes` is enabled. |
| `visibleItems` | `number` | preset | How many slides are simultaneously visible. Controls drag sensitivity. |
| `overlaps` | `number` | `1/visibleItems` | Fraction of a slide visible from the neighbouring slot. |
| `maxJump` | `number` | — | Maximum waypoints inertia can skip in a single flick. |
| `dragHook` | `function` | — | `(delta) => delta` — transform the raw drag delta before it is applied. |
| `defaultInitial` | `object` | preset | Base (t=0) style for every slide node (overrides preset). |
| `defaultEntering` | `array` | preset | Tween descriptors for a slide entering the centre (overrides preset). |
| `defaultLeaving` | `array` | preset | Tween descriptors for a slide leaving the centre (overrides preset). |
| `carouselStyle` | `object` | preset | Style for the outermost container. |
| `wrapperStyle` | `object` | preset | Style for the inner slide strip. |
| `prevBtnStyle` | `object` | preset | Style for the ‹ button. Omit to hide. |
| `nextBtnStyle` | `object` | preset | Style for the › button. Omit to hide. |
| `autoScrollEaseFn` | `string` | `"easeQuadInOut"` | Easing function for programmatic transitions. |
| `autoScrollEaseDuration` | `number` | `750` | Duration in ms for programmatic transitions. |
| `style` | `object` | `{}` | Extra styles merged into the carousel container. |
| `className` | `string` | `""` | Extra class names on the root element. |

---

## Imperative API

The `api` object is available as the third argument of the `onClick` callback. It exposes the following methods:

| Method | Description |
|---|---|
| `api.goTo(index)` | Jump to a specific index (wraps in infinite mode). |
| `api.goNext()` | Advance one slide forward. |
| `api.goPrev()` | Go one slide backward. |
| `api.updateItemsAxes(pos)` | Force-sync per-slide inner axes from a raw `slideAxis` position. |

```jsx
<Slider
  onClick={(event, index, api) => {
    if (someCondition) api.goTo(0);
  }}
>
  ...
</Slider>
```

---

## Style presets

A preset is a plain object whose keys map to the same-named props on the slider. You can register custom presets via the exported `customStyles` map:

```js
import Slider, { customStyles } from "react-voodoo-slider";
import myPreset from "./myPreset";

customStyles.myPreset = myPreset;
```

```jsx
<Slider defaultStyleId="myPreset" />
```

### Preset shape

| Key | Description |
|---|---|
| `visibleItems` | Number of slides visible at once. |
| `carouselStyle` | Outermost container styles. |
| `wrapperStyle` | Inner strip styles. |
| `prevBtnStyle` / `nextBtnStyle` | Button styles (omit either key to hide that button). |
| `defaultInitial` | Base style applied to each slide node at t=0. |
| `defaultEntering` | Tween descriptors for a slide approaching the centre. |
| `defaultLeaving` | Tween descriptors for a slide departing from the centre. |
| `dragHook` | Optional `(delta) => delta` transform applied to raw drag input. |

### Built-in presets

| Preset id | Description |
|---|---|
| `"default"` | Full-width, 1-up. Slides pass over each other horizontally. |
| `"ThreeItems"` | 3-up side-by-side strip with flex layout and nav buttons. |
| `"FourItems"` | 5-up strip — 4 full slides plus two half-visible slides peeking from the edges. |
| `"slider3d"` | 5-up 3D fan arc using perspective and multi-layer transforms. |

---

## Per-slide inner axes (`updateItemAxes`)

When `updateItemAxes={true}`, each child slide is expected to be a `react-voodoo` sub-tweener that exposes named axes. The slider drives these axes every frame based on each slide's position relative to the centre:

| Axis id | Range | Meaning |
|---|---|---|
| `entering` | `0 → 100` | Slide approaching centre from the right. |
| `leaving` | `0 → 100` | Slide departing from centre to the left. |
| `visible` | `0 → 100` | Continuous proximity to centre (100 = fully centred). |
| `visibleNext` | `0 → 100` | Binary: 100 inside the visible neighbourhood, 0 far away. |

### Example slide component

```jsx
import Voodoo from "react-voodoo";

const MySlide = ({ record, voodooRef }) => {
  const [tweener, ViewBox] = Voodoo.hook();

  // Expose the tweener so the parent slider can drive its axes
  voodooRef?.(tweener);

  return (
    <ViewBox>
      <Voodoo.Axis id="entering"    defaultPosition={0} />
      <Voodoo.Axis id="leaving"     defaultPosition={100} />
      <Voodoo.Axis id="visible"     defaultPosition={0} />
      <Voodoo.Axis id="visibleNext" defaultPosition={0} />

      <Voodoo.Node
        style={{ opacity: 0, transform: [{ translateX: "3em" }] }}
        axes={{
          visible: [{
            from: 0, duration: 100,
            apply: { opacity: 1, transform: [{ translateX: "-3em" }] }
          }]
        }}
      >
        <div>{record.label}</div>
      </Voodoo.Node>
    </ViewBox>
  );
};

// Usage:
<Slider updateItemAxes={true} infinite={true}>
  {items.map((rec, i) => <MySlide record={rec} key={i} />)}
</Slider>
```

---

## Coordinate system

The internal `slideAxis` position is calculated as follows:

```
axisPos = 100 + dec + slideIndex × step
          │      │              │
          │      │              └─ step = 100 × overlaps
          │      └─ ghost-slide offset (infinite mode only)
          └─ base offset (room for the leaving tween of slide 0)
```

Each slide's tween descriptors are the shared `entering + leaving` curve, time-shifted to `slideIndex × step`. So slide 0 animates during `[0, 200]`, slide 1 during `[step, step + 200]`, and so on.

---

## License

[MIT](./LICENSE.MD)
