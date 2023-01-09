import { Fragment } from './../vnode';
import { createVNode } from '../vnode';

export function renderSlots(slots, name, props = {}) {
  const slot = slots[name];
  if (slot) {
    //作用域插槽是一个函数，需要执行后得到一个 h 。
    const slotContent = slot(props);
    return createVNode(Fragment, {}, slotContent);
  }
}
