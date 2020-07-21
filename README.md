# Vue-component-media-queries

Component-based media query matcher for Vue.

Status: Work in progress.

[![npm](https://img.shields.io/npm/v/vue-component-media-queries)](https://www.npmjs.com/package/vue-component-media-queries)

```html
<template>
  <MediaQueryProvider :queries="$options.queries">
    <MyLayout />
  </MediaQueryProvider>
</template>

<script>
import { MediaQueryProvider } from 'vue-component-media-queries';

export default {
  name: 'App',
  queries: {
    mobile: '(max-width: 680px)',
  },
  components: {
    MediaQueryProvider,
  },
};
</script>
```
```html
<template>
  <div class="my-layout">
    <div class="title">{{title}}</div>
    <MatchMedia query="mobile" v-slot="{ matches }">
      <div class="mobile" v-if="matches">
        <slot />
      </div>
      <div class="desktop" v-else>
        <slot />
      </div>
    </MatchMedia>
  </div>
</template>

<script>
import { MatchMedia } from 'vue-component-media-queries';

export default {
  name: 'MyLayout',
  components: {
    MatchMedia,
  },
  inject: ['mediaQueries'],
  computed: {
    title() {
      return this.mediaQueries.mobile ? 'Short title' : 'A very very long title';
    },
  },
};
</script>
```

TODO: rest of the documentation