import { CreateElement, VNode } from 'Vue';

export const renderWrappedNodes = (h: CreateElement, nodes: VNode | VNode[], wrapperTag: string) => {
  if (Array.isArray(nodes)) {
    if (nodes.length !== 1 || !nodes[0].tag) return h(wrapperTag, {}, nodes);
    else return nodes[0];
  }
  return nodes;
};