import { render } from './renderer';
import { createVNode } from './vnode';

export function createApp(rootComponet) {
  return {
    mount(rootContainer) {
      //vNode
      const vnode = createVNode(rootComponet);

      render(vnode, rootContainer);
    },
  };
}

