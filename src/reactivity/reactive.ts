import { mutableHandlers, readonlyHandlers } from './baseHandlers';
import { track, trigger } from './effect';

export function reactive(raw) {
  return createActionObject(raw, mutableHandlers);
}
/**
 * @description: 只读：是不需要做依赖收集，也不会去触发依赖
 * @param {*} raw
 */
export function readonly(raw) {
  return createActionObject(raw, readonlyHandlers);
}
/**
 * @description: 增加可读性，抽离重复代码
 * @param {any} raw
 * @param {*} baseHandlers
 */
function createActionObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
