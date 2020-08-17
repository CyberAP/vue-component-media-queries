import Vue, { PropType, VNode } from 'vue';
import { renderWrappedNodes } from "./utils";

type MediaQueriesConfig = Record<string, string>;
type MediaEventListener = () => void;
type Fallback = string | string[];
type Data = {
  mediaQueries: MediaQueriesProvision,
  matchers: [MediaQueryList, MediaEventListener][],
  $nuxt?: any
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
    ssr: {
      type: Boolean as PropType<boolean>,
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
  beforeMount() {
    if (!this.ssr && !this.$nuxt) {
      this.bootstrap();
    }
  },
  mounted() {
    if (this.ssr || this.$nuxt) {
      this.bootstrap();
    }
  },
  beforeDestroy() {
    this.matchers.forEach(([matcher, listener]) => {
      matcher.removeListener(listener);
    });
  },
  methods: {
    bootstrap() {
      const { queries, mediaQueries } = this;

      for (const key in queries) {
        const query = queries[key];

        const matcher = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => {
          this.$emit(`change:${key}`, event);
          Vue.set(mediaQueries, key, event.matches);
        };
        // using deprecated method because of Safari's poor support for addEventListener
        matcher.addListener(handler);
        Vue.set(mediaQueries, key, matcher.matches);
        this.matchers.push([matcher, handler as MediaEventListener]);
      }
    },
  },
  render(h): VNode {
    return renderWrappedNodes(h, this.$slots.default!, this.wrapperTag);
  }
});