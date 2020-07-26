import Vue, { PropType } from 'vue';
import { MediaQueriesProvision } from './MediaQueryProvider'
import { renderWrappedNodes } from "./utils";

type SlotProps = { matches: boolean } | MediaQueriesProvision
type Data = {
  matches: boolean,
  matcher: null | MediaQueryList,
  mediaQueries?: null | MediaQueriesProvision
}

export const MatchMedia = Vue.extend({
  inject: {
    mediaQueries: {
      default: null
    },
  },
  props: {
    query: {
      type: String as PropType<string>
    },
    fallback: {
      type: Boolean as PropType<boolean>
    },
    wrapperTag: {
      type: String as PropType<string>,
      default: 'span'
    }
  },
  data(): Data {
    return {
      matcher: null,
      matches: this.fallback,
    };
  },
  beforeMount() {
    if (this.query) {
      const matcher = this.matcher = window.matchMedia(this.query);
      matcher.addListener(this.onMedia);
      this.matches = matcher.matches;
    }
  },
  beforeDestroy() {
    if (this.matcher) {
      this.matcher.removeListener(this.onMedia);
      this.matcher = null;
    }
  },
  methods: {
    onMedia(event: MediaQueryListEvent) {
      this.matches = event.matches;
    },
  },
  computed: {
    slotProps(): SlotProps {
      if (this.query) return { matches: this.matches };
      if (!this.mediaQueries) {
        console.error(
          `
            [vue-component-media-queries]:
            A 'query' prop or a <MediaQueryProvider> component inside parent component tree is required.
          `
        );
      }
      return this.mediaQueries as MediaQueriesProvision;
    },
  },
  render(h): any {
    const nodes = this.$scopedSlots.default!(this.slotProps);
    return renderWrappedNodes(h, nodes, this.wrapperTag);
  },
});