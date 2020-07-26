import Vue, { PropType } from 'vue';
import { renderWrappedNodes } from "./utils";

type MediaQueriesConfig = Record<string, string>;
type MediaEventListener = () => void;
type Matchers = [MediaQueryList, MediaEventListener][] | null;
type Fallback = string | string[];

export type MediaQueriesProvision = Record<string, boolean>;

export const MediaQueryProvider = Vue.extend({
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
  provide(this: { mediaQueries: MediaQueriesProvision }) {
    return { mediaQueries: this.mediaQueries };
  },
  data() {
    const mediaQueries = {} as MediaQueriesProvision;
    const { fallback } = this;
    if (fallback) {
      if (Array.isArray(fallback)) {
        Object.keys(fallback).forEach(key => mediaQueries[key] = true);
      } else {
        mediaQueries[fallback] = true;
      }
    }
    return { mediaQueries, matchers: [] as Matchers };
  },
  beforeMount() {
    const { queries, mediaQueries } = this;

    for (const key in queries) {
      const query = queries[key];

      const matcher = window.matchMedia(query);
      const handler = (event: MediaQueryListEvent) => {
        mediaQueries[key] = event.matches;
      };
      // using deprecated method because of Safari's poor support for addEventListener
      matcher.addListener(handler);
      mediaQueries[key] = matcher.matches;
      this.matchers!.push([matcher, handler as MediaEventListener]);
    }
  },
  beforeDestroy() {
    this.matchers!.forEach(([matcher, listener]) => {
      matcher.removeListener(listener);
    });
    this.matchers = null;
  },
  render(h): any {
    return renderWrappedNodes(h, this.$slots.default, this.wrapperTag);
  }
});