import { extend, isObject } from '../shared';
import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';
/**
 * @description: 无需重复执行createGetter(),createSetter()等函数，第一次执行进行缓存
 */
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
/**
 * @description:在reactive，readon 等函数中发现 get部分 存在重复代码，进行重构成createGetter
 * tip 对照reactive，readon 中的 get 代码前后对照，了解重构必要性
 * @param {*} isReadonly 只读的标志
 * @return {*}
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key == ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key == ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    //如果此时 shallow 标志为true，浅层的只读,不需要收集依赖以及深层处理
    if (shallow) {
      return res;
    }
    // 如果res是object，应该是继续执行reactive/readonly
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
}
/**
 * @description:在reactive，readon 等函数中 set部分 发现存在重复代码，进行重构成createGetter
 * @return {*} set function
 */
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}
/**
 * @description: 用于重构reactive等函数Proxy重复结构，简化内部函数
 */
export const mutableHandlers = {
  get,
  set,
};
/**
 * @description: 用于重构readonly等函数Proxy重复结构，简化内部函数
 */
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key:${key} set failed because target is readonly`, target);
    return true;
  },
};
/**
 * @description: 用于重构shallowReadonly等函数Proxy重复结构，简化内部函数
 */
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, { get: shallowReadonlyGet });
