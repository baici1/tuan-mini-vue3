import { render } from './renderer';
import { createVNode } from './vnode';

export function createApp(rootComponet) {
  return {
    /**
     * @description: 基于 rootComponet 生成vnode
     * @param {*} rootContainer 根容器
     */
    mount(rootContainer) {
      //vNode
      const vnode = createVNode(rootComponet);

      render(vnode, rootContainer);
    },
  };
}
