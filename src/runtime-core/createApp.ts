import { createVNode } from './vnode';

export function createAppAPI(render) {
  return function createApp(rootComponet) {
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
  };
}
