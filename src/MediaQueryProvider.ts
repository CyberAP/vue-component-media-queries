import Vue, { PropType, VNode } from 'vue';
import { IS_BROWSER } from './index'

type MediaQueriesConfig = Record<string, string>;
export type MediaQueriesProvision = Record<string, boolean>;

export const MediaQueryProvider = Vue.extend({
  props: {
    queries: {
      type: Object as PropType<MediaQueriesConfig>,
      required: true,
    },
    fallback: String,
  },
  provide(this: { mediaQueries: MediaQueriesProvision }) {
    return { mediaQueries: this.mediaQueries };
  },
  data() {
    const mediaQueries = {} as MediaQueriesProvision;
    const { queries, fallback } = this;
    for (const key in queries) {
      const media = queries[key];
      
      mediaQueries[key] = media === fallback;

      if (IS_BROWSER) {
        const matcher = window.matchMedia(media);
        matcher.addListener((event) => {
          mediaQueries[key] = event.matches;
        });
        mediaQueries[key] = matcher.matches;
      }
    }
    return { mediaQueries };
  },
  render(): any {
    return this.$slots.default as VNode[];
  }
});