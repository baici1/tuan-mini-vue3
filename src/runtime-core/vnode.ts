import { ShapeFlags } from '../shared/shapeFlags';

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };
  // children type
  if (typeof children == 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  //children slot type
  normalizeChildren(vnode, children);
  return vnode;
}
/**
 * @description: 对 children slot类型进行标记 规则：组件+children object
 * @param {*} vnode
 * @param {*} children
 * @return {*}
 */
export function normalizeChildren(vnode, children) {
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      // 暂时主要是为了标识出 slots_children 这个类型来
      // 暂时我们只有 element 类型和 component 类型的组件
      // 所以我们这里除了 element ，那么只要是 component 的话，那么children 肯定就是 slots 了
      if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        // 如果是 element 类型的话，那么 children 肯定不是 slots
      } else {
        // 这里就必然是 component 了,
        vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
      }
    }
  }
}

/**
 * @description: 获取组件类型
 * @param {any} type
 * @return {*}
 */
function getShapeFlag(type: any) {
  return typeof type == 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
