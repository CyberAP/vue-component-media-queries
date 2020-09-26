# Vue Component Media Queries

[![npm](https://img.shields.io/npm/v/vue-component-media-queries)](https://www.npmjs.com/package/vue-component-media-queries) ![Bundle size](https://img.shields.io/bundlephobia/minzip/vue-component-media-queries)

[Media Queries](https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries) component library for Vue.

Key features:

* 🍳 **Lightweight**. Less than 1kb gzipped [total size](https://bundlephobia.com/result?p=vue-component-media-queries).
* 🤗 **User-friendly**. Does not require global installation, can be [used on a per-component level](#component-based).
* 💊 **Versatile**. Works both on a component level (inside **`<template>`**) or as an [injected property (inside **`<script>`**)](#global-matching-with-provideinject).
* 💡 **Server Rendered**. Zero hydration errors, fully compatible with Nuxt.js or any custom SSR, supports [predictive rendering](#predictive-rendering).
* 🌳 **Tree-shakeable**. Import only the necessary components right where you need them.
* 🧹 **Clean**. Does not pollute your component's context.

[**Live playground on codesandbox**](https://codesandbox.io/s/ecstatic-frog-g1cqy?file=/src/App.vue)

Define your responsive breakpoints via media queries and place them right in your components:

```html
<!-- App.vue -->
<template>
  <MediaQueryProvider :queries="{ mobile: '(max-width: 680px)' }">
    <AppLayout />
  </MediaQueryProvider>
</template>
```
```html
<!-- AppLayout.vue -->
<template>
  <MatchMedia v-slot="{ mobile }">
    <MobileLayout  v-if="mobile" />
    <DesktopLayout v-else />
  </MatchMedia>
</template>
```

## Before you start

There are two ways how you can use Media Queries on Web: CSS and JS runtime.
In most cases you'll be fine with just CSS, so before going any further please verify that CSS is insufficient for your case.
For example, you don't need this library if you need to toggle element visibility for non-complex elements.
You're better off using just CSS for that:

```html
<div class="show-on-desktop">You're on mobile</div>
<div class="show-on-mobile">You're on desktop</div>
```
```css
@media (min-width: 761px) {
  .show-on-mobile { display: none !important; }
}
@media (max-width: 760px) {
  .show-on-desktop { display: none !important; }
}
```

But if you encounter a significant performance degradation from rendering everything in a single pass
or have some logic bound to media queries you might want to use `window.matchMedia`.
This library provides `window.matchMedia` integration for Vue.

## Table of contents

* [Getting started](#getting-started)
    + [Installation](#installation)
      - [NPM](#npm)
      - [CDN](#cdn)
    + [Usage](#usage)
      - [Global matching](#global-matching)
      - [Component-based](#component-based)
      - [Global matching with Provide\Inject](#global-matching-with-provideinject)
* [API](#api)
    + [`<MediaQueryProvider>`](#mediaqueryprovider)
      - [Props](#props)
        * [`queries`](#queries)
        * [`fallback`](#fallback)
        * [`ssr`](#ssr)
        * [`wrapperTag`](#wrappertag)
      - [Events](#events)
        * [`change:[name]`](#changename)
    + [`<MatchMedia>`](#matchmedia)
      - [Props](#props-1)
        * [`query`](#query)
        * [`fallback`](#fallback-1)
        * [`ssr`](#ssr-1)
        * [`wrapperTag`](#wrappertag-1)
      - [Scoped Slots](#scoped-slots)
        * [`default` slot](#default-slot)
      - [Events](#events-1)
        * [`change`](#change)
    + [`mediaQueries` injection](#mediaqueries-injection)
* [SSR](#ssr)
    + [Predictive rendering](#predictive-rendering)

## Getting started

### Installation

#### NPM

1. Install library as a dependency: `npm i vue-component-media-queries`

1. Import components via named exports where necessary:
    
    ```js
    import { MediaQueryProvider, MatchMedia } from 'vue-component-media-queries'
    ```

#### CDN

If you don't have an option to use NPM you can use a CDN package,
it will register a global `VueComponentMediaQueries` variable with appropriate exports.
The CDN method is not recommended for production usage. Prefer using NPM method whenever possible.

1. Import library after Vue:

    ```html
    <script src="https://unpkg.com/vue@2.6.11/dist/vue.js"></script>
    <script src="https://unpkg.com/vue-component-media-queries@1.0.0/dist/index.js"></script>
    ```

2. Get components from the global `VueComponentMediaQueries` object:

    ```html
    <script>
    const { MatchMedia, MediaQueryProvider } = VueComponentMediaQueries;
    // ...
    </script>
    ```

### Usage

#### Global matching

If you have an app with lots of components that depend on media queries your best option is to use **Global matching** method.

There are two components required for this method: `<MediaQueryProvider>` and `<MatchMedia>`.

1. `<MediaQueryProvider>` does the actual matching and provides values down the render tree. You should wrap your whole app with this component in your `App.vue` or `Layout.vue`.
2. `<MatchMedia>` retrieves these values from the `<MediaQueryProvider>` and exposes them to rendering context through scoped slots.
    You should put this component where you have to actually use these media queries.

Here's a basic setup for this method:

1. Wrap your app in a `<MediaQueryProvider>` and pass `queries` object to it.

    ```html
    <template>
      <MediaQueryProvider :queries="$options.queries">
        <AppLayout />
      </MediaQueryProvider>
    </template>
    
    <script>
      import { MediaQueryProvider } from "vue-component-media-queries";
      import AppLayout from "./AppLayout.vue";
    
      const queries = {
        mobile: '(max-width: 760px)'
      };
    
      export default {
        name: 'App',
        queries,
        components: {
          MediaQueryProvider,
          AppLayout,
        },
      }
    </script>
    ```

2. In any part of your app that's within the `<MediaQueryProvider>` use `<MatchMedia>` component to retrieve the results of media queries.

    ```html
    <template>
      <MatchMedia v-slot="{ mobile }">
        <MobileLayout  v-if="mobile" />
        <DesktopLayout v-else />
      </MatchMedia>
    </template>
    
    <script>
      import { MatchMedia } from "vue-component-media-queries";
      import MobileLayout from "./MobileLayout.vue";
      import DesktopLayout from "./DesktopLayout.vue";
    
      export default {
        name: 'AppLayout',
        components: {
          MatchMedia,
          MobileLayout,
          DesktopLayout,
        },
      }
    </script>
    ```

`<MatchMedia v-slot="{ mobile }">` in the example above refers to the `mobile: '(max-width: 760px)'` media query result taken from the `<MediaQueryProvider>`.
This result is reactive – when you resize the page it will update accordingly.

----

#### Component-based

`<MatchMedia>` can be used without `<MediaQueryProvider>`.
This is convenient if you have just a few components that need media queries.
In that case you'll have to pass a `query` directly to `<MatchMedia>` and get the result from a `matches` slot prop.

```html
<template>
  <MatchMedia query="(max-width: 760px)" v-slot="{ matches }">
    <MobileLayout  v-if="matches" />
    <DesktopLayout v-else />
  </MatchMedia>
</template>

<script>
  import { MatchMedia } from "vue-component-media-queries";
  import MobileLayout from "./MobileLayout.vue";
  import DesktopLayout from "./DesktopLayout.vue";

  export default {
    name: 'AppLayout',
    components: {
      MatchMedia,
      MobileLayout,
      DesktopLayout,
    },
  }
</script>
```

If you have a lot of these components you might prefer using [**Global matching**](#global-matching) method instead.

----

#### Global matching with Provide\Inject

It's possible to have just `<MediaQueryProvider>` and no `<MatchMedia>` components.
This is needed when you want to use your media queries inside `computed` or `watch`.
[Provide\Inject pattern](https://vuejs.org/v2/api/#provide-inject) can be used to get media queries results.

To get the provided media queries results you'll need to:
 
1. Set up `<MediaQueryProvider>` as shown in [**Global matching**](#global-matching) method.

2. Inject `mediaQueries` in your component:

    ```html
    <template>
      <div v-text="title" />
    </template>
    
    <script>
      export default {
        name: 'ResponsiveComponent',
        inject: ['mediaQueries'],
        computed: {
          title() {
            return this.mediaQueries.mobile ? `You're on a mobile layout` : `You're on a desktop layout`;
          }
        }
      }
    </script>
    ```

## API

### `<MediaQueryProvider>`

#### Props

##### `queries`

Type: `{ [name]: string }`

Required: **yes**

`queries` is an object where:
 
* name is a media query name that would be then used in `<MatchMedia>` scoped slot (`<MatchMedia v-slot="{ name }">`) or in `mediaQueries` injection (`this.mediaQueries.name`).
* string value is a [media query expression](https://developer.mozilla.org/docs/Web/CSS/Media_Queries/Using_media_queries).
  It is handled internally with the [`window.matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) API.

```js
const queries = {
  mobile: '(max-width: 760px)',
  tablet: '(max-width: 1024px)',
  desktop: '(min-width: 1024px)',
  landscape: '(orientation: landscape)'
}
```

`queries` are best passed to `<MediaQueryProvider>` via the [`$options`](https://vuejs.org/v2/api/#vm-options) object
because `$options` contents are static and so should be your media queries object.

```html
<template>
  <MediaQueryProvider :queries="$options.queries">
    <AppLayout />
  </MediaQueryProvider>
</template>

<script>
import { MediaQueryProvider } from 'vue-component-media-queries';
import AppLayout from './AppLayout.vue';

const queries = {
  mobile: '(max-width: 760px)',
  tablet: '(max-width: 1024px)',
  desktop: '(min-width: 1024px)',
  landscape: '(orientation: landscape)'
};

export default {
  name: 'App',
  components: {
    MediaQueryProvider
    AppLayout,
  },
  queries, // queries can now be used as part of an $options object
}
</script>
```

##### `fallback`

Type: `string` or `string[]`

A key or a list of `queries` keys that should return `true` when `window.matchMedia` is unavailable (node.js\nuxt.js for example).

```html
<MediaQueryProvider :queries="{ mobile: '(max-width: 760px)' }" fallback="mobile">
  <MatchMedia v-slot="{ mobile }">
    {{ mobile }} <!-- will be true on server, will automatically update on client -->
  </MatchMedia>
</MediaQueryProvider>
```

Multiple fallbacks:

```html
<MediaQueryProvider 
  :queries="{ mobile: '(max-width: 760px)', landscape: 'orientation: landscape' }"
  :fallback="['mobile', 'landscape']"
>
</MediaQueryProvider>
```

##### `ssr`

Type: `boolean`

This prop switches between eager and lazy mode for matching to avoid hydration mismatch errors.

* `false` – Eager mode sets all the queries to match before your components render.
    It ensures that components using media queries won't have to re-render after a first render due to data mismatch
    (all media queries return `false` before matching, except those listed in [`fallback` prop](#fallback)).
* `true` – Lazy mode allows for components to render with fallback values first (passed to [`fallback` prop](#fallback)) to avoid hydration errors.

```html
<MediaQueryProvider 
  :queries="{ mobile: '(max-width: 760px)', landscape: 'orientation: landscape' }"
  :fallback="['mobile', 'landscape']"
  ssr
>
</MediaQueryProvider>
```

Set this prop to `true` if you have a custom server side rendering.
Nuxt.js users will have this set to `true` by default.

##### `wrapperTag`

Type: `string`

Default: `span`

A wrapping tag that is used when a component has more than one child.

```html
<MediaQueryProvider 
  :queries="$options.queries"
  wrapper-tag="'div'"
>
  <FirstChild />
  <SecondChild />
</MediaQueryProvider>
```

#### Events

##### `change:[name]`

Type: [`MediaQueryListEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryListEvent)

Arguments:

* `matches` – boolean. Represents media query result.
* `media` — string. Media query.
* Rest of `EventTarget` interface.

An even fired when a media query `name` result changes.
`name` is a key of `queries` object passed to `<MediaQueryProvider>`.

```html
<template>
  <MediaQueryProvider 
    @change:mobile="onMobileChange" 
    :queries="$options.queries"
  >
    <AppLayout />
  </MediaQueryProvider>
</template>

<script>
import { MediaQueryProvider } from 'vue-component-media-queries';
import AppLayout from './AppLayout.vue';

const queries = {
  mobile: '(max-width: 760px)'
};

export default {
  name: 'App',
  components: {
    MediaQueryProvider
    AppLayout,
  },
  queries,
  methods: {
    onMobileChange(event) {
      const { matches, media, ...rest } = event;
      // some logic
    },
  },
}
</script>
```

----

### `<MatchMedia>`

#### Props

##### `query`

Type: `string`, a [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries).

Required: yes, when is not a descendant of `<MediaQueryProvider>`.

A media query that needs to be matched in place. See [usage section](#component-based-single-query-matching) for an example.

##### `fallback`

Type: `string`

Sets `matches` value to `true` when used outside of browser context (same as for `<MediaQueryProvider>`).

```html
<MatchMedia query="(max-width: 760px)" :fallback="isServer" v-slot="{ matches }">
  {{ matches }} <!-- will be `true` on server -->
</MatchMedia>
```

##### `ssr`

Type: `boolean`

Same as for `<MediaQueryProvider>`.

##### `wrapperTag`

Type: `string`

Default: `span`

A wrapping tag that is used when a component has more than one child.

```html
<MatchMedia v-slot="{ mobile }">
  <FirstChild v-if="mobile" />
  <SecondChild />
</MatchMedia>
```

#### Scoped Slots

##### `default` slot

Slot props: `{ [name]: boolean }` or `{ matches: boolean }`

Returns a record of media queries results from the `<MediaQueryProvider>`.

```html
<MatchMedia v-slot="{ mobile }">
{{ mobile }} <!-- a result of `mobile` media query from <MediaQueryProvider> -->
</MatchMedia>
```

Or returns a `matches` slot prop if you pass a `query` prop.

```html
<MatchMedia query="(max-width: 760px)" v-slot="{ matches }">
{{ matches }} <!-- doesn't need <MediaQueryProvider> -->
</MatchMedia>
```

#### Events

##### `change`

Type: [`MediaQueryListEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryListEvent)

Arguments:

* `matches` – boolean. Represents media query result.
* `media` — string. Media query.
* Rest of `EventTarget` interface.

Triggers when a result from passed media `query` prop changes.

```html
<MatchMedia query="(max-width: 760px)" @change="onMedia" />
```

----

### `mediaQueries` injection

Type: `{ [name]: boolean }`

A record with the results of `<MediaQueryProvider>`. See [Provide\Inject](#provideinject) section for an example.

## SSR

### Predictive rendering

You can use user agent detection (also called browser sniffing) to make a guess which media queries should be matched on server.
This is useful when you want to avoid [layout shifts](https://web.dev/optimize-cls/) and unnecessary re-renders after a hydration.

To do so, we'll have to parse user agent on server side, set fallback values for `<MediaQueryProvider>` and pass them back to the client.

Here's an example of using [`ua-parser-js`](https://github.com/faisalman/ua-parser-js) to make a guess which device is sending a request in a default Nuxt.js layout:

```html
<template>
  <MediaQueryProvider :queries="$options.queries" :fallback="fallback">
    <Nuxt />
  </MediaQueryProvider>
</template>

<script>
  import { MediaQueryProvider } from 'vue-component-media-queries';

  export default {
    name: 'DefaultLayout',
    queries: {
      mobile: '(max-width: 760px)'
    },
    components: {
      MediaQueryProvider
    },
    async fetch() {
      if (this.$nuxt.context.req) {
        // ua-parser-js is dynamically imported to avoid including it in the client bundle
        const { default: uaparser } = await import('ua-parser-js');
        const { device } = uaparser(this.$nuxt.context.req.headers['user-agent']);
        if (device.type === 'mobile') {
          this.fallback = 'mobile';
        }
      }
    },
    data() {
      return { fallback: null };
    },
  }
</script>
```

