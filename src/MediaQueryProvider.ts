import Vue, { PropType } from 'vue';
import { renderWrappedNodes } from "./utils";

type MediaQueriesConfig = Record<string, string>;
type MediaEventListener = () => void;
type Fallback = string | string[];
type Data = {
  mediaQueries: MediaQueriesProvision,
  matchers: [MediaQueryList, MediaEventListener][]
}

export type MediaQueriesProvision = Record<string, boolean>;

export const MediaQueryProvider = Vue.extend({
  name: 'MediaQueryProvider',
  props: {
    queries: {
      type: Object as PropType<MediaQueriesConfig>,
      required: true,
    },
    fallback: [String, Array] as PropType<Fallback>,
    wrapperTag: {
      type: String as PropType<string>,
      default: 'span'
    },
  },
  provide(): { mediaQueries: MediaQueriesProvision } {
    return { mediaQueries: this.mediaQueries };
  },
  data(): Data {
    const mediaQueries = {} as MediaQueriesProvision;
    const { fallback, queries } = this;

    Object.keys(queries).forEach(key => { mediaQueries[key] = false; });

    if (fallback) {
      if (Array.isArray(fallback)) {
        fallback.forEach(key => { mediaQueries[key] = true; });
      } else {
        mediaQueries[fallback] = true;
      }
    }

    return { mediaQueries, matchers: [] };
  },
  // Matching on mounted to avoid hydration errors
  mounted() {
    const { queries, mediaQueries } = this;

    for (const key in queries) {
      const query = queries[key];

      const matcher = window.matchMedia(query);
      const handler = (event: MediaQueryListEvent) => {
        Vue.set(mediaQueries, key, event.matches);
      };
      // using deprecated method because of Safari's poor support for addEventListener
      matcher.addListener(handler);
      Vue.set(mediaQueries, key, matcher.matches);
      this.matchers.push([matcher, handler as MediaEventListener]);
    }
  },
  beforeDestroy() {
    this.matchers.forEach(([matcher, listener]) => {
      matcher.removeListener(listener);
    });
    delete this.matchers;
  },
  render(h): any {
    return renderWrappedNodes(h, this.$slots.default!, this.wrapperTag);
  }
});