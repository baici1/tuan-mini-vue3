/*
 * @Author: baici1 249337001@qq.com
 * @Date: 2023-01-01 11:41:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-08 16:43:34
 * @FilePath: \src\shared\index.ts
 * @Description:用于存放一些公共的函数
 * @Github: https://github.com/baici1/
 */

export const extend = Object.assign;
export const isObject = (val) => {
  return val !== null && typeof val == 'object';
};

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
};

//判断对象是否存在某一个属性
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

/**
 * @description: 首字母大写
 * @param {string} str
 * @return {*}
 */
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 * @description: add-foo -> addFoo
 * @param {string} str
 * @return {*}
 */
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : '';
  });
};
/**
 * @description: 构建合理的 event name值
 * @param {string} str
 * @return {*}
 */
export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
};
