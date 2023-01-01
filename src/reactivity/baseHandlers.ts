import { track, trigger } from './effect';
import { ReactiveFlags } from './reactive';
/**
 * @description: 无需重复执行createGetter(),createSetter()等函数，第一次执行进行缓存
 */
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
/**
 * @description:在reactive，readon 等函数中发现 get部分 存在重复代码，进行重构成createGetter
 * tip 对照reactive，readon 中的 get 代码前后对照，了解重构必要性
 * @param {*} isReadonly 只读的标志
 * @return {*}
 */
function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key == ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key == ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
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
