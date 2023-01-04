import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';
/**
 * @description: 某一个状态的标志
 * @return {*}
 */
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

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
 * @description: shallowReadonly 只把最外层的数据设置为只读模式，深层数据不做要求，非响应式
 * @param {*} raw
 */
export function shallowReadonly(raw) {
  return createActionObject(raw, shallowReadonlyHandlers);
}

/**
 * @description: 判断对象是否是reactive类型
 * @param {*} value
 */
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

/**
 * @description: 增加可读性，抽离重复代码
 * @param {any} raw
 * @param {*} baseHandlers
 */
function createActionObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
