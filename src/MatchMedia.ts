import Vue from 'vue';
import { IS_BROWSER } from './index'
import { MediaQueriesProvision } from './MediaQueryProvider'

type context = {
  mediaQueries: MediaQueriesProvision,
  query: string,
  matcher: null | MediaQueryList,
  hasMatched: null | boolean,
  fallback?: boolean,
  onMedia: () => void
}

export const MatchMedia = Vue.extend({
  inject: ['mediaQueries'],
  props: {
    query: {
      type: String,
      required: true,
    },
    fallback: Boolean,
  },
  data(this: context) {
    let matcher = null;
    let hasMatched = null;
    if (!(this.query in this.mediaQueries) && IS_BROWSER) {
      matcher = window.matchMedia(this.query);
      hasMatched = matcher.matches;
      matcher.addListener(this.onMedia);
    }
    return { matcher, hasMatched };
  },
  methods: {
    onMedia(this: any, event: MediaQueryListEvent) {
      this.hasMatched = event.matches;
    },
  },
  beforeDestroy(this: context) {
    if (this.matcher) {
      this.matcher.removeListener(this.onMedia);
    }
  },
  computed: {
    matches(this: context) {
      if (!IS_BROWSER) return this.fallback;
      if (this.matcher) return this.hasMatched;
      return this.mediaQueries[this.query];
    },
  },
  render(this: { $scopedSlots: any, matches: boolean }): any {
    return this.$scopedSlots.default!({ matches: this.matches });
  },
});