import { ShapeFlags } from '../shared/shapeFlags';

export function initSlots(instance: any, children: any) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}));
  }
}

export function normalizeObjectSlots(children: any, slots: any) {
  //当涉及到具名插槽时候，需要处理的children格式是object
  for (const key in children) {
    const value = children[key];
    console.log('%c Line:9 🥓 value', 'color:#ea7e5c', value);
    //针对作用域插槽的函数形式
    if (typeof value == 'function') {
      slots[key] = (props) => normalizeSlotValue(value(props));
    }
  }
}

function normalizeSlotValue(value) {
  // 同时支持单个vnode和多个vnode节点，所作的处理
  return Array.isArray(value) ? value : [value];
}
